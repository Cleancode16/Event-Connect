import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BsArrowUpRightCircle } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';

function OrganizerDashBoard() {
  const [details, setDetails] = useState(null);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [detailsRes, eventsRes] = await Promise.all([
          axios.get('http://localhost:3000/organiser/getdetails', {
            headers: { Authorization: localStorage.getItem('token') },
          }),
          axios.get('http://localhost:3000/event/app/v1/organiser/events', {
            headers: { Authorization: localStorage.getItem('token') },
          }),
        ]);

        if (detailsRes.status === 200) setDetails(detailsRes.data.payload);
        if (eventsRes.status === 200) setEvents(eventsRes.data.payload);
      } catch (err) {
        console.error(err);
        alert('Error fetching dashboard data');
      }
    }

    fetchData();
  }, []);

  const ongoingEvents = events.filter(event => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    return start <= now && end >= now;
  });

  const gotoEvent = (id) => {
    navigate(`../viewevent/${id}`);
  };

  if (!details) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Loading organizer details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 ml-36">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center ">
        {details.username} Dashboard
      </h1>

      {/* Profile Details */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Profile Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-sm">
          <InfoItem label="Username" value={details.username} />
          <InfoItem label="Email" value={details.email} />
          <InfoItem label="Phone Number" value={details.phoneNumber} />
          <InfoItem label="Club Name" value={details.clubName?.join(', ')} />
          <InfoItem label="College Name" value={details.collegeName} />
          <InfoItem label="Department" value={details.department} />
          <InfoItem label="Position" value={details.position} />
          <InfoItem label="Role" value={details.role} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <StatCard label="Total Events Created" count={events.length} bg="bg-black" text="text-white" />
      </div>

      {/* Ongoing Events Section */}
      {ongoingEvents.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ongoing Events</h2>
          <div className="flex flex-wrap justify-start gap-4 mb-8">
            {ongoingEvents.map((event) => (
              <div key={event._id} className="w-60 bg-green-50 border border-green-200 rounded-lg shadow-md overflow-hidden">
                <img
                  src={event.eventImage}
                  alt={event.eventName}
                  className="w-full h-36 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-md font-semibold text-gray-800 mb-1">{event.eventName}</h3>
                  <p className="text-sm text-gray-600">
                    <strong>Start:</strong>{' '}
                    {new Date(event.startDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>End:</strong>{' '}
                    {new Date(event.endDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  <button
                    className="flex items-center bg-green-600 text-white text-sm px-3 py-1 rounded-md hover:bg-green-700"
                    onClick={() => gotoEvent(event._id)}
                  >
                    Get Details <BsArrowUpRightCircle className="ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <p>
      <span className="font-medium">{label}:</span> {value || '—'}
    </p>
  );
}

function StatCard({ label, count, bg, text }) {
  return (
    <div className={`p-6 rounded-lg shadow-md ${bg}`}>
      <h3 className={`text-lg font-medium mb-2 ${text}`}>{label}</h3>
      <p className={`text-3xl font-bold ${text}`}>{count}</p>
    </div>
  );
}

export default OrganizerDashBoard;
