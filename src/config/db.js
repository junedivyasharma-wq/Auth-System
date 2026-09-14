import config from "./config.js";
import mongoose from "mongoose";

const connectDb=async()=>{
 try{
    const connectionInstance= await mongoose.connect(config.MONGO_URI)
    console.log(`\n MONGODB connected !! DB HOST : 
        ${connectionInstance.connection.host}`);
    }catch(error){
        console.log("MongoDb error",error);
        process.exit(1)
    }
}
export default connectDb