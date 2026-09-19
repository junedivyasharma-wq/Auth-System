import mongoose from "mongoose";

const userSessionSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true,"user is required"]
    },
    refreshTokenHash:{
        type:String,
        required:[true,"Refresh token hash is required"]
    },
    ip:{
        type:String,
        required:[true,"ip is required"]
    },
    userAgent:{
        type:String,
        required:[true,"User Agent is required"]
    },
    revoke:{
        type:Boolean,
        default:false
    }
},
    {timestamps:true}
)

export  const userSession= mongoose.model("userSession", userSessionSchema)