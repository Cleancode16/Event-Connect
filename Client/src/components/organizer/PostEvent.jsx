
import { useForm } from 'react-hook-form';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Page, PageHeader } from '../ui/Page';

// Titled glass group for the long form
function Section({ title, children }) {
  return (
    <section className="glass rounded-3xl p-5 sm:p-6">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-neutral-300">{title}</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function PostEvent() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);
  const { width, height } = useWindowSize();
  const [posted, setPosted] = useState(false);

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, formData);
    return res.data.secure_url;
  };

  const addFaq = () => setFaqs([...faqs, { question: '', answer: '' }]);
  const removeFaq = (index) => setFaqs(faqs.filter((_, i) => i !== index));
  const handleFaqChange = (index, field, value) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index][field] = value;
    setFaqs(updatedFaqs);
  };

  async function handleFormSubmit(data) {
    try {
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

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/event/app/v1/create`, payload, {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });

      if (res.status === 200) {
        setPosted(true);
        reset();
        setFaqs([{ question: '', answer: '' }]);
      } else {
        alert('Invalid Data');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  }

  useEffect(() => {
    if (posted) {
      const timeout = setTimeout(() => setPosted(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [posted]);

  return (
    <Page className="max-w-4xl">
      <PageHeader title="Create Event" subtitle="Publish a new event for your club" />
      {posted && createPortal(
        <div className="pointer-events-none fixed inset-0 z-[60]">
          <Confetti width={width} height={height} gravity={0.3} tweenDuration={3000} colors={['#0a0a0a', '#525252', '#a3a3a3', '#e5e5e5', '#ffffff']} />
        </div>,
        document.body
      )}

      <AnimatePresence>
        {posted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-5 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black"
          >
            🎉 Event published successfully
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <Section title="Basics">
          <div className="sm:col-span-2">
            <label className="field-label">Event Name</label>
            <input type="text" placeholder="e.g. 24h Build Sprint" {...register('eventName', { required: true, minLength: 3, maxLength: 30 })} className="field" />
            {errors.eventName && <p className="field-error">Event Name is required (3-30 characters)</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="field-label">Description</label>
            <textarea placeholder="Describe your event" {...register('description', { required: true })} className="field" rows="4"></textarea>
            {errors.description && <p className="field-error">Description is required</p>}
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
            <label className="field-label">Max Limit</label>
            <input type="number" placeholder="Seats" {...register('maxLimit', { required: true })} className="field" />
            {errors.maxLimit && <p className="field-error">Max Limit is required</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="field-label">Key Takeaways</label>
            <textarea placeholder="Describe Key Takeaways" {...register('keyTakeAways', { required: true })} className="field" rows="4"></textarea>
            {errors.keyTakeAways && <p className="field-error">Key Takeaways are required</p>}
          </div>
        </Section>

        <Section title="Schedule">
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
            <label className="field-label">End Time</label>
            <input type="time" {...register('endTime', { required: true })} className="field [color-scheme:dark]" />
            {errors.endTime && <p className="field-error">End Time is required</p>}
          </div>

          <div>
            <label className="field-label">Registration End Date</label>
            <input type="date" {...register('registrationEndDate', { required: true })} className="field [color-scheme:dark]" />
            {errors.registrationEndDate && <p className="field-error">Registration End Date is required</p>}
          </div>
        </Section>

        <Section title="Venue & Registration">
          <div>
            <label className="field-label">Venue</label>
            <input type="text" placeholder="e.g. Main Auditorium" {...register('venue', { required: true })} className="field" />
            {errors.venue && <p className="field-error">Venue is required</p>}
          </div>

          <div>
            <label className="field-label">Venue Address (Link)</label>
            <input type="text" {...register('venueAddress', { required: true })} className="field" placeholder='Paste Google Maps link' />
            {errors.venueAddress && <p className="field-error">Venue Address is required</p>}
          </div>

          <div>
            <label className="field-label">Registration Fee</label>
            <input type="number" placeholder="0 for free" {...register('registrationFee', { required: true })} className="field" />
            {errors.registrationFee && <p className="field-error">Registration Fee is required</p>}
          </div>

          <div>
            <label className="field-label">Reward Points</label>
            <input type="number" placeholder="Points per enrollment" {...register('rewardPoints', { required: true })} className="field" />
            {errors.rewardPoints && <p className="field-error">Reward Points are required</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="field-label">Registration Form (Link)</label>
            <input type="text" placeholder="https://forms.gle/…" {...register('registrationForm', { required: true })} className="field" />
            {errors.registrationForm && <p className="field-error">Registration Form link is required</p>}
          </div>
        </Section>

        <Section title="Media">
          <div>
            <label className="field-label">Event Image</label>
            <input type="file" {...register('eventImage')} className="field" accept=".jpg,.jpeg,.png" />
          </div>

          <div>
            <label className="field-label">Sample Certificate</label>
            <input type="file" {...register('sampleCertificate')} className="field" accept=".jpg,.jpeg,.png" />
          </div>
        </Section>

        <section className="glass rounded-3xl p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">FAQs</h2>
            <button type="button" onClick={addFaq} className="btn-ghost px-4 py-1.5 text-xs">
              <IconPlus size={14} /> Add FAQ
            </button>
          </div>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 sm:flex-row">
                    <input type="text" placeholder="Question" value={faq.question} onChange={(e) => handleFaqChange(index, 'question', e.target.value)} className="field" />
                    <input type="text" placeholder="Answer" value={faq.answer} onChange={(e) => handleFaqChange(index, 'answer', e.target.value)} className="field" />
                    <button type="button" onClick={() => removeFaq(index)} aria-label="Remove FAQ" className="flex shrink-0 items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-white/10 hover:text-white">
                      <IconTrash size={16} /> <span className="sm:hidden">Remove</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3.5 text-base">
          {isSubmitting ? 'Publishing…' : 'Create Event'}
        </button>
      </form>
    </Page>
  );
}

export default PostEvent;
