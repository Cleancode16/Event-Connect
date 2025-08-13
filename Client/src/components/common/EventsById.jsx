import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoPricetags } from 'react-icons/io5';
import { BsCalendarDate } from 'react-icons/bs';
import { IoMdTime } from 'react-icons/io';
import {useForm} from 'react-hook-form'
import {useRecoilValue} from 'recoil'
import axios from 'axios';
import {userAtom} from '../UserAtom'
import { MdDelete } from "react-icons/md";
import { useParams } from 'react-router-dom';
import { MdModeEditOutline } from "react-icons/md";
function AccordionItem({ question, answer, isExpanded, onToggle }) {

  return (
    <div className="rounded-xl bg-gray-100 overflow-hidden">
      <div className="flex justify-between items-center p-4 cursor-pointer" onClick={onToggle}>
        <div className="font-medium">{question}</div>
       <i className={`bx bx-chevron-right ${isExpanded ? "rotate-90":""}`}></i>
      </div>
      {isExpanded && (
        <div className="px-4 pb-4 text-gray-700">
          {answer}
        </div>
      )}
    </div>
  );
}
function EventsById() {
  const [edit,setEdit]=useState(false);
  const [commentEdit,setCommentEdit]=useState(false);
   const {eventById}=useParams();
  const navigate=useNavigate()
const { register, handleSubmit, formState: { errors },reset,setValue} = useForm({
  defaultValues: {
    newComment: ''
  }});
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);
  const user=useRecoilValue(userAtom);
  const addFaq = () => setFaqs([...faqs, { question: '', answer: '' }]);
  const removeFaq = (index) => setFaqs(faqs.filter((_, i) => i !== index));
  const handleFaqChange = (index, field, value) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index][field] = value;
    setFaqs(updatedFaqs);
  };
  const [isEnrolled, setIsEnrolled] = useState(false);
 const [commentIdstore,setCommentIdstore]=useState();

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, formData);
    return res.data.secure_url;
  };




  async function handleUpdateSubmit(data) {
  console.log('Updating Event:', data);
  console.log('FAQs:', faqs);
   const eventImageUrl = data.eventImage?.[0]
        ? await uploadToCloudinary(data.eventImage[0])
        : currentArticle?.eventImage || '';
      const certificateImageUrl = data.sampleCertificate?.[0]
        ? await uploadToCloudinary(data.sampleCertificate[0])
        : currentArticle?.sampleCertificate || '';
 
const payload = {
        eventName: data.eventName,
        description: data.description,
        maxLimit: data.maxLimit,
        enrolled: 0,
        category: data.category,
        startDate: data.startDate,
        endDate: data.endDate,
        sampleCertificate: certificateImageUrl,
        registrationFee: data.registrationFee,
        venue: data.venue,
        keyTakeAways: data.keyTakeAways,
        isApproved: false,
        rewardPoints: data.rewardPoints,
        registrationForm: data.registrationForm,
        registrationEndDate: data.registrationEndDate,
        endTime: data.endTime,
        eventImage: eventImageUrl,
        faqs: faqs,
        venueAddress: data.venueAddress,
      };

  try {
    const res = await axios.post(`http://localhost:3000/event/app/v1/event/update/${eventById}`, payload, {
      headers: {  'Authorization': localStorage.getItem('token') },
    });

    if (res.status === 200) {
      alert('Event updated successfully');

      setCurrentArticle(res.data.payload); 
      setEdit(false); 
    } else {
      alert('Failed to update event');
    }
  } catch (err) {
    console.error(err);
    alert('Error updating event');
  }
}
  async function handleFormSubmit(data) {
    console.log('Form submitted:', data);
    console.log('FAQs:', faqs);

    const eventImageUrl = data.eventImage?.[0]
        ? await uploadToCloudinary(data.eventImage[0])
        : '';
      const certificateImageUrl = data.sampleCertificate?.[0]
        ? await uploadToCloudinary(data.sampleCertificate[0])
        : '';
 const payload = {
        eventName: data.eventName,
        description: data.description,
        maxLimit: data.maxLimit,
        enrolled: 0,
        category: data.category,
        startDate: data.startDate,
        endDate: data.endDate,
        sampleCertificate: certificateImageUrl,
        registrationFee: data.registrationFee,
        venue: data.venue,
        keyTakeAways: data.keyTakeAways,
        isApproved: false,
        rewardPoints: data.rewardPoints,
        registrationForm: data.registrationForm,
        registrationEndDate: data.registrationEndDate,
        endTime: data.endTime,
        eventImage: eventImageUrl,
        faqs: faqs,
        venueAddress: data.venueAddress,
      };

     
    
try {
      const res = await axios.post('http://localhost:3000/event/app/v1/create', payload, {
        headers: { 'Authorization':localStorage.getItem("token")},
      });
      if (res.status === 200) {
        alert(res.data.message);
      } else {
        alert('Invalid Data');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  }
    
    const [expandedID, setExpandedID] = useState(null);
    const [comments, setComments] = useState([]);
    const [currentArticle,setCurrentArticle]=useState();
useEffect(()=>{
   const fetchEvent=async ()=>{
    const res=await axios.get(`http://localhost:3000/event/app/v1/events/${eventById}`,{
      headers:{
        Authorization:localStorage.getItem('token')
      }
    });

    if(res.status===200){
      setCurrentArticle(res.data.payload);
      setComments(res.data.payload.comments);
        setIsEnrolled(res.data.isEnrolled);    }
   }
   fetchEvent();
},[eventById,commentIdstore]);
  const toggleExpand = (id) => {
    setExpandedID(expandedID === id ? null : id);
  };
    

  console.log(user.username);
  const handleAddComment = async (data) => {
    const res=await axios.put(`http://localhost:3000/event/app/v1/update/student/${eventById}`,{
       content: data.newComment,
        owner: user._id,
        name: user.username,
    },{
      headers:{
        Authorization:localStorage.getItem("token")
      }
    })
   setComments(res.data.payload.comments || []);
    reset(); 
  };

        useEffect(() => {
          if (edit && currentArticle) {
            reset({
              eventName: currentArticle.eventName,
              description: currentArticle.description,
              maxLimit: currentArticle.maxLimit,
              category: currentArticle.category,
              startDate: new Date(currentArticle.startDate).toISOString().split('T')[0],
              endDate: new Date(currentArticle.endDate).toISOString().split('T')[0],
              registrationFee: currentArticle.registrationFee,
              venue: currentArticle.venue,
              venueAddress: currentArticle.venueAddress,
              keyTakeAways: currentArticle.keyTakeAways,
              rewardPoints: currentArticle.rewardPoints,
              registrationForm: currentArticle.registrationForm,
              registrationEndDate: new Date(currentArticle.registrationEndDate).toISOString().split('T')[0],
              endTime: currentArticle.endTime,
            });

        
            setFaqs(currentArticle.faqs || []);
          }
        }, [edit, currentArticle, reset]);

async function handleEnroll() {
  try {
    const res = await axios.put(
      `http://localhost:3000/event/app/v1/update/student/${eventById}`,
      {
        enroll: true,
        name: user.username,
        rewardPoints: currentArticle.rewardPoints
      },
      {
        headers: {
          Authorization: localStorage.getItem('token')
        }
      }
    );

    if (res.status === 200) {
      alert("🎉 Enrolled successfully!");
      setCurrentArticle(res.data.payload);
    }
  } catch (err) {
    console.error("Enrollment error:", err);
    alert(err.response?.data?.message || " Failed to enroll in the event.");
  }
}
const [commentEditText, setCommentEditText] = useState("");
useEffect(() => {
  if (commentIdstore && commentEditText) {
    setValue('newComment', commentEditText);
  }
}, [commentIdstore, commentEditText, setValue]);

function handleCommenteditState(commentId,content){
setCommentIdstore(commentId);
setCommentEditText(content);
//setValue('newComment', content); 
}
async function handleEditComment(data){
  //setValue('newComment',data.newComment);
  console.log(data.newComment);
  alert(data.newComment)
try{
const res=await axios.put(`http://localhost:3000/event/app/v1/comment/update/${eventById}/${commentIdstore}`,{
  text:data.newComment
},{
  headers:{
    Authorization:localStorage.getItem('token')
  }
});
if(res.status==200){
    setComments(res.data.payload); 
  setCommentEdit(false);
  setCommentEditText(null)
  setCommentIdstore(null);
  alert(res.data.message);
}
}catch(e){
  alert('error in updating the comment');
}
}
        async function deleteComment(commentId){
              try{
              const res=await axios.delete(`http://localhost:3000/event/app/v1/comment/delete/${eventById}/${commentId}`,{
                headers:{
                  Authorization:localStorage.getItem('token')
                }
              })

              if(res.status===200){
                setComments(res.data.payload);
              }

              }catch(e){
                
              alert('error deeleting comment',e.message);
              }
          }
     
        async function deleteArticle(){
      const confirmDelete = window.confirm("Are you sure you want to delete this article?");
  if (!confirmDelete) return;
        const res=await axios.delete(`http://localhost:3000/event/app/v1/event/delete/${eventById}`,{
          headers:{
            Authorization:localStorage.getItem('token')
          }
        });
        if(res.status===200){
          alert('article deleted successfully');
        navigate('../events');
        }
        }
        if (!currentArticle) {
          return <div className="text-center mt-10 text-gray-500">Loading event details...</div>;
        }


  return (
   <div> 
    {!edit?
    <div className="p-4  w-full mt-12">
      {currentArticle.organiser===user._id&& <div className='flex justify-end'>
         <button onClick={() => setEdit(true)}  className='rounded-md  px-3 flex items-center gap-2 py-1 text-md bg-gray-500 text-white m-1'>Edit <MdModeEditOutline className='text-lg'/></button>
    <button className='rounded-md py-1 px-1 ml-2 mr-2 m-1 flex items-center gap-1 bg-red-600 text-white' onClick={()=>deleteArticle()}>Delete <MdDelete className='text-white'/></button>
       </div>}
      <div className="mb-6">
        <img
          src={currentArticle.eventImage}
          alt="Event"
          className="rounded-xl w-full h-72 object-cover"
        />
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">

          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-red-200 rounded px-2 py-1 flex items-center">
              <IoPricetags className="mr-1" /> {currentArticle.category}
            </span>
          </div>

          <h1 className="text-3xl font-bold">{currentArticle.eventName}</h1>

          <div>
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-gray-700">{currentArticle.description}</p>
          </div>
          <div className="space-y-2">
              <p className="flex items-center gap-2 text-gray-700">
                            <BsCalendarDate /> <b>Registration End Date:</b> {new Date(currentArticle.registrationEndDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                            </p>
                            <p className="flex items-center gap-2 text-gray-700">
                  <IoMdTime /> <b>End Time:</b> {currentArticle.endTime}
              </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 break-words">Venue</h2>
            <p className="text-gray-700 max-w-96 break-words">{currentArticle.venue|| 'N/A'}</p>
            <div className="mt-3">
              {currentArticle.venueAddress ? (
                <iframe src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d25418.28499136932!2d78.56582081300171!3d17.421640627684678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1svnr%20map!5e1!3m2!1sen!2sin!4v1752216320713!5m2!1sen!2sin" width="600" height="450" style={{border:0}} 
                loading="lazy" ></iframe>
              ) : (
                <p className="text-gray-500">Venue location not available.</p>
              )}
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/3 space-y-6 bg-gray-50 rounded-xl p-4 shadow-md h-fit">
            <div className="space-y-2">
                <h3 className="font-semibold text-lg mb-2">Date & Time</h3>
                <p className="flex items-center gap-2 text-gray-700">
                  <BsCalendarDate /> <b>Start:</b> {new Date(currentArticle.startDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="flex items-center gap-2 text-gray-700">
                  <IoMdTime /> <b>End:</b> {new Date(currentArticle.endDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Cost</h3>
                  ₹{currentArticle.cost || 0}
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Availability</h3>
                  <div className="w-full bg-gray-200 h-2 rounded">
                    <div
                      className="bg-blue-600 h-2 rounded"
                      style={{ width: `${(currentArticle.enrolled / currentArticle.maxLimit) * 100}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-sm">{currentArticle.enrolled}/{currentArticle.maxLimit} spots filled</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Reward Points</h3>
                  {currentArticle.rewardPoints || 0} points
                </div>
{user._id !== currentArticle.organiser&&(user.role!=='admin'||user.role!='organizer') && (
 <button
  onClick={handleEnroll}
  disabled={isEnrolled}
  className={`px-4 py-2 rounded text-white ${isEnrolled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
>
  {isEnrolled ? "Already Enrolled" : "Enroll"}
</button>


)}


        </div>
      </div>                
           <h2 className="text-xl font-semibold mb-2 text-center"> FAQs</h2>
           <div className="flex justify-center">
              <div className="w-full  space-y-3">
                {currentArticle.faqs && currentArticle.faqs.length > 0 ? (
                  currentArticle.faqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      question={faq.question}
                      answer={faq.answer}
                      isExpanded={expandedID === index}
                      onToggle={() => toggleExpand(index)}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center">No FAQs available.</p>
                )}
              </div>
          </div>
        <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Comments</h2>
        {comments.length > 0 ? (
          <div className="space-y-3">
                  {comments.map((comment, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded">
                                    
                    <div key={index} className="p-2 bg-gray-100 rounded flex gap-3 items-center">
                      {commentIdstore !== comment._id ? (
  <div className="flex gap-3 items-center">
    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg uppercase">
      {comment.name?.charAt(0)}
    </div>
    <div className='flex justify-between'>
      <div className="flex-1">
      <p className="font-semibold">{comment.name}</p>
      <p className="text-gray-700">{comment.content}</p>
    </div>

    {user._id === comment.owner && (
      <div className='ml-[1100px]'>
        <button onClick={() => deleteComment(comment._id)} className='bg-neutral-400 rounded-lg h-8 min-w-10'>
          <MdDelete className="text-red-600 mr-2 text-bold m-1 ml-2 py-1 px-1 text-2xl" />
        </button>
        <button onClick={() => handleCommenteditState(comment._id,comment.content)} className='bg-neutral-400 m-1 rounded-lg w-10 h-8'>
          <MdModeEditOutline className="text-neutral-600 mr-2 text-bold ml-2 text-2xl py-1 px-1" />
        </button>
      </div>
    )}
    </div>
    
  </div>
) : (
  <form
  key={commentIdstore} 
    onSubmit={handleSubmit(handleEditComment)}
    className="mt-4 space-y-2 w-full"
  >
    <input
      type="text"
      placeholder="Edit your comment..."
      {...register('newComment', { required: true })}
      className="w-full border px-3 py-2 rounded"
      onChange={(e) => setValue("newComment", e.target.value)}
      
    />
    <div className="flex gap-2">
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" >
        Save Comment
      </button>
      <button
        type="button"
        onClick={() => {
          setCommentIdstore(null);
          setCommentEdit(false);
        }}
        className="bg-gray-400 text-white px-4 py-2 rounded"
      >
        Cancel
      </button>
    </div>
  </form>
)}
  
                    </div>
               </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No Comments Yet</p>
        )}

            {user._id!==currentArticle.organiser&&<form
            
            onSubmit={handleSubmit(handleAddComment)} className="mt-4 space-y-2">
              
              <input
                  type="text"
                  placeholder="Write a comment..."
                  {...register('newComment', { required: true })}
                  className="w-full border px-3 py-2 rounded"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                 >
                  Add Comment
                </button>
              </form>}

      </div>




    </div>:<div className='p-6 w-full'>
      <h1 className="text-xl mb-4">Update Event</h1>

      <form onSubmit={handleSubmit(handleUpdateSubmit)} className="space-y-4 w-full">

        <div>
          <label>Event Name:</label>
          <input type="text" {...register('eventName', { required: true, minLength: 3, maxLength: 30 })} className="w-full border px-3 py-2 rounded" />
          {errors.eventName && <p className="text-red-600">* Event Name is required (3-30 characters)</p>}
        </div>

        <div>
          <label>Description:</label>
          <textarea placeholder="Describe your event" {...register('description', { required: true })} className="w-full border px-3 py-2 rounded" rows="4"></textarea>
          {errors.description && <p className="text-red-600">* Description is required</p>}
        </div>

        <div>
          <label>Max Limit:</label>
          <input type="number" {...register('maxLimit', { required: true })} className="w-full border px-3 py-2 rounded" />
          {errors.maxLimit && <p className="text-red-600">* Max Limit is required</p>}
        </div>

        <div>
          <label>Category:</label>
          <select {...register('category', { required: true })} className="w-full border px-3 py-2 rounded">
            <option value="">-- Select --</option>
            <option value="hackathon">Hackathon</option>
            <option value="codingcontest">Coding Contest</option>
            <option value="workshop">Workshop</option>
            <option value="seminar">Seminar</option>
            <option value="bootcamp">Bootcamp</option>
          </select>
          {errors.category && <p className="text-red-600">* Category is required</p>}
        </div>

        <div>
          <label>Start Date:</label>
          <input type="date" {...register('startDate', { required: true })} className="w-full border px-3 py-2 rounded" />
          {errors.startDate && <p className="text-red-600">* Start Date is required</p>}
        </div>

        <div>
          <label>End Date:</label>
          <input type="date" {...register('endDate', { required: true })} className="w-full border px-3 py-2 rounded" />
          {errors.endDate && <p className="text-red-600">* End Date is required</p>}
        </div>

        <div>
  <label>Event Image:</label>
  <div className="flex items-center gap-4">
    <input type="file" {...register('eventImage')} accept=".pdf,.jpg,.jpeg,.png" />
    {currentArticle?.eventImage && (
      <img src={currentArticle.eventImage} alt="Event" className="h-20 w-20 object-cover rounded" />
    )}
  </div>
</div>


        <div>
  <label>Sample Certificate:</label>
  <div className="flex items-center gap-4">
    <input type="file" {...register('sampleCertificate')} accept=".pdf,.jpg,.jpeg,.png" />
    {currentArticle?.sampleCertificate && (
      <img src={currentArticle.sampleCertificate} alt="Certificate" className="h-20 w-20 object-cover rounded" />
    )}
  </div>
</div>

        <div>
          <label>Venue:</label>
          <input type="text" {...register('venue', { required: true })} className="w-full border px-3 py-2 rounded" />
          {errors.venue && <p className="text-red-600">* Venue is required</p>}
        </div>
        <div>
          <label>Venue Address (Link) :</label>
          <input type="text" {...register('venueAddress', { required: true })} className="w-full border px-3 py-2 rounded" placeholder='paste google maps address of your college'/>
          {errors.venueAddress && <p className="text-red-600">* Venue Address is required</p>}
        </div>

        <div>
          <label>Registration Fee:</label>
          <input type="number" {...register('registrationFee', { required: true })} className="w-full border px-3 py-2 rounded" />
          {errors.registrationFee && <p className="text-red-600">* Registration Fee is required</p>}
        </div>
        <div>
          <label>Key Takeaways:</label>
          <textarea placeholder="Describe Key takeways" {...register('keyTakeAways', { required: true })} className="w-full border px-3 py-2 rounded" rows="10"></textarea>
          {errors.keyTakeAways && <p className="text-red-600">* Key Takeaways is required</p>}
        </div>
        <div>
          <label>Reward Points:</label>
          <input type="number" {...register('rewardPoints', { required: true })} className="w-full border px-3 py-2 rounded" />
          {errors.rewardPoints && <p className="text-red-600">* Reward Points is required</p>}
        </div>

        <div>
          <label>Registration Form (Link):</label>
          <input type="text" {...register('registrationForm', { required: true })} className="w-full border px-3 py-2 rounded" />
          {errors.registrationForm && <p className="text-red-600">* Registration Form link is required</p>}
        </div>

        <div>
          <label>Registration End Date:</label>
          <input type="date" {...register('registrationEndDate', { required: true })} className="w-full border px-3 py-2 rounded" />
          {errors.registrationEndDate && <p className="text-red-600">* Registration End Date is required</p>}
        </div>

        <div>
          <label>End Time:</label>
          <input type="time" {...register('endTime', { required: true })} className="w-full border px-3 py-2 rounded" />
          {errors.endTime && <p className="text-red-600">* End Time is required</p>}
        </div>

        <div>
          <h3 className="text-lg font-semibold">FAQs</h3>
          {faqs.map((faq, index) => (
            <div key={index} className="flex flex-col md:flex-col gap-4 items-center">
              <input type="text" placeholder="Question" value={faq.question} onChange={(e) => handleFaqChange(index, 'question', e.target.value)} className="w-full border px-3 py-2 rounded" />
              <input type="text" placeholder="Answer" value={faq.answer} onChange={(e) => handleFaqChange(index, 'answer', e.target.value)} className="w-full border px-3 py-2 rounded" />
              <button type="button" onClick={() => removeFaq(index)} className="text-red-500 font-semibold">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addFaq} className="text-white font-medium bg-black rounded-lg p-2 mt-1">+ Add FAQ</button>
        </div>

      <button type='submit' className='rounded-md px-3 flex items-center gap-2 py-1 text-md bg-gray-500 text-white m-1'>Update <MdModeEditOutline className='text-lg'/></button>

      </form>
      </div>}
    </div>
  );
}

export default EventsById;









































































