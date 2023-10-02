"use server"
import dotenv from "dotenv"
dotenv.config();
const mongoose = require("mongoose");
let isConnected = false;
export const ConnectToDB = async () => {
  if (isConnected) {
    console.log("MongoDB connection already established");
    return;
  }
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Missing MongoDB URI");
    }
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("MongoDB connection established");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
