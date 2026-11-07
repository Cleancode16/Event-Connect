const exp=require('express');
const authRouter=exp.Router();
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs'); // bcryptjs is the dependency in package.json; reads existing bcrypt hashes
const mongoose=require('mongoose');
const {Student}=require('../models/student.model')
const z=require('zod');
const {StudentToken}=require('../models/tokenStudent')
const {sendEmail}=require('../utils/sendUserEmail');
const crypto=require('crypto')
const {Organizer}=require('../models/organizer.model');
const {OrganizerToken}=require('../models/tokenOrganiser');
const {sendOrganiserEmail}=require('../utils/sendOrganiserEmail')
const User = require('./User');

// Link the user clicks in the email. Matches the client route /verifyPage/:role/:id/:token
function verificationUrl(role, id, token) {
  const base = (process.env.BASE_URL || 'http://localhost:5173').replace(/\/+$/, '');
  return `${base}/verifyPage/${role}/${id}/${token}`;
}

// Sends the email and reports success instead of throwing, so signup/signin can tell the user the truth
async function trySendVerification(sendFn, email, url) {
  try {
    await sendFn(email, 'Verify Email', url);
    return true;
  } catch (e) {
    console.error(`Verification email to ${email} failed:`, e.message);
    return false;
  }
}

// Reuse the unexpired token if there is one (old links keep working), otherwise create one
async function getOrCreateToken(TokenModel, userId) {
  const existing = await TokenModel.findOne({ userId });
  if (existing) return existing;
  return new TokenModel({ userId, token: crypto.randomBytes(32).toString('hex') }).save();
}

// Mongo duplicate key (unique username / email / phone / club name)
function duplicateMessage(e) {
  if (e?.code !== 11000) return null;
  const field = Object.keys(e.keyPattern || e.keyValue || {})[0] || 'field';
  const label = { phoneNumber: 'phone number', clubName: 'club name' }[field] || field;
  return `An account with this ${label} already exists`;
}

