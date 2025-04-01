import { initializeApp } from "firebase/app";
import { getVertexAI, getImagenModel } from "firebase/vertexai";
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

async function verifyAPI() {
  try {
    console.log("Step 1: Initializing Firebase app...");
    const firebaseApp = initializeApp(firebaseConfig);
    console.log("✅ Firebase initialized successfully");
    
    console.log("\nStep 2: Connecting to Vertex AI...");
    const vertexAI = getVertexAI(firebaseApp, {
      project: process.env.FIREBASE_PROJECT_ID, 
      location: process.env.VERTEX_AI_LOCATION,
    });
    console.log("✅ Vertex AI initialized successfully");
    
    console.log("\nStep 3: Accessing Imagen model...");
    const imagenModel = getImagenModel(vertexAI, {
      model: process.env.VERTEX_AI_MODEL,
    });
    console.log("✅ Imagen model accessed successfully");
    
    // Test generating a simple image with a short prompt
    console.log("\nStep 4: Testing image generation with prompt 'A blue sky'...");
    
    try {
      const response = await imagenModel.generateImages("A blue sky");
      console.log("✅ Image generation API call succeeded!");
      console.log(`Response contains ${response.images?.length || 0} images`);
      
      if (response.images && response.images.length > 0) {
        const image = response.images[0];
        console.log("Image data format:", Object.keys(image).join(", "));
      }
      
      console.log("\n🎉 All tests passed! The API connection is working properly.");
    } catch (error) {
      console.error("❌ Image generation failed:", error.message);
      if (error.customErrorData) {
        console.error("Error details:", JSON.stringify(error.customErrorData, null, 2));
      }
      console.log("\n🔍 Diagnosis:");
      if (error.message.includes("Missing text content")) {
        console.log("- The API expects a different format for the prompt.");
        console.log("- Try modifying how the prompt is passed to generateImages().");
      } else if (error.message.includes("403") || error.message.includes("Authentication")) {
        console.log("- Authentication issue: Check your Firebase project settings");
        console.log("- Verify that Vertex AI API is enabled in your GCP project");
        console.log("- Check billing is enabled for your Google Cloud account");
      } else if (error.message.includes("not found") || error.message.includes("404")) {
        console.log("- API endpoint or model not found");
        console.log("- Verify the model name and region are correct");
      }
    }
  } catch (error) {
    console.error("❌ Setup failed:", error);
  }
}

verifyAPI(); 