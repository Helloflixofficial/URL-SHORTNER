import mongoose from "mongoose";
let isConnected = false;
export const connecTotDB = async () => {
  mongoose.set("strictQuery", true);
  if (!process.env.MONGODB_URL) return console.log("Mongoose url not found");
  if (isConnected) return console.log("mangoose is allready connected");
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    isConnected = true;
    console.log("MDB_Connected");
  } catch (error) {
    console.log(error);
  }
};