const validStudentDataSignup=(req,res,next)=>{
  const {username,password,email,phoneNumber,collegeName,department,year,role}=req.body;
  const userProfileSchema=z.object({
    username:z.string().min(3).max(30),
    password:z.string().min(8).refine((val) => {
  const hasAt = val.includes('@') && !val.startsWith('@');
  const digitCount = (val.match(/[1-9]/g) || []).length;
  const hasAlpha = /[a-zA-Z]/.test(val);

  return hasAt && digitCount >= 1 && hasAlpha;
}, {
  message: "Password must be at least 8 characters, include at least two digits (1-9), alphabets, and '@' (not at the start)",
}),
email:z.string().email(),
phoneNumber:z.number(),
collegeName:z.string(),
department:z.string(),
year:z.number(),
role:z.string()
  });
  const result=userProfileSchema.safeParse(req.body);
  if(!result.success){
    const issue=result.error.issues?.[0];
    res.status(411).json({
      message: issue ? `Invalid ${issue.path.join('.') || 'data'}: ${issue.message}` : "Invalid data"
    })
    return;
  }
  next();

}
authRouter.post('/student/signUp',validStudentDataSignup,async(req,res)=>{
  try {
    const {username,password,email,phoneNumber,collegeName,department,year,role}=req.body;
    const hashedPassword=await bcrypt.hash(password,5);
    const Data=await new Student({
      username:username,
      password:hashedPassword,
      email:email,
      phoneNumber:phoneNumber,
      collegeName:collegeName,
      department:department,
      year:year,
      role:role
    }).save();
    const token=await new StudentToken({
      userId:Data._id,
      token:crypto.randomBytes(32).toString("hex"),
    }).save();
    const url=verificationUrl(Data.role,Data._id,token.token);
    const emailSent=await trySendVerification(sendEmail,Data.email,url);
    res.status(200).json({
      message: emailSent
        ? `Account created. We sent a verification link to ${Data.email}. It expires in 1 hour (check spam too).`
        : "Account created, but we couldn't send the verification email. Try signing in later to get a new link.",
      emailSent
    })
  } catch (e) {
    const dup=duplicateMessage(e);
    if(dup) return res.status(409).json({ message: dup });
    console.error(e);
    res.status(500).json({ message: 'Something went wrong' });
  }
})
const validUserData=(req,res,next)=>{
  const {email,password,role}=req.body;
  const userSchema=z.object({
    password:z.string(),
    email:z.string().email(),
    role:z.string()
  })
   const {success}=userSchema.safeParse(req.body);
  if(!success){
    res.status(411).json({
      message:"Invalid data"
    })
    return;
  }
  next();

}
authRouter.get('/student/:id/verifyStudent/:token',async(req,res)=>{
  console.log("reached");
  try{
      const student=await Student.findOne({_id:req.params.id});
      if(!student){
        return res.status(400).json({
          message:"Invalid link"
        })
      }
      const token=await StudentToken.findOne({
        userId:student._id,
        token:req.params.token
      })
      if(!token){
        return res.status(400).send({
               message:"invalid link"
        })
      }
      await Student.updateOne(
  { _id: student._id },
  { verified: true }
)

      await token.deleteOne()
      res.status(200).send({
        message:'user verified successfully'
      })
  }catch(e){
      console.error("Verification error:", e);  // helpful for debugging
  res.status(500).json({ message: "Internal Server Error" });
  }
})
authRouter.post('/student/signin',validUserData,async(req,res)=>{
  try {
    const {email,password}=req.body;
    const StudentResponse=await Student.findOne({
     email:email
    })
    if(StudentResponse){
    const validPassword=await bcrypt.compare(password,StudentResponse.password);
    
    if(validPassword){
     if(!StudentResponse.verified){
      // Always (re)send: the earlier email may have failed or been lost
      const token=await getOrCreateToken(StudentToken,StudentResponse._id);
      const url=verificationUrl(StudentResponse.role,StudentResponse._id,token.token);
      const emailSent=await trySendVerification(sendEmail,StudentResponse.email,url);
      return res.status(403).send({
        message: emailSent
          ? `Please verify your email first. We sent a new link to ${StudentResponse.email}.`
          : "Please verify your email first. We couldn't send the link right now, try again in a few minutes.",
        needsVerification:true,
        emailSent
      })
    }
     const secret=process.env.JWT_SECRET;
     const token=jwt.sign({userId:StudentResponse._id},secret);
     if(token){
       res.status(200).json({
         message:"sign in successfully",
         token:token,
         payload:StudentResponse
       })
     }else{
       res.status(404).json({
         message:'backend crashed'
       })
     }
    }else{
       res.status(411).json({
         message:'Incorrect Password'
       })
    }
    }else{
       res.status(411).json({
         message:'Invalid Details',
       })
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Something went wrong' });
  }
})
const validOrganiserDataSignup=(req,res,next)=>{
const {username,clubName,password,email,phoneNumber,collegeName,department,position,role,logo}=req.body;
  const userProfileSchema=z.object({
    username:z.string().min(3).max(30),
    password:z.string().min(8).refine((val) => {
  const hasAt = val.includes('@') && !val.startsWith('@');
  const digitCount = (val.match(/[1-9]/g) || []).length;
  const hasAlpha = /[a-zA-Z]/.test(val);

  return hasAt && digitCount >= 1 && hasAlpha;
}, {
  message: "Password must be at least 8 characters, include at least two digits (1-9), alphabets, and '@' (not at the start)",
}),
email:z.string().email(),
// phoneNumber:z.number(),
  phoneNumber: z.coerce.number(),
collegeName:z.string(),
department:z.string(),
clubName:z.string(),
position:z.string(),
role:z.string(),
logo:z.string()

  });


 const parsedData = {
    username,
    clubName,
    password,
    email,
    phoneNumber,
    collegeName,
    department,
    position,
    role,logo
  };

  const result = userProfileSchema.safeParse(parsedData);

  if (!result.success) {
    const issue = result.error.issues?.[0];
    return res.status(411).json({
      message: issue ? `Invalid ${issue.path.join('.') || 'data'}: ${issue.message}` : "Invalid data",
      error: result.error.issues
    });
  }

  // Attach parsed data to req.body for downstream use
  req.body = result.data;


  next();

}
authRouter.get('/organizer/:id/verifyOrganizer/:token',async(req,res)=>{
  console.log('reached')
  try{
      const organizer=await Organizer.findOne({_id:req.params.id});
      if(!organizer){
        return res.status(400).json({
          message:"Invalid link"
        })
      }
      const token=await OrganizerToken.findOne({
        userId:organizer._id,
        token:req.params.token
      })
      if(!token){
        return res.status(400).send({
               message:"invalid link"
        })
      }
      await Organizer.updateOne(
  { _id: organizer._id },
  { verified: true }
)

      await token.deleteOne()
      res.status(200).send({
        message:'user verified successfully'
      })
  }catch(e){
  console.error("Verification error:", e); 
  res.status(500).json({ message: "Internal Server Error" });
  }
})

authRouter.post('/organizer/signUp',validOrganiserDataSignup,async(req,res)=>{
  try {
    const {username,clubName,password,email,phoneNumber,collegeName,department,position,role,logo}=req.body;
    const hashedPassword=await bcrypt.hash(password,5);
    
    
    const Data=await new Organizer({
      username:username,
      clubName:clubName,
      password:hashedPassword,
      email:email,
      phoneNumber:phoneNumber,
      collegeName:collegeName,
      department:department,
      position:position,
      role:role,
      logo:logo
    }).save();
    const token=await new OrganizerToken({
      userId:Data._id,
      token:crypto.randomBytes(32).toString("hex"),
    }).save();
    const url=verificationUrl(Data.role,Data._id,token.token);
    const emailSent=await trySendVerification(sendOrganiserEmail,Data.email,url);
    res.status(200).json({
      message: emailSent
        ? `Account created. We sent a verification link to ${Data.email}. It expires in 1 hour (check spam too).`
        : "Account created, but we couldn't send the verification email. Try signing in later to get a new link.",
      emailSent
    })
  } catch (e) {
    const dup=duplicateMessage(e);
    if(dup) return res.status(409).json({ message: dup });
    console.error(e);
    res.status(500).json({ message: 'Something went wrong' });
  }
})


authRouter.post('/organizer/signin',validUserData,async(req,res)=>{
  try {
    const {email,password}=req.body;
    const OrganizerResponse=await Organizer.findOne({
     email:email
    })
    if(OrganizerResponse){
    const validPassword=await bcrypt.compare(password,OrganizerResponse.password);
    if(validPassword){
     if(!OrganizerResponse.verified){
      // Always (re)send: the earlier email may have failed or been lost
      const token=await getOrCreateToken(OrganizerToken,OrganizerResponse._id);
      const url=verificationUrl(OrganizerResponse.role,OrganizerResponse._id,token.token);
      const emailSent=await trySendVerification(sendOrganiserEmail,OrganizerResponse.email,url);
      return res.status(403).send({
        message: emailSent
          ? `Please verify your email first. We sent a new link to ${OrganizerResponse.email}.`
          : "Please verify your email first. We couldn't send the link right now, try again in a few minutes.",
        needsVerification:true,
        emailSent
      })
    }
     const secret=process.env.JWT_SECRET;
     const token=jwt.sign({userId:OrganizerResponse._id},secret,{expiresIn:"1h"});
     if(token){
       res.status(200).json({
         message:"sign in successfully",
         token:token,
         payload:OrganizerResponse
       })
     }else{
       res.status(404).json({
         message:'backend crashed'
       })
     }
    }else{
       res.status(411).json({
         message:'Incorrect Password'
       })
    }
    }else{
       res.status(411).json({
         message:'Invalid Details',
       })
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Something went wrong' });
  }
})
module.exports={
  authApp:authRouter
}
