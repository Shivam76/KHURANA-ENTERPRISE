import { NavLink } from 'react-router-dom'
import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <NavLink to="/" className="header-brand">
          <span className="brand-icon">K</span>
          <span className="brand-text">Khurana Enterprise</span>
        </NavLink>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
          <NavLink to="/stock" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Stock</NavLink>
          <NavLink to="/billing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Billing</NavLink>
          <NavLink to="/sales" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Sales</NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Header