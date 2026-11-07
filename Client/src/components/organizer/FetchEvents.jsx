import React, { useEffect ,useState} from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Page, PageHeader, EmptyState, listVariants } from '../ui/Page';
import EventCard from '../ui/EventCard';
import { motion } from 'motion/react';
function FetchEvents() {
  const [events,setEvents]=useState([]);
  const navigate=useNavigate()
  useEffect(()=>{
    async function getevents(){
      try{
        const res=await axios.get(`${import.meta.env.VITE_API_URL}/event/app/v1/organiser/events`,{
          headers:{
            Authorization:localStorage.getItem('token')
          }
        });
        if(res.status==200){
          setEvents(res.data.payload);
        }
      }catch(e){
       console.error(e);
       alert("unable to fetch the events");
      }
    }
    getevents();
  },[]);
 function gotoevent(eventById){
  navigate(`../event/${eventById}`)
 }
  return (
    <Page>
      <PageHeader title="My Events" />
      {events.length === 0 ? (
        <EmptyState title="No events yet" />
      ) : (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {events.map((event, idx) => (
            <EventCard key={event._id || idx} event={event} onOpen={()=>gotoevent(event._id)} ctaLabel="Get details" />
          ))}
        </motion.div>
      )}
    </Page>
  )
}

export default FetchEvents
