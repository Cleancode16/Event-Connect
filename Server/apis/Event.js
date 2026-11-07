const mongoose=require('mongoose');
require('dotenv').config();
const z =require('zod');
const express=require('express');
const eventApp=express.Router();
const {verifyUser}=require('../middlewares/verifyUser');
const {Organizer}=require('../models/organizer.model');
const {Events}=require('../models/event.model');
const {Student}=require('../models/student.model');
const { useState } = require('react');
const { error } = require('console');
const validEventData=(req,res,next)=>{
const {eventName,description,maxLimit,category,faqs,startDate,endDate,registrationFee,venue,keyTakeAways,isApproved,rewardPoints,organizer,registrationForm,registrationEndDate,endTime,venueAddress}=req.body;
 
const eventSchema = z.object({
  eventName: z.string(),
  description: z.string(),
  maxLimit: z.number(),
  category: z.string(),
  faqs: z.array(z.object({
    question: z.string().min(1, "Question is required"),
    answer: z.string().min(1, "Answer is required")
  })).optional().default([]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  registrationFee: z.number(),
  venue: z.string(),
  keyTakeAways: z.string(),
  rewardPoints: z.number(),
  registrationForm: z.string(),
  registrationEndDate: z.coerce.date(),
  endTime: z.string(),
  venueAddress:z.string()
});



  const {success}=eventSchema.safeParse(req.body);
  if(success){
    next();
  }else{
    res.status(411).json({
      meassage:"invalid data or all field required manadatory"
    })
  }
}
const validPerson=async(req,res,next)=>{
  try{
  const response=await Organizer.findById(req.userId
  )
  if(response){
  return next();
  }
  // Not an organizer: answer instead of leaving the request hanging
  return res.status(403).json({ message:"Only organizers can do this" })
  }catch(e){
    res.status(411).json({
      message:"unauthorized access"
    })
  }
}

eventApp.post('/app/v1/create',verifyUser,validPerson,async(req,res)=>{
  try {
    const {eventName,description,maxLimit,category,faqs,startDate,endDate,registrationFee,venue,keyTakeAways,rewardPoints,registrationForm,registrationEndDate,endTime,eventImage,sampleCertificate,venueAddress}=req.body;
 
    const response=await Events.create({
     eventName:eventName,
     description:description,
     maxLimit:maxLimit,
     category:category,
     faqs:faqs,
     startDate:new Date(startDate),
     endDate:new Date(endDate),
     registrationFee:registrationFee,
     venue:venue,
     keyTakeAways:keyTakeAways,
     rewardPoints:rewardPoints,
     registrationForm:registrationForm,
     eventImage:eventImage,
     sampleCertificate:sampleCertificate,
     registrationEndDate:new Date(registrationEndDate),
     endTime:endTime,
     organiser:req.userId,
     venueAddress:venueAddress
    })
   
   
   
   if(response){
     res.status(200).json({
       message:"event is created succesfully",
       payload:response
     })
   }else{
     res.status(411).json({
       message:"evenet is not created"
     })
   }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Something went wrong' });
  }
})
eventApp.get('/app/v1/events/:eventId', verifyUser, async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const event = await Events.findById(eventId);
    if (!event) {
      return res.status(403).json({
        message: "You are not authorized to view this event or it doesn't exist."
      });
    }

    const isEnrolled = event.enrolledStudents.some(
      (studentObj) => studentObj.studentId.toString() === req.userId
    );

    res.status(200).json({
      message: "Event details fetched successfully",
      payload: event,
      isEnrolled: isEnrolled
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Something went wrong"
    });
  }
});

eventApp.get('/app/v1/events',verifyUser,async(req,res)=>{
  try{
    const events = await Events.find({});
    res.status(200).json({
      message:"Events details fetched successfully",
      payload: events
    });
  }catch(e){
    console.error(e);
    res.status(500).json({
      message: "Something went wrong"
    });
  }
})

