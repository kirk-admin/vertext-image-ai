import { initializeApp } from "firebase/app";
import { getVertexAI, getImagenModel } from "firebase/vertexai";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Use environment variables for Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize FirebaseApp
const firebaseApp = initializeApp(firebaseConfig);

// Initialize the Vertex AI service with environment variables
const vertexAI = getVertexAI(firebaseApp, {
  project: process.env.FIREBASE_PROJECT_ID,
  location: process.env.VERTEX_AI_LOCATION,
});

// Create an `ImagenModel` instance with an Imagen 3 model from environment variables
const imagenModel = getImagenModel(vertexAI, {
  model: process.env.VERTEX_AI_MODEL,
});

const app = express();
const PORT = process.env.PORT || 3000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the public directory exists
const publicDir = path.join(__dirname, "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Serve static files
app.use(express.static(publicDir));
app.use(express.json());

// Endpoint to generate and serve the image
app.get("/generate-image", async (req, res) => {
  try {
    // Get the prompt from the query string or use a default
    const prompt = req.query.prompt || "An astronaut riding a horse.";
    
    console.log(`Generating image for prompt: "${prompt}"`);
    
    // Call the Vertex AI Imagen API with the prompt
    const response = await imagenModel.generateImages(prompt);
    
    if (!response.images || response.images.length === 0) {
      return res.status(500).send({ error: "No images in the response." });
    }

    const image = response.images[0];
    console.log("Image format:", Object.keys(image).join(", "));
    
    // Handle the image based on the format from our verification script
    if (image.bytesBase64Encoded) {
      // Save the base64 image
      const imageBuffer = Buffer.from(image.bytesBase64Encoded, "base64");
      const imagePath = path.join(publicDir, "output.png");
      fs.writeFileSync(imagePath, imageBuffer);
      
      // Return the URL to the saved image
      res.send({ 
        imageUrl: "/output.png",
        mimeType: image.mimeType || "image/png"
      });
    } else if (image.base64) {
      // Alternative field name
      const imageBuffer = Buffer.from(image.base64, "base64");
      const imagePath = path.join(publicDir, "output.png");
      fs.writeFileSync(imagePath, imageBuffer);
      res.send({ imageUrl: "/output.png" });
    } else if (image.url) {
      // If the API returns a URL directly
      res.send({ imageUrl: image.url });
    } else {
      // For debugging
      console.log("Image object structure:", JSON.stringify(image, null, 2));
      return res.status(500).send({ 
        error: "Image data not in expected format. Please check server logs."
      });
    }
  } catch (error) {
    console.error("Error generating image:", error);
    
    // Provide a user-friendly error message
    let errorMessage = "Failed to generate image";
    if (error.message) {
      errorMessage += ": " + error.message;
    }
    
    res.status(500).send({ error: errorMessage });
  }
});

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser to use the AI image generator`);
});
