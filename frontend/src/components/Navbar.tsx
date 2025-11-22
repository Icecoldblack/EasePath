import React from 'react'
import { Link, NavLink } from 'react-router-dom'

const Navbar: React.FC = () => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          E-Resume
        </Link>
      </div>
      <nav className="navbar-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}>
          Home
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}>
          Dashboard
        </NavLink>
        <NavLink to="/resume-builder" className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}>
          Resume Builder
        </NavLink>
        <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}>
          Login
        </NavLink>
      </nav>
    </header>
  )
}

export default Navbar
