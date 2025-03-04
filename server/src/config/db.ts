import mongoose from "mongoose";
import { MONGODB_URL } from "./env";

export const connectDB = async () => {
    mongoose.set("strictQuery", true);
    try {
        await mongoose.connect(MONGODB_URL as string);
        console.log("Connected to Mongo DB");
    } catch (err) {
        console.error("Failed to connect with MongoDB", err);
        throw err; // Rethrow the error to handle it in the server start
    }
};