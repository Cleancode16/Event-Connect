const mongoose=require("mongoose");
const exp=require("express");
const app=exp();
// Add this at the very top of your server.js
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); 

require('dotenv').config();
const {authApp}=require('./apis/Auth');
const {eventApp}=require('./apis/Event');
const {organizerApp}=require('./apis/Organizer');
const {studentApp}=require('./apis/User')
const {adminApp}=require('./apis/Admin')
const dbUrl=process.env.DB_URL;
const cors=require('cors');
app.use(exp.json());
app.use(cors());
mongoose.connect(dbUrl).then(()=>{
  console.log("URI exists:", !!process.env.DB_URL);
  console.log('database is successfully connected to the backend')
}).catch((e)=>{
  console.log(e)
})
const port=process.env.PORT||4000;
// require("dotenv").config(); 
app.use('/auth',authApp);
app.use('/event',eventApp);
app.use('/organiser',organizerApp);
app.use('/student',studentApp);
app.use('/admin',adminApp);
app.listen(port,()=>{
  console.log("server is running on the backend server on port ",port);
  // Checks the Gmail login once at startup; prints a clear error if emails can't be sent
  require('./utils/mailer').verifyMailer();
});
