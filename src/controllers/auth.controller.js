import {User} from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken"
import config from "../config/config.js";



export async function register(req,res){

    const {username,email,password}=req.body;

    const alreadyRegistered=await User.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(alreadyRegistered){
        return res.status(402).json({
            message:"Username or email already exists"
        })
    }

    const  hashedPassword=crypto.createHash("sha256").update(password).digest("hex")
    const user= await User.create({
        username:username,
        email:email,
        password:hashedPassword
    });

    const token=jwt.sign({
        id:user._id
    },config.JWT_SECRET,
    {
        expiresIn:"1d"
    })

    res.status(201).json({
        message:"User registered successfully",
        user:{
            username:user.username,
            email:user.email
        },
        token
    })

}

export async function getMe(req,res){
    const token =req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({
            message:"Token not found"
        })
    }

    const decoded=jwt.verify(token,config.JWT_SECRET);
    console.log(decoded);

    const user= await User.findById(decoded?.id);

    return res.status(200).json({
        message:"User fetched successfully",
        user
    })
}