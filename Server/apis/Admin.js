const mongoose=require('mongoose');
const express=require('express');
const adminApp=express.Router();
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");
const z=require("zod");
const { Admin } = require('../models/admin.model');
const {Events} =require('../models/event.model');
const {verifyUser} =require('../middlewares/verifyUser')
require("dotenv").config()
const validateAdminData=(req,res,next)=>{
const {name,password,email}=req.body;
  const AdminSchema=z.object({
    name:z.string().min(3).max(30),
    password:z.string().min(8).refine((val) => {
    const hasAt = val.includes('@') && !val.startsWith('@');
    const digitCount = (val.match(/[1-9]/g) || []).length;
    const hasAlpha = /[a-zA-Z]/.test(val);
    return hasAt && digitCount >= 1 && hasAlpha;
    }, {
    message: "Password must be at least 8 characters, include at least two digits (1-9), alphabets, and '@' (not at the start)",
    }),
    email:z.string().email()
});
 const {success}=AdminSchema.safeParse(req.body);
 if(!success){
    return res.status(401).json({
        message:"Invalid Data"
    })
    
 }
 
 next();
}

//validate Admin
const validAdmin=async(req,res,next)=>{
  try{
  const response=await Admin.findById(req.userId
  )
  if(response){
  return next();
  }
  // Not an admin: answer instead of leaving the request hanging
  return res.status(403).json({ message:"Admin access only" })
  }catch(e){
    res.status(411).json({
      message:"unauthorized access"
    })
  }
}

adminApp.post("/signUp",validateAdminData,async(req,res)=>{
    try {
        const {name,email,password}=req.body;
        const hashedPassword=await bcrypt.hash(password,5)
        const Data=await Admin.create({
            name:name,
            password:hashedPassword,
            email:email
        })
        if(Data){
        res.status(200).json({
            message:"Admin Created successfully",
            payload:Data
        })
        }else{
        res.status(404).json({
            message:"Admin not created"
        })
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Something went wrong' });
    }
})
adminApp.post("/signin",async(req,res)=>{
    try {
        const {email,password}=req.body;
        const response= await Admin.findOne({
            email:email
        }
        ) 
        if(!response){
            res.status(404).json({
                message:"Invalid User"
            })
            return 
        }
        const isverified=await bcrypt.compare(password,response.password);
        if(!isverified){
            res.status(400).json({
                message:"Invalid User"
            })
        }
        else{
            const secret=process.env.JWT_SECRET;
            const token=jwt.sign({ userId: response._id }, secret);
            if(!token){
                res.status(404).json({
                    message:"Invalid Details"
                })
                return 
            }
            res.status(200).json({
                message:"Signed in Succesfully",
                token:token,
                payload:response
            })
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Something went wrong' });
    }
})


adminApp.put('/event/comment/:eventId/:commentId', verifyUser,validAdmin, async (req, res) => {
  try {
    const { eventId, commentId } = req.params;
    const userId = req.userId;

    const event = await Events.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const commentIndex = event.comments.findIndex(
      (c) => c._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const comment = event.comments[commentIndex];

    

    event.comments.splice(commentIndex, 1);
    await event.save();

    res.status(200).json({
      message: 'Comment deleted successfully',
      payload: event
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Something went wrong' });
  }
});




//Aproove event
adminApp.put('/app/v1/event/update/:eventId', verifyUser, validAdmin, async (req, res) => {
  try {
    const { eventId } = req.params;
    const existingEvent = await Events.findOne({ _id: eventId});
    if (!existingEvent) {
      res.status(403).json({
        message: "You are not authorized to update this event or it doesn't exist."
      });
      return;
    }

    // Update the event with new data
    const updatedEvent = await Events.findByIdAndUpdate(
      eventId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Event approved ",
      payload: updatedEvent
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Something went wrong" });
  }
});




module.exports={adminApp:adminApp}