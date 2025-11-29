import Modal from './Modal'
import './styles/ResumenModal.css'

export default function ResumenModal({ isOpen, onClose, onConfirm, formData, isSubmitting }) {
  if (!formData) return null

  const servicioObj = [
    { value: 'urgencia', label: 'Urgencia' },
    { value: 'cirugias-procedimientos', label: 'Cirugías y Procedimientos' },
    { value: 'peluqueria', label: 'Peluquería' },
    { value: 'hospitalizacion', label: 'Hospitalización' },
    { value: 'atencion-medica-general', label: 'Atención Médica General' },
    { value: 'diagnostico-laboratorio', label: 'Diagnóstico y Laboratorio' },
    { value: 'cuidados-paliativos-eticos', label: 'Cuidados Paliativos y Éticos' }
  ].find(s => s.value === formData.cita?.servicio)

  const servicioNombre = servicioObj ? servicioObj.label : formData.cita?.servicio

  const formatDate = (dateString) => {
    if (!dateString) return ''
    
    // Formatear fecha sin conversión de zona horaria
    const dateOnly = String(dateString).split('T')[0]
    const parts = dateOnly.split('-')
    if (parts.length === 3) {
      const [year, month, day] = parts
      const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                     'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
      const weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
      
      // Calcular día de la semana sin usar Date para evitar problemas de zona horaria
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      const weekday = weekdays[date.getDay()]
      const monthName = months[parseInt(month) - 1]
      
      return `${weekday}, ${day} de ${monthName} de ${year}`
    }
    
    return dateString
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resumen de tu Cita" size="large">
      <div className="resumen-content">
        <p className="resumen-intro">
          Por favor, revisa los datos de tu cita antes de confirmar:
        </p>

        <div className="resumen-section">
          <h3 className="resumen-section-title">
            <span className="resumen-icon">👤</span>
            Datos del Propietario
          </h3>
          <div className="resumen-grid">
            <div className="resumen-item">
              <strong>Nombre:</strong>
              <span>{formData.propietario?.nombre}</span>
            </div>
            {formData.propietario?.rut && (
              <div className="resumen-item">
                <strong>RUT:</strong>
                <span>{formData.propietario.rut}</span>
              </div>
            )}
            <div className="resumen-item">
              <strong>Teléfono:</strong>
              <span>{formData.propietario?.telefono}</span>
            </div>
            <div className="resumen-item">
              <strong>Correo:</strong>
              <span>{formData.propietario?.correo}</span>
            </div>
          </div>
        </div>

        <div className="resumen-section">
          <h3 className="resumen-section-title">
            <span className="resumen-icon">🐾</span>
            Datos de la Mascota
          </h3>
          <div className="resumen-grid">
            <div className="resumen-item">
              <strong>Nombre:</strong>
              <span>{formData.mascota?.nombre}</span>
            </div>
            <div className="resumen-item">
              <strong>Especie:</strong>
              <span>{formData.mascota?.especie}</span>
            </div>
            <div className="resumen-item">
              <strong>Raza:</strong>
              <span>{formData.mascota?.raza}</span>
            </div>
            <div className="resumen-item">
              <strong>Edad:</strong>
              <span>{formData.mascota?.edad} años</span>
            </div>
            <div className="resumen-item">
              <strong>Sexo:</strong>
              <span>{formData.mascota?.sexo}</span>
            </div>
          </div>
        </div>

        <div className="resumen-section">
          <h3 className="resumen-section-title">
            <span className="resumen-icon">📅</span>
            Detalles de la Cita
          </h3>
          <div className="resumen-grid">
            <div className="resumen-item">
              <strong>Servicio:</strong>
              <span>{servicioNombre}</span>
            </div>
            <div className="resumen-item">
              <strong>Fecha:</strong>
              <span>{formatDate(formData.cita?.fecha)}</span>
            </div>
            <div className="resumen-item">
              <strong>Hora:</strong>
              <span>{formData.cita?.hora}</span>
            </div>
            {formData.cita?.veterinario_preferido && (
              <div className="resumen-item">
                <strong>Veterinario preferido:</strong>
                <span>{formData.cita.veterinario_preferido}</span>
              </div>
            )}
            <div className="resumen-item resumen-item-full">
              <strong>Motivo de la consulta:</strong>
              <span>{formData.cita?.motivo}</span>
            </div>
          </div>
        </div>

        <div className="resumen-actions">
          <button 
            className="btn-resumen btn-cancelar" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Volver a editar
          </button>
          <button 
            className="btn-resumen btn-confirmar" 
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Confirmar y Enviar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}



