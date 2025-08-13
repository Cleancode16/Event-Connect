const mongoose=require('mongoose');
const express=require('express');
const organizerApp=express.Router();
const {Organizer}=require('../models/organizer.model');
const {verifyUser}=require('../middlewares/verifyUser');
const {Events}=require('../models/event.model');
organizerApp.get('/getdetails',verifyUser,async(req,res)=>{
  try{
   const userId=req.userId;
   const organizerDetails=await Organizer.findById(userId);
   return res.status(200).json({
    payload:organizerDetails
   })
  }catch(e){ 
    res.status(403).json({
      message:"unauthorized access"
    })
  }
})
organizerApp.put('/update/profiledetails', verifyUser,  async (req, res) => {
  try {
    const userId = req.userId;
    let updatedData = { ...req.body };
    const updatedOrganiser = await Organizer.findByIdAndUpdate(
      userId,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Organiser updated successfully",
      payload: updatedOrganiser
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Something went wrong" });
  }
});
organizerApp.get('/get/organiserDetails',async(req,res)=>{
  try{
const organisers=await Organizer.find({});
res.status(200).json({
  organiserDetails:organisers,
  message:'organizer details'
})

  }catch(e){
   res.status(411).json({
    message:"unable to fetch organizer details"
   })
  }

})

module.exports={
  organizerApp:organizerApp
}