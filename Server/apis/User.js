const mongoose=require('mongoose');
const express=require('express');
const studentApp=express.Router();
const {Student}=require('../models/student.model');
const {verifyUser}=require('../middlewares/verifyUser');
const {Events}=require('../models/event.model');
studentApp.get('/getdetails',verifyUser,async(req,res)=>{
  try{
    const userId=req.userId;
    if(!userId){
      return res.status(401).json({
        message:"unauthorized access"
      })
    }
    const studentDetails=await Student.findById(userId);
    return res.status(200).json({
    payload:studentDetails
    })
  }catch(e){
    return res.status(401).json({
        message:"unauthorized access"
      })
  }
})
studentApp.get('/enrolledEvents',verifyUser,async(req,res)=>{
  try{
  const studentId=req.userId;
  const events=await Events.find({
    'enrolledStudents.studentId':studentId
  });
  return res.status(200).json({
    payload:events
  })
  }catch(e){
    return res.status(411).json({
      message:"unable to fetch events due to internal server error"
  })
  }
})
studentApp.put('/update/profiledetails',verifyUser,async(req,res)=>{
  try {
     const userId  = req.userId;
     
     const updatedStudent= await Student.findByIdAndUpdate(
       userId,
       { $set: req.body },
       { new: true, runValidators: true }
     );
 
     res.status(200).json({
       message: "user updated successfully",
       payload: updatedStudent
     });
 
   } catch (e) {
     console.error(e);
     res.status(500).json({ message: "Something went wrong" });
   }
});

studentApp.put('/comment/:eventId', verifyUser, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { content } = req.body;
    const userId = req.userId; // from verifyUser

    const event = await Events.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.comments.push({
      content,
      owner: userId,
      event: eventId
    });

    await event.save();

    res.status(200).json({
      message: 'Comment added successfully',
      payload: event
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

studentApp.put('/comment/:eventId/:commentId', verifyUser, async (req, res) => {
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

    if (comment.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own comments' });
    }

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



module.exports={
  studentApp:studentApp
}