import axios from 'axios'

// Configuración base de la API
const API_BASE_URL = 'http://localhost:8082'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/admin/login'
    }
    console.error('API Error:', error.response?.data || error.message)
    throw error
  }
)

// Servicios para Propietarios
export const propietarioService = {
  // Obtener todos los propietarios
  getAll: async () => {
    try {
      const response = await api.get('/propietarios')
      return response.data
    } catch (error) {
      console.error('Error al obtener propietarios:', error)
      throw error
    }
  },

  // Obtener propietario por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/propietarios/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener propietario:', error)
      throw error
    }
  },

  // Buscar propietario por RUT
  findByRut: async (rut) => {
    try {
      // Normalizar RUT: remover puntos, guiones y espacios
      const rutNormalizado = rut.replace(/[.-\s]/g, '').toUpperCase()
      const response = await api.get(`/propietarios/rut/${rutNormalizado}`)
      return response.data
    } catch (error) {
      if (error.response?.status === 404) {
        return null
      }
      console.error('Error al buscar propietario por RUT:', error)
      return null
    }
  },

  // Buscar propietario por email (método alternativo)
  findByEmail: async (email) => {
    try {
      const all = await propietarioService.getAll()
      return all.find(p => p.email && p.email.toLowerCase() === email.toLowerCase()) || null
    } catch (error) {
      console.error('Error al buscar propietario por email:', error)
      return null
    }
  },

  // Crear propietario
  create: async (propietario) => {
    try {
      const response = await api.post('/propietarios', propietario)
      return response.data
    } catch (error) {
      console.error('Error al crear propietario:', error)
      throw error
    }
  },

  // Actualizar propietario
  update: async (id, propietario) => {
    try {
      const response = await api.put(`/propietarios/${id}`, propietario)
      return response.data
    } catch (error) {
      console.error('Error al actualizar propietario:', error)
      throw error
    }
  },

  // Eliminar propietario
  delete: async (id) => {
    try {
      const response = await api.delete(`/propietarios/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar propietario:', error)
      throw error
    }
  }
}

// Servicios para Mascotas
export const mascotaService = {
  // Obtener todas las mascotas
  getAll: async () => {
    const response = await api.get('/mascotas')
    return response.data
  },

  // Obtener mascota por ID
  getById: async (id) => {
    const response = await api.get(`/mascotas/${id}`)
    return response.data
  },

  // Buscar mascotas por propietario
  findByPropietario: async (propietarioId) => {
    const all = await mascotaService.getAll()
    return all.filter(m => m.propietario && m.propietario.id === propietarioId)
  },

  // Buscar mascota por nombre y propietario
  findByNombreAndPropietario: async (nombre, propietarioId) => {
    const all = await mascotaService.getAll()
    return all.find(m => 
      m.nombre && 
      m.nombre.toLowerCase() === nombre.toLowerCase() && 
      m.propietario && 
      m.propietario.id === propietarioId
    ) || null
  },

  // Crear mascota
  create: async (mascota) => {
    const response = await api.post('/mascotas', mascota)
    return response.data
  },

  // Actualizar mascota
  update: async (id, mascota) => {
    const response = await api.put(`/mascotas/${id}`, mascota)
    return response.data
  }
}

// Servicios para Citas
export const citaService = {
  // Obtener todas las citas con filtros opcionales
  getAll: async (filtros = {}) => {
    const params = new URLSearchParams()
    if (filtros.fecha) params.append('fecha', filtros.fecha)
    if (filtros.servicioId) params.append('servicioId', filtros.servicioId)
    if (filtros.estado) params.append('estado', filtros.estado)
    
    const queryString = params.toString()
    const url = queryString ? `/citas?${queryString}` : '/citas'
    const response = await api.get(url)
    return response.data
  },

  // Obtener cita por ID
  getById: async (id) => {
    const response = await api.get(`/citas/${id}`)
    return response.data
  },

  // Verificar si existe una cita duplicada
  checkDuplicate: async (mascotaId, fecha, hora) => {
    const all = await citaService.getAll()
    return all.some(cita => {
      if (!cita.mascota || cita.mascota.id !== mascotaId) return false
      if (cita.fecha !== fecha) return false
      // Comparar horas (formato puede variar, normalizar)
      if (hora && cita.hora) {
        const horaCita = cita.hora.includes(':') ? cita.hora.substring(0, 5) : cita.hora
        const horaForm = hora.includes(':') ? hora.substring(0, 5) : hora
        return horaCita === horaForm
      }
      // Si no hay hora en la cita existente pero sí en la nueva, no es duplicado exacto
      return !hora && !cita.hora
    })
  },

  // Crear cita
  create: async (cita) => {
    const response = await api.post('/citas', cita)
    return response.data
  },

  // Actualizar cita
  update: async (id, cita) => {
    const response = await api.put(`/citas/${id}`, cita)
    return response.data
  },

  // Eliminar cita
  delete: async (id) => {
    const response = await api.delete(`/citas/${id}`)
    return response.data
  },

  // Cambiar estado de cita
  updateEstado: async (id, estado) => {
    const response = await api.patch(`/citas/${id}/estado`, { estado })
    return response.data
  }
}

// Servicio para Veterinarios
export const veterinarioService = {
  // Obtener todos los veterinarios
  getAll: async () => {
    try {
      const response = await api.get('/veterinarios')
      return response.data
    } catch (error) {
      console.error('Error al obtener veterinarios:', error)
      return []
    }
  },

  // Obtener veterinario por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/veterinarios/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener veterinario:', error)
      return null
    }
  }
}

// Servicios para Productos
export const productoService = {
  // Obtener todos los productos
  getAll: async () => {
    try {
      const response = await api.get('/productos')
      return response.data
    } catch (error) {
      console.error('Error al obtener productos:', error)
      return []
    }
  },

  // Obtener producto por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/productos/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener producto:', error)
      return null
    }
  },

  // Buscar productos por tipo (alimento, medicamento, etc.)
  findByTipo: async (tipo) => {
    try {
      const all = await productoService.getAll()
      return all.filter(p => {
        // Si el backend tiene un campo 'tipo', usarlo
        // Si no, intentar inferir del nombre o descripción
        if (p.tipo) {
          return p.tipo.toLowerCase() === tipo.toLowerCase()
        }
        // Fallback: buscar en nombre o descripción
        const nombreDesc = `${p.nombre || ''} ${p.descripcion || ''}`.toLowerCase()
        return nombreDesc.includes(tipo.toLowerCase())
      })
    } catch (error) {
      console.error('Error al buscar productos por tipo:', error)
      return []
    }
  }
}

// Servicios para Servicios
export const servicioService = {
  // Obtener todos los servicios (con filtro opcional de activo)
  getAll: async (filtros = {}) => {
    try {
      const params = new URLSearchParams()
      if (filtros.activo !== undefined) {
        params.append('activo', filtros.activo)
      }
      
      const queryString = params.toString()
      const url = queryString ? `/servicios?${queryString}` : '/servicios'
      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error('Error al obtener servicios:', error)
      return []
    }
  },

  // Obtener servicio por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/servicios/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener servicio:', error)
      return null
    }
  },

  // Buscar servicio por nombre o slug (búsqueda dinámica)
  findBySlug: async (slug) => {
    try {
      const all = await servicioService.getAll()
      
      // Primero intentar con el mapeo estático (para compatibilidad)
      const slugToNombre = {
        'urgencia': 'Urgencia',
        'cirugias-procedimientos': 'Cirugías y Procedimientos',
        'peluqueria': 'Peluquería',
        'hospitalizacion': 'Hospitalización',
        'atencion-medica-general': 'Atención Médica General',
        'diagnostico-laboratorio': 'Diagnóstico y Laboratorio',
        'cuidados-paliativos-eticos': 'Cuidados Paliativos y Éticos'
      }
      
      const nombreBuscado = slugToNombre[slug]
      if (nombreBuscado) {
        const encontrado = all.find(s => s.nombre && s.nombre.toLowerCase() === nombreBuscado.toLowerCase())
        if (encontrado) return encontrado
      }
      
      // Si no se encontró en el mapeo estático, buscar dinámicamente
      // Generar slug desde el nombre de cada servicio y comparar
      const servicioEncontrado = all.find(s => {
        if (!s.nombre) return false
        
        // Generar slug desde el nombre (igual que en Servicios.jsx)
        const slugGenerado = s.nombre.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
        
        return slugGenerado === slug
      })
      
      return servicioEncontrado || null
    } catch (error) {
      console.error('Error al buscar servicio por slug:', error)
      return null
    }
  },

  // Crear servicio (con soporte para archivo de imagen)
  create: async (servicio, imagenFile = null) => {
    try {
      if (imagenFile) {
        // Si hay imagen, usar FormData
        const formData = new FormData()
        formData.append('imagen', imagenFile)
        formData.append('nombre', servicio.nombre || '')
        formData.append('descripcion', servicio.descripcion || '')
        if (servicio.precio) formData.append('precio', servicio.precio.toString())
        if (servicio.duracion) formData.append('duracion', servicio.duracion.toString())
        formData.append('activo', servicio.activo !== undefined ? servicio.activo.toString() : 'true')
        
        const response = await api.post('/servicios', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        return response.data
      } else {
        // Si no hay imagen, usar JSON normal
      const response = await api.post('/servicios', servicio)
      return response.data
      }
    } catch (error) {
      console.error('Error al crear servicio:', error)
      throw error
    }
  },

  // Actualizar servicio (con soporte para archivo de imagen)
  update: async (id, servicio, imagenFile = null) => {
    try {
      if (imagenFile) {
        // Si hay imagen nueva, usar FormData
        const formData = new FormData()
        formData.append('imagen', imagenFile)
        formData.append('nombre', servicio.nombre || '')
        formData.append('descripcion', servicio.descripcion || '')
        if (servicio.precio) formData.append('precio', servicio.precio.toString())
        if (servicio.duracion) formData.append('duracion', servicio.duracion.toString())
        formData.append('activo', servicio.activo !== undefined ? servicio.activo.toString() : 'true')
        // Mantener imagen actual si no se sube nueva
        if (servicio.imagenUrl && !imagenFile) {
          formData.append('imagenUrlActual', servicio.imagenUrl)
        }
        
        const response = await api.put(`/servicios/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        return response.data
      } else {
        // Si no hay imagen nueva pero hay imagenUrl, mantenerla
        const formData = new FormData()
        formData.append('nombre', servicio.nombre || '')
        formData.append('descripcion', servicio.descripcion || '')
        if (servicio.precio) formData.append('precio', servicio.precio.toString())
        if (servicio.duracion) formData.append('duracion', servicio.duracion.toString())
        formData.append('activo', servicio.activo !== undefined ? servicio.activo.toString() : 'true')
        if (servicio.imagenUrl) {
          formData.append('imagenUrlActual', servicio.imagenUrl)
        }
        
        const response = await api.put(`/servicios/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      return response.data
      }
    } catch (error) {
      console.error('Error al actualizar servicio:', error)
      throw error
    }
  },

  // Eliminar servicio
  delete: async (id) => {
    try {
      const response = await api.delete(`/servicios/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar servicio:', error)
      throw error
    }
  },

  // Cambiar estado (activar/desactivar)
  updateEstado: async (id, activo) => {
    try {
      const response = await api.patch(`/servicios/${id}/estado`, activo, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al actualizar estado del servicio:', error)
      throw error
    }
  }
}

// Servicios para Medicamentos
export const medicamentoService = {
  // Obtener todos los medicamentos
  getAll: async () => {
    try {
      const response = await api.get('/medicamentos')
      return response.data
    } catch (error) {
      console.error('Error al obtener medicamentos:', error)
      return []
    }
  },

  // Obtener medicamento por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/medicamentos/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener medicamento:', error)
      return null
    }
  }
}

