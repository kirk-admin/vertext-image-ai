import { initializeApp } from "firebase/app";
import { getVertexAI, getImagenModel } from "firebase/vertexai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to test image generation
async function testImageGeneration() {
  try {
    console.log("Initializing Firebase app...");
    const firebaseApp = initializeApp(firebaseConfig);
    
    console.log("Initializing Vertex AI...");
    const vertexAI = getVertexAI(firebaseApp, {
      project: process.env.FIREBASE_PROJECT_ID,
      location: process.env.VERTEX_AI_LOCATION,
    });
    
    console.log("Getting Imagen model...");
    const imagenModel = getImagenModel(vertexAI, {
      model: process.env.VERTEX_AI_MODEL,
    });
    
    console.log("Model properties:", Object.getOwnPropertyNames(imagenModel));
    console.log("Model methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(imagenModel)));
    
    const prompt = "A cute puppy playing with a ball";
    console.log(`Generating image for prompt: "${prompt}"`);
    
    try {
      // First attempt: as a string parameter
      console.log("Attempt 1: Passing prompt as string");
      const response = await imagenModel.generateImages(prompt);
      console.log("Success! Response received.");
      processResponse(response);
    } catch (error) {
      console.error("Attempt 1 failed:", error.message);
      
      try {
        // Second attempt: with object parameter
        console.log("Attempt 2: Passing prompt in object with text property");
        const response = await imagenModel.generateImages({ text: prompt });
        console.log("Success! Response received.");
        processResponse(response);
      } catch (error) {
        console.error("Attempt 2 failed:", error.message);
        
        try {
          // Third attempt: with prompt property
          console.log("Attempt 3: Passing prompt in object with prompt property");
          const response = await imagenModel.generateImages({ prompt });
          console.log("Success! Response received.");
          processResponse(response);
        } catch (error) {
          console.error("Attempt 3 failed:", error.message);
          throw new Error("All attempts to generate an image failed");
        }
      }
    }
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

function processResponse(response) {
  console.log("Response structure:", Object.keys(response));
  
  if (response.filteredReason) {
    console.error("Image filtered:", response.filteredReason);
    return;
  }
  
  if (!response.images || response.images.length === 0) {
    console.error("No images in the response");
    return;
  }
  
  const image = response.images[0];
  console.log("Image object keys:", Object.keys(image));
  
  if (image.base64) {
    console.log("Image has base64 data");
    const imageBuffer = Buffer.from(image.base64, "base64");
    const outputPath = path.join(__dirname, "test-output.png");
    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`Image saved to: ${outputPath}`);
  } else if (image.url) {
    console.log(`Image available at URL: ${image.url}`);
  } else {
    console.log("No standard image format found in response");
    console.log("Full image object:", JSON.stringify(image, null, 2));
  }
}

// Run the test
testImageGeneration()
  .then(() => console.log("Test completed"))
  .catch(err => console.error("Test failed:", err)); 