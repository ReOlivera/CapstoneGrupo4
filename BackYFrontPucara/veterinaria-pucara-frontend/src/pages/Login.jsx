import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import './Login.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.login(username, password)
      // Redirigir según el rol del usuario
      const user = authService.getCurrentUser()
      if (user?.rol === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true })
      } else if (user?.rol === 'RECEPCIONISTA') {
        navigate('/admin/citas', { replace: true })
      } else {
        navigate('/admin/dashboard', { replace: true })
      }
    } catch (err) {
      console.error('Error completo en login:', err)
      console.error('Error response:', err.response)
      
      let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.'
      
      if (err.response) {
        // El servidor respondió con un código de error
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error
        } else {
          errorMessage = `Error ${err.response.status}: ${err.response.statusText || 'Error de autenticación'}`
        }
      } else if (err.request) {
        // La solicitud se hizo pero no hubo respuesta
        errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.'
      } else {
        // Algo más pasó al configurar la solicitud
        errorMessage = err.message || 'Error al iniciar sesión. Verifica tus credenciales.'
      }
      
      setError(errorMessage)
      // Prevenir que el error se limpie demasiado rápido
      setTimeout(() => {
        setError(prev => prev === errorMessage ? errorMessage : prev)
      }, 100)
    } finally {
      setLoading(false)
    }
  }

  // Si ya está autenticado, redirigir según el rol
  useEffect(() => {
    if (authService.isAuthenticated()) {
      const user = authService.getCurrentUser()
      if (user?.rol === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true })
      } else if (user?.rol === 'RECEPCIONISTA') {
        navigate('/admin/citas', { replace: true })
      } else {
        navigate('/admin/dashboard', { replace: true })
      }
    }
  }, [navigate])

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Veterinaria Pucará</h1>
          <p>Panel de Administración</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              placeholder="Ingresa tu usuario"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Ingresa tu contraseña"
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <p>Credenciales por defecto: admin / admin123</p>
        </div>
      </div>
    </div>
  )
}

