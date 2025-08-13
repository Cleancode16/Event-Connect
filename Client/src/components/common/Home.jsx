import React, { useState } from 'react';
import Events from './Events';
import GalleryHomePage from './GalleryHomePage'
import CustomCalender from './Customcalender'
import StudentCalender from '../students/StudentCalender'
import StudentDashBoard from '../students/StudentDashBoard'
import EnrolledEvents from '../students/EnrolledEvents'
import {
  IconLayoutSidebarRightFilled,
  IconPictureInPicture,
  IconAperture,
  IconCalendar,
  IconCalendarEvent,
  IconLayoutDashboard,
  IconLibraryPhoto
} from '@tabler/icons-react';
function SidebarIcon({ icon, label }) {
  return (
    <div className="relative group mt-2">
      <button className='flex mt-1 text-[24px] mb-4'>{icon}</button>

      {/* Tooltip */}
      <div className="
        absolute left-full top-1/2 -translate-y-1/2 ml-2
        bg-gray-800 text-white text-xs rounded px-2 py-1 z-300
        opacity-0 group-hover:opacity-100 invisible group-hover:visible
        transition-all duration-300 whitespace-nowrap
      ">
        {label}
      </div>
    </div>
  );
}

function Home() {
  const [open, setOpen] = useState(true);
  const [tab,setTab]=useState('Events');

  return (
    <div className='bg-black h-screen w-full text-white overflow-hidden'>
      <div className='flex'>

        {/* Sidebar */}
        {open ? (
          <div className={`
            mt-[93px] h-screen fixed bg-neutral-900
            transition-all duration-800 ease-in-out w-44
          border-r-4 border-[rgba(8,112,184,0.7)]`}>
            <div className='flex justify-end'>
              <button onClick={() => setOpen(!open)}>
                <IconLayoutSidebarRightFilled
                  size={32}
                  stroke={4}
                  className='mt-2 mr-2 transition-transform duration-300'
                  style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
            </div>
            <div className='flex flex-col'>
              <button className='flex mt-1 text-[24px]' onClick={()=>setTab('Events')}><IconPictureInPicture size={36} stroke={2} className='ml-3 mr-1 mb-4'/>Events</button>
              <button className='flex mt-1 text-[24px]' onClick={()=>setTab('EnrolledEvents')}><IconAperture size={36} stroke={2} className='ml-3 mr-1 mb-4'/>Enrolled Events</button>
              <button className='flex mt-1 text-[24px]' onClick={()=>setTab('EventsCalender')}><IconCalendar size={36} stroke={2} className='ml-3 mr-1 mb-4'/>Events Calender</button>
              <button className='flex mt-1 text-[24px]' onClick={()=>setTab('Calender')}><IconCalendarEvent size={36} stroke={2} className='ml-3 mr-1 mb-4'/>Calender</button>
              <button className='flex mt-1 text-[24px]' onClick={()=>setTab('dashboard')}><IconLayoutDashboard size={36} stroke={2} className='ml-3 mr-1 mb-4'/>DashBoard</button>
              <button className='flex mt-1 text-[24px]' onClick={()=>setTab('gallery')}><IconLibraryPhoto size={36} stroke={2} className='ml-3 mr-1 mb-4'/>Gallery</button>
            </div>
          </div>
        ) : (
          <div className='
            mt-[93px] h-screen fixed bg-neutral-900
            transition-all duration-300 ease-in-out w-20
border-r-2 border-[rgba(8,112,184,0.7)]'>
            <button onClick={() => setOpen(!open)} >
              <IconLayoutSidebarRightFilled
                size={32}
                stroke={4}
                className='mt-2 mr-2 transition-transform duration-300 ml-12'
                style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>

            <div className='flex flex-col items-center'>
             <button onClick={()=>setTab('Events')}><SidebarIcon icon={<IconPictureInPicture size={36} stroke={2} />} label="Events" />
  </button>           
     <buuton onClick={()=>setTab('EnrolledEvents')}><SidebarIcon icon={<IconAperture size={36} stroke={2} />} label="Enrolled Events" /></buuton>  
           <button onClick={()=>setTab('EventsCalender')}><SidebarIcon icon={<IconCalendar size={36} stroke={2} />} label="Events Calender" /></button>   
            <button onClick={()=>setTab('Calender')}><SidebarIcon icon={<IconCalendarEvent size={36} stroke={2} />} label="Calender" /></button>  
           <button onClick={()=>setTab('dashboard')}><SidebarIcon icon={<IconLayoutDashboard size={36} stroke={2} />} label="DashBoard" /></button>   
           <button onClick={()=>setTab('gallery')}> <SidebarIcon icon={<IconLibraryPhoto size={36} stroke={2} />} label="Gallery" /></button>  
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`
          mt-2 transition-all duration-300 ease-in-out
          ${open ? 'ml-48' : 'ml-20'}
        `}>
        {tab==='Events'&&<Events/>}
        {tab==='EnrolledEvents'&&<EnrolledEvents/>}
        {tab==='EventsCalender'&&<StudentCalender/>}
        {tab==='Calender'&&<CustomCalender/>}
        {tab=='dashboard'&&<StudentDashBoard/>}
        {tab==='gallery'&&<GalleryHomePage/>}
        </div>

      </div>
    </div>
  );
}

export default Home;
