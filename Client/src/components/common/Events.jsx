import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BsArrowUpRightCircle } from "react-icons/bs";
import { IoPricetags } from "react-icons/io5";
import { GoDotFill } from "react-icons/go";
import  './Event.css'
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../UserAtom';
function Events() {
  const [events, setEvents] = useState([]);
   const navigate=useNavigate();
   const user=useRecoilValue(userAtom)
  useEffect(() => {
    const getEvents = async () => {
      try {
        const res = await axios.get('http://localhost:3000/event/app/v1/events', {
          headers: {
            Authorization: localStorage.getItem("token")
          }
        });
        setEvents(res.data.payload);
      } catch (e) {
        alert('Error fetching events');
      }
    };
    getEvents()
  }, []);
  function callEventByid(eventObj){
      if(user?.role === 'student'){
  navigate(`/student-profile/${user.emailId}/viewevent/${eventObj._id}`);
} else if(user?.role === 'organizer'){
  navigate(`/organizer-profile/${user.emailId}/viewevent/${eventObj._id}`);
} else if(user?.role === 'admin'){
  navigate(`/admin-profile/${user.emailId}/viewevent/${eventObj._id}`);
}

  }
const isActive = (registrationEndDate, enrolled, maxLimit) => {
  const today = new Date();
  const regEndDate = new Date(registrationEndDate);
  return regEndDate >= today && enrolled < maxLimit;
};
  return (
    <div className="flex flex-wrap flex-row gap-4 p-4 bg-black h-screen">
      {
        events.map((obj, idx) => (
          <div key={idx} className='min-h-52 bg-black min-w-60 max-w-60 max-h-80 flex flex-col rounded-lg  border border-[rgba(8,112,184,0.7)] 
mt-24'>
            <div className=''>
              <img src={obj.eventImage} alt=""  className="w-full h-40 mb-3 rounded-t" />
            </div>
            <div className='px-4 pb-4 text-white'>
              <div className='flex justify-between items-center mb-2'>
                <h1 className='text-lg font-bold'>{obj.eventName}</h1>
                <span className='text-xs bg-gray-500 text-center rounded-md px-2 py-1 flex '>
<IoPricetags className='m-1'/>{obj.category}
                </span>
              </div>
      <div className='flex flex-row'>
        <div className='text-xs mb-2'>
                <p>Start Date : {new Date(obj.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                <p>End Date : {new Date(obj.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
              <div className='mt-2 ml-2 '>
                <div className='bg-white text-black py-1 px-2 rounded-md'>
                  <p className='text-xs text-center text-black ml-1'> Seats Left: <span className='font-semibold text-xs '>{obj.maxLimit - obj.enrolled}</span></p>
                </div>
  
              </div>
      </div>
              


              <div className="flex items-center justify-between">
<span className={`bg-white p-2 rounded-md text-xs font-semibold ${isActive(obj.registrationEndDate, obj.enrolled, obj.maxLimit) ? 'text-green-400' : 'text-red-400'}`}>
  {isActive(obj.registrationEndDate, obj.enrolled, obj.maxLimit) ? (
    <span className="flex items-center gap-1"><GoDotFill className='text-black animate-blink' /> Active</span>
  ) : (
    <span className="flex items-center gap-1"><GoDotFill className='text-black' />Closed</span>
  )}
</span>

                <button className='text-sm hover:text-white hover:bg-gray-800 bg-white text-black fs-bold px-4 py-1 rounded-md flex' onClick={()=>callEventByid(obj)}>
                  Go to event
                  <BsArrowUpRightCircle className='m-1 ml-2'/>
                </button>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
}

export default Events;
