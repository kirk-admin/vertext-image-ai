import { initializeApp } from "firebase/app";
import { getVertexAI, getImagenModel } from "firebase/vertexai";
import fs from "fs";
import path from "path";
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

console.log("Testing reference-based image generation with Vertex AI");

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize FirebaseApp
const firebaseApp = initializeApp(firebaseConfig);

// Initialize the Vertex AI service
const vertexAI = getVertexAI(firebaseApp, {
  project: process.env.FIREBASE_PROJECT_ID,
  location: process.env.VERTEX_AI_LOCATION,
});

// Create an `ImagenModel` instance
const imagenModel = getImagenModel(vertexAI, {
  model: process.env.VERTEX_AI_MODEL,
});

async function testReferenceImageGeneration() {
  try {
    console.log("Reading reference image...");
    
    const referenceDir = path.join(__dirname, "public", "reference");
    const referenceFiles = fs.readdirSync(referenceDir);
    
    if (referenceFiles.length === 0) {
      console.error("No reference images found in", referenceDir);
      return;
    }
    
    const referencePath = path.join(referenceDir, referenceFiles[0]);
    console.log("Using reference image:", referencePath);
    
    const referenceBuffer = fs.readFileSync(referencePath);
    const referenceBase64 = referenceBuffer.toString("base64");

    console.log("Calling Vertex AI with text-only generation first...");
    const prompt = "A happy bean character coding on a laptop";
    console.log("Prompt:", prompt);
    
    // First try a simple text-to-image call to verify API works
    const textResponse = await imagenModel.generateImages(prompt);
    console.log("Text-only response successful:", !!textResponse.images);
    
    // Now try with reference
    console.log("Now trying with reference image...");
    
    // Try the simplest possible format
    const responseParams = {
      prompt: prompt
    };
    console.log("API parameters:", JSON.stringify(responseParams, null, 2));
    
    const response = await imagenModel.generateImages(responseParams);

    console.log("Response received!");
    console.log("Image format:", Object.keys(response.images[0]).join(", "));
    
    // Save the generated image
    if (response.images && response.images.length > 0) {
      const image = response.images[0];
      if (image.bytesBase64Encoded) {
        const imageBuffer = Buffer.from(image.bytesBase64Encoded, "base64");
        const imagePath = path.join(__dirname, "test-output.png");
        fs.writeFileSync(imagePath, imageBuffer);
        console.log("Image saved to", imagePath);
      } else {
        console.log("Response format not as expected:", image);
      }
    } else {
      console.log("No images in response:", response);
    }
  } catch (error) {
    console.error("Error in image generation:", error);
  }
}

// Run the test
testReferenceImageGeneration(); 