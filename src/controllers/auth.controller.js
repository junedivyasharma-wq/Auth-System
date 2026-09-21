import {User} from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken"
import config from "../config/config.js";
import { userSession } from "../models/session.model.js";
import { sendEmail } from "../services/email.service.js";
import { generateOTP, getOtpHtml } from "../utils/utils.js";
import { otpModel } from "../models/otp.model.js";


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

    const otp=generateOTP();
    const html=getOtpHtml(otp);

    const otpHash= crypto.createHash("sha256").update(otp).digest("hex")

    await otpModel.create({
        email,
        user:user._id,
        otpHash
    })

    await sendEmail(email,"OTP Verification",`your otp code is ${otp}`, html)

 

    // const refreshtoken = jwt.sign({
    //     id:user._id
    // }, config.JWT_SECRET,
    // {
    //     expiresIn:"7d"
    // })

    // const refreshTokenHash= crypto.createHash("sha256").update(refreshtoken).digest("hex")
    // const session= await userSession.create({
    //     user: user._id,
    //     refreshTokenHash,
    //     ip:req.ip,
    //     userAgent:req.headers["user-agent"]

    // })


    // const accesstoken=jwt.sign({
    //     id:user._id,
    //     sessionId:session._id
    // },config.JWT_SECRET,
    // {
    //     expiresIn:"15m"
    // })

    // res.cookie("refreshtoken", refreshtoken,{
    //     httpOnly:true,
    //     secure:true,
    //     sameSite: "strict",
    //     maxAge: 7*24*60*60*1000// 7 days
    // })
    res.status(201).json({
        message:"User registered successfully",
        user:{
            username:user.username,
            email:user.email,
            verified:user.verified
        }
        // ,
        // token: accesstoken
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

export async function refreshToken (req,res){
    const refreshtoken= req.cookies.refreshtoken;

    if(!refreshtoken){
        return res.status(401).json({
            message:"Refresh Token not found"
        })
    }

    const decoded=jwt.verify(refreshtoken, config.JWT_SECRET)

    const refreshTokenHash= crypto.createHash("sha256").update(refreshtoken).digest("hex");

    const session= await userSession.findOne({
        refreshTokenHash,
        revoke:false
    })

    if(!session){
        return res.status(401).json({
            message:"invalid refresh token"
        })
    }
    const accessToken= jwt.sign({
        id:decoded.id
    },config.JWT_SECRET,
    {
        expiresIn:"15m"
    })

    const newrefreshToken= jwt.sign({
        id:decoded.id
    },
    config.JWT_SECRET,
    {
        expiresIn:"7d"
    })

    const newrefreshTokenHash=crypto.createHash("sha256").update(newrefreshToken).digest("hex");

    session.refreshTokenHash= newrefreshTokenHash;
    await session.save()

    res.cookie("refreshtoken",newrefreshToken,{
        httpOnly:true,
        secure:true,
        sameSite: "strict",
        maxAge: 7*24*60*60*1000// 7 days
    })
    return res.status(200).json({
        message:"Accesss token generated successfully",
        token:accessToken
    }
    )
}

export async function logout(req,res){
    const refreshToken=req.cookies.refreshtoken;

    if(!refreshToken){
        return res.status(200).json({
            message:"Refresh token is not found"
        })
    }

    const refreshTokenHash= crypto.createHash("sha256").update(refreshToken).digest("hex");
    console.log(refreshTokenHash)
    const session = await userSession.findOne({
        refreshTokenHash,
        revoke:false
    })

    if(!session){
        return res.status(400).json({
            message:"Session is not found"
        })
    }

    session.revoke=true;

    await session.save();

    res.clearCookie("refreshtoken")
    return res.status(200).json({
        message:"logged out successfully"
    })
}

export async function logoutAll(req,res){

    const refreshToken=req.cookies.refreshtoken;

    if(!refreshToken){
        return res.status(400).json({
            message:"refresh token not found"
        })
    }

    const decoded=jwt.verify(refreshToken,config.JWT_SECRET);

    await userSession.updateMany({
        user:decoded.id,
        revoke:false
    },{
        revoke:true
    })

    

    res.clearCookie()
    return res.status(200).json({
        message:"User successfully logged out from all devices"
    })
}

export async function login(req,res){
    const {username,password}=req.body;

    if(!username || !password){
        return res.status(401).json({
            message:"username and password both are required"
        })
    }

    const hashedPassword=crypto.createHash("sha256").update(password).digest("hex");

    const user= await User.findOne({
        username:username
    })

    if(!user){
        return res.status(400).json({
            message:"User not registered"
        })
    }

    if(!user.verified){
        return res.status(401).json({
            "message":"user email not verified"
        })
    }
    if(user.password !== hashedPassword){
        return res.status(401).json({
            message:"Invalid password"
        })
    }

    const refreshToken=jwt.sign({
        id:user._id
    },config.JWT_SECRET,
    {
        expiresIn:"7d"
    })

    const refreshTokenHash= crypto.createHash("sha256").update(refreshToken).digest("hex")

    const session= await userSession.create({
        user: user._id,
        refreshTokenHash,
        ip:req.ip,
        userAgent:req.headers["user-agent"]

    })

    const accessToken= jwt.sign({
        id:user._id,
        sessionId:session._id
    },
    config.JWT_SECRET,
    {
        expiresIn:"10m"
    })

    res.cookie("refreshtoken",refreshToken,{
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        maxAge: 7*24*60*60*1000
    })
    return res.status(200).json({
        message:"login successfull",
        user:{
            username:user.username,
            email:user.email
        },
        accessToken
    }
    )

}

export async function verifyEmail(req,res){
    const {otp, email}= req.body;

    const hashedOTP=crypto.createHash("sha256").update(otp).digest("hex");
    console.log(hashedOTP)

    const otpDoc= await otpModel.findOne({
        email,
        otpHash:hashedOTP
    });

    if(!otpDoc){
        return res.status(400).json({
            message:"wrong otp"
        })
    }


    const user= await User.findByIdAndUpdate(otpDoc.user,{
        verified:true
    },
    {new:true})
    
    await otpModel.deleteMany({
        user:otpDoc.user
    })

    return res.status(200).json({
        message:"Email verified successfully",
        user:{
            username:user.username,
            email:user.email,
            verified:user.verified
        }
    })
}