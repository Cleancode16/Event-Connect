import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import axios from 'axios';

export default function SignUp() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm();
  const [role, setRole] = useState('student');

  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, formData);
    return res.data.secure_url;
  };

  async function handleFormSubmit(data) {
    try {
      if (role === 'student') {
        data.phoneNumber = Number(data.phoneNumber);
        data.year = Number(data.year);

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/student/signUp`,
          data
        );

        if (res.status === 200) {
          alert(res.data.message);
          navigate("/signin");
        } else {
          alert("Invalid data");
        }

      } else {
        const logourl = data.logo?.[0]
          ? await uploadToCloudinary(data.logo[0])
          : '';

        data.phoneNumber = Number(data.phoneNumber);

        const payload = {
          username: data.username,
          email: data.email,
          phoneNumber: data.phoneNumber,
          password: data.password,
          collegeName: data.collegeName,
          department: data.department,
          position: data.position,
          clubName: data.clubName,
          role: data.role,
          logo: logourl
        };

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/organizer/signUp`,
          payload
        );

        if (res.status === 200) {
          alert(res.data.message);
          navigate("/signin");
        } else {
          alert("Invalid data");
        }
      }
    } catch (err) {
      console.error(err);
      if (err.config?.url?.includes('api.cloudinary.com')) {
        alert('Logo upload failed. Check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in Client/.env.');
      } else if (!err.response) {
        alert('Cannot reach the server. Is it running?');
      } else {
        // e.g. "An account with this email already exists", "Invalid password: ..."
        alert(err.response.data?.message || 'Something went wrong');
      }
    }
  }

  useEffect(() => {
    setValue('role', role);
  }, [role, setValue]);

  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-1 py-10 text-white">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong w-full max-w-2xl rounded-[28px] p-6 sm:p-8"
      >
        <div className="mb-6 text-center">
          <h1 className="text-gradient text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-neutral-400">Join as a student or as a club organizer</p>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="glass flex rounded-full p-1">
            {['student', 'organizer'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`relative rounded-full px-5 py-2 text-sm font-medium capitalize transition-colors duration-200 ${
                  role === r ? 'text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {role === r && (
                  <motion.span
                    layoutId="signup-role-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-white"
                  />
                )}
                <span className="relative z-10">{r}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Username */}
            <div>
              <label className="field-label">Username</label>
              <input
                type="text"
                placeholder="johndoe"
                {...register('username', { required: true, minLength: 3, maxLength: 30 })}
                className="field"
              />
              {errors.username?.type === 'required' && <p className='field-error'>Username is required</p>}
              {errors.username?.type === 'minLength' && <p className='field-error'>MinLength is 3</p>}
              {errors.username?.type === 'maxLength' && <p className='field-error'>MaxLength is 30</p>}
            </div>

            {/* Email */}
            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                placeholder="you@college.edu"
                {...register('email', { required: true })}
                className="field"
              />
              {errors.email && <p className='field-error'>Email is required</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label className="field-label">Phone Number</label>
              <input
                type="text"
                placeholder="10-digit number"
                {...register('phoneNumber', {
                  required: true,
                  minLength: 10,
                  maxLength: 10,
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Phone number must contain only digits"
                  }
                })}
                className="field"
              />
              {errors.phoneNumber && <p className='field-error'>{errors.phoneNumber.message || "Phone number is required"}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="field-label">Password</label>
              <input
                type="password"
                placeholder="Min 8 chars, letters, digits, @"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: "Password must be at least 8 characters" },
                  pattern: {
                    value: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*@).{8,}$/,
                    message: "Password must include letters, digits, and '@'"
                  }
                })}
                className="field"
              />
              {errors.password && <p className='field-error'>{errors.password.message}</p>}
            </div>

            {/* College Name */}
            <div>
              <label className="field-label">College Name</label>
              <select
                {...register('collegeName', { required: true })}
                className="field"
              >
                <option value="vnrvjiet">VNRVJIET</option>
                <option value="cbit">CBIT</option>
                <option value="vasavi">VASAVI</option>
                <option value="jntuh">JNTUH</option>
                <option value="griet">GRIET</option>
              </select>
              {errors.collegeName && <p className='field-error'>College name is required</p>}
            </div>

            {/* Department */}
            <div>
              <label className="field-label">Department</label>
              <select
                {...register('department', { required: true })}
                className="field"
              >
                <option value="cse">CSE</option>
                <option value="ece">ECE</option>
                <option value="csm">CSM</option>
                <option value="csd">CSD</option>
                <option value="cys">CYS</option>
                <option value="csbs">CSBS</option>
                <option value="it">IT</option>
                <option value="aids">AIDS</option>
                <option value="mech">ME</option>
              </select>
              {errors.department && <p className='field-error'>Department is required</p>}
            </div>

            {/* Student: Year */}
            {role === 'student' && (
              <div>
                <label className="field-label">Year of Studying</label>
                <select
                  {...register('year', { required: true })}
                  className="field"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
                {errors.year && <p className='field-error'>Year is required</p>}
              </div>
            )}

            {/* Organizer Fields */}
            {role === 'organizer' && (
              <>
                {/* Position */}
                <div>
                  <label className="field-label">Position</label>
                  <select
                    {...register('position')}
                    className="field"
                  >
                    <option value="lead">Lead</option>
                    <option value="chairPerson">Chair Person</option>
                    <option value="secretary">Secretary</option>
                    <option value="president">President</option>
                    <option value="cordinator">Coordinator</option>
                    <option value="vlounteer">Volunteer</option>
                  </select>
                </div>

                {/* Club Name */}
                <div>
                  <label className="field-label">Club Name</label>
                  <input
                    type="text"
                    placeholder="Coding Club"
                    {...register('clubName', { required: true })}
                    className="field"
                  />
                  {errors.clubName && <p className='field-error'>Club name is required</p>}
                </div>

                {/* Logo Upload */}
                <div className="sm:col-span-2">
                  <label className="field-label">Club Logo</label>
                  <input
                    type="file"
                    {...register('logo', { required: true })}
                    accept="image/*"
                    className="field"
                  />
                  {errors.logo && <p className='field-error'>Logo is required</p>}
                </div>
              </>
            )}
          </div>

          {/* Hidden Role Field */}
          <input type="hidden" {...register('role')} value={role} />

          {/* Submit Button */}
          <button type="submit" disabled={isSubmitting} className="btn-primary mt-8 w-full py-3">
            {isSubmitting ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Already have an account?{' '}
          <Link to="/signin" className="font-medium text-white underline-offset-4 hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
