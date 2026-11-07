import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {useForm} from 'react-hook-form'
import {useRecoilValue} from 'recoil'
import axios from 'axios';
import { AnimatePresence, motion } from 'motion/react';
import {
  IconCalendarEvent,
  IconCertificate,
  IconChevronDown,
  IconClock,
  IconExternalLink,
  IconHourglass,
  IconMapPin,
  IconPencil,
  IconPlus,
  IconSend,
  IconTag,
  IconTrash,
  IconTrophy,
} from '@tabler/icons-react';
import {userAtom} from '../UserAtom'
import { useParams } from 'react-router-dom';
import { Page } from '../ui/Page';

function AccordionItem({ question, answer, isExpanded, onToggle }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
      <button type="button" className="flex w-full items-center justify-between gap-3 p-4 text-left text-white" onClick={onToggle}>
        <span className="font-medium">{question}</span>
        <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0 text-neutral-400">
          <IconChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.06] px-4 py-4 text-sm text-neutral-400">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const longDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

// Small glass panel for the details sidebar
function InfoPanel({ title, children }) {
  return (
    <div className="glass rounded-3xl p-5">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{title}</h3>
      {children}
    </div>
  );
}

function EventsById() {
  const [edit,setEdit]=useState(false);
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
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/event/app/v1/event/update/${eventById}`, payload, {
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
    const [expandedID, setExpandedID] = useState(null);
    const [comments, setComments] = useState([]);
    const [currentArticle,setCurrentArticle]=useState();
useEffect(()=>{
   const fetchEvent=async ()=>{
    const res=await axios.get(`${import.meta.env.VITE_API_URL}/event/app/v1/events/${eventById}`,{
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
    const res=await axios.put(`${import.meta.env.VITE_API_URL}/event/app/v1/update/student/${eventById}`,{
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
      `${import.meta.env.VITE_API_URL}/event/app/v1/update/student/${eventById}`,
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
const res=await axios.put(`${import.meta.env.VITE_API_URL}/event/app/v1/comment/update/${eventById}/${commentIdstore}`,{
  text:data.newComment
},{
  headers:{
    Authorization:localStorage.getItem('token')
  }
});
if(res.status==200){
    setComments(res.data.payload); 
  setCommentEditText(null)
  setCommentIdstore(null);
  alert(res.data.message);
}
}catch(e){
  console.error(e);
  alert('error in updating the comment');
}
}
        async function deleteComment(commentId){
              try{
              const res=await axios.delete(`${import.meta.env.VITE_API_URL}/event/app/v1/comment/delete/${eventById}/${commentId}`,{
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
        const res=await axios.delete(`${import.meta.env.VITE_API_URL}/event/app/v1/event/delete/${eventById}`,{
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
          return (
            <div className="mx-auto w-full max-w-6xl animate-pulse space-y-5">
              <div className="h-64 w-full rounded-[28px] bg-white/[0.05] sm:h-96"></div>
              <div className="h-10 w-2/3 rounded-xl bg-white/[0.05]"></div>
              <div className="h-40 w-full rounded-3xl bg-white/[0.05]"></div>
            </div>
          );
        }

  const heroImage = Array.isArray(currentArticle.eventImage) ? currentArticle.eventImage[0] : currentArticle.eventImage;
  const fillPct = currentArticle.maxLimit ? Math.min((currentArticle.enrolled / currentArticle.maxLimit) * 100, 100) : 0;

  return (
   <Page className="max-w-6xl">
    {!edit ? (
      <div>
          {/* Hero */}
          <div className="relative mb-6 overflow-hidden rounded-[28px] border border-white/10">
            {heroImage ? (
              <motion.img
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                src={heroImage}
                alt={currentArticle.eventName}
                className="h-64 w-full object-cover sm:h-80 md:h-[26rem]"
              />
            ) : (
              <div className="h-64 w-full bg-gradient-to-br from-neutral-800 to-neutral-950 sm:h-80" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-8">
              <div>
                <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-black">
                  <IconTag size={13} stroke={2} /> {currentArticle.category}
                </span>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">{currentArticle.eventName}</h1>
              </div>
              {currentArticle.organiser===user._id&& <div className='flex shrink-0 gap-2'>
                <button onClick={() => setEdit(true)} className='btn-primary'>
                  <IconPencil size={16} /> Edit
                </button>
                <button className='btn-ghost backdrop-blur-md' onClick={deleteArticle}>
                  <IconTrash size={16} /> Delete
                </button>
              </div>}
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex-1 space-y-5">
              <div className="glass rounded-3xl p-6">
                <h2 className="mb-3 text-lg font-semibold text-white">About</h2>
                <p className="whitespace-pre-line leading-relaxed text-neutral-300">{currentArticle.description}</p>
              </div>

              {currentArticle.keyTakeAways && (
                <div className="glass rounded-3xl p-6">
                  <h2 className="mb-3 text-lg font-semibold text-white">Key Takeaways</h2>
                  <p className="whitespace-pre-line leading-relaxed text-neutral-300">{currentArticle.keyTakeAways}</p>
                </div>
              )}

              <div className="glass rounded-3xl p-6">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <IconMapPin size={18} /> {currentArticle.venue || 'N/A'}
                  </h2>
                  {currentArticle.venueAddress && (
                    <a href={currentArticle.venueAddress} target="_blank" rel="noreferrer" className="btn-ghost px-4 py-1.5 text-xs">
                      Open in Maps <IconExternalLink size={14} />
                    </a>
                  )}
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
                  {currentArticle.venueAddress ? (
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d25418.28499136932!2d78.56582081300171!3d17.421640627684678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1svnr%20map!5e1!3m2!1sen!2sin!4v1752216320713!5m2!1sen!2sin"
                      width="100%"
                      height="300"
                      style={{border:0}}
                      className="[filter:grayscale(1)] dark:[filter:grayscale(1)_invert(0.92)_contrast(0.9)]"
                      loading="lazy"
                    ></iframe>
                  ) : (
                    <p className="p-4 text-neutral-500">Venue location not available.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 lg:w-1/3">
              <InfoPanel title="Date & Time">
                <div className="space-y-2 text-sm text-neutral-300">
                  <p className="flex items-center gap-2"><IconCalendarEvent size={16} className="text-neutral-500" /> {longDate(currentArticle.startDate)} – {longDate(currentArticle.endDate)}</p>
                  <p className="flex items-center gap-2"><IconClock size={16} className="text-neutral-500" /> Ends at {currentArticle.endTime}</p>
                  <p className="flex items-center gap-2"><IconHourglass size={16} className="text-neutral-500" /> Register by {longDate(currentArticle.registrationEndDate)}</p>
                </div>
              </InfoPanel>

              <div className="grid grid-cols-2 gap-4">
                <InfoPanel title="Cost">
                  <p className="text-2xl font-bold text-white">₹{currentArticle.registrationFee || 0}</p>
                </InfoPanel>
                <InfoPanel title="Rewards">
                  <p className="flex items-center gap-1.5 text-2xl font-bold text-white"><IconTrophy size={20} /> {currentArticle.rewardPoints || 0}</p>
                </InfoPanel>
              </div>

              <InfoPanel title="Availability">
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${fillPct}%` }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                    className="h-full rounded-full bg-white"
                  />
                </div>
                <p className="mt-2 text-sm text-neutral-400">{currentArticle.enrolled}/{currentArticle.maxLimit} spots filled</p>
              </InfoPanel>

              {currentArticle.sampleCertificate && (
                <InfoPanel title="Sample Certificate">
                  <a href={currentArticle.sampleCertificate} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-2xl border border-white/[0.06]">
                    <img src={currentArticle.sampleCertificate} alt="Sample certificate" className="h-36 w-full object-cover transition duration-500 group-hover:scale-105" />
                  </a>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500"><IconCertificate size={14} /> Awarded to participants</p>
                </InfoPanel>
              )}

              {user._id !== currentArticle.organiser && (user.role !== 'admin' && user.role !== 'organizer') && (
                <motion.button
                  whileHover={!isEnrolled ? { scale: 1.02 } : undefined}
                  whileTap={!isEnrolled ? { scale: 0.97 } : undefined}
                  onClick={handleEnroll}
                  disabled={isEnrolled}
                  className={`w-full rounded-full px-4 py-3.5 font-semibold transition ${
                    isEnrolled
                      ? "cursor-not-allowed border border-white/15 bg-white/[0.04] text-neutral-400"
                      : "bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:bg-neutral-200"
                  }`}
                >
                  {isEnrolled ? "Already Enrolled" : "Enroll Now"}
                </motion.button>
              )}

              {currentArticle.registrationForm && (
                <a href={currentArticle.registrationForm} target="_blank" rel="noreferrer" className="btn-ghost w-full py-3">
                  Registration Form <IconExternalLink size={16} />
                </a>
              )}
            </div>
          </div>

          <div className="glass mt-5 rounded-3xl p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Frequently Asked Questions</h2>
            <div className="space-y-3">
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
                <p className="py-4 text-center text-neutral-500">No FAQs available.</p>
              )}
            </div>
          </div>

          <div className="glass mt-5 rounded-3xl p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Comments <span className="text-neutral-500">· {comments.length}</span></h2>
            {comments.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment._id || index}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.03]"
                  >
                    {commentIdstore !== comment._id ? (
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold uppercase text-black">
                            {comment.name?.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold capitalize text-white">{comment.name}</p>
                            <p className="break-words text-sm text-neutral-300">{comment.content}</p>
                          </div>
                          {user._id === comment.owner && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleCommenteditState(comment._id, comment.content)}
                                aria-label="Edit comment"
                                className="rounded-full p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
                              >
                                <IconPencil size={16} />
                              </button>
                              <button
                                onClick={() => deleteComment(comment._id)}
                                aria-label="Delete comment"
                                className="rounded-full p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
                              >
                                <IconTrash size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <form
                        key={commentIdstore}
                        onSubmit={handleSubmit(handleEditComment)}
                        className="space-y-3 p-4"
                      >
                        <input
                          type="text"
                          placeholder="Edit your comment..."
                          {...register('newComment', { required: true })}
                          className="field"
                          onChange={(e) => setValue("newComment", e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button type="submit" className="btn-primary px-4 py-2">
                            Save Comment
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCommentIdstore(null);
                            }}
                            className="btn-ghost px-4 py-2"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </motion.div>
                ))}
                </AnimatePresence>
              </div>
            ) : (
              <p className="py-4 text-neutral-500">No comments yet. Be the first to comment!</p>
            )}

            {user._id !== currentArticle.organiser && (
              <form
                onSubmit={handleSubmit(handleAddComment)}
                className="mt-5 flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Write a comment..."
                  {...register('newComment', { required: true })}
                  className="field rounded-full px-5"
                />
                <button type="submit" aria-label="Add comment" className="btn-primary shrink-0 px-4">
                  <IconSend size={16} /> <span className="hidden sm:inline">Post</span>
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className='mx-auto max-w-4xl'>
          <h1 className="text-gradient mb-6 text-2xl font-bold tracking-tight sm:text-3xl">Update Event</h1>

          <form onSubmit={handleSubmit(handleUpdateSubmit)} className="glass grid grid-cols-1 gap-5 rounded-[28px] p-5 sm:grid-cols-2 sm:p-8">
            <div className="sm:col-span-2">
              <label className="field-label">Event Name</label>
              <input type="text" {...register('eventName', { required: true, minLength: 3, maxLength: 30 })} className="field" />
              {errors.eventName && <p className="field-error">Event Name is required (3-30 characters)</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="field-label">Description</label>
              <textarea placeholder="Describe your event" {...register('description', { required: true })} className="field" rows="4"></textarea>
              {errors.description && <p className="field-error">Description is required</p>}
            </div>

            <div>
              <label className="field-label">Max Limit</label>
              <input type="number" {...register('maxLimit', { required: true })} className="field" />
              {errors.maxLimit && <p className="field-error">Max Limit is required</p>}
            </div>

            <div>
              <label className="field-label">Category</label>
              <select {...register('category', { required: true })} className="field">
                <option value="">-- Select --</option>
                <option value="hackathon">Hackathon</option>
                <option value="codingcontest">Coding Contest</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="bootcamp">Bootcamp</option>
              </select>
              {errors.category && <p className="field-error">Category is required</p>}
            </div>

            <div>
              <label className="field-label">Start Date</label>
              <input type="date" {...register('startDate', { required: true })} className="field [color-scheme:dark]" />
              {errors.startDate && <p className="field-error">Start Date is required</p>}
            </div>

            <div>
              <label className="field-label">End Date</label>
              <input type="date" {...register('endDate', { required: true })} className="field [color-scheme:dark]" />
              {errors.endDate && <p className="field-error">End Date is required</p>}
            </div>

            <div>
              <label className="field-label">Event Image</label>
              <div className="flex items-center gap-3">
                <input type="file" {...register('eventImage')} accept=".pdf,.jpg,.jpeg,.png" className="field" />
                {heroImage && (
                  <img src={heroImage} alt="Event" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                )}
              </div>
            </div>

            <div>
              <label className="field-label">Sample Certificate</label>
              <div className="flex items-center gap-3">
                <input type="file" {...register('sampleCertificate')} accept=".pdf,.jpg,.jpeg,.png" className="field" />
                {currentArticle?.sampleCertificate && (
                  <img src={currentArticle.sampleCertificate} alt="Certificate" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                )}
              </div>
            </div>

            <div>
              <label className="field-label">Venue</label>
              <input type="text" {...register('venue', { required: true })} className="field" />
              {errors.venue && <p className="field-error">Venue is required</p>}
            </div>

            <div>
              <label className="field-label">Venue Address (Link)</label>
              <input type="text" {...register('venueAddress', { required: true })} className="field" placeholder='paste google maps address of your college' />
              {errors.venueAddress && <p className="field-error">Venue Address is required</p>}
            </div>

            <div>
              <label className="field-label">Registration Fee</label>
              <input type="number" {...register('registrationFee', { required: true })} className="field" />
              {errors.registrationFee && <p className="field-error">Registration Fee is required</p>}
            </div>

            <div>
              <label className="field-label">Reward Points</label>
              <input type="number" {...register('rewardPoints', { required: true })} className="field" />
              {errors.rewardPoints && <p className="field-error">Reward Points is required</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="field-label">Key Takeaways</label>
              <textarea placeholder="Describe Key takeaways" {...register('keyTakeAways', { required: true })} className="field" rows="6"></textarea>
              {errors.keyTakeAways && <p className="field-error">Key Takeaways is required</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="field-label">Registration Form (Link)</label>
              <input type="text" {...register('registrationForm', { required: true })} className="field" />
              {errors.registrationForm && <p className="field-error">Registration Form link is required</p>}
            </div>

            <div>
              <label className="field-label">Registration End Date</label>
              <input type="date" {...register('registrationEndDate', { required: true })} className="field [color-scheme:dark]" />
              {errors.registrationEndDate && <p className="field-error">Registration End Date is required</p>}
            </div>

            <div>
              <label className="field-label">End Time</label>
              <input type="time" {...register('endTime', { required: true })} className="field [color-scheme:dark]" />
              {errors.endTime && <p className="field-error">End Time is required</p>}
            </div>

            <div className="sm:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">FAQs</h3>
                <button type="button" onClick={addFaq} className="btn-ghost px-4 py-1.5 text-xs">
                  <IconPlus size={14} /> Add FAQ
                </button>
              </div>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 sm:flex-row">
                    <input type="text" placeholder="Question" value={faq.question} onChange={(e) => handleFaqChange(index, 'question', e.target.value)} className="field" />
                    <input type="text" placeholder="Answer" value={faq.answer} onChange={(e) => handleFaqChange(index, 'answer', e.target.value)} className="field" />
                    <button type="button" onClick={() => removeFaq(index)} aria-label="Remove FAQ" className="flex shrink-0 items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-white/10 hover:text-white">
                      <IconTrash size={16} /> <span className="sm:hidden">Remove</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2 sm:col-span-2">
              <button type='submit' className='btn-primary flex-1 py-3'>
                <IconPencil size={16} /> Update Event
              </button>
              <button type='button' onClick={() => setEdit(false)} className='btn-ghost flex-1 py-3'>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </Page>
  );
}

export default EventsById;
