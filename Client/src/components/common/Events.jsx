import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Event.css';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../UserAtom';
import { Page, PageHeader, EmptyState, Spinner, listVariants } from '../ui/Page';
import EventCard from '../ui/EventCard';
import { motion } from 'motion/react';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = useRecoilValue(userAtom);

  useEffect(() => {
    const getEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No auth token found");
          return;
        }

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/event/app/v1/events`, {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        });

        if (res.data && res.data.payload) {
          setEvents(res.data.payload);
        } else {
          console.error("Invalid response format:", res.data);
        }
      } catch (e) {
        console.error("Error fetching events:", e);
        alert('Error fetching events');
      } finally {
        setLoading(false);
      }
    };

    getEvents();
  }, []);

  function callEventByid(eventObj) {
    if (user?.role === 'student' && user?.email) {
      navigate(`/student-profile/${user.email}/viewevent/${eventObj._id}`);
    } else if (user?.role === 'organizer' && user?.email) {
      navigate(`/organizer-profile/${user.email}/viewevent/${eventObj._id}`);
    } else if (user?.role === 'admin' && user?.email) {
      navigate(`/admin-profile/${user.email}/viewevent/${eventObj._id}`);
    } else {
      // Fallback if user info is missing
      console.error("Navigation error: User info is incomplete");
    }
  }

  return (
    <Page>
      <PageHeader title="All Events" subtitle="Everything happening across campus" />
      {loading ? (
        <Spinner label="Loading events…" />
      ) : events.length === 0 ? (
        <EmptyState title="No events yet" text="Check back soon — clubs are cooking something up." />
      ) : (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {events.map((obj, idx) => (
            <EventCard key={obj._id || idx} event={obj} onOpen={() => callEventByid(obj)} ctaLabel="Go to event" />
          ))}
        </motion.div>
      )}
    </Page>
  );
}

export default Events;
