# Security Fix: Socket.IO Network Device Discovery Permission

## Issue Description

When users clicked the "Book Now" button to login, they would receive a browser notification asking for permission to "listen to devices on your network" or similar messages. This created a poor user experience and raised security concerns.

## Root Cause

The issue was caused by Socket.IO's default transport configuration. Socket.IO supports multiple transport mechanisms for real-time communication:

1. **WebSocket** - Primary transport (fast, bidirectional)
2. **Polling** - HTTP long-polling fallback
3. **WebRTC** - Peer-to-peer transport (causes the permission prompt)

By default, Socket.IO attempts to use WebRTC as one of its transport options. WebRTC requires access to network discovery capabilities to establish peer-to-peer connections, which triggers the browser's permission prompt asking to "listen to devices on the network."

## Security Implications

While WebRTC itself is not inherently insecure, the permission prompt:
- Creates a poor user experience
- Raises unnecessary security concerns for users
- Is not needed for server-client communication (WebRTC is designed for peer-to-peer)
- Could potentially expose local network information

## Solution

We disabled WebRTC transport in the Socket.IO server configuration by explicitly restricting transports to only WebSocket and Polling:

```javascript
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5000',
    credentials: true,
  },
  // Explicitly restrict transports to prevent WebRTC and network device discovery prompts
  transports: ['websocket', 'polling'],
  // Disable WebRTC transport to prevent browser permission requests
  allowEIO3: false,
});
```

### Key Changes

1. **`transports: ['websocket', 'polling']`** - Restricts Socket.IO to only use WebSocket and HTTP polling
2. **`allowEIO3: false`** - Disables older Engine.IO v3 protocol that could also trigger WebRTC

## Impact

### Positive
- ✅ Eliminates browser permission prompts for network device access
- ✅ Improves user experience during login/booking flow
- ✅ Reduces security concerns
- ✅ Maintains full real-time notification functionality
- ✅ WebSocket and polling are sufficient for all application needs

### No Negative Impact
- ⚠️ WebRTC transport is not needed for server-client communication
- ⚠️ WebSocket provides better performance than WebRTC for this use case
- ⚠️ Polling fallback ensures compatibility with restrictive networks/firewalls

## Testing

To verify the fix:

1. Start the server: `npm start`
2. Navigate to the website
3. Click "Book Now" button
4. Attempt to book a tour
5. Verify no browser permission prompt appears
6. Verify Socket.IO real-time notifications still work (if implemented in frontend)

## Future Considerations

If Socket.IO client is implemented in the frontend, ensure it also uses the same transport configuration:

```javascript
// Client-side Socket.IO configuration (when implemented)
const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
});
```

## References

- [Socket.IO Transport Documentation](https://socket.io/docs/v4/client-options/#transports)
- [WebRTC and Browser Permissions](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols)
- [Engine.IO Protocol](https://socket.io/docs/v4/engine-io-protocol/)

## Related Files

- `/server.js` - Main server configuration with Socket.IO setup
- `/server/utils/notification.js` - Socket.IO notification implementation
