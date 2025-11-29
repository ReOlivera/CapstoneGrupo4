import { useState } from 'react'
import { documentoService } from '../services/api'
import './styles/GenerarDocumentoModal.css'

// Lista de documentos disponibles
const DOCUMENTOS_DISPONIBLES = [
  {
    id: 'certificado-parvovirus',
    nombre: 'Certificado Parvovirus',
    descripcion: 'Certificado de vacunación contra parvovirus',
    icono: '📄'
  },
  {
    id: 'certificado-autorizacion-cirugia-anestesia',
    nombre: 'Certificado de Autorización de Cirugía y Anestesia',
    descripcion: 'Certificado de autorización para procedimientos quirúrgicos y anestesia',
    icono: '🏥'
  },
  {
    id: 'certificado-salud-sag',
    nombre: 'Certificado de Salud SAG',
    descripcion: 'Certificado de salud para el Servicio Agrícola y Ganadero',
    icono: '📋'
  },
  {
    id: 'certificado-retrovirales',
    nombre: 'Certificado Retrovirales',
    descripcion: 'Certificado de análisis retrovirales',
    icono: '🔬'
  },
  {
    id: 'certificado-salud-pucara',
    nombre: 'Certificado de Salud Pucara',
    descripcion: 'Certificado de salud general de la clínica Pucara',
    icono: '🏥'
  },
  {
    id: 'certificado-sag-ingles',
    nombre: 'Certificado SAG Inglés',
    descripcion: 'Certificado de salud SAG en inglés',
    icono: '🌐'
  }
  // Aquí se agregarán los otros documentos más adelante
]

