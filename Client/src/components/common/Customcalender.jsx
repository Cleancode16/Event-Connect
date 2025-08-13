import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../UserAtom';

const localizer = momentLocalizer(moment);

function OrganizerCalendar() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();
  const user = useRecoilValue(userAtom);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('http://localhost:3000/event/app/v1/events', {
          headers: {
            Authorization: localStorage.getItem('token'),
          },
        });

        if (res.status === 200) {
          const now = new Date();
          const formatted = res.data.payload.map((event) => {
            const start = new Date(event.startDate);
            const end = new Date(event.endDate);

            const status = end < now ? 'completed' : 'upcoming';

            return {
              title: event.eventName,
              start,
              end,
              allDay: true,
              status,
              ...event,
            };
          });
          setEvents(formatted);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to fetch organizer events');
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const filtered = events.filter(event =>
        moment(event.start).isSame(selectedDate, 'day')
      );
      setDayEvents(filtered);
    }
  }, [selectedDate, events]);

  const getStatusColor = (status) => {
    return status === 'completed' ? 'bg-yellow-500' : 'bg-green-500';
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.status === 'completed' ? '#facc15' : '#22c55e',
        color: 'white',
        borderRadius: '6px',
        paddingLeft: '4px',
      },
    };
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen bg-black">
      {/* Calendar */}
      <div className="w-full lg:w-2/3 p-4 mr-4">
        <h2 className="text-2xl font-semibold mb-4 mt-16 text-white">Events Calender</h2>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={['month']}
          style={{ height: '70vh', width: '850px' }}
          selectable
          onSelectSlot={(slotInfo) => setSelectedDate(slotInfo.start)}
          onSelectEvent={(event) => {
            setSelectedDate(event.start);
            setSelectedEvent(event);
          }}
          eventPropGetter={eventStyleGetter}
        />
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-1/3 px-6 py-4 overflow-y-auto border-t lg:border-t-0 lg:border-l text-white">
        <h3 className="text-xl font-semibold mb-4 mt-16">
          {selectedDate
            ? `Events on ${moment(selectedDate).format('MMMM D, YYYY')}`
            : 'Click a date to view your events'}
        </h3>

        {dayEvents.length === 0 ? (
          <p className="text-gray-400">No events on this date.</p>
        ) : (
          <ul className="space-y-4">
            {dayEvents.map((event) => (
              <li
                key={event._id}
                onClick={() => setSelectedEvent(event)}
                className="p-4 bg-gray-900 rounded-lg shadow cursor-pointer hover:bg-gray-500 transition"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium">{event.eventName}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                <p className="text-sm text-gray-400 hover:text-white">
                  {moment(event.start).format('hh:mm A')} - {moment(event.end).format('hh:mm A')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-black border-4 border-[rgba(8,112,184,0.7)] p-6 rounded-lg w-[90%] max-w-md shadow-xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-2">{selectedEvent.eventName}</h2>
            <p className="mb-1"><strong>Start:</strong> {moment(selectedEvent.start).format('MMMM D, YYYY hh:mm A')}</p>
            <p className="mb-1"><strong>End:</strong> {moment(selectedEvent.end).format('MMMM D, YYYY hh:mm A')}</p>
            <p className="mb-1"><strong>Description:</strong> {selectedEvent.description || 'No description'}</p>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 bg-gray-300 text-black rounded" onClick={() => setSelectedEvent(null)}>
                Close
              </button>
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded"
                onClick={() => {
                  if (user?.email) {
                    navigate(`/student-profile/${user.email}/viewevent/${selectedEvent._id}`);
                  } else {
                    alert("User not logged in.");
                  }
                }}
              >
                View Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrganizerCalendar;
