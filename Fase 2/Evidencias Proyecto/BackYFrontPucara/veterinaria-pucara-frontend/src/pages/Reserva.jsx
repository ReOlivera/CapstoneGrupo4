import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Input from '../components/Form/Input'
import Select from '../components/Form/Select'
import Textarea from '../components/Form/Textarea'
import DatePicker from '../components/Form/DatePicker'
import TimePicker from '../components/Form/TimePicker'
import Checkbox from '../components/Form/Checkbox'
import ResumenModal from '../components/ResumenModal'
import ConfirmacionModal from '../components/ConfirmacionModal'
import { propietarioService, mascotaService, citaService, veterinarioService, servicioService } from '../services/api'
import { validarRUT, validarFormatoRUT, formatearRUTInput, normalizarRUT } from '../utils/rutValidator'
import './Reserva.css'

// Opciones de servicios
const servicios = [
  { value: 'urgencia', label: 'Urgencia' },
  { value: 'cirugias-procedimientos', label: 'Cirugías y Procedimientos' },
  { value: 'peluqueria', label: 'Peluquería' },
  { value: 'hospitalizacion', label: 'Hospitalización' },
  { value: 'atencion-medica-general', label: 'Atención Médica General' },
  { value: 'diagnostico-laboratorio', label: 'Diagnóstico y Laboratorio' },
  { value: 'cuidados-paliativos-eticos', label: 'Cuidados Paliativos y Éticos' }
]

// Opciones de especies
const especies = [
  { value: 'Perro', label: 'Perro' },
  { value: 'Gato', label: 'Gato' }
]

// Opciones de sexo
const sexos = [
  { value: 'Macho', label: 'Macho' },
  { value: 'Hembra', label: 'Hembra' }
]