export default function GenerarDocumentoModal({ isOpen, onClose, mascota, propietario }) {
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null)
  const [formData, setFormData] = useState({})
  const [isGenerando, setIsGenerando] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleSeleccionarDocumento = (doc) => {
    setDocumentoSeleccionado(doc)
    setFormData({})
    setError(null)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  const handleGenerar = async () => {
    if (!documentoSeleccionado) return

    setIsGenerando(true)
    setError(null)

    try {
      // Calcular edad de la mascota
      const edadMascota = mascota?.fechaNacimiento ? calcularEdad(mascota.fechaNacimiento) : 'N/A'
      
      const datosCompletos = {
        documentoId: documentoSeleccionado.id,
        mascotaId: mascota?.id,
        propietarioId: propietario?.id,
        datosMascota: {
          nombre: mascota?.nombre || 'N/A',
          especie: mascota?.especie || 'N/A',
          raza: mascota?.raza || 'N/A',
          edad: edadMascota,
          sexo: mascota?.sexo || 'N/A'
        },
        datosPropietario: {
          nombre: propietario?.nombre || 'N/A',
          rut: propietario?.rut || 'N/A',
          telefono: propietario?.telefono || 'N/A',
          email: propietario?.email || 'N/A'
        },
        datosFormulario: {
          fecha: formData.fecha || '',
          doctorSolicitante: formData.doctorSolicitante || '',
          numFicha: formData.numFicha || '',
          // Datos adicionales para certificado de autorización de cirugía
          color: formData.color || '',
          peso: formData.peso || '',
          direccion: formData.direccion || '',
          // Datos adicionales para certificado de salud SAG
          fechaCertificado: formData.fechaCertificado || '',
          numeroChip: formData.numeroChip || '',
          fechaIncorporacion: formData.fechaIncorporacion || '',
          sitioIncorporacion: formData.sitioIncorporacion || '',
          // Datos adicionales para certificado retrovirales
          nombreSolicitante: formData.nombreSolicitante || '',
          // Datos adicionales para certificado SAG inglés
          numeroMicrochip: formData.numeroMicrochip || '',
          fechaChip: formData.fechaChip || '',
          sitioChip: formData.sitioChip || ''
        }
      }

      const blob = await documentoService.generarDocumento(datosCompletos)
      
      // Crear URL temporal para descargar
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${documentoSeleccionado.nombre}_${mascota?.nombre || 'documento'}.docx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Cerrar modal después de descargar
      setTimeout(() => {
        onClose()
        setDocumentoSeleccionado(null)
        setFormData({})
      }, 500)
    } catch (err) {
      console.error('Error al generar documento:', err)
      setError(err.response?.data?.message || 'Error al generar el documento. Por favor, intenta nuevamente.')
    } finally {
      setIsGenerando(false)
    }
  }

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'N/A'
    try {
      const fecha = new Date(fechaNacimiento)
      const hoy = new Date()
      let años = hoy.getFullYear() - fecha.getFullYear()
      const mes = hoy.getMonth() - fecha.getMonth()
      if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
        años--
      }
      return años < 1 ? 'Recién nacido' : `${años} ${años === 1 ? 'año' : 'años'}`
    } catch (e) {
      return 'N/A'
    }
  }

  const renderFormulario = () => {
    if (!documentoSeleccionado) return null

    switch (documentoSeleccionado.id) {
      case 'certificado-parvovirus':
        return (
          <div className="documento-form">
            <h3>Datos del Certificado de Parvovirus</h3>
            <div style={{ 
              background: '#f0f7ff', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              fontSize: '14px',
              color: '#555'
            }}>
              <strong>📋 Datos que se completan automáticamente:</strong>
              <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                <li>Nombre de la Mascota: {mascota?.nombre || 'N/A'}</li>
                <li>Especie: {mascota?.especie || 'N/A'}</li>
                <li>Raza: {mascota?.raza || 'N/A'}</li>
                <li>Edad: {mascota?.fechaNacimiento ? calcularEdad(mascota.fechaNacimiento) : 'N/A'}</li>
                <li>Sexo: {mascota?.sexo || 'N/A'}</li>
                <li>Nombre del Propietario: {propietario?.nombre || 'N/A'}</li>
              </ul>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Fecha *</label>
                <input
                  type="date"
                  value={formData.fecha || ''}
                  onChange={(e) => handleInputChange('fecha', e.target.value)}
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Fecha que aparecerá en el certificado</small>
              </div>
              <div className="form-field">
                <label>Doctor Solicitante *</label>
                <input
                  type="text"
                  value={formData.doctorSolicitante || ''}
                  onChange={(e) => handleInputChange('doctorSolicitante', e.target.value)}
                  placeholder="Ej: Dr. Juan Pérez"
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Nombre del veterinario responsable</small>
              </div>
              <div className="form-field">
                <label>Número de Ficha (opcional)</label>
                <input
                  type="text"
                  value={formData.numFicha || ''}
                  onChange={(e) => handleInputChange('numFicha', e.target.value)}
                  placeholder="Ej: FICHA-001 o dejar vacío para usar ID de mascota"
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Si se deja vacío, se usará el ID de la mascota ({mascota?.id || 'N/A'})
                </small>
              </div>
            </div>
          </div>
        )
      case 'certificado-autorizacion-cirugia-anestesia':
        return (
          <div className="documento-form">
            <h3>Datos del Certificado de Autorización de Cirugía y Anestesia</h3>
            <div style={{ 
              background: '#fff3cd', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              fontSize: '14px',
              color: '#555'
            }}>
              <strong>📋 Datos que se completan automáticamente:</strong>
              <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                <li>Nombre de la Mascota: {mascota?.nombre || 'N/A'}</li>
                <li>Especie: {mascota?.especie || 'N/A'}</li>
                <li>Raza: {mascota?.raza || 'N/A'}</li>
                <li>Edad: {mascota?.fechaNacimiento ? calcularEdad(mascota.fechaNacimiento) : 'N/A'}</li>
                <li>Sexo: {mascota?.sexo || 'N/A'}</li>
                <li>Nombre del Propietario: {propietario?.nombre || 'N/A'}</li>
                <li>RUT del Propietario: {propietario?.rut || 'N/A'}</li>
                <li>Teléfono: {propietario?.telefono || 'N/A'}</li>
                <li>Correo: {propietario?.email || 'N/A'}</li>
              </ul>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Fecha *</label>
                <input
                  type="date"
                  value={formData.fecha || ''}
                  onChange={(e) => handleInputChange('fecha', e.target.value)}
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Fecha que aparecerá en el certificado</small>
              </div>
              <div className="form-field">
                <label>Color de la Mascota *</label>
                <input
                  type="text"
                  value={formData.color || ''}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="Ej: Negro, Blanco, Marrón, etc."
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Color del pelaje o plumaje</small>
              </div>
              <div className="form-field">
                <label>Peso *</label>
                <input
                  type="text"
                  value={formData.peso || ''}
                  onChange={(e) => handleInputChange('peso', e.target.value)}
                  placeholder="Ej: 5.5 kg, 3.2 kg"
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Peso actual de la mascota</small>
              </div>
              <div className="form-field">
                <label>Dirección del Propietario *</label>
                <input
                  type="text"
                  value={formData.direccion || ''}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  placeholder="Ej: Av. Principal #123, Ciudad"
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Dirección completa del propietario</small>
              </div>
            </div>
          </div>
        )
      case 'certificado-salud-sag':
        return (
          <div className="documento-form">
            <h3>Datos del Certificado de Salud SAG</h3>
            <div style={{ 
              background: '#d1ecf1', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              fontSize: '14px',
              color: '#555'
            }}>
              <strong>📋 Datos que se completan automáticamente:</strong>
              <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                <li>Nombre de la Mascota: {mascota?.nombre || 'N/A'}</li>
                <li>Especie: {mascota?.especie || 'N/A'}</li>
                <li>Raza: {mascota?.raza || 'N/A'}</li>
                <li>Edad: {mascota?.fechaNacimiento ? calcularEdad(mascota.fechaNacimiento) : 'N/A'}</li>
                <li>Sexo: {mascota?.sexo || 'N/A'}</li>
                <li>Nombre del Propietario: {propietario?.nombre || 'N/A'}</li>
                <li>RUT del Propietario: {propietario?.rut || 'N/A'}</li>
                <li>Teléfono: {propietario?.telefono || 'N/A'}</li>
              </ul>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Fecha del Certificado *</label>
                <input
                  type="date"
                  value={formData.fechaCertificado || ''}
                  onChange={(e) => handleInputChange('fechaCertificado', e.target.value)}
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Fecha que aparecerá en el certificado</small>
              </div>
              <div className="form-field">
                <label>Color de la Mascota *</label>
                <input
                  type="text"
                  value={formData.color || ''}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="Ej: Negro, Blanco, Marrón, etc."
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Color del pelaje o plumaje</small>
              </div>
              <div className="form-field">
                <label>Peso de la Mascota *</label>
                <input
                  type="text"
                  value={formData.peso || ''}
                  onChange={(e) => handleInputChange('peso', e.target.value)}
                  placeholder="Ej: 5.5 kg, 3.2 kg"
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Peso actual de la mascota</small>
              </div>
              <div className="form-field">
                <label>Número de Chip *</label>
                <input
                  type="text"
                  value={formData.numeroChip || ''}
                  onChange={(e) => handleInputChange('numeroChip', e.target.value)}
                  placeholder="Ej: 123456789012345"
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Número de identificación del chip</small>
              </div>
              <div className="form-field">
                <label>Dirección del Propietario *</label>
                <input
                  type="text"
                  value={formData.direccion || ''}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  placeholder="Ej: Av. Principal #123, Ciudad"
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Dirección completa del propietario</small>
              </div>
              <div className="form-field">
                <label>Fecha de Incorporación *</label>
                <input
                  type="date"
                  value={formData.fechaIncorporacion || ''}
                  onChange={(e) => handleInputChange('fechaIncorporacion', e.target.value)}
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Fecha en que se incorporó la mascota</small>
              </div>
              <div className="form-field">
                <label>Sitio de Incorporación *</label>
                <input
                  type="text"
                  value={formData.sitioIncorporacion || ''}
                  onChange={(e) => handleInputChange('sitioIncorporacion', e.target.value)}
                  placeholder="Ej: Santiago, Temuco, Valparaíso"
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Lugar donde se incorporó la mascota</small>
              </div>
            </div>
          </div>
        )
      case 'certificado-retrovirales':
        return (
          <div className="documento-form">
            <h3>Datos del Certificado Retrovirales</h3>
            <div style={{ 
              background: '#e8f5e9', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              fontSize: '14px',
              color: '#555'
            }}>
              <strong>📋 Datos que se completan automáticamente:</strong>
              <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                <li>Nombre de la Mascota: {mascota?.nombre || 'N/A'}</li>
                <li>Especie: {mascota?.especie || 'N/A'}</li>
                <li>Raza: {mascota?.raza || 'N/A'}</li>
                <li>Edad: {mascota?.fechaNacimiento ? calcularEdad(mascota.fechaNacimiento) : 'N/A'}</li>
                <li>Sexo: {mascota?.sexo || 'N/A'}</li>
                <li>Nombre del Propietario: {propietario?.nombre || 'N/A'}</li>
              </ul>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Fecha del Certificado *</label>
                <input
                  type="date"
                  value={formData.fechaCertificado || ''}
                  onChange={(e) => handleInputChange('fechaCertificado', e.target.value)}
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Fecha que aparecerá en el certificado</small>
              </div>
              <div className="form-field">
                <label>Número de Ficha (opcional)</label>
                <input
                  type="text"
                  value={formData.numFicha || ''}
                  onChange={(e) => handleInputChange('numFicha', e.target.value)}
                  placeholder="Ej: FICHA-001 o dejar vacío para usar ID de mascota"
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Si se deja vacío, se usará el ID de la mascota ({mascota?.id || 'N/A'})
                </small>
              </div>
              <div className="form-field">
                <label>Nombre del Solicitante *</label>
                <input
                  type="text"
                  value={formData.nombreSolicitante || ''}
                  onChange={(e) => handleInputChange('nombreSolicitante', e.target.value)}
                  placeholder="Ej: Dr. Juan Pérez"
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Nombre del veterinario o persona que solicita el certificado</small>
              </div>
            </div>
          </div>
        )
      case 'certificado-salud-pucara':
        return (
          <div className="documento-form">
            <h3>Datos del Certificado de Salud Pucara</h3>
            <div style={{ 
              background: '#f3e5f5', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              fontSize: '14px',
              color: '#555'
            }}>
              <strong>📋 Datos que se completan automáticamente:</strong>
              <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                <li>Nombre de la Mascota: {mascota?.nombre || 'N/A'}</li>
                <li>Especie: {mascota?.especie || 'N/A'}</li>
                <li>Raza: {mascota?.raza || 'N/A'}</li>
                <li>Edad: {mascota?.fechaNacimiento ? calcularEdad(mascota.fechaNacimiento) : 'N/A'}</li>
                <li>Sexo: {mascota?.sexo || 'N/A'}</li>
                <li>Nombre del Propietario: {propietario?.nombre || 'N/A'}</li>
                <li>Teléfono: {propietario?.telefono || 'N/A'}</li>
              </ul>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Peso de la Mascota *</label>
                <input
                  type="text"
                  value={formData.peso || ''}
                  onChange={(e) => handleInputChange('peso', e.target.value)}
                  placeholder="Ej: 5.5 kg, 3.2 kg"
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Peso actual de la mascota</small>
              </div>
              <div className="form-field">
                <label>Dirección del Propietario *</label>
                <input
                  type="text"
                  value={formData.direccion || ''}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  placeholder="Ej: Av. Principal #123, Ciudad"
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Dirección completa del propietario</small>
              </div>
            </div>
          </div>
        )
      case 'certificado-sag-ingles':
        return (
          <div className="documento-form">
            <h3>Datos del Certificado SAG Inglés</h3>
            <div style={{ 
              background: '#fff9e6', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              fontSize: '14px',
              color: '#555'
            }}>
              <strong>📋 Datos que se completan automáticamente:</strong>
              <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                <li>Nombre de la Mascota: {mascota?.nombre || 'N/A'}</li>
                <li>Especie: {mascota?.especie || 'N/A'}</li>
                <li>Raza: {mascota?.raza || 'N/A'}</li>
                <li>Edad: {mascota?.fechaNacimiento ? calcularEdad(mascota.fechaNacimiento) : 'N/A'}</li>
                <li>Sexo: {mascota?.sexo || 'N/A'}</li>
                <li>Nombre del Propietario: {propietario?.nombre || 'N/A'}</li>
                <li>RUT del Propietario: {propietario?.rut || 'N/A'}</li>
                <li>Teléfono: {propietario?.telefono || 'N/A'}</li>
              </ul>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Peso de la Mascota *</label>
                <input
                  type="text"
                  value={formData.peso || ''}
                  onChange={(e) => handleInputChange('peso', e.target.value)}
                  placeholder="Ej: 5.5 kg, 3.2 kg"
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Peso actual de la mascota</small>
              </div>
              <div className="form-field">
                <label>Color de la Mascota *</label>
                <input
                  type="text"
                  value={formData.color || ''}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="Ej: Negro, Blanco, Marrón, etc."
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Color del pelaje o plumaje</small>
              </div>
              <div className="form-field">
                <label>Número de Microchip *</label>
                <input
                  type="text"
                  value={formData.numeroMicrochip || ''}
                  onChange={(e) => handleInputChange('numeroMicrochip', e.target.value)}
                  placeholder="Ej: 123456789012345"
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Número de identificación del microchip</small>
              </div>
              <div className="form-field">
                <label>Fecha del Chip *</label>
                <input
                  type="date"
                  value={formData.fechaChip || ''}
                  onChange={(e) => handleInputChange('fechaChip', e.target.value)}
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Fecha en que se colocó el microchip</small>
              </div>
              <div className="form-field">
                <label>Sitio del Chip *</label>
                <input
                  type="text"
                  value={formData.sitioChip || ''}
                  onChange={(e) => handleInputChange('sitioChip', e.target.value)}
                  placeholder="Ej: Santiago, Temuco, Valparaíso"
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Lugar donde se colocó el microchip</small>
              </div>
              <div className="form-field">
                <label>Dirección del Propietario *</label>
                <input
                  type="text"
                  value={formData.direccion || ''}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  placeholder="Ej: Av. Principal #123, Ciudad"
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Dirección completa del propietario</small>
              </div>
            </div>
          </div>
        )
      default:
        return <p>Formulario no disponible para este documento.</p>
    }
  }

  const isFormValid = () => {
    if (!documentoSeleccionado) return false
    
    if (documentoSeleccionado.id === 'certificado-parvovirus') {
      return formData.fecha && 
             formData.doctorSolicitante &&
             mascota?.id // Asegurar que hay una mascota seleccionada
    }
    
    if (documentoSeleccionado.id === 'certificado-autorizacion-cirugia-anestesia') {
      return formData.fecha &&
             formData.color &&
             formData.peso &&
             formData.direccion &&
             mascota?.id // Asegurar que hay una mascota seleccionada
    }
    
    if (documentoSeleccionado.id === 'certificado-salud-sag') {
      return formData.fechaCertificado &&
             formData.color &&
             formData.peso &&
             formData.numeroChip &&
             formData.direccion &&
             formData.fechaIncorporacion &&
             formData.sitioIncorporacion &&
             mascota?.id // Asegurar que hay una mascota seleccionada
    }
    
    if (documentoSeleccionado.id === 'certificado-retrovirales') {
      return formData.fechaCertificado &&
             formData.nombreSolicitante &&
             mascota?.id // Asegurar que hay una mascota seleccionada
    }
    
    if (documentoSeleccionado.id === 'certificado-salud-pucara') {
      return formData.peso &&
             formData.direccion &&
             mascota?.id // Asegurar que hay una mascota seleccionada
    }
    
    if (documentoSeleccionado.id === 'certificado-sag-ingles') {
      return formData.peso &&
             formData.color &&
             formData.numeroMicrochip &&
             formData.fechaChip &&
             formData.sitioChip &&
             formData.direccion &&
             mascota?.id // Asegurar que hay una mascota seleccionada
    }
    
    return false
  }

  return (
    <div className="documento-modal-overlay" onClick={onClose}>
      <div className="documento-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="documento-modal-header">
          <h2>Generar Documento Clínico</h2>
          <button className="documento-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="documento-modal-body">
          {!documentoSeleccionado ? (
            <div className="documentos-lista">
              <p className="documentos-lista-descripcion">
                Selecciona el documento que deseas generar para <strong>{mascota?.nombre}</strong>
              </p>
              <div className="documentos-grid">
                {DOCUMENTOS_DISPONIBLES.map((doc) => (
                  <div
                    key={doc.id}
                    className="documento-card"
                    onClick={() => handleSeleccionarDocumento(doc)}
                  >
                    <div className="documento-icono">{doc.icono}</div>
                    <h3>{doc.nombre}</h3>
                    <p>{doc.descripcion}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="documento-formulario-container">
              <div className="documento-formulario-header">
                <button
                  className="btn-volver"
                  onClick={() => {
                    setDocumentoSeleccionado(null)
                    setFormData({})
                    setError(null)
                  }}
                >
                  ← Volver a lista de documentos
                </button>
                <h3>{documentoSeleccionado.nombre}</h3>
              </div>

              {renderFormulario()}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="documento-modal-actions">
                <button
                  className="btn-cancelar"
                  onClick={onClose}
                  disabled={isGenerando}
                >
                  Cancelar
                </button>
                <button
                  className="btn-generar"
                  onClick={handleGenerar}
                  disabled={!isFormValid() || isGenerando}
                >
                  {isGenerando ? 'Generando...' : 'Generar y Descargar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

