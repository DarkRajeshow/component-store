import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Export configuration variables for use in other parts of the app

export const MONGODB_URL = process.env.MONGODB_URL || ''   // MongoDB connection string
export const JWT_SECRET = process.env.JWT_SECRET || ''     // JWT Secret key
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || ''     // JWT Secret key
export const CLIENT_DOMAIN = process.env.CLIENT_DOMAIN || ''// Client domain (useful for CORS or front-end config)
export const CLIENT_URL = process.env.CLIENT_URL || ''     // Client URL, often used for building URLs in responses
export const ADMIN_SETUP_KEY = process.env.ADMIN_SETUP_KEY || 'default_secret_key'; // Secret key for initial admin setup
