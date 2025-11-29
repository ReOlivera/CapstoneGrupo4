import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, adminService, citaService, propietarioService } from '../services/api'
import AdminSidebar from '../components/AdminSidebar'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [citas, setCitas] = useState([])
  const [propietarios, setPropietarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Verificar autenticación
    if (!authService.isAuthenticated()) {
      navigate('/admin/login')
      return
    }

    const currentUser = authService.getCurrentUser()
    setUser(currentUser)

    // Cargar datos
    loadDashboardData()
  }, [navigate])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Obtener fecha de hoy en formato YYYY-MM-DD usando fecha local (sin problemas de zona horaria)
      const hoy = new Date()
      const año = hoy.getFullYear()
      const mes = String(hoy.getMonth() + 1).padStart(2, '0')
      const dia = String(hoy.getDate()).padStart(2, '0')
      const fechaHoy = `${año}-${mes}-${dia}` // Formato: YYYY-MM-DD
      
      console.log('Fecha de hoy calculada:', fechaHoy) // Debug
      
      const [statsData, citasData, propietariosData] = await Promise.all([
        adminService.getDashboardStats(),
        citaService.getAll({ fecha: fechaHoy }), // Obtener solo citas de hoy
        adminService.getRecentPropietarios(5)
      ])
      setStats(statsData)
      setCitas(citasData)
      setPropietarios(propietariosData)
      
      console.log('Citas obtenidas para hoy:', citasData.length, citasData) // Debug
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error)
    } finally {
      setLoading(false)
    }
  }


  const formatDate = (dateString) => {
    if (!dateString) return ''
    
    // Si ya viene en formato YYYY-MM-DD, formatearlo directamente sin conversión de zona horaria
    if (typeof dateString === 'string' && dateString.includes('-')) {
      const parts = dateString.split('T')[0].split('-')
      if (parts.length === 3) {
        // Formato: YYYY-MM-DD -> DD-MM-YYYY
        return `${parts[2]}-${parts[1]}-${parts[0]}`
      }
    }
    
    // Si viene como Date o string ISO, parsearlo cuidadosamente
    try {
      // Si es string ISO, extraer solo la parte de fecha
      const dateOnly = String(dateString).split('T')[0]
      const parts = dateOnly.split('-')
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`
      }
    } catch (e) {
      console.error('Error al formatear fecha:', e)
    }
    
    return dateString
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    return timeString.substring(0, 5) // HH:MM
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-header">
          <h1>DASHBOARD</h1>
          <p>Bienvenido, {user?.nombre || 'Administrador'}</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <h3>Citas de Hoy</h3>
            <div className="stat-value">{stats?.citasHoy || 0}</div>
            <p>Total de citas programadas para hoy</p>
          </div>

          <div className="stat-card stat-success">
            <h3>Total Citas</h3>
            <div className="stat-value">{stats?.totalCitas || 0}</div>
            <p>Citas en el sistema</p>
          </div>

          <div className="stat-card stat-info">
            <h3>Total Propietarios</h3>
            <div className="stat-value">{stats?.totalPropietarios || 0}</div>
            <p>Propietarios registrados</p>
          </div>

          <div className="stat-card stat-warning">
            <h3>Total Mascotas</h3>
            <div className="stat-value">{stats?.totalMascotas || 0}</div>
            <p>Mascotas registradas</p>
          </div>
        </div>

        {/* Citas de Hoy */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Citas de Hoy</h2>
            <span style={{ 
              fontSize: '14px', 
              color: '#666',
              fontWeight: 'normal'
            }}>
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Propietario</th>
                  <th>Mascota</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Servicio</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {citas.length > 0 ? (
                  citas.map((cita) => (
                    <tr key={cita.id}>
                      <td>{cita.mascota?.propietario?.nombre || 'N/A'}</td>
                      <td>{cita.mascota?.nombre || 'N/A'}</td>
                      <td>{formatDate(cita.fecha)}</td>
                      <td>{formatTime(cita.hora)}</td>
                      <td>{cita.servicio?.nombre || 'N/A'}</td>
                      <td>{cita.motivo || 'N/A'}</td>
                      <td>
                        <span className="status-badge status-completed">Activa</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      No hay citas programadas para hoy
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Propietarios */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Propietarios Recientes</h2>
            <input type="text" placeholder="Buscar..." className="search-input" />
          </div>
          <div className="contacts-grid">
            {propietarios.length > 0 ? (
              propietarios.map((propietario) => (
                <div key={propietario.id} className="contact-card">
                  <div className="contact-avatar">
                    {propietario.nombre?.charAt(0).toUpperCase() || 'P'}
                  </div>
                  <div className="contact-info">
                    <h4>{propietario.nombre || 'Sin nombre'}</h4>
                    <p>{propietario.email || 'Sin email'}</p>
                    <p>{propietario.telefono || 'Sin teléfono'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No hay propietarios recientes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