eventApp.get('/app/v1/organiser/events', verifyUser,validPerson, async (req, res) => {
  try {
     const events = await Events.find({ organiser: req.userId });
     res.status(200).json({
      message: "Fetched organiser's events successfully",
      payload: events
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Something went wrong" });
  }
});
eventApp.get('/app/v1/events/details/:organiserId', verifyUser, async (req, res) => {
  console.log("hello")
  try {
    const organiserId=req.params.organiserId;
     const events = await Events.find({ organiser: organiserId });
     res.status(200).json({
      message: "Fetched organiser's events successfully",
      payload: events
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Something went wrong" });
  }
});

eventApp.post('/app/v1/event/update/:eventId', verifyUser, validPerson, async (req, res) => {
    console.log("hi")
  try {
    const { eventId } = req.params;
    const existingEvent = await Events.findOne({ _id: eventId, organiser: req.userId });
    if (!existingEvent) {
      return res.status(403).json({
        message: "You are not authorized to update this event or it doesn't exist."
      });
    }

    const updatedData = { ...req.body };

if (updatedData.maxLimit) updatedData.maxLimit = parseInt(updatedData.maxLimit);
if (updatedData.registrationFee) updatedData.registrationFee = parseInt(updatedData.registrationFee);
if (updatedData.rewardPoints) updatedData.rewardPoints = parseInt(updatedData.rewardPoints);

// Parse dates
if (updatedData.startDate) updatedData.startDate = new Date(updatedData.startDate);
if (updatedData.endDate) updatedData.endDate = new Date(updatedData.endDate);
if (updatedData.registrationEndDate) updatedData.registrationEndDate = new Date(updatedData.registrationEndDate);

// Parse faqs
if (updatedData.faqs) updatedData.faqs = updatedData.faqs;


    

    const updatedEvent = await Events.findByIdAndUpdate(
      eventId,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Event updated successfully",
      payload: updatedEvent
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Something went wrong" });
  }
});


// eventApp.post('/app/v1/event/update/:eventId', verifyUser, validPerson, upload.fields([
//     { name: 'eventImage', maxCount: 1 },
//     { name: 'sampleCertificate', maxCount: 1 }
//   ]), async (req, res) => {
//     console.log("hi")
//   try {
//     const { eventId } = req.params;
//     const existingEvent = await Events.findOne({ _id: eventId, organiser: req.userId });
//     if (!existingEvent) {
//       return res.status(403).json({
//         message: "You are not authorized to update this event or it doesn't exist."
//       });
//     }

//     const updatedData = { ...req.body };

// // Parse numeric fields (FormData sends them as strings)
// if (updatedData.maxLimit) updatedData.maxLimit = parseInt(updatedData.maxLimit);
// if (updatedData.registrationFee) updatedData.registrationFee = parseInt(updatedData.registrationFee);
// if (updatedData.rewardPoints) updatedData.rewardPoints = parseInt(updatedData.rewardPoints);

// // Parse dates
// if (updatedData.startDate) updatedData.startDate = new Date(updatedData.startDate);
// if (updatedData.endDate) updatedData.endDate = new Date(updatedData.endDate);
// if (updatedData.registrationEndDate) updatedData.registrationEndDate = new Date(updatedData.registrationEndDate);

// // Parse faqs
// if (updatedData.faqs) updatedData.faqs = JSON.parse(updatedData.faqs);


//     // If new eventImage is uploaded
//     if (req.files['eventImage'] && req.files['eventImage'][0]) {
//       const uploadResult = await uploadOnCloudinary(req.files['eventImage'][0].path);
//       if (uploadResult) {
//         updatedData.eventImage = [uploadResult.url];
//       }
//     }

//     // If new sampleCertificate is uploaded
//     if (req.files['sampleCertificate'] && req.files['sampleCertificate'][0]) {
//       const uploadResult = await uploadOnCloudinary(req.files['sampleCertificate'][0].path);
//       if (uploadResult) {
//         updatedData.sampleCertificate = uploadResult.url;
//       }
//     }

//     const updatedEvent = await Events.findByIdAndUpdate(
//       eventId,
//       { $set: updatedData },
//       { new: true, runValidators: true }
//     );

//     res.status(200).json({
//       message: "Event updated successfully",
//       payload: updatedEvent
//     });

//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: "Something went wrong" });
//   }
// });


eventApp.put('/app/v1/update/student/:eventId', verifyUser, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { content, name, enroll, rewardPoints } = req.body;
    const event = await Events.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (enroll) {
      const alreadyEnrolled = event.enrolledStudents?.some(
        s => s.studentId.toString() === req.userId
      );
      if (alreadyEnrolled) {
        return res.status(400).json({ message: "You have already enrolled in this event" });
      }
      event.enrolledStudents.push({
        studentId: req.userId,
        name: name
      });
      event.enrolled += 1;
      await event.save();
      console.log("Student added to event");
      const student = await Student.findById(req.userId);
      if (student) {
        const objectIdEvent = new mongoose.Types.ObjectId(eventId);
        const alreadyInList = student.eventsEnrolled.some(
          id => id.toString() === eventId
        );
        if (!alreadyInList) {
          student.eventsEnrolled.push(objectIdEvent);
        }
        student.rewardsEarned += rewardPoints;
        await student.save();
      } else {
        console.log(" Student not found by ID:", req.userId);
      }
      return res.status(200).json({
        message: "Enrolled successfully",
        payload: event
      });
    }
    if (content && name) {
      event.comments.push({
        content,
        owner: req.userId,
        name,
      });
      await event.save();
      return res.status(200).json({
        message: "Comment added successfully",
        payload: event
      });
    }

    return res.status(400).json({ message: "Invalid request" });

  } catch (e) {
    console.error("Error in student event update:", e);
    res.status(500).json({ message: "Something went wrong" });
  }
});
eventApp.put('/app/v1/comment/update/:eventId/:commentId', verifyUser, async (req, res) => {
  console.log("reached");
  try {
    const { eventId, commentId } = req.params;
    const { text } = req.body; 

    const event = await Events.findById(eventId);
    if (!event || !Array.isArray(event.comments)) {
      return res.status(404).json({ message: "Event not found or has no comments" });
    }

    const comment = event.comments.find(
      (comment) =>
        comment?._id?.toString() === commentId &&
        comment?.owner?.toString() === req.userId
    );

    if (!comment) {
      return res.status(403).json({
        message: "You are not authorized to update this comment or it doesn't exist.",
      });
    }
    console.log(text);
    comment.content= text;
    event.markModified('comments'); // update comment's text
    await event.save();

    res.status(200).json({
      message: "Comment updated successfully",
      payload: event.comments,
    });

  } catch (e) {
    console.error("Error updating comment:", e);
    res.status(500).json({ message: "Something went wrong", error: e.message });
  }
});

eventApp.get('/students/enroll/:eventId', verifyUser, validPerson,async(req,res)=>{
  const {eventId}=req.params;
  try{
    const students=await Student.find({eventsEnrolled:eventId}).select('-password');
    res.status(200).json({
      payload:students
    })

  }catch(e){
    req.status(500).json({
      message:"unable to fetch student details",
      error:e.message
    })
  }
})
eventApp.delete('/app/v1/event/delete/:eventId',verifyUser,validPerson,async(req,res)=>{
  try{
    const eventId=req.params.eventId;
    const response=await Events.findOne({
      _id:eventId,
      organiser:req.userId
    })
    if(response){
      await Events.findByIdAndDelete(eventId);
      res.status(200).json({
        message:"Event deleted succesfully"
      })
    }else{
      return res.status(403).json({
        message: "You are not authorized to delete this event or it doesn't exist."
      });
    }

  }catch(e){
     console.error(e);
    res.status(500).json({
      message: "Something went wrong"
    });
  }
})
eventApp.delete('/app/v1/comment/delete/:eventId/:commentId', verifyUser, async (req, res) => {
  try {
    const { eventId, commentId } = req.params;

    const event = await Events.findById(eventId);
    if (!event || !Array.isArray(event.comments)) {
      return res.status(404).json({ message: "Event not found or has no comments" });
    }

    const commentIndex = event.comments.findIndex(
      (comment) =>
        comment?._id?.toString() === commentId &&
        comment?.owner?.toString() === req.userId
    );

    if (commentIndex === -1) {
      return res.status(403).json({
        message: "You are not authorized to delete this comment or it doesn't exist.",
      });
    }

    event.comments.splice(commentIndex, 1);
    await event.save();

    res.status(200).json({
      message: "Comment deleted successfully",
      payload: event.comments,
    });

  } catch (e) {
    console.error("Error deleting comment:", e); 
    res.status(500).json({ message: "Something went wrong", error: e.message });
  }
});


module.exports={
  eventApp:eventApp
}