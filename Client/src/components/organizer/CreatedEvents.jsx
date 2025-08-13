import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BsArrowUpRightCircle } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';

function CreatedEvents() {
  const [createdEvents, setCreatedEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function getDetails() {
      try {
        const res = await axios.get('http://localhost:3000/event/app/v1/organiser/events', {
          headers: {
            Authorization: localStorage.getItem('token'),
          },
        });

        if (res.status === 200) {
          setCreatedEvents(res.data.payload);
        }
      } catch (e) {
        console.error("Unable to fetch the details", e);
        alert("Unable to fetch the details");
      }
    }

    getDetails();
  }, []);

  function viewdetails(eventId) {
    navigate(`../viewevent/${eventId}`);
  }

  return (
    <div className="min-h-screen px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-10 text-black">Created Events</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {createdEvents.length === 0 ? (
          <p className="text-center col-span-full text-gray-600">No created events found.</p>
        ) : (
          createdEvents.map((event, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-gray-700 bg-black text-white shadow hover:shadow-white/20 transition-all"
            >
              <h2 className="text-2xl font-semibold mb-2">{event.eventName}</h2>
              <p className="text-gray-300 text-sm mb-4">
                {event.description?.slice(0, 100) || "No description available."}
              </p>
              <div className="flex flex-row m-1 mb-2">
                <div className="text-xs mb-2">
                  <p>
                    Start Date:{' '}
                    {new Date(event.startDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p>
                    End Date:{' '}
                    {new Date(event.endDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <button
                className="rounded border border-white px-4 py-2 hover:bg-white hover:text-black transition flex items-center mt-1"
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

export default CreatedEvents;
