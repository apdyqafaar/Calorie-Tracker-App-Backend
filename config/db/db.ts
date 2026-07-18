import mongoose from "mongoose";

const connectDb=async():Promise<void>=>{
 try {
    const uri=process.env.NODE_ENV==="production"?process.env.MONGO_URI_PROD:process.env.MONGO_URI_DEV;
    if(!uri){
        throw new Error("MongoDB URI is not defined in environment variables");
    }
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
 } catch (error) {
    const message=error instanceof Error?error.message:"Unknown error";
    console.error("Error connecting to MongoDB:", message);
    process.exit(1);
 }
}

export default connectDb