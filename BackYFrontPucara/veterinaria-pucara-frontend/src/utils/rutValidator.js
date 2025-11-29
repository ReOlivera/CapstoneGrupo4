/**
 * Valida y normaliza RUT chileno
 * Formato: 12345678-9 o 12.345.678-9
 */

/**
 * Normaliza un RUT eliminando puntos, espacios y guiones, y convirtiendo a mayúsculas
 * @param {string} rut - RUT a normalizar
 * @returns {string} - RUT normalizado
 */
export const normalizarRUT = (rut) => {
  if (!rut) return ''
  return rut.replace(/[.-\s]/g, '').toUpperCase()
}

/**
 * Valida el formato básico de un RUT (longitud)
 * @param {string} rut - RUT a validar
 * @returns {boolean} - true si el formato es válido
 */
export const validarFormatoRUT = (rut) => {
  if (!rut) return false
  const rutNormalizado = normalizarRUT(rut)
  // RUT debe tener entre 8 y 9 dígitos más el guión y dígito verificador
  // Formato normalizado: 12345678K (8-9 dígitos + 1 carácter)
  return /^\d{7,8}[0-9K]$/.test(rutNormalizado)
}

/**
 * Calcula el dígito verificador de un RUT
 * @param {string} rutSinVerificador - RUT sin el dígito verificador
 * @returns {string} - Dígito verificador calculado
 */
const calcularDigitoVerificador = (rutSinVerificador) => {
  let suma = 0
  let multiplicador = 2

  // Recorrer el RUT de derecha a izquierda
  for (let i = rutSinVerificador.length - 1; i >= 0; i--) {
    suma += parseInt(rutSinVerificador.charAt(i)) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }

  const resto = suma % 11
  const verificador = 11 - resto

  if (verificador === 11) return '0'
  if (verificador === 10) return 'K'
  return verificador.toString()
}

/**
 * Valida un RUT chileno completo (incluyendo dígito verificador)
 * @param {string} rut - RUT a validar (formato: 12345678-9 o 12.345.678-9)
 * @returns {boolean} - true si el RUT es válido
 */
export const validarRUT = (rut) => {
  if (!rut) return false

  const rutNormalizado = normalizarRUT(rut)
  
  // Validar formato básico
  if (!/^\d{7,8}[0-9K]$/.test(rutNormalizado)) {
    return false
  }

  // Separar número y dígito verificador
  const rutSinVerificador = rutNormalizado.slice(0, -1)
  const digitoVerificador = rutNormalizado.slice(-1).toUpperCase()

  // Calcular dígito verificador esperado
  const digitoCalculado = calcularDigitoVerificador(rutSinVerificador)

  // Comparar dígitos verificadores
  return digitoVerificador === digitoCalculado
}

/**
 * Formatea un RUT con puntos y guión
 * @param {string} rut - RUT a formatear
 * @returns {string} - RUT formateado (ej: 12.345.678-9)
 */
export const formatearRUT = (rut) => {
  if (!rut) return ''
  
  const rutNormalizado = normalizarRUT(rut)
  
  if (rutNormalizado.length < 8) return rutNormalizado

  // Separar número y dígito verificador
  const numero = rutNormalizado.slice(0, -1)
  const digitoVerificador = rutNormalizado.slice(-1)

  // Formatear número con puntos
  let numeroFormateado = ''
  let contador = 0
  
  for (let i = numero.length - 1; i >= 0; i--) {
    numeroFormateado = numero.charAt(i) + numeroFormateado
    contador++
    if (contador === 3 && i > 0) {
      numeroFormateado = '.' + numeroFormateado
      contador = 0
    }
  }

  return `${numeroFormateado}-${digitoVerificador}`
}

/**
 * Formatea RUT mientras el usuario escribe (formato automático)
 * @param {string} value - Valor actual del input
 * @returns {string} - RUT formateado
 */
export const formatearRUTInput = (value) => {
  if (!value) return ''
  
  // Remover todo excepto números y K
  let cleaned = value.replace(/[^0-9Kk]/g, '').toUpperCase()
  
  // Limitar longitud (máximo 10 caracteres: 8 dígitos + 1 guión + 1 dígito verificador)
  if (cleaned.length > 9) {
    cleaned = cleaned.slice(0, 9)
  }
  
  if (cleaned.length === 0) return ''
  
  // Si tiene más de 1 carácter, agregar formato
  if (cleaned.length <= 1) return cleaned
  
  const numero = cleaned.slice(0, -1)
  const digitoVerificador = cleaned.slice(-1)
  
  // Formatear número con puntos
  let numeroFormateado = ''
  let contador = 0
  
  for (let i = numero.length - 1; i >= 0; i--) {
    numeroFormateado = numero.charAt(i) + numeroFormateado
    contador++
    if (contador === 3 && i > 0) {
      numeroFormateado = '.' + numeroFormateado
      contador = 0
    }
  }
  
  return `${numeroFormateado}-${digitoVerificador}`
}

