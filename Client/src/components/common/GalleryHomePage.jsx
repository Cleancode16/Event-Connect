import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { BsArrowUpRightCircle } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../UserAtom';

function GalleryHomePage() {
  const [clubs,setClubs]=useState([]);
  const navigate=useNavigate();
  const user = useRecoilValue(userAtom);

  useEffect(()=>{
    async function getClubs(){
      try{
      const res=await axios.get('http://localhost:3000/organiser/get/organiserDetails',{
        headers:{
          Authorization:localStorage.getItem('token')
        }
      });
      if(res.status===200){
        setClubs(res.data.organiserDetails);
      }
    }catch(e){
      alert('unable to fetch the organizer details',e);
    }
    }
    getClubs()
  },[])
  function ClubEventsNavigate(clubId) {
  if (user?.email) {
    navigate(`/student-profile/${user.email}/club/${clubId}`);
  } else {
    alert("User not logged in");
  }
}

  return (
    <div>
      <h1 className='text-white ml-80 mt-20 text-2xl font-semibold'>Clubs Gallery Page</h1>
     {clubs.map((club,idx)=>
      <div key={idx} className='flex flex-wrap  items-center '>
       <div className='h-64 w-48 bg-gray-1000 rounded-md m-4 flex flex-col border-2 border-[rgba(8,112,184,0.7)]'>
        <h1 className='text-white text-center text-bold mt-2'>{club.clubName}</h1>
        <img src='https://turinghut.org/static/9384c958bbd95db9f010ee70a3bdaee1/078c3/turinghut_logo.webp' alt="" className='h-28 w-28 mx-auto mt-2'/>
        <h2 className='text-white text-center'><strong>Department :</strong> {club.department}</h2>
     <h2 className='text-white text-center'><strong>CollegeName :</strong> {club.collegeName}</h2>
     <button className='m-2 text-white rounded-md bg-black w-32 px-2 py-1 mx-auto flex border-2 border-[rgba(8,112,184,0.7)] hover:bg-neutral-400  hover:text-white' onClick={()=>ClubEventsNavigate(club._id)}>View Events <BsArrowUpRightCircle className='mx-auto  my-1 fs-bold text-center' /></button>
       </div>
      </div>
     )
     
     }
    </div>
  )
}

export default GalleryHomePage