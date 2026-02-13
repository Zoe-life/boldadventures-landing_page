/**
 * Doppler Configuration
 * 
 * This module handles loading secrets from Doppler.
 * It provides a fallback to dotenv for local development when Doppler is not configured.
 */

const { DopplerSDK } = require('@dopplerhq/node-sdk');

// Default configuration values
const DEFAULT_PROJECT = 'boldadventures';
const DEFAULT_CONFIG = 'dev';

/**
 * Initialize and load secrets from Doppler
 * Falls back to dotenv if Doppler token is not available
 */
async function loadSecrets() {
  const dopplerToken = process.env.DOPPLER_TOKEN;

  // If no Doppler token is available, fall back to dotenv
  if (!dopplerToken) {
    console.log('No DOPPLER_TOKEN found - falling back to dotenv for local development');
    require('dotenv').config();
    return;
  }

  try {
    console.log('Loading secrets from Doppler...');
    
    // Initialize Doppler SDK
    const doppler = new DopplerSDK({
      accessToken: dopplerToken,
    });

    // Fetch all secrets
    const response = await doppler.secrets.list({
      project: process.env.DOPPLER_PROJECT || DEFAULT_PROJECT,
      config: process.env.DOPPLER_CONFIG || DEFAULT_CONFIG,
    });

    // Load secrets into process.env
    if (response.secrets) {
      Object.entries(response.secrets).forEach(([key, value]) => {
        if (value.computed) {
          process.env[key] = value.computed;
        }
      });
      console.log(`✓ Successfully loaded ${Object.keys(response.secrets).length} secrets from Doppler`);
    }
  } catch (error) {
    console.error('Error loading secrets from Doppler:', error.message);
    console.log('Falling back to dotenv...');
    require('dotenv').config();
  }
}

module.exports = { loadSecrets };
