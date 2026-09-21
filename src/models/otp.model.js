import mongoose, { mongo } from "mongoose"

const otpSchema= new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required"]
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true,"User is required"]
    },
    otpHash:{
        type:String,
        required:[true,"Otp Hash is required"]
    }
},
{
    timestamps:true
})

export const otpModel=mongoose.model("otpModel",otpSchema)