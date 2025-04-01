# AI Image Generator

A web application that leverages Firebase Vertex AI to generate images from text prompts using Google's Imagen 3.0 model.

## Overview

This application provides a simple web interface for users to enter text prompts and generate AI images. It uses Firebase's Vertex AI integration to access Google Cloud's powerful Imagen 3.0 model for high-quality image generation.

## Features

- Text-to-image generation using advanced AI
- Clean, responsive web interface
- Real-time image generation and display
- Error handling and loading state management
- Secure environment variable configuration

## Project Structure

### Main Files

- `main.js` - Express server and backend logic that handles API requests and image generation
- `public/index.html` - Frontend interface for user interaction
- `public/styles.css` - CSS styling for the web interface
- `public/app.js` - Frontend JavaScript for handling form submission and displaying results
- `verify-api.js` - Diagnostic utility to verify Firebase Vertex AI connectivity
- `test-imagen.js` - Test script for debugging the image generation API
- `package.json` - Project dependencies and scripts
- `.env` - Environment variables for secure configuration
- `.gitignore` - Specifies intentionally untracked files to ignore

## How It Works

### Backend (main.js)

The server-side logic is implemented in `main.js`, which:

1. Initializes Firebase and Vertex AI services using environment variables
2. Sets up an Express server to handle HTTP requests
3. Provides an endpoint (`/generate-image`) that:
   - Accepts a text prompt from the user
   - Calls the Vertex AI Imagen API to generate an image
   - Processes the response and saves the generated image
   - Returns the image URL to the frontend

### Frontend

The frontend consists of three main files:

#### index.html
- Provides the structure of the web interface
- Contains a form for users to input text prompts
- Includes containers for displaying loading state and generated images

#### styles.css
- Implements responsive design with mobile support
- Styles the form elements, loading indicators, and image display
- Provides visual feedback during user interactions

#### app.js
- Handles form submission and prevents page reloads
- Makes AJAX requests to the backend API
- Manages UI states (loading, success, error)
- Displays the generated image or error messages

## Utility Scripts

### verify-api.js
A diagnostic tool that:
- Tests the connection to Firebase and Vertex AI
- Verifies the API credentials and access
- Provides detailed error information if something is wrong

### test-imagen.js
A debugging script that:
- Tests different ways of calling the Imagen API
- Logs detailed response information
- Helps diagnose issues with the image generation process

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   # Firebase Configuration
   FIREBASE_API_KEY=your-api-key
   FIREBASE_AUTH_DOMAIN=your-auth-domain
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-storage-bucket
   FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   FIREBASE_APP_ID=your-app-id
   FIREBASE_MEASUREMENT_ID=your-measurement-id

   # Vertex AI Configuration
   VERTEX_AI_LOCATION=us-central1
   VERTEX_AI_MODEL=imagen-3.0-generate-002

   # Server Configuration 
   PORT=3000
   ```
4. Ensure you have a Firebase project with Vertex AI enabled
5. Start the server:
   ```
   npm start
   ```
6. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter a descriptive text prompt in the input field
2. Click "Generate Image" or press Enter
3. Wait for the image to be generated (loading indicator will display)
4. View the generated image that appears below the form
5. Enter a new prompt to generate another image

## Technical Details

- **Firebase Vertex AI**: Used to access Google's Imagen 3.0 model
- **Express.js**: Handles HTTP requests and serves static files
- **ES Modules**: Project uses modern JavaScript module system
- **Base64 Image Handling**: Processes image data from the API response
- **Error Handling**: Comprehensive error detection and user feedback
- **Environment Variables**: Secures API keys and configuration

## Requirements

- Node.js 14+
- Firebase account with Vertex AI enabled
- Google Cloud project with billing enabled
- Internet connection to access Firebase and Vertex AI services

## Future Enhancements

- Support for image-to-image generation
- Adjustable image parameters (size, style, etc.)
- Gallery of generated images
- User authentication
- Sharing capabilities

## Troubleshooting

If you encounter issues:

1. Check the server console for detailed error messages
2. Run `node verify-api.js` to test API connectivity
3. Ensure your Firebase project has Vertex AI enabled
4. Verify that billing is set up correctly on your Google Cloud project
5. Check that your `.env` file contains all the required variables and correct values 