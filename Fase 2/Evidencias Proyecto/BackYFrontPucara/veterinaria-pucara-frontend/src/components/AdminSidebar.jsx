import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/api'
import './AdminSidebar.css'

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = authService.getCurrentUser()
  
  const handleLogout = () => {
    authService.logout()
    navigate('/admin/login', { replace: true })
  }

  const handleNavClick = (e, path) => {
    e.preventDefault()
    navigate(path)
  }

  // Verificar si es admin
  const isAdmin = user?.rol === 'ADMIN'
  // Verificar si es recepcionista
  const isRecepcionista = user?.rol === 'RECEPCIONISTA'

  // Determinar si una ruta está activa
  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="user-profile">
          <div className="profile-avatar">
            {user?.nombre?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="profile-info">
            <h3>{user?.nombre || 'Usuario'}</h3>
            <p>{user?.rol || 'Usuario'}</p>
          </div>
        </div>
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? '×' : '☰'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {/* Dashboard - Solo Admin */}
        {isAdmin && (
          <a 
            href="/admin/dashboard" 
            className={`nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, '/admin/dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </a>
        )}

        {/* Citas - Admin y Recepcionista */}
        {(isAdmin || isRecepcionista) && (
          <a 
            href="/admin/citas" 
            className={`nav-item ${isActive('/admin/citas') ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, '/admin/citas')}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-text">Citas</span>
          </a>
        )}

        {/* Pacientes - Admin y Recepcionista */}
        {(isAdmin || isRecepcionista) && (
          <a 
            href="/admin/pacientes" 
            className={`nav-item ${isActive('/admin/pacientes') ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, '/admin/pacientes')}
          >
            <span className="nav-icon">🐾</span>
            <span className="nav-text">Pacientes</span>
          </a>
        )}

        {/* Propietarios - Admin y Recepcionista */}
        {(isAdmin || isRecepcionista) && (
          <a 
            href="/admin/propietarios" 
            className={`nav-item ${isActive('/admin/propietarios') ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, '/admin/propietarios')}
          >
            <span className="nav-icon">👤</span>
            <span className="nav-text">Propietarios</span>
          </a>
        )}

        {/* Servicios - Solo Admin */}
        {isAdmin && (
          <a 
            href="/admin/servicios" 
            className={`nav-item ${isActive('/admin/servicios') ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, '/admin/servicios')}
          >
            <span className="nav-icon">⚕️</span>
            <span className="nav-text">Servicios</span>
          </a>
        )}

        {/* Inventario - Solo Admin */}
        {isAdmin && (
          <a 
            href="/admin/inventario" 
            className={`nav-item ${isActive('/admin/inventario') ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, '/admin/inventario')}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-text">Inventario</span>
          </a>
        )}

        {/* Reportes - Solo Admin */}
        {isAdmin && (
          <a 
            href="/admin/reportes" 
            className={`nav-item ${isActive('/admin/reportes') ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, '/admin/reportes')}
          >
            <span className="nav-icon">📈</span>
            <span className="nav-text">Reportes</span>
          </a>
        )}

        {/* Configuración - Solo Admin */}
        {isAdmin && (
          <a 
            href="#configuracion" 
            className={`nav-item ${isActive('#configuracion') ? 'active' : ''}`}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Configuración</span>
          </a>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}