// Servicio de Autenticación
export const authService = {
  // Login
  login: async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        username,
        password
      })
      const data = response.data
      // Guardar token y usuario en localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        username: data.username,
        rol: data.rol,
        nombre: data.nombre
      }))
      return data
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      throw error
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/admin/login'
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem('token')
  }
}

// Servicios para Historial Clínico
export const historialService = {
  // Obtener todos los historiales
  getAll: async () => {
    try {
      const response = await api.get('/historiales')
      return response.data
    } catch (error) {
      console.error('Error al obtener historiales:', error)
      return []
    }
  },

  // Obtener historial por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/historiales/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener historial:', error)
      return null
    }
  },

  // Buscar historiales por mascota
  findByMascota: async (mascotaId) => {
    try {
      const all = await historialService.getAll()
      return all.filter(h => h.mascota && h.mascota.id === mascotaId)
    } catch (error) {
      console.error('Error al buscar historiales por mascota:', error)
      return []
    }
  },

  // Crear historial
  create: async (historial) => {
    try {
      const response = await api.post('/historiales', historial)
      return response.data
    } catch (error) {
      console.error('Error al crear historial:', error)
      throw error
    }
  },

  // Actualizar historial
  update: async (id, historial) => {
    try {
      const response = await api.put(`/historiales/${id}`, historial)
      return response.data
    } catch (error) {
      console.error('Error al actualizar historial:', error)
      throw error
    }
  },

  // Eliminar historial
  delete: async (id) => {
    try {
      const response = await api.delete(`/historiales/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar historial:', error)
      throw error
    }
  }
}

// Servicios para Inventario
export const inventarioService = {
  // Obtener todos los inventarios (con filtros opcionales)
  getAll: async (filtros = {}) => {
    try {
      const params = new URLSearchParams()
      if (filtros.activo !== undefined) {
        params.append('activo', filtros.activo)
      }
      if (filtros.categoria) {
        params.append('categoria', filtros.categoria)
      }
      
      const queryString = params.toString()
      const url = queryString ? `/inventarios?${queryString}` : '/inventarios'
      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error('Error al obtener inventarios:', error)
      return []
    }
  },

  // Obtener inventario por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/inventarios/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener inventario:', error)
      return null
    }
  },

  // Crear inventario (con soporte para archivo de imagen)
  create: async (inventario, imagenFile = null) => {
    try {
      if (imagenFile) {
        // Si hay imagen, usar FormData
        const formData = new FormData()
        formData.append('imagen', imagenFile)
        formData.append('nombreProducto', inventario.nombreProducto || '')
        formData.append('descripcion', inventario.descripcion || '')
        formData.append('categoria', inventario.categoria || '')
        if (inventario.cantidad !== undefined) formData.append('cantidad', inventario.cantidad.toString())
        formData.append('unidad', inventario.unidad || '')
        if (inventario.precio) formData.append('precio', inventario.precio.toString())
        if (inventario.stockMinimo) formData.append('stockMinimo', inventario.stockMinimo.toString())
        if (inventario.fechaIngreso) formData.append('fechaIngreso', inventario.fechaIngreso)
        if (inventario.fechaVencimiento) formData.append('fechaVencimiento', inventario.fechaVencimiento)
        formData.append('estado', inventario.estado || 'Activo')
        
        const response = await api.post('/inventarios', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        return response.data
      } else {
        // Si no hay imagen, usar JSON normal
        const response = await api.post('/inventarios', inventario)
        return response.data
      }
    } catch (error) {
      console.error('Error al crear inventario:', error)
      throw error
    }
  },

  // Actualizar inventario (con soporte para archivo de imagen)
  update: async (id, inventario, imagenFile = null, imagenUrlActual = null) => {
    try {
      if (imagenFile) {
        // Si hay imagen nueva, usar FormData
        const formData = new FormData()
        formData.append('imagen', imagenFile)
        formData.append('nombreProducto', inventario.nombreProducto || '')
        formData.append('descripcion', inventario.descripcion || '')
        formData.append('categoria', inventario.categoria || '')
        if (inventario.cantidad !== undefined) formData.append('cantidad', inventario.cantidad.toString())
        formData.append('unidad', inventario.unidad || '')
        if (inventario.precio) formData.append('precio', inventario.precio.toString())
        if (inventario.stockMinimo) formData.append('stockMinimo', inventario.stockMinimo.toString())
        if (inventario.fechaIngreso) formData.append('fechaIngreso', inventario.fechaIngreso)
        if (inventario.fechaVencimiento) formData.append('fechaVencimiento', inventario.fechaVencimiento)
        formData.append('estado', inventario.estado || 'Activo')
        if (imagenUrlActual) formData.append('imagenUrlActual', imagenUrlActual)
        
        const response = await api.put(`/inventarios/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        return response.data
      } else {
        // Si no hay imagen nueva pero hay imagenUrl, mantenerla
        const formData = new FormData()
        formData.append('nombreProducto', inventario.nombreProducto || '')
        formData.append('descripcion', inventario.descripcion || '')
        formData.append('categoria', inventario.categoria || '')
        if (inventario.cantidad !== undefined) formData.append('cantidad', inventario.cantidad.toString())
        formData.append('unidad', inventario.unidad || '')
        if (inventario.precio) formData.append('precio', inventario.precio.toString())
        if (inventario.stockMinimo) formData.append('stockMinimo', inventario.stockMinimo.toString())
        if (inventario.fechaIngreso) formData.append('fechaIngreso', inventario.fechaIngreso)
        if (inventario.fechaVencimiento) formData.append('fechaVencimiento', inventario.fechaVencimiento)
        formData.append('estado', inventario.estado || 'Activo')
        if (imagenUrlActual) formData.append('imagenUrlActual', imagenUrlActual)
        
        const response = await api.put(`/inventarios/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        return response.data
      }
    } catch (error) {
      console.error('Error al actualizar inventario:', error)
      throw error
    }
  },

  // Eliminar inventario
  delete: async (id) => {
    try {
      const response = await api.delete(`/inventarios/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar inventario:', error)
      throw error
    }
  },

  // Actualizar stock
  updateStock: async (id, cantidad) => {
    try {
      // El backend ahora acepta tanto Integer directo como objeto JSON
      // Enviar como número JSON serializado explícitamente
      const cantidadNum = parseInt(cantidad)
      if (isNaN(cantidadNum)) {
        throw new Error('La cantidad debe ser un número válido')
      }
      // Enviar el número como JSON string para asegurar la serialización correcta
      const response = await api.patch(`/inventarios/${id}/stock`, cantidadNum, {
        headers: {
          'Content-Type': 'application/json'
        },
        transformRequest: [(data) => {
          // Serializar explícitamente como número JSON
          return JSON.stringify(data)
        }]
      })
      return response.data
    } catch (error) {
      console.error('Error al actualizar stock:', error)
      throw error
    }
  },

  // Actualizar estado
  updateEstado: async (id, estado) => {
    try {
      // Spring Boot con @RequestBody String espera el string como JSON (entre comillas)
      // Enviar el estado como JSON string
      const response = await api.patch(`/inventarios/${id}/estado`, JSON.stringify(estado), {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      throw error
    }
  }
}

// Servicios para Documentos
export const documentoService = {
  // Generar documento
  generarDocumento: async (datos) => {
    try {
      const response = await api.post('/documentos/generar', datos, {
        responseType: 'blob' // Importante para recibir archivos binarios
      })
      return response.data
    } catch (error) {
      console.error('Error al generar documento:', error)
      throw error
    }
  },

  // Obtener lista de documentos disponibles
  getDocumentosDisponibles: async () => {
    try {
      const response = await api.get('/documentos/listar')
      return response.data
    } catch (error) {
      console.error('Error al obtener documentos disponibles:', error)
      throw error
    }
  }
}

// Servicio de Admin
export const adminService = {
  // Obtener estadísticas del dashboard
  getDashboardStats: async () => {
    try {
      const response = await api.get('/api/admin/dashboard/stats')
      return response.data
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
      throw error
    }
  },

  // Obtener citas recientes
  getRecentCitas: async (limit = 10) => {
    try {
      const response = await api.get(`/api/admin/citas/recent?limit=${limit}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener citas recientes:', error)
      throw error
    }
  },

  // Obtener propietarios recientes
  getRecentPropietarios: async (limit = 10) => {
    try {
      const response = await api.get(`/api/admin/propietarios/recent?limit=${limit}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener propietarios recientes:', error)
      throw error
    }
  },

  // Obtener reportes/estadísticas
  getReportes: async () => {
    try {
      const response = await api.get('/api/admin/reportes')
      return response.data
    } catch (error) {
      console.error('Error al obtener reportes:', error)
      throw error
    }
  }
}

export default api

