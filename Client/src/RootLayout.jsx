import React from 'react'
import Header from '../src/components/common/Header'
import Footer from '../src/components/common/Footer'
import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RootLayout() {
  return (
    <div >
      <Header/>
      <div className='min-h-screen'>
        <Outlet/>
      </div>
      <Footer/>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"  // or "dark" / "light"
      />
    </div>
  )
}

export default RootLayout