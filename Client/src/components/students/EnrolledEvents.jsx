import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BsArrowUpRightCircle } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../UserAtom';

function EnrolledEvents() {
  const [enrolledEvents, setEnrolledEvents] = useState([]);
  const navigate = useNavigate();
  const user = useRecoilValue(userAtom);

  useEffect(() => {
    async function getEvents() {
      try {
        const res = await axios.get('http://localhost:3000/student/enrolledEvents', {
          headers: {
            Authorization: localStorage.getItem('token'),
          },
        });

        if (res.status === 200) {
          setEnrolledEvents(res.data.payload);
        }
      } catch (e) {
        console.error("Unable to fetch events", e);
        alert("Unable to fetch events");
      }
    }

    getEvents();
  }, []);

  function viewdetails(eventId) {
    if (user?.email) {
  navigate(`/student-profile/${user.email}/viewevent/${eventId}`);
} else {
  alert("User not logged in.");
}

  }

  return (
    <div className="min-h-screen px-6 py-12">
      <h1 className="text-xl font-bold text-center mb-6 text-white mt-10">Enrolled Events</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {enrolledEvents.length === 0 ? (
          <p className="text-center col-span-full text-gray-600">No enrolled events found.</p>
        ) : (
          enrolledEvents.map((event, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg border border-[rgba(8,112,184,0.7)] bg-black text-white shadow hover:shadow-white/20 transition-all"
            >
              <h2 className="text-2xl font-semibold mb-2">{event.eventName}</h2>
              <p className="text-gray-300 text-sm mb-4">
                {event.description?.slice(0, 100) || "No description available."}
              </p>
                  <div className='flex flex-row m-1 mb-2'>
        <div className='text-xs mb-2'>
                <p>Start Date : {new Date(event.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                <p>End Date : {new Date(event.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
              
      </div>
  
              <button
                className="rounded border border-white px-4 py-2 hover:bg-white hover:text-black transition flex items-center mt-1 hover:border-[rgba(8,112,184,0.7)]"
                onClick={() => viewdetails(event._id)}
              >
                View Details <BsArrowUpRightCircle className="ml-2 h-5 w-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default EnrolledEvents;
