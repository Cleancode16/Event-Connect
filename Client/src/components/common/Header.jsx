import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRecoilValue, useResetRecoilState } from 'recoil'
import { userAtom } from '../UserAtom';
function Header() {
  const user=useRecoilValue(userAtom);
  const navigate=useNavigate()
  const resetUser=useResetRecoilState(userAtom);
  function logout(){
    resetUser();
    localStorage.removeItem('token');
    navigate('/')
  }
  const headerclass = `fixed top-0 left-0 right-0 z-50 p-3 flex justify-between mx-auto text-white  ${
  user.isLoggedIn ? 'border-b-2 border-[rgba(8,112,184,0.7)] bg-neutral-900 py-1 px-4 py-2 px-4' : ''
}`;

  return (

    <div className={headerclass}>
      <div className='p-1 ml-2'>
        <Link to='/'><h1 className='font- text-xl'>
          <strong>
          Event Connect</strong></h1></Link>
      
      </div>
      <div className='pr-8 '>
          <ul className='flex justify-between p-1'>
           {!user.isLoggedIn&& <li className='p-1'>
             <button className='rounded-md py-1 px-2 text-sm border border-[rgba(8,_112,_184,_0.7)]'>
               <Link to='/signup'>Get Started</Link>
             </button>
            </li>}
            <li className='p-1'>
            {user.isLoggedIn?<button onClick={logout} className='py-1 px-2 rounded-md text-sm border border-[rgba(8,_112,_184,_0.7)] '>
              Log Out
              </button> :
              <button className='py-1 px-2 rounded-md text-sm border border-[rgba(8,_112,_184,_0.7)] '>
                <Link to='/signin'>
              Sign In
              </Link>
              </button>} 
            </li>
          </ul>
      </div>
    </div>
  )
}

export default Header
