import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { userAtom } from '../UserAtom'
import { useSetRecoilState } from 'recoil'
import { toast } from 'react-toastify';

export default function SignIn() {
  const navigate = useNavigate();
  const setUser = useSetRecoilState(userAtom);
  const { register, handleSubmit, formState: { errors } } = useForm();

  async function handleFormSubmit(data) {
    try {
      let res;
      if (data.role === 'student') {
        res = await axios.post('http://localhost:3000/auth/student/signin', data);
      } else if (data.role === 'admin') {
        res = await axios.post('http://localhost:3000/admin/signin', data);
      } else {
        res = await axios.post('http://localhost:3000/auth/organizer/signin', data);
      }

      if (res.status === 200) {
        const payload = {
          username: res.data.payload.username,
          role: res.data.payload.role,
          _id: res.data.payload._id,
          email: res.data.payload.email,
          isLoggedIn: true
        };
        setUser(payload);
        localStorage.setItem('token', res.data.token);

        if (data.role === 'student') {
          toast.success('You have been successfully logged in');
          navigate(`/student-profile/${res.data.payload.username}`);
        } else if (data.role === 'admin') {
          navigate(`/admin-profile/${res.data.payload.username}`);
        } else {
          navigate(`/organizer-profile/${res.data.payload.username}`);
        }
      } else {
        alert("Invalid data");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      toast.error('Invalid credentials, unable to sign in');
    }
  }

  const borderColor = 'rgba(8, 112, 184, 0.7)';

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div
        className="p-6 m-3 rounded-2xl shadow-lg w-full max-w-lg mt-20"
        style={{ border: `1px solid ${borderColor}`, backgroundColor: 'bg-gray-800' }}
      >
        <form onSubmit={handleSubmit(handleFormSubmit)}>

          <div className="mb-4">
            <label className="block mb-1" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              {...register('email', { required: true })}
              className="w-full px-4 py-2 rounded-md bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ border: `1px solid ${borderColor}` }}
            />
            {errors.email?.type === 'required' && (
              <p className="text-red-600 mt-1">*Email is required</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              {...register('password', {
                required: 'Password is required',
                pattern: {
                  value: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*@).{8,}$/,
                  message: "Password must include letters, digits, and '@'"
                },
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters"
                }
              })}
              className="w-full px-4 py-2 rounded-md bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ border: `1px solid ${borderColor}` }}
            />
            {errors.password && (
              <p className="text-red-600 mt-1">*{errors.password.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1" htmlFor="role">Select Role</label>
            <select
              id="role"
              {...register('role', { required: true })}
              className="w-full px-4 py-2 rounded-md bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ border: `1px solid ${borderColor}` }}
            >
              <option value="student" className="bg-black text-white">student</option>
              <option value="organizer" className="bg-black text-white">organizer</option>
              <option value="admin" className="bg-black text-white">admin</option>
            </select>
            {errors.role?.type === 'required' && (
              <p className="text-red-600 mt-1">*Role is required</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-neutral-200 hover:bg-white text-black py-2 px-4 rounded-md transition-colors duration-300"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
