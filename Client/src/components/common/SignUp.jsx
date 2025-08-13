import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SignUp() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
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
          'http://localhost:3000/auth/student/signUp',
          data
        );

        if (res.status === 200) {
          alert(res.data.message);
          // navigate somewhere if needed
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
          'http://localhost:3000/auth/organizer/signUp',
          payload
        );

        if (res.status === 200) {
          alert(res.data.message);
          // navigate somewhere if needed
        } else {
          alert("Invalid data");
        }
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  }

  useEffect(() => {
    setValue('role', role);
  }, [role, setValue]);

  const borderColor = 'rgba(8, 112, 184, 0.7)';

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div
        className="p-6 m-4 rounded-2xl shadow-lg w-full max-w-lg mt-20"
        style={{ border: `1px solid ${borderColor}`,backgroundColor: 'bg-gray-800' }}
      >
        <div className="flex justify-center mb-6">
          <div className="flex rounded-full bg-gray-800 p-1">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out
                ${
                  role === "student"
                    ? "bg-white text-black shadow-lg scale-105"
                    : "text-gray-400"
                }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole("organizer")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out
                ${
                  role === "organizer"
                    ? "bg-white text-black shadow-lg scale-105"
                    : "text-gray-400"
                }`}
            >
              Organizer
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Username */}
          <div className="mb-3">
            <label className="block mb-1 text-white">Username</label>
            <input
              type="text"
              {...register('username', { required: true, minLength: 3, maxLength: 30 })}
              className="w-full px-4 py-2 bg-black text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ border: `1px solid ${borderColor}` }}
            />
            {errors.username?.type === 'required' && <p className='text-red-600'>*Username is required</p>}
            {errors.username?.type === 'minLength' && <p className='text-red-600'>*MinLength is 3</p>}
            {errors.username?.type === 'maxLength' && <p className='text-red-600'>*MaxLength is 30</p>}
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="block mb-1 text-white">Email</label>
            <input
              type="email"
              {...register('email', { required: true })}
              className="w-full px-4 py-2 bg-black text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ border: `1px solid ${borderColor}` }}
            />
            {errors.email && <p className='text-red-600'>*Email is required</p>}
          </div>

          {/* Phone Number */}
          <div className="mb-3">
            <label className="block mb-1 text-white">Phone Number</label>
            <input
              type="text"
              {...register('phoneNumber', {
                required: true,
                minLength: 10,
                maxLength: 10,
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Phone number must contain only digits"
                }
              })}
              className="w-full px-4 py-2 bg-black text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ border: `1px solid ${borderColor}` }}
            />
            {errors.phoneNumber && <p className='text-red-600'>{errors.phoneNumber.message || "*Phone number is required"}</p>}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="block mb-1 text-white">Password</label>
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: "Password must be at least 8 characters" },
                pattern: {
                  value: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*@).{8,}$/,
                  message: "Password must include letters, digits, and '@'"
                }
              })}
              className="w-full px-4 py-2 bg-black text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ border: `1px solid ${borderColor}` }}
            />
            {errors.password && <p className='text-red-600'>*{errors.password.message}</p>}
          </div>

          {/* College Name */}
          <div className="mb-3">
            <label className="block mb-1 text-white">College Name</label>
            <select
              {...register('collegeName', { required: true })}
              className="w-full px-4 py-2 bg-black text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ border: `1px solid ${borderColor}` }}
            >
              <option value="vnrvjiet">VNRVJIET</option>
              <option value="cbit">CBIT</option>
              <option value="vasavi">VASAVI</option>
              <option value="jntuh">JNTUH</option>
              <option value="griet">GRIET</option>
            </select>
            {errors.collegeName && <p className='text-red-600'>*College name is required</p>}
          </div>

          {/* Department */}
          <div className="mb-3">
            <label className="block mb-1 text-white">Department</label>
            <select
              {...register('department', { required: true })}
              className="w-full px-4 py-2 bg-black text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ border: `1px solid ${borderColor}` }}
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
            {errors.department && <p className='text-red-600'>*Department is required</p>}
          </div>

          {/* Student: Year */}
          {role === 'student' && (
            <div className="mb-3">
              <label className="block mb-1 text-white">Year of Studying</label>
              <select
                {...register('year', { required: true })}
                className="w-full px-4 py-2 bg-black text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ border: `1px solid ${borderColor}` }}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
              {errors.year && <p className='text-red-600'>*Year is required</p>}
            </div>
          )}

          {/* Organizer Fields */}
          {role === 'organizer' && (
            <>
              {/* Position */}
              <div className="mb-3">
                <label className="block mb-1 text-white">Position</label>
                <select
                  {...register('position')}
                  className="w-full px-4 py-2 bg-black text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  style={{ border: `1px solid ${borderColor}` }}
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
              <div className="mb-3">
                <label className="block mb-1 text-white">Club Name</label>
                <input
                  type="text"
                  {...register('clubName', { required: true })}
                  className="w-full px-4 py-2 bg-black text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  style={{ border: `1px solid ${borderColor}` }}
                />
                {errors.clubName && <p className='text-red-600'>*Club name is required</p>}
              </div>

              {/* Logo Upload */}
              <div className="mb-3">
                <label className="block mb-1 text-white">Upload Logo</label>
                <input
                  type="file"
                  {...register('logo', { required: true })}
                  accept="image/*"
                  className="w-full px-4 py-2 bg-black text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  style={{ border: `1px solid ${borderColor}` }}
                />
                {errors.logo && <p className='text-red-600'>*Logo is required</p>}
              </div>
            </>
          )}

          {/* Hidden Role Field */}
          <input type="hidden" {...register('role')} value={role} />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-white text-black py-2 px-4 rounded-md border hover:bg-neutral-600 hover:border-white hover:text-white"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
