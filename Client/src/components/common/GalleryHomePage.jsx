import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react';
import { IconArrowUpRight, IconBuilding, IconSchool } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../UserAtom';
import { Page, PageHeader, EmptyState, Spinner, listVariants, itemVariants } from '../ui/Page';

// Local backup image (Client/public), shown when a club has no logo or its logo URL fails to load
const FALLBACK_LOGO = '/club-placeholder.svg';

function getLogoSrc(logo) {
  const url = typeof logo === 'string' ? logo.trim() : '';
  return url || FALLBACK_LOGO;
}

// Swap to the backup once if the real logo errors (404, deleted Cloudinary asset, blocked host)
function handleLogoError(e) {
  const img = e.currentTarget;
  if (!img.src.endsWith(FALLBACK_LOGO)) {
    img.src = FALLBACK_LOGO;
  }
}

function GalleryHomePage() {
  const [clubs,setClubs] = useState([]);
  const [loading,setLoading] = useState(true);
  const navigate=useNavigate();
  const user = useRecoilValue(userAtom);

  useEffect(()=>{
    async function getClubs(){
      try{
      const res=await axios.get(`${import.meta.env.VITE_API_URL}/organiser/get/organiserDetails`,{
        headers:{
          Authorization:localStorage.getItem('token')
        }
      });
      if(res.status===200){
        setClubs(res.data.organiserDetails);
      }
    }catch(e){
      alert('unable to fetch the organizer details',e);
    }finally{
      setLoading(false);
    }
    }
    getClubs()
  },[])

  function ClubEventsNavigate(clubId) {
    if (user?.email) {
      navigate(`/student-profile/${user.email}/club/${clubId}`);
    } else {
      alert("User not logged in");
    }
  }

  return (
    <Page>
      <PageHeader title="Clubs Gallery" subtitle="Discover the clubs behind every event" />
      {loading ? (
        <Spinner label="Loading clubs…" />
      ) : clubs.length === 0 ? (
        <EmptyState title="No clubs yet" />
      ) : (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {clubs.map((club, idx) => (
            <motion.div
              key={club._id || idx}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className='glass group flex h-full flex-col items-center rounded-3xl p-6 text-center'
            >
              <div className='mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-[#fff] p-3 shadow-[0_8px_30px_-8px_rgb(var(--glass-shadow))]'>
                <img
                  src={getLogoSrc(club.logo)}
                  onError={handleLogoError}
                  loading='lazy'
                  alt={`${Array.isArray(club.clubName) ? club.clubName.join(', ') : club.clubName} logo`}
                  className='h-full w-full object-contain transition duration-500 group-hover:scale-110'
                />
              </div>
              <h2 className='mb-3 w-full truncate text-lg font-semibold text-white'>
                {Array.isArray(club.clubName) ? club.clubName.join(', ') : club.clubName}
              </h2>
              <div className='mb-5 w-full space-y-1.5 text-xs text-neutral-400'>
                <p className='flex items-center justify-center gap-1.5 uppercase tracking-wider'>
                  <IconBuilding size={14} stroke={1.8} /> {club.department}
                </p>
                <p className='flex items-center justify-center gap-1.5 truncate uppercase tracking-wider'>
                  <IconSchool size={14} stroke={1.8} /> {club.collegeName}
                </p>
              </div>
              <button
                className='btn-ghost mt-auto w-full group-hover:border-white group-hover:bg-white group-hover:text-black'
                onClick={()=>ClubEventsNavigate(club._id)}
              >
                View Events <IconArrowUpRight size={16} stroke={2} />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </Page>
  )
}

export default GalleryHomePage
