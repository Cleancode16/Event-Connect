import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter,Route,Routes} from 'react-router-dom'
import RootLayout from './RootLayout'
import LandingPage from './components/common/LandingPage'
import SignUp from './components/common/SignUp'
import SignIn from './components/common/SignIn.jsx'
import EnrolledEvents from './components/students/EnrolledEvents'
import StudentDashBoard from './components/students/StudentDashBoard.jsx'
import EventsById from './components/common/EventsById.jsx'
import OrganizerDashBoard from './components/organizer/OrganizerDashBoard.jsx'
import AdminDashBoard from './components/admin/AdminDashBoard.jsx'
import ManageEvents from './components/admin/ManageEvents.jsx'
import Events from './components/common/Events.jsx';
import VerifyPage from './components/common/VerifyPage.jsx'
import OrganizerHomePage from './components/organizer/OrganizerHomePage.js'
import CreatedEvents from './components/organizer/CreatedEvents.jsx'
import PostEvent from './components/organizer/PostEvent.jsx'
import {RecoilRoot} from 'recoil'
import Customcalendar from './components/common/Customcalender.jsx'
import GalleryHomePage from './components/common/GalleryHomePage.jsx'
import ClubEvents from './components/common/ClubEvents.jsx'
import FetchEvents from './components/organizer/FetchEvents.jsx'
import EventDetails from './components/organizer/EventDetails.jsx'
import StudentCalender from './components/students/StudentCalender.jsx'
import OrganiserCalendar from './components/organizer/OrganiserCalender.jsx'
import Home from './components/common/Home.jsx'
function Main(){
return (
  <BrowserRouter>
 <Routes>
    
    <Route path='/' element={<RootLayout/>}>
    <Route index element={<LandingPage/>}/>
    <Route path='signup' element={<SignUp/>}/>
    <Route path='signin' element={<SignIn/>}/>
     <Route path='verifyPage/:role/:id/:token' element={<VerifyPage/>}/>
    <Route path='student-profile/:emailId'>
      <Route index element={<Home/>}/>
      <Route path='dashboard' element={<StudentDashBoard/>}/>
      <Route path='enrolledevents' element={<EnrolledEvents/>}/>
      <Route path='viewevent/:eventById' element={<EventsById/>}/>
      <Route path='events' element={<Events/>}/>
      <Route path='calender' element={<Customcalendar/>}/>
      <Route path='studentCalender' element={<StudentCalender/>}/>
      <Route path='galleryPage' element={<GalleryHomePage/>}/>
      <Route path='club/:clubById' element={<ClubEvents/>}/>
    </Route>
    <Route path='organizer-profile/:emailId' element={<OrganizerHomePage/>}>
       <Route index element={<Home/>}/>
      <Route  path='dashboard' element={<OrganizerDashBoard/>}/>
      <Route path='viewevent/:eventById' element={<EventsById/>}/>
      <Route path='events' element={<Events/>}/>
      <Route path='createdEvents' element={<CreatedEvents/>}/>
      <Route path='postEvents' element={<PostEvent/>}/>
      <Route path='view/calender' element={<Customcalendar/>}/>
      <Route path='view/organisercalender' element={<OrganiserCalendar/>}/>
      <Route path='getevents' element={<FetchEvents/>}/>
      <Route path='event/:eventById' element={<EventDetails/>}/>
    </Route>
    <Route path='admin-profile/:emailId'>
      <Route path='dashboard' element={<AdminDashBoard/>} />
        <Route path='manageEvents' element={<ManageEvents/>}/>
      <Route path='viewevent/:eventById' element={<EventsById/>}/>
      <Route path='events' element={<Events/>}/>
    </Route>
    </Route>
  </Routes>
  </BrowserRouter>
)
}




createRoot(document.getElementById('root')).render(
  <RecoilRoot>
    <Main/>
  </RecoilRoot>
)
