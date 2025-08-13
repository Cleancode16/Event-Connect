import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

function OrganizerCalendar() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('http://localhost:3000/event/app/v1/organiser/events', {
          headers: {
            Authorization: localStorage.getItem('token'),
          },
        });

        if (res.status === 200) {
          const now = new Date();
          const formatted = res.data.payload.map((event) => {
            const start = new Date(event.startDate);
            const end = new Date(event.endDate);
            const status =
              end < now ? 'completed' : start <= now && end >= now ? 'yettodo' : 'upcoming';

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
        alert('Events not fetched');
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const filtered = events.filter((event) =>
        moment(event.start).isSame(selectedDate, 'day')
      );
      setDayEvents(filtered);
    }
  }, [selectedDate, events]);

  const getStatusColor = (status) => {
    if (status === 'completed') return 'bg-yellow-500';
    if (status === 'yettodo') return 'bg-red-500';
    if (status === 'upcoming') return 'bg-blue-600';
    return 'bg-gray-400';
  };

  const eventStyleGetter = (event) => {
    const bg =
      event.status === 'completed'
        ? '#facc15'
        : event.status === 'yettodo'
        ? '#ef4444'
        : '#3b82f6';

    return {
      style: {
        backgroundColor: bg,
        color: 'white',
        borderRadius: '6px',
        paddingLeft: '4px',
      },
    };
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-white">
      {/* Calendar */}
      <div className="w-[950px] p-4">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Organizer Created Events</h2>
        <div className="h-[80vh]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={['month']}
            selectable
            onSelectSlot={(slotInfo) => setSelectedDate(slotInfo.start)}
            onSelectEvent={(event) => {
              setSelectedDate(event.start);
              setSelectedEvent(event);
            }}
            eventPropGetter={eventStyleGetter}
            style={{ height: '100%' ,width:'100%'}}
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-[20%] px-4 py-4 overflow-y-auto border-t lg:border-t-0 lg:border-l border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {selectedDate
            ? `Events on ${moment(selectedDate).format('MMMM D, YYYY')}`
            : 'Click a date to view events'}
        </h3>

        {dayEvents.length === 0 ? (
          <p className="text-gray-500">No events on this date.</p>
        ) : (
          <ul className="space-y-4 w-full  mx-auto overflow-hidden">
  {dayEvents.map((event) => (
    <li
      key={event._id}
      onClick={() => setSelectedEvent(event)}
      className="p-4 bg-gray-100 rounded-xl shadow-sm cursor-pointer hover:bg-gray-200 transition w-full"
    >
      <div className="flex justify-between items-center mb-1 m-1 gap-4 flex-wrap">
        <h4 className="text-sm font-medium text-gray-800 break-words">
          {event.eventName}
        </h4>
        <span
          className={`text-xs px-3 py-1 rounded-full text-white whitespace-nowrap flex-shrink-0 ${getStatusColor(
            event.status
          )}`}
        >
          {event.status}
        </span>
      </div>
      <p className="text-xs text-gray-600">
        {moment(event.start).format('hh:mm A')}
        {!moment(event.start).isSame(event.end) &&
          ` - ${moment(event.end).format('hh:mm A')}`}
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
            className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-2 text-gray-800">{selectedEvent.eventName}</h2>
            <p className="mb-1 text-sm text-gray-700">
              <strong>Start:</strong> {moment(selectedEvent.start).format('MMMM D, YYYY hh:mm A')}
            </p>
            <p className="mb-1 text-sm text-gray-700">
              <strong>End:</strong> {moment(selectedEvent.end).format('MMMM D, YYYY hh:mm A')}
            </p>
            <p className="mb-1 text-sm text-gray-700">
              <strong>Description:</strong> {selectedEvent.description || 'No description'}
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 text-black rounded"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => navigate(`../viewevent/${selectedEvent._id}`)}
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
