# Cloudinary Integration Guide

This guide explains how to set up and use Cloudinary for cloud-based image storage in Bold Adventures.

## Overview

Bold Adventures supports two image storage options:
1. **Local Storage** (default) - Images stored in `images/uploads/` directory
2. **Cloudinary** (recommended for production) - Cloud-based image storage with optimization

The system automatically detects which storage method to use based on environment variables.

## Why Use Cloudinary?

- **Cloud Storage**: Images stored securely in the cloud
- **Automatic Optimization**: Images automatically compressed and optimized
- **Format Conversion**: Automatic format conversion (WebP, AVIF) for better performance
- **Transformations**: On-the-fly image resizing, cropping, and effects
- **CDN Delivery**: Fast global content delivery
- **No Server Storage**: Reduces server storage requirements
- **Scalability**: Handles unlimited images

## Setup Instructions

### 1. Create Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account (free tier includes 25GB storage and 25GB bandwidth)
3. Once logged in, go to Dashboard

### 2. Get API Credentials

From your Cloudinary Dashboard, you'll find:
- **Cloud Name**: Your unique cloud identifier
- **API Key**: Public API key
- **API Secret**: Private API secret (keep this secure!)

### 3. Configure Environment Variables

Add the following to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Important**: Replace the values with your actual Cloudinary credentials.

### 4. Restart Application

After adding the environment variables, restart your server:

```bash
npm start
# or
npm run dev
```

## How It Works

### Automatic Detection

The system automatically detects if Cloudinary is configured:

```javascript
// In server/utils/upload.js
const storage = isCloudinaryConfigured() ? cloudinaryStorage : localStorage;
```

- If Cloudinary credentials are present → Uses Cloudinary
- If credentials are missing → Falls back to local storage

### Storage Locations

Images are organized in folders on Cloudinary:

- **Profile Pictures**: `boldadventures/profiles/`
- **Tour Cover Images**: `boldadventures/tours/covers/`
- **Tour Gallery Images**: `boldadventures/tours/gallery/`
- **General Images**: `boldadventures/`

### Image Transformations

Images uploaded to Cloudinary are automatically:
- Resized to max 1200x800 (maintaining aspect ratio)
- Compressed with automatic quality
- Converted to optimal format (WebP, AVIF when supported)

## API Endpoints

All upload endpoints work the same regardless of storage method:

### Upload Profile Picture
```http
POST /api/upload/profile
Headers:
  Authorization: Bearer <token>
  X-CSRF-Token: <csrf-token>
Body (multipart/form-data):
  image: <file>
```

### Upload Tour Images
```http
POST /api/upload/tour/:tourId
Headers:
  Authorization: Bearer <token>
  X-CSRF-Token: <csrf-token>
Body (multipart/form-data):
  coverImage: <file> (optional)
  images: <file[]> (optional, max 10)
```

### Upload Single Image
```http
POST /api/upload/image
Headers:
  Authorization: Bearer <token>
  X-CSRF-Token: <csrf-token>
Body (multipart/form-data):
  image: <file>
```

## Response Format

All upload endpoints return the storage type in the response:

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v123/boldadventures/image.jpg",
    "filename": "image.jpg",
    "size": 123456,
    "mimetype": "image/jpeg",
    "storageType": "cloudinary"
  }
}
```

For local storage:
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "/images/uploads/image-123456.jpg",
    "filename": "image-123456.jpg",
    "size": 123456,
    "mimetype": "image/jpeg",
    "storageType": "local"
  }
}
```

## Using Cloudinary Utilities

### Direct Upload
```javascript
const { uploadToCloudinary } = require('./server/config/cloudinary');

// Upload a file
const result = await uploadToCloudinary(filePath, {
  folder: 'boldadventures/custom',
  transformation: [
    { width: 800, height: 600, crop: 'fill' },
    { quality: 90 },
  ],
});

console.log(result.url); // Cloudinary URL
```

### Delete Image
```javascript
const { deleteFromCloudinary } = require('./server/config/cloudinary');

// Delete using public_id
await deleteFromCloudinary('boldadventures/tours/covers/image123');
```

### Upload Multiple Images
```javascript
const { uploadMultipleToCloudinary } = require('./server/config/cloudinary');

const files = ['path/to/file1.jpg', 'path/to/file2.jpg'];
const results = await uploadMultipleToCloudinary(files, {
  folder: 'boldadventures/batch',
});
```

### Get Image URL with Transformations
```javascript
const { getImageUrl } = require('./server/config/cloudinary');

// Get URL with custom transformations
const url = getImageUrl('boldadventures/image123', {
  width: 300,
  height: 300,
  crop: 'fill',
  gravity: 'face',
  quality: 'auto',
});
```

## File Size Limits

- **Maximum file size**: 5MB per image
- **Allowed formats**: JPG, JPEG, PNG, GIF, WebP
- **Maximum files per request**: 10 (for multiple uploads)

## Migration from Local to Cloudinary

If you already have images in local storage and want to migrate to Cloudinary:

1. Set up Cloudinary credentials in `.env`
2. Keep existing local images (they'll still work)
3. New uploads will automatically use Cloudinary
4. Optionally, manually upload existing images to Cloudinary
5. Update database records with new Cloudinary URLs

## Troubleshooting

### Images not uploading to Cloudinary

**Check:**
1. Environment variables are correctly set in `.env`
2. Cloudinary credentials are valid
3. Server was restarted after adding credentials
4. Check server logs for specific errors

### Images still going to local storage

**Verify:**
```javascript
// Test in Node.js console or route
const { isCloudinaryConfigured } = require('./server/config/cloudinary');
console.log(isCloudinaryConfigured()); // Should return true
```

### Upload fails with "Invalid signature"

**Solution:**
- Double-check your `CLOUDINARY_API_SECRET` is correct
- Ensure no extra spaces in `.env` file

### Images not displaying

**Check:**
1. Image URLs in database are valid
2. Cloudinary account is active
3. Network allows access to `res.cloudinary.com`

## Best Practices

1. **Use Cloudinary in Production**: Better performance and reliability
2. **Keep Credentials Secret**: Never commit `.env` file to git
3. **Use Transformations**: Leverage Cloudinary's image optimization
4. **Organize Folders**: Use meaningful folder structure
5. **Monitor Usage**: Check Cloudinary dashboard for usage stats
6. **Set Up Webhooks**: For advanced use cases (optional)

## Security Considerations

1. **API Secret**: Keep it secure, never expose in client-side code
2. **Signed URLs**: Use for sensitive images (optional)
3. **Upload Presets**: Configure in Cloudinary for additional security
4. **Rate Limiting**: Already implemented in the application
5. **File Validation**: Only images allowed, max 5MB

## Cost Considerations

### Free Tier Includes:
- 25 GB storage
- 25 GB bandwidth per month
- 2,500 transformations per month

### Upgrade When:
- You exceed free tier limits
- Need more transformations
- Require advanced features (video, AI)

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK Guide](https://cloudinary.com/documentation/node_integration)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)
- [Pricing](https://cloudinary.com/pricing)

## Support

For issues specific to:
- **Cloudinary**: Contact Cloudinary support
- **Bold Adventures Integration**: Check server logs and documentation
- **General Upload Issues**: Review this guide and check environment variables
