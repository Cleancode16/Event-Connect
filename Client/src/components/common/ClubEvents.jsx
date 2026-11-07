import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../UserAtom';
import { Page, PageHeader, EmptyState, Spinner, listVariants } from '../ui/Page';
import EventCard from '../ui/EventCard';
import { motion } from 'motion/react';

function ClubEvents() {
  const user = useRecoilValue(userAtom);
  const { clubById } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate=useNavigate()
  useEffect(() => {
    async function getEvents() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/event/app/v1/events/details/${clubById}`, {
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
      } finally {
        setLoading(false);
      }
    }

    if (clubById) {
      getEvents();
    }
  }, [clubById]);
function geteventdetails(eventId){
  if (user?.email) {
    navigate(`/student-profile/${user.email}/viewevent/${eventId}`);
  } else {
    alert("User not logged in");
  }
}

  return (
    <Page>
      <PageHeader title="Club Events" subtitle="Everything this club is hosting" />
      {loading ? (
        <Spinner label="Loading club events…" />
      ) : events.length > 0 ? (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {events.map((event) => (
            <EventCard key={event._id} event={event} onOpen={() => geteventdetails(event._id)} ctaLabel="Go to event" showDescription />
          ))}
        </motion.div>
      ) : (
        <EmptyState title="No events found for this club." text="This club hasn't published anything yet." />
      )}
    </Page>
  );
}

export default ClubEvents;
