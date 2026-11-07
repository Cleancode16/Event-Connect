import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil'
import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand, IconLogin, IconLogout } from '@tabler/icons-react'
import { userAtom } from '../UserAtom';
import { sidebarOpenState } from '../atoms/sidebarAtom';
import ThemeToggle from '../theme/ThemeToggle';

const MotionLink = motion.create(Link);

const buttonMotion = {
  whileHover: { y: -1, scale: 1.03 },
  whileTap: { scale: 0.95 },
  transition: { type: 'spring', stiffness: 400, damping: 22 },
};

// Floating rounded header with space around it
function Header() {
  const user=useRecoilValue(userAtom);
  const navigate=useNavigate()
  const location = useLocation();
  const resetUser=useResetRecoilState(userAtom);
  const [sidebarOpen, setSidebarOpen] = useRecoilState(sidebarOpenState);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  // Only adds a soft shadow once the page scrolls; the header always stays visible
  useMotionValueEvent(scrollY, 'change', (current) => setScrolled(current > 8));

  const showSidebarButton = user?.isLoggedIn && !['/', '/signin', '/signup'].includes(location.pathname);

  function logout(){
    resetUser();
    localStorage.removeItem('token');
    navigate('/')
  }

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className='fixed inset-x-3 top-3 z-50 sm:inset-x-6 sm:top-4'
    >
      <div
        className={`glass-bar mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-full pl-3 pr-2 text-white transition-shadow duration-300 sm:pl-5 ${
          scrolled ? 'shadow-[0_12px_40px_-12px_rgb(var(--glass-shadow))]' : ''
        }`}
      >
        {/* Brand */}
        <div className='flex min-w-0 items-center gap-2'>
          {showSidebarButton && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label='Toggle sidebar'
              className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-white md:hidden'
            >
              {sidebarOpen ? <IconLayoutSidebarLeftCollapse size={19} stroke={1.8} /> : <IconLayoutSidebarLeftExpand size={19} stroke={1.8} />}
            </motion.button>
          )}
          <Link to='/' className='flex min-w-0 items-center gap-2'>
            <span className='truncate text-sm font-semibold tracking-tight sm:text-base'>Event Connect</span>
            {user.isLoggedIn && user.role && (
              <span className='hidden rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-widest text-neutral-400 sm:inline-block'>
                {user.role}
              </span>
            )}
          </Link>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-1.5 sm:gap-2'>
          <ThemeToggle />
          {user.isLoggedIn ? (
            <motion.button
              {...buttonMotion}
              onClick={logout}
              className='flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-medium sm:text-sm'
            >
              <IconLogout size={15} stroke={1.8} />
              <span className='hidden sm:inline'>Log Out</span>
            </motion.button>
          ) : (
            <>
              <MotionLink
                {...buttonMotion}
                to='/signin'
                className='hidden items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-medium sm:flex sm:text-sm'
              >
                <IconLogin size={15} stroke={1.8} />
                Sign In
              </MotionLink>
              <MotionLink
                {...buttonMotion}
                to='/signup'
                className='rounded-full bg-white px-4 py-2 text-xs font-semibold text-black sm:text-sm'
              >
                Get Started
              </MotionLink>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}

export default Header