export default function Reserva() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [showResumenModal, setShowResumenModal] = useState(false)
  const [showConfirmacionModal, setShowConfirmacionModal] = useState(false)
  const [citaConfirmada, setCitaConfirmada] = useState(null)
  const [veterinarios, setVeterinarios] = useState([
    { value: '', label: 'Sin preferencia' }
  ])
  const [mascotasExistentes, setMascotasExistentes] = useState([])
  const [crearNuevaMascota, setCrearNuevaMascota] = useState(false)

  // Estado del formulario
  const [formData, setFormData] = useState({
    // Datos del dueño
    propietario: {
      id: null,
      nombre: '',
      rut: '',
      telefono: '',
      correo: ''
    },
    // Datos de la mascota
    mascota: {
      id: null,
      nombre: '',
      especie: '',
      raza: '',
      edad: '',
      sexo: ''
    },
    // Detalles de la cita
    cita: {
      servicio: '',
      motivo: '',
      fecha: '',
      hora: '',
      veterinario_preferido: ''
    },
    // Confirmaciones
    aceptaTerminos: false,
    autorizaDatos: false
  })

  // Cargar servicio desde URL si existe
  useEffect(() => {
    const servicioParam = searchParams.get('servicio')
    if (servicioParam) {
      setFormData(prev => ({
        ...prev,
        cita: {
          ...prev.cita,
          servicio: servicioParam
        }
      }))
    }
  }, [searchParams])

  // Cargar veterinarios al montar
  useEffect(() => {
    const loadVeterinarios = async () => {
      try {
        const vets = await veterinarioService.getAll()
        const vetsOptions = [
          { value: '', label: 'Sin preferencia' },
          ...vets.map(vet => ({
            value: vet.nombre,
            label: vet.nombre
          }))
        ]
        setVeterinarios(vetsOptions)
      } catch (error) {
        console.error('Error al cargar veterinarios:', error)
        // Mantener opciones por defecto si falla
      }
    }
    loadVeterinarios()
  }, [])

  // Autocompletado cuando se ingresa un RUT válido
  const handleRutChange = useCallback(async (rut) => {
    // Formatear RUT mientras se escribe
    const rutFormateado = formatearRUTInput(rut)
    
    setFormData(prev => ({
      ...prev,
      propietario: {
        ...prev.propietario,
        rut: rutFormateado
      }
    }))
    
    // Validar RUT y buscar si es válido
    if (validarRUT(rutFormateado)) {
      setIsLoadingData(true)
      try {
        const propietarioExistente = await propietarioService.findByRut(rutFormateado)
        
        if (propietarioExistente) {
          // Autocompletar datos del propietario
          setFormData(prev => ({
            ...prev,
            propietario: {
              ...prev.propietario,
              id: propietarioExistente.id,
              rut: propietarioExistente.rut ? formatearRUTInput(propietarioExistente.rut) : prev.propietario.rut,
              nombre: propietarioExistente.nombre || prev.propietario.nombre,
              telefono: propietarioExistente.telefono || prev.propietario.telefono,
              correo: propietarioExistente.email || prev.propietario.correo
            }
          }))

          // Cargar mascotas del propietario
          const mascotas = await mascotaService.findByPropietario(propietarioExistente.id)
          setMascotasExistentes(mascotas)
          setCrearNuevaMascota(false) // Reset al encontrar propietario
          
          // Si solo hay una mascota, autocompletarla
          if (mascotas.length === 1) {
            const mascota = mascotas[0]
            const fechaNacimiento = mascota.fechaNacimiento 
              ? new Date(mascota.fechaNacimiento) 
              : null
            const edad = fechaNacimiento 
              ? Math.floor((new Date() - fechaNacimiento) / (365.25 * 24 * 60 * 60 * 1000))
              : ''
            
            setFormData(prev => ({
              ...prev,
              mascota: {
                id: mascota.id,
                nombre: mascota.nombre || prev.mascota.nombre,
                especie: mascota.especie || prev.mascota.especie,
                raza: mascota.raza || prev.mascota.raza,
                edad: edad.toString() || prev.mascota.edad,
                sexo: mascota.sexo || prev.mascota.sexo
              }
            }))
          } else if (mascotas.length > 1) {
            // Si hay múltiples mascotas, limpiar campos para que seleccione
            setFormData(prev => ({
              ...prev,
              mascota: {
                id: null,
                nombre: '',
                especie: '',
                raza: '',
                edad: '',
                sexo: ''
              }
            }))
          }
        } else {
          // Limpiar datos si no existe (pero mantener el RUT ingresado)
          setMascotasExistentes([])
          setCrearNuevaMascota(true) // Nuevo propietario = nueva mascota
          // Limpiar datos de mascota
          setFormData(prev => ({
            ...prev,
            mascota: {
              id: null,
              nombre: '',
              especie: '',
              raza: '',
              edad: '',
              sexo: ''
            }
          }))
        }
      } catch (error) {
        console.error('Error al buscar propietario por RUT:', error)
      } finally {
        setIsLoadingData(false)
      }
    } else if (validarFormatoRUT(rutFormateado)) {
      // Si el formato es válido pero el RUT completo no, esperar a que termine de escribir
      setMascotasExistentes([])
      // Limpiar datos de mascota si se cambió el RUT
      setFormData(prev => ({
        ...prev,
        mascota: {
          id: null,
          nombre: '',
          especie: '',
          raza: '',
          edad: '',
          sexo: ''
        }
      }))
    } else {
      // Si el formato no es válido, limpiar datos
      setMascotasExistentes([])
      // Limpiar datos de mascota
      setFormData(prev => ({
        ...prev,
        mascota: {
          id: null,
          nombre: '',
          especie: '',
          raza: '',
          edad: '',
          sexo: ''
        }
      }))
    }
  }, [])

  // Manejadores de cambio
  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[`${section}.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[`${section}.${field}`]
        return newErrors
      })
    }

    // Si es el campo de RUT, buscar autocompletado
    if (section === 'propietario' && field === 'rut') {
      handleRutChange(value)
    }
  }

  const handleCheckboxChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validación de RUT chileno (ya no se usa, se usa validarRUT del utils)

  // Validación de email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  // Validación de teléfono
  const validatePhone = (phone) => {
    const phoneClean = phone.replace(/\s/g, '')
    return phoneClean.length >= 9 && /^[+]?[0-9]+$/.test(phoneClean)
  }

  // Verificar duplicados
  const checkDuplicates = async () => {
    if (!formData.propietario.rut || !formData.mascota.nombre || !formData.cita.fecha || !formData.cita.hora) {
      return null
    }

    try {
      // Buscar propietario por RUT
      const propietario = await propietarioService.findByRut(formData.propietario.rut)
      if (!propietario) return null

      // Buscar mascota por nombre y propietario
      const mascota = await mascotaService.findByNombreAndPropietario(
        formData.mascota.nombre,
        propietario.id
      )
      if (!mascota) return null

      // Verificar si ya existe una cita para esta mascota en esta fecha y hora
      const fechaFormateada = formData.cita.fecha // Ya está en formato YYYY-MM-DD
      const horaFormateada = formData.cita.hora // Formato HH:MM
      const existeDuplicado = await citaService.checkDuplicate(mascota.id, fechaFormateada, horaFormateada)
      
      return existeDuplicado
    } catch (error) {
      console.error('Error al verificar duplicados:', error)
      return false
    }
  }

  // Validación completa del formulario
  const validateForm = () => {
    const newErrors = {}

    // Validar datos del dueño
    if (!formData.propietario.nombre.trim()) {
      newErrors['propietario.nombre'] = 'El nombre es requerido'
    }
    if (!formData.propietario.rut.trim()) {
      newErrors['propietario.rut'] = 'El RUT es requerido'
    } else if (!validarFormatoRUT(formData.propietario.rut)) {
      newErrors['propietario.rut'] = 'El formato del RUT no es válido'
    } else if (!validarRUT(formData.propietario.rut)) {
      newErrors['propietario.rut'] = 'El RUT no es válido (dígito verificador incorrecto)'
    }
    if (!formData.propietario.telefono.trim()) {
      newErrors['propietario.telefono'] = 'El teléfono es requerido'
    } else if (!validatePhone(formData.propietario.telefono)) {
      newErrors['propietario.telefono'] = 'El teléfono no es válido'
    }
    if (!formData.propietario.correo.trim()) {
      newErrors['propietario.correo'] = 'El correo es requerido'
    } else if (!validateEmail(formData.propietario.correo)) {
      newErrors['propietario.correo'] = 'El correo no es válido'
    }

    // Validar datos de la mascota
    if (!formData.mascota.nombre.trim()) {
      newErrors['mascota.nombre'] = 'El nombre de la mascota es requerido'
    }
    if (!formData.mascota.especie) {
      newErrors['mascota.especie'] = 'La especie es requerida'
    }
    if (!formData.mascota.raza.trim()) {
      newErrors['mascota.raza'] = 'La raza es requerida'
    }
    if (!formData.mascota.edad.trim()) {
      newErrors['mascota.edad'] = 'La edad es requerida'
    } else if (isNaN(formData.mascota.edad) || parseInt(formData.mascota.edad) < 0) {
      newErrors['mascota.edad'] = 'La edad debe ser un número válido'
    }
    if (!formData.mascota.sexo) {
      newErrors['mascota.sexo'] = 'El sexo es requerido'
    }

    // Validar detalles de la cita
    if (!formData.cita.servicio) {
      newErrors['cita.servicio'] = 'El servicio es requerido'
    }
    if (!formData.cita.motivo.trim()) {
      newErrors['cita.motivo'] = 'El motivo de la consulta es requerido'
    }
    if (!formData.cita.fecha) {
      newErrors['cita.fecha'] = 'La fecha es requerida'
    }
    if (!formData.cita.hora) {
      newErrors['cita.hora'] = 'La hora es requerida'
    }

    // Validar confirmaciones
    if (!formData.aceptaTerminos) {
      newErrors['aceptaTerminos'] = 'Debes aceptar los términos y condiciones'
    }
    if (!formData.autorizaDatos) {
      newErrors['autorizaDatos'] = 'Debes autorizar el tratamiento de datos personales'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Calcular fecha de nacimiento a partir de la edad
  const calcularFechaNacimiento = (edad) => {
    const fechaNacimiento = new Date()
    fechaNacimiento.setFullYear(fechaNacimiento.getFullYear() - parseInt(edad))
    return fechaNacimiento.toISOString().split('T')[0]
  }

  // Mapear slug de servicio a nombre de servicio para buscar en BD
  const mapearSlugANombreServicio = (slug) => {
    const slugToNombre = {
      'urgencia': 'Urgencia',
      'cirugias-procedimientos': 'Cirugías y Procedimientos',
      'peluqueria': 'Peluquería',
      'hospitalizacion': 'Hospitalización',
      'atencion-medica-general': 'Atención Médica General',
      'diagnostico-laboratorio': 'Diagnóstico y Laboratorio',
      'cuidados-paliativos-eticos': 'Cuidados Paliativos y Éticos'
    }
    return slugToNombre[slug] || slug
  }

  // Enviar datos al backend
  const submitToBackend = async () => {
    try {
      // 1. Crear o actualizar propietario
      let propietarioId = formData.propietario.id
      const rutNormalizado = normalizarRUT(formData.propietario.rut)
      
      // Buscar si ya existe un propietario con ese RUT
      const propietarioExistente = await propietarioService.findByRut(formData.propietario.rut)
      
      if (propietarioExistente) {
        // Actualizar propietario existente
        propietarioId = propietarioExistente.id
        await propietarioService.update(propietarioId, {
          rut: rutNormalizado,
          nombre: formData.propietario.nombre.trim(),
          telefono: formData.propietario.telefono.trim(),
          email: formData.propietario.correo.trim()
        })
      } else {
        // Crear nuevo propietario
        const nuevoPropietario = await propietarioService.create({
          rut: rutNormalizado,
          nombre: formData.propietario.nombre.trim(),
          telefono: formData.propietario.telefono.trim(),
          email: formData.propietario.correo.trim()
        })
        propietarioId = nuevoPropietario.id
      }

      // 2. Crear o usar mascota existente
      let mascotaId = formData.mascota.id
      const fechaNacimiento = calcularFechaNacimiento(formData.mascota.edad)
      
      // Si ya hay un ID de mascota y NO estamos creando una nueva, usar la existente
      if (mascotaId && !crearNuevaMascota) {
        // Verificar que la mascota existe y pertenece al propietario
        try {
          const mascotaExistente = await mascotaService.getById(mascotaId)
          if (!mascotaExistente || mascotaExistente.propietario?.id !== propietarioId) {
            throw new Error('La mascota seleccionada no pertenece a este propietario')
          }
          // Usar el ID de la mascota existente sin modificarla
          mascotaId = mascotaExistente.id
        } catch (error) {
          console.error('Error al verificar mascota:', error)
          throw new Error('Error al verificar la mascota seleccionada')
        }
      } else {
        // Crear nueva mascota (ya sea porque se marcó "crear nueva" o porque no hay ID)
        // NO buscar si existe, siempre crear nueva si el usuario decidió crear una nueva
          const nuevaMascota = await mascotaService.create({
            nombre: formData.mascota.nombre.trim(),
            especie: formData.mascota.especie,
            raza: formData.mascota.raza.trim(),
            fechaNacimiento: fechaNacimiento,
            sexo: formData.mascota.sexo,
            propietario: { id: propietarioId }
          })
          mascotaId = nuevaMascota.id
      }

      // 3. Buscar veterinario si hay preferencia
      let veterinarioId = null
      if (formData.cita.veterinario_preferido) {
        const veterinarios = await veterinarioService.getAll()
        const veterinario = veterinarios.find(v => 
          v.nombre === formData.cita.veterinario_preferido
        )
        if (veterinario) {
          veterinarioId = veterinario.id
        }
      }

      // 4. Buscar servicio por nombre
      let servicioId = null
      if (formData.cita.servicio) {
        const nombreServicio = mapearSlugANombreServicio(formData.cita.servicio)
        const serviciosBD = await servicioService.getAll()
        const servicio = serviciosBD.find(s => 
          s.nombre && s.nombre.toLowerCase() === nombreServicio.toLowerCase()
        )
        if (servicio) {
          servicioId = servicio.id
        } else {
          throw new Error(`No se encontró el servicio: ${nombreServicio}`)
        }
      }

      // 5. Convertir hora de formato HH:MM a LocalTime
      const horaParts = formData.cita.hora.split(':')
      const horaFormato = `${horaParts[0]}:${horaParts[1] || '00'}:00`

      // 6. Normalizar fecha para evitar problemas de zona horaria
      // Asegurar que la fecha esté en formato YYYY-MM-DD sin conversiones
      let fechaNormalizada = formData.cita.fecha
      if (fechaNormalizada) {
        // Si viene como string, asegurarse de que solo tenga la parte de la fecha
        if (typeof fechaNormalizada === 'string') {
          fechaNormalizada = fechaNormalizada.split('T')[0]
        } else if (fechaNormalizada instanceof Date) {
          // Si viene como Date, convertir a YYYY-MM-DD sin usar toISOString (que usa UTC)
          const year = fechaNormalizada.getFullYear()
          const month = String(fechaNormalizada.getMonth() + 1).padStart(2, '0')
          const day = String(fechaNormalizada.getDate()).padStart(2, '0')
          fechaNormalizada = `${year}-${month}-${day}`
        }
      }

      // 7. Crear cita
      const nuevaCita = await citaService.create({
        fecha: fechaNormalizada,
        hora: horaFormato,
        motivo: formData.cita.motivo.trim(),
        diagnostico: null,
        tratamiento: null,
        mascota: { id: mascotaId },
        veterinario: veterinarioId ? { id: veterinarioId } : null,
        servicio: { id: servicioId }
      })

      return {
        success: true,
        cita: nuevaCita,
        propietario: {
          nombre: formData.propietario.nombre,
          correo: formData.propietario.correo
        },
        mascota: {
          nombre: formData.mascota.nombre
        },
        servicio: servicios.find(s => s.value === formData.cita.servicio)?.label || formData.cita.servicio,
        fecha: formData.cita.fecha,
        hora: formData.cita.hora
      }
    } catch (error) {
      console.error('Error al enviar al backend:', error)
      throw error
    }
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      // Scroll al primer error
      const firstErrorField = document.querySelector('.form-input-error, .form-select-error, .form-textarea-error')
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    // Verificar duplicados antes de mostrar resumen
    const existeDuplicado = await checkDuplicates()
    if (existeDuplicado) {
      setErrors({
        'cita.duplicado': 'Ya existe una cita registrada para esta mascota en esta fecha y hora. Por favor, selecciona otra fecha/hora o verifica los datos.'
      })
      alert('Ya existe una cita registrada para esta mascota en esta fecha y hora. Por favor, selecciona otra fecha/hora o verifica los datos.')
      return
    }

    // Mostrar modal de resumen
    setShowResumenModal(true)
  }

  // Confirmar envío desde el modal de resumen
  const handleConfirmSubmit = async () => {
    setShowResumenModal(false)
    setIsSubmitting(true)

    try {
      const resultado = await submitToBackend()
      
      if (resultado.success) {
        setCitaConfirmada(resultado)
        setShowConfirmacionModal(true)
      }
    } catch (error) {
      console.error('Error al enviar la reserva:', error)
      alert('Hubo un error al procesar tu reserva. Por favor, intenta nuevamente. Si el problema persiste, contacta directamente con la clínica.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cerrar modal de confirmación y redirigir
  const handleCloseConfirmacion = () => {
    setShowConfirmacionModal(false)
    navigate('/')
  }

  return (
    <div className="reserva-page">
      <div className="reserva-header">
        <h1>Agenda tu hora</h1>
        <p>Completa el siguiente formulario para reservar una cita veterinaria</p>
      </div>

      {isLoadingData && (
        <div className="loading-indicator">
          <p>Buscando datos del cliente...</p>
        </div>
      )}

      {mascotasExistentes.length > 0 && (
        <div className="mascotas-existentes-info" style={{
          background: '#e8f5e9',
          border: '2px solid #4caf50',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: '600', color: '#2e7d32' }}>
            ✓ Se encontraron {mascotasExistentes.length} mascota(s) registrada(s) para este cliente.
          </p>
          
          {!crearNuevaMascota && (
            <>
          <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#555' }}>
            Por favor, selecciona la mascota para la cual deseas agendar la cita:
          </p>
          <Select
                label="Seleccionar Mascota Existente"
            name="mascota.seleccionada"
            value={formData.mascota.id ? formData.mascota.id.toString() : ''}
            onChange={(e) => {
              const mascotaId = parseInt(e.target.value)
                  if (!mascotaId) {
                    // Limpiar selección
                    setFormData(prev => ({
                      ...prev,
                      mascota: {
                        id: null,
                        nombre: '',
                        especie: '',
                        raza: '',
                        edad: '',
                        sexo: ''
                      }
                    }))
                    return
                  }
              const mascotaSeleccionada = mascotasExistentes.find(m => m.id === mascotaId)
              if (mascotaSeleccionada) {
                const fechaNacimiento = mascotaSeleccionada.fechaNacimiento 
                  ? new Date(mascotaSeleccionada.fechaNacimiento) 
                  : null
                const edad = fechaNacimiento 
                  ? Math.floor((new Date() - fechaNacimiento) / (365.25 * 24 * 60 * 60 * 1000))
                  : ''
                
                setFormData(prev => ({
                  ...prev,
                  mascota: {
                    id: mascotaSeleccionada.id,
                    nombre: mascotaSeleccionada.nombre || '',
                    especie: mascotaSeleccionada.especie || '',
                    raza: mascotaSeleccionada.raza || '',
                    edad: edad.toString() || '',
                    sexo: mascotaSeleccionada.sexo || ''
                  }
                }))
                
                // Limpiar errores relacionados con la mascota
                setErrors(prev => {
                  const newErrors = { ...prev }
                  delete newErrors['mascota.nombre']
                  delete newErrors['mascota.especie']
                  delete newErrors['mascota.raza']
                  delete newErrors['mascota.edad']
                  delete newErrors['mascota.sexo']
                  return newErrors
                })
              }
            }}
                options={[
                  { value: '', label: 'Selecciona una mascota' },
                  ...mascotasExistentes.map(m => ({
              value: m.id.toString(),
              label: `${m.nombre} - ${m.especie || 'N/A'} (${m.raza || 'N/A'})`
                  }))
                ]}
            placeholder="Selecciona una mascota"
                required={!crearNuevaMascota}
              />
              
              <button
                type="button"
                onClick={() => {
                  setCrearNuevaMascota(true)
                  setFormData(prev => ({
                    ...prev,
                    mascota: {
                      id: null,
                      nombre: '',
                      especie: '',
                      raza: '',
                      edad: '',
                      sexo: ''
                    }
                  }))
                }}
                style={{
                  marginTop: '15px',
                  padding: '10px 20px',
                  background: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                + Agregar Nueva Mascota
              </button>
            </>
          )}
          
          {crearNuevaMascota && (
            <>
              <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#555' }}>
                Ingresa los datos de la nueva mascota:
              </p>
              <button
                type="button"
                onClick={() => {
                  setCrearNuevaMascota(false)
                  setFormData(prev => ({
                    ...prev,
                    mascota: {
                      id: null,
                      nombre: '',
                      especie: '',
                      raza: '',
                      edad: '',
                      sexo: ''
                    }
                  }))
                }}
                style={{
                  marginTop: '5px',
                  padding: '8px 16px',
                  background: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ← Volver a Mascotas Existentes
              </button>
            </>
          )}
        </div>
      )}

      {errors['cita.duplicado'] && (
        <div className="error-message-global">
          {errors['cita.duplicado']}
        </div>
      )}

      <form className="reserva-form" onSubmit={handleSubmit}>
        {/* Sección 1: Datos del Dueño */}
        <section className="form-section">
          <h2 className="section-title">
            <span className="section-icon">👤</span>
            Datos del Dueño
          </h2>
          <div className="form-grid">
            <Input
              label="Nombre completo"
              name="propietario.nombre"
              placeholder="Ej: Juan Pérez"
              value={formData.propietario.nombre}
              onChange={(e) => handleChange('propietario', 'nombre', e.target.value)}
              error={errors['propietario.nombre']}
              required
            />
            <Input
              label="RUT"
              name="propietario.rut"
              placeholder="Ej: 12.345.678-9"
              value={formData.propietario.rut}
              onChange={(e) => handleChange('propietario', 'rut', e.target.value)}
              error={errors['propietario.rut']}
              required
              helperText={formData.propietario.id ? "Cliente existente detectado. Los datos se han cargado automáticamente." : "El RUT se formateará automáticamente mientras escribes."}
            />
            <Input
              label="Teléfono"
              name="propietario.telefono"
              type="tel"
              placeholder="Ej: +56912345678"
              value={formData.propietario.telefono}
              onChange={(e) => handleChange('propietario', 'telefono', e.target.value)}
              error={errors['propietario.telefono']}
              required
            />
            <Input
              label="Correo electrónico"
              name="propietario.correo"
              type="email"
              placeholder="Ej: juanperez@gmail.com"
              value={formData.propietario.correo}
              onChange={(e) => handleChange('propietario', 'correo', e.target.value)}
              error={errors['propietario.correo']}
              required
            />
          </div>
        </section>

        {/* Sección 2: Datos de la Mascota */}
        <section className="form-section">
          <h2 className="section-title">
            <span className="section-icon">🐾</span>
            Datos de la Mascota
          </h2>
          <div className="form-grid">
            <Input
              label="Nombre de la mascota"
              name="mascota.nombre"
              placeholder="Ej: Firulais"
              value={formData.mascota.nombre}
              onChange={(e) => handleChange('mascota', 'nombre', e.target.value)}
              error={errors['mascota.nombre']}
              required
              disabled={formData.mascota.id && !crearNuevaMascota}
              helperText={formData.mascota.id && !crearNuevaMascota ? "Mascota seleccionada de las existentes. Para editar, usa el panel de administración." : ""}
            />
            <Select
              label="Especie"
              name="mascota.especie"
              value={formData.mascota.especie}
              onChange={(e) => handleChange('mascota', 'especie', e.target.value)}
              options={especies}
              placeholder="Selecciona la especie"
              error={errors['mascota.especie']}
              required
              disabled={formData.mascota.id && !crearNuevaMascota}
            />
            <Input
              label="Raza"
              name="mascota.raza"
              placeholder="Ej: Labrador"
              value={formData.mascota.raza}
              onChange={(e) => handleChange('mascota', 'raza', e.target.value)}
              error={errors['mascota.raza']}
              required
              disabled={formData.mascota.id && !crearNuevaMascota}
            />
            <Input
              label="Edad (años)"
              name="mascota.edad"
              type="number"
              placeholder="Ej: 4"
              min="0"
              value={formData.mascota.edad}
              onChange={(e) => handleChange('mascota', 'edad', e.target.value)}
              error={errors['mascota.edad']}
              required
              disabled={formData.mascota.id && !crearNuevaMascota}
            />
            <Select
              label="Sexo"
              name="mascota.sexo"
              value={formData.mascota.sexo}
              onChange={(e) => handleChange('mascota', 'sexo', e.target.value)}
              options={sexos}
              placeholder="Selecciona el sexo"
              error={errors['mascota.sexo']}
              required
              disabled={formData.mascota.id && !crearNuevaMascota}
            />
          </div>
        </section>

        {/* Sección 3: Detalles de la Cita */}
        <section className="form-section">
          <h2 className="section-title">
            <span className="section-icon">📅</span>
            Detalles de la Cita
          </h2>
          <div className="form-grid">
            <Select
              label="Servicio"
              name="cita.servicio"
              value={formData.cita.servicio}
              onChange={(e) => handleChange('cita', 'servicio', e.target.value)}
              options={servicios}
              placeholder="Selecciona un servicio"
              error={errors['cita.servicio']}
              required
            />
            <div className="form-field-full-width">
              <Textarea
                label="Motivo de la consulta"
                name="cita.motivo"
                placeholder="Describe el motivo de la consulta (ej: Mi perro tiene una herida en la pata)"
                value={formData.cita.motivo}
                onChange={(e) => handleChange('cita', 'motivo', e.target.value)}
                error={errors['cita.motivo']}
                rows={4}
                required
              />
            </div>
            <div className="form-field-full-width">
              <DatePicker
                label="Fecha de atención"
                name="cita.fecha"
                value={formData.cita.fecha}
                onChange={(e) => handleChange('cita', 'fecha', e.target.value)}
                error={errors['cita.fecha']}
                required
              />
            </div>
            {formData.cita.fecha && (
              <div className="form-field-full-width">
                <TimePicker
                  label="Hora de atención"
                  name="cita.hora"
                  value={formData.cita.hora}
                  onChange={(e) => handleChange('cita', 'hora', e.target.value)}
                  error={errors['cita.hora']}
                  required
                />
              </div>
            )}
            <Select
              label="Veterinario preferido (opcional)"
              name="cita.veterinario_preferido"
              value={formData.cita.veterinario_preferido}
              onChange={(e) => handleChange('cita', 'veterinario_preferido', e.target.value)}
              options={veterinarios}
              placeholder="Selecciona un veterinario"
            />
          </div>
        </section>

        {/* Sección 4: Confirmación */}
        <section className="form-section">
          <h2 className="section-title">
            <span className="section-icon">✓</span>
            Confirmación
          </h2>
          <div className="form-grid">
            <Checkbox
              label="Acepto los términos y condiciones de atención"
              name="aceptaTerminos"
              checked={formData.aceptaTerminos}
              onChange={(e) => handleCheckboxChange('aceptaTerminos', e.target.checked)}
              error={errors['aceptaTerminos']}
              required
              description="He leído y acepto las políticas de atención, cancelación y reembolso de la clínica."
            />
            <Checkbox
              label="Autorizo el tratamiento de datos personales"
              name="autorizaDatos"
              checked={formData.autorizaDatos}
              onChange={(e) => handleCheckboxChange('autorizaDatos', e.target.checked)}
              error={errors['autorizaDatos']}
              required
              description="Autorizo a Clínica Veterinaria Pucará a tratar mis datos personales de acuerdo con la Ley 19.628 sobre Protección de la Vida Privada de Chile."
            />
          </div>
        </section>

        {/* Botón de envío */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting || isLoadingData}
          >
            {isSubmitting ? 'Enviando...' : 'Revisar y Confirmar Reserva'}
          </button>
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate('/')}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Modal de Resumen */}
      <ResumenModal
        isOpen={showResumenModal}
        onClose={() => setShowResumenModal(false)}
        onConfirm={handleConfirmSubmit}
        formData={formData}
        isSubmitting={isSubmitting}
      />

      {/* Modal de Confirmación */}
      <ConfirmacionModal
        isOpen={showConfirmacionModal}
        onClose={handleCloseConfirmacion}
        citaData={citaConfirmada}
      />
    </div>
  )
}
