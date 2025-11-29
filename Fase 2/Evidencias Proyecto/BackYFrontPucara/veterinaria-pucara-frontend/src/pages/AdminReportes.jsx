import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, adminService } from '../services/api'
import './AdminDashboard.css'

export default function AdminReportes() {
  const [user, setUser] = useState(null)
  const [reportes, setReportes] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/admin/login')
      return
    }

    const currentUser = authService.getCurrentUser()
    setUser(currentUser)

    loadReportes()
  }, [navigate])

  const loadReportes = async () => {
    try {
      setLoading(true)
      const data = await adminService.getReportes()
      setReportes(data)
    } catch (error) {
      console.error('Error al cargar reportes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
  }

  const formatMonth = (monthKey) => {
    if (!monthKey) return ''
    const [year, month] = monthKey.split('-')
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return `${monthNames[parseInt(month) - 1]} ${year.slice(2)}`
  }

  const getMaxValue = (data) => {
    if (!data || Object.keys(data).length === 0) return 1
    return Math.max(...Object.values(data).map(v => typeof v === 'number' ? v : 0))
  }

  const renderBarChart = (data, title, color = '#667eea') => {
    if (!data || Object.keys(data).length === 0) {
      return <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>No hay datos disponibles</p>
    }

    const maxValue = getMaxValue(data)
    const entries = Object.entries(data).sort()

    return (
      <div style={{ marginTop: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '10px',
          height: '200px',
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: '10px'
        }}>
          {entries.map(([key, value]) => {
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0
            return (
              <div key={key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '100%',
                  background: color,
                  height: `${height}%`,
                  minHeight: value > 0 ? '5px' : '0',
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                title={`${key}: ${value}`}
                />
                <span style={{
                  fontSize: '10px',
                  color: '#7f8c8d',
                  marginTop: '5px',
                  textAlign: 'center',
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'center',
                  whiteSpace: 'nowrap'
                }}>
                  {formatMonth(key)}
                </span>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#7f8c8d' }}>
          <span>Mín: 0</span>
          <span>Máx: {maxValue}</span>
        </div>
      </div>
    )
  }

  const renderHorizontalBarChart = (data, title, color = '#667eea') => {
    if (!data || data.length === 0) {
      return <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>No hay datos disponibles</p>
    }

    const maxValue = Math.max(...data.map(item => item.cantidad || 0))

    return (
      <div style={{ marginTop: '20px' }}>
        {data.map((item, index) => {
          const width = maxValue > 0 ? (item.cantidad / maxValue) * 100 : 0
          return (
            <div key={index} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                  {item.nombre || item.especie || 'N/A'}
                </span>
                <span style={{ fontSize: '14px', color: '#7f8c8d' }}>{item.cantidad}</span>
              </div>
              <div style={{
                width: '100%',
                height: '25px',
                background: '#f0f0f0',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${width}%`,
                  height: '100%',
                  background: color,
                  transition: 'width 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '10px',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {width > 15 && item.cantidad}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const exportToCSV = () => {
    if (!reportes) return

    let csv = 'Reporte de Clínica Veterinaria\n\n'
    
    // Citas mensuales
    csv += 'Citas Mensuales\n'
    csv += 'Mes,Cantidad\n'
    Object.entries(reportes.citasMensuales || {}).forEach(([mes, cantidad]) => {
      csv += `${formatMonth(mes)},${cantidad}\n`
    })
    
    csv += '\nServicios Más Solicitados\n'
    csv += 'Servicio,Cantidad\n'
    ;(reportes.serviciosMasSolicitados || []).forEach(item => {
      csv += `${item.nombre},${item.cantidad}\n`
    })
    
    csv += '\nMascotas por Especie\n'
    csv += 'Especie,Cantidad\n'
    ;(reportes.mascotasPorEspecie || []).forEach(item => {
      csv += `${item.especie},${item.cantidad}\n`
    })
    
    csv += '\nEstadísticas Generales\n'
    csv += `Total Citas,${reportes.totalCitas || 0}\n`
    csv += `Total Mascotas,${reportes.totalMascotas || 0}\n`
    csv += `Total Propietarios,${reportes.totalPropietarios || 0}\n`
    csv += `Vacunas Aplicadas,${reportes.vacunasAplicadas || 0}\n`

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `reporte_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando reportes...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="user-profile">
            <div className="profile-avatar">
              {user?.nombre?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="profile-info">
              <h3>{user?.nombre || 'Administrador'}</h3>
              <p>{user?.rol || 'ADMIN'}</p>
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
          <a href="/admin/dashboard" className="nav-item">
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </a>
          <a href="/admin/citas" className="nav-item">
            <span className="nav-icon">📅</span>
            <span className="nav-text">Citas</span>
          </a>
          <a href="/admin/pacientes" className="nav-item">
            <span className="nav-icon">🐾</span>
            <span className="nav-text">Pacientes</span>
          </a>
          <a href="/admin/propietarios" className="nav-item">
            <span className="nav-icon">👤</span>
            <span className="nav-text">Propietarios</span>
          </a>
          <a href="/admin/servicios" className="nav-item">
            <span className="nav-icon">⚕️</span>
            <span className="nav-text">Servicios</span>
          </a>
          <a href="/admin/inventario" className="nav-item">
            <span className="nav-icon">📦</span>
            <span className="nav-text">Inventario</span>
          </a>
          <a href="/admin/reportes" className="nav-item active">
            <span className="nav-icon">📈</span>
            <span className="nav-text">Reportes</span>
          </a>
          <a href="#configuracion" className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Configuración</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>REPORTES Y ESTADÍSTICAS</h1>
            <p>Análisis y estadísticas de la clínica veterinaria</p>
          </div>
          <button
            onClick={exportToCSV}
            style={{
              padding: '10px 20px',
              background: '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>📥</span> Exportar CSV
          </button>
        </div>

        {/* Estadísticas Generales */}
        <div className="stats-grid" style={{ marginBottom: '30px' }}>
          <div className="stat-card stat-primary">
            <h3>Total Citas</h3>
            <div className="stat-value">{reportes?.totalCitas || 0}</div>
            <p>Citas registradas en el sistema</p>
          </div>
          <div className="stat-card stat-success">
            <h3>Total Mascotas</h3>
            <div className="stat-value">{reportes?.totalMascotas || 0}</div>
            <p>Mascotas registradas</p>
          </div>
          <div className="stat-card stat-info">
            <h3>Total Propietarios</h3>
            <div className="stat-value">{reportes?.totalPropietarios || 0}</div>
            <p>Propietarios registrados</p>
          </div>
          <div className="stat-card stat-warning">
            <h3>Vacunas Aplicadas</h3>
            <div className="stat-value">{reportes?.vacunasAplicadas || 0}</div>
            <p>Vacunas registradas en historial</p>
          </div>
        </div>

        {/* Citas Mensuales */}
        <div className="dashboard-section">
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>📅 Citas Mensuales</h2>
          {renderBarChart(reportes?.citasMensuales, 'Citas Mensuales', '#3498db')}
        </div>

        {/* Servicios Más Solicitados */}
        <div className="dashboard-section">
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>🐶 Servicios Más Solicitados</h2>
          {renderHorizontalBarChart(reportes?.serviciosMasSolicitados, 'Servicios', '#2ecc71')}
        </div>

        {/* Mascotas por Especie */}
        <div className="dashboard-section">
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>💉 Mascotas Atendidas por Especie</h2>
          {renderHorizontalBarChart(reportes?.mascotasPorEspecie, 'Especies', '#9b59b6')}
        </div>

        {/* Propietarios Mensuales */}
        <div className="dashboard-section">
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>🧍‍♂️ Propietarios Nuevos por Mes</h2>
          {renderBarChart(reportes?.propietariosMensuales, 'Propietarios', '#e67e22')}
        </div>
      </div>
    </div>
  )
}

