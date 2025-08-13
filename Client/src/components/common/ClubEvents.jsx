import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BsArrowUpRightCircle } from "react-icons/bs";
import { useRecoilValue } from 'recoil';
import { userAtom } from '../UserAtom';

function ClubEvents() {
  const user = useRecoilValue(userAtom);
  const { clubById } = useParams();
  const [events, setEvents] = useState([]);
  const navigate=useNavigate()
  useEffect(() => {
    async function getEvents() {
      try {
        const res = await axios.get(`http://localhost:3000/event/app/v1/events/details/${clubById}`, {
          headers: {
            Authorization: localStorage.getItem('token'),
          },
        });

        if (res.status === 200) {
          setEvents(res.data.payload);
        }
      } catch (e) {
        alert("Unable to fetch the club events");
        console.error(e);
      }
    }

    if (clubById) {
      getEvents();
    }
  }, []);
function geteventdetails(eventId){
  if (user?.email) {
    navigate(`/student-profile/${user.email}/viewevent/${eventId}`);
  } else {
    alert("User not logged in");
  }
}

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 ">Events of Club </h1>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {events.map((event) => (
            <div key={event._id} className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold">{event.eventName}</h2>
              <p className="text-gray-600">{event.description}</p>
            <button onClick={()=>geteventdetails(event._id)} className='bg-black text-white rounded-md p-1 w-36 flex px-3 mt-6'>Go to Event <BsArrowUpRightCircle className='mx-auto my-1'/></button>
            </div>
          ))}
        </div>
      ) : (
        <p>No events found for this club.</p>
      )}
    </div>
  );
}

export default ClubEvents;
