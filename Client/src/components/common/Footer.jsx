import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useRecoilValue } from 'recoil'
import { userAtom } from '../UserAtom'

function Footer() {
  const user = useRecoilValue(userAtom);
  const year = new Date().getFullYear();

  const links = user.isLoggedIn
    ? []
    : [
        { to: '/signup', label: 'Create account' },
        { to: '/signin', label: 'Sign in' },
      ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className='px-2 pb-6 pt-10 sm:px-4 md:px-6'
    >
      <div className='glass mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl px-5 py-6 text-sm text-neutral-400 sm:flex-row sm:items-center sm:justify-between sm:px-8'>
        <div className='flex items-center gap-3'>
          <div>
            <p className='font-semibold text-white'>Event Connect</p>
            <p className='text-xs'>Every campus event, one place.</p>
          </div>
        </div>

        {links.length > 0 && (
          <nav className='flex flex-wrap gap-x-6 gap-y-2'>
            {links.map((link) => (
              <Link key={link.to} to={link.to} className='transition-colors duration-200 hover:text-white'>
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <p className='text-xs'>© {year} Event Connect. All rights reserved.</p>
      </div>
    </motion.footer>
  )
}

export default Footer
