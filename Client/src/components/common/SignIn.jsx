import React from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import axios from 'axios'
import { userAtom } from '../UserAtom'
import { useSetRecoilState } from 'recoil'
import { toast } from 'react-toastify';

export default function SignIn() {
  const navigate = useNavigate();
  const setUser = useSetRecoilState(userAtom);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  async function handleFormSubmit(data) {
    try {
      let res;
      if (data.role === 'student') {
        res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/student/signin`, data);
      } else if (data.role === 'admin') {
        res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/signin`, data);
      } else {
        res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/organizer/signin`, data);
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
      const data = error.response?.data;
      if (data?.needsVerification) {
        // Unverified account: the server just (re)sent the verification link
        (data.emailSent ? toast.info : toast.warn)(data.message, { autoClose: 8000 });
      } else if (!error.response) {
        toast.error('Cannot reach the server. Is it running?');
      } else {
        toast.error(data?.message || 'Invalid credentials, unable to sign in');
      }
    }
  }

  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-1 py-10 text-white">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong w-full max-w-md rounded-[28px] p-6 sm:p-8"
      >
        <div className="mb-8 text-center">
          <h1 className="text-gradient text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-neutral-400">Sign in to continue to Event Connect</p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          <div>
            <label className="field-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="you@college.edu"
              autoComplete="email"
                {...register('email', { required: true })}
              className="field"
            />
            {errors.email?.type === 'required' && (
              <p className="field-error">Email is required</p>
            )}
          </div>

          <div>
            <label className="field-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              autoComplete="current-password"
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
              className="field"
            />
            {errors.password && (
              <p className="field-error">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="field-label" htmlFor="role">Sign in as</label>
            <select
              id="role"
              {...register('role', { required: true })}
              className="field"
            >
              <option value="student">Student</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role?.type === 'required' && (
              <p className="field-error">Role is required</p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          New here?{' '}
          <Link to="/signup" className="font-medium text-white underline-offset-4 hover:underline">Create an account</Link>
        </p>
      </motion.div>
    </div>
  )
}
