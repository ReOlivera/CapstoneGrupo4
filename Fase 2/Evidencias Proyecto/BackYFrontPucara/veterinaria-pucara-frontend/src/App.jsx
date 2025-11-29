import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FloatingWhatsApp from './components/FloatingWhatsapp'
import Reserva from './pages/Reserva'
import Servicios from './pages/Servicios'
import ServicioDetalle from './pages/ServicioDetalle'
import NuestraClinica from './pages/NuestraClinica'
import NuestrosProfesionales from './pages/NuestrosProfesionales'
import Contacto from './pages/Contacto'
import BlogVeterinario from './pages/BlogVeterinario'
import BlogDetalle from './pages/BlogDetalle'
import Productos from './pages/Productos'
import Alimentos from './pages/Alimentos'
import Medicamentos from './pages/Medicamentos'
import Footer from './components/Footer'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import AdminCitas from './pages/AdminCitas'
import AdminPropietarios from './pages/AdminPropietarios'
import AdminPacientes from './pages/AdminPacientes'
import AdminServicios from './pages/AdminServicios'
import AdminInventario from './pages/AdminInventario'
import AdminReportes from './pages/AdminReportes'
import { authService } from './services/api'
import './App.css'

// Componente para proteger rutas
function ProtectedRoute({ children }) {
  const isAuthenticated = authService.isAuthenticated()
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />
}

// Componente para proteger rutas según el rol
function ProtectedAdminRoute({ children, allowedRoles = ['ADMIN'] }) {
  const isAuthenticated = authService.isAuthenticated()
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }
  
  const user = authService.getCurrentUser()
  const userRole = user?.rol
  
  // Si el usuario tiene un rol permitido, mostrar el contenido
  if (allowedRoles.includes(userRole)) {
    return children
  }
  
  // Si no tiene el rol permitido, redirigir según su rol
  if (userRole === 'RECEPCIONISTA') {
    return <Navigate to="/admin/citas" replace />
  }
  
  // Si no tiene un rol reconocido, redirigir al login
  return <Navigate to="/admin/login" replace />
}

// Componente para redirigir /admin según el rol
function AdminRedirect() {
  const isAuthenticated = authService.isAuthenticated()
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }
  
  const user = authService.getCurrentUser()
  const userRole = user?.rol
  
  // Redirigir según el rol
  if (userRole === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />
  } else if (userRole === 'RECEPCIONISTA') {
    return <Navigate to="/admin/citas" replace />
  }
  
  // Por defecto, redirigir al login
  return <Navigate to="/admin/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={
          <div className="app">
            <Navbar />
            <main className="main">
              <Hero />
              <FloatingWhatsApp />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/reserva" element={
          <div className="app">
            <Navbar />
            <main className="main">
              <Reserva />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/servicios" element={
          <div className="app">
            <Navbar />
            <main className="main">
              <Servicios />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/servicios/:servicioId" element={
          <div className="app">
            <Navbar />
            <main className="main">
              <ServicioDetalle />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/nuestra-clinica" element={
          <div className="app">
            <Navbar />
            <main className="main">
              <NuestraClinica />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/nuestros-profesionales" element={
          <div className="app">
            <Navbar />
            <main className="main">
              <NuestrosProfesionales />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/contacto" element={
          <div className="app">
            <Navbar />
            <main className="main">
              <Contacto />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/blog-veterinario" element={
          <div className="app">
            <Navbar />
            <main className="main">
              <BlogVeterinario />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/blog-veterinario/:articuloId" element={
          <div className="app">
            <Navbar />
            <main className="main">
              <BlogDetalle />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/productos" element={
          <div className="app">
            <Navbar />
            <main className="main">
              <Productos />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/productos/:tipo" element={
          <div className="app">
            <Navbar />
            <main className="main">
              <Productos />
            </main>
            <Footer />
          </div>
        } />

        {/* Rutas de admin */}
        <Route path="/admin" element={<AdminRedirect />} />
        <Route path="/admin/login" element={<Login />} />
        
        {/* Rutas solo para ADMIN */}
        <Route path="/admin/dashboard" element={
          <ProtectedAdminRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/servicios" element={
          <ProtectedAdminRoute allowedRoles={['ADMIN']}>
            <AdminServicios />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/inventario" element={
          <ProtectedAdminRoute allowedRoles={['ADMIN']}>
            <AdminInventario />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/reportes" element={
          <ProtectedAdminRoute allowedRoles={['ADMIN']}>
            <AdminReportes />
          </ProtectedAdminRoute>
        } />
        
        {/* Rutas para ADMIN y RECEPCIONISTA */}
        <Route path="/admin/citas" element={
          <ProtectedAdminRoute allowedRoles={['ADMIN', 'RECEPCIONISTA']}>
            <AdminCitas />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/propietarios" element={
          <ProtectedAdminRoute allowedRoles={['ADMIN', 'RECEPCIONISTA']}>
            <AdminPropietarios />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/pacientes" element={
          <ProtectedAdminRoute allowedRoles={['ADMIN', 'RECEPCIONISTA']}>
            <AdminPacientes />
          </ProtectedAdminRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
