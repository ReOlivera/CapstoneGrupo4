import './Contacto.css'

export default function Contacto() {
  return (
    <div className="page">
      <h1 style={{ color: 'var(--color-primary)', textAlign: 'center', marginBottom: '2rem' }}>
        Contacto
      </h1>
      
      <div className="contacto-container">
        <div className="contacto-info">
          <h2 style={{ color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
            Información de Contacto
          </h2>
          
          <div className="contacto-item">
            <h3 style={{ color: 'var(--color-primary-700)', marginBottom: '0.5rem' }}>
              📧 Email
            </h3>
            <p style={{ color: 'var(--color-text)', fontSize: '1.1rem' }}>
              <a href="mailto:vetpucara@gmail.com" 
                 style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                vetpucara@gmail.com
              </a>
            </p>
          </div>

          <div className="contacto-item">
            <h3 style={{ color: 'var(--color-primary-700)', marginBottom: '0.5rem' }}>
              📞 Teléfono
            </h3>
            <p style={{ color: 'var(--color-text)', fontSize: '1.1rem' }}>
              <a href="tel:+56228592840" 
                 style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                +56228592840
              </a>
            </p>
          </div>

          <div className="contacto-item">
            <h3 style={{ color: 'var(--color-primary-700)', marginBottom: '0.5rem' }}>
              📍 Dirección
            </h3>
            <p style={{ color: 'var(--color-text)', fontSize: '1.1rem', marginBottom: '1rem' }}>
              Esmeralda 97<br />
              San Bernardo, Región Metropolitana
            </p>
          </div>

          <div className="horarios">
            <h3 style={{ color: 'var(--color-primary-700)', marginBottom: '1rem' }}>
              🕒 Horarios de Atención
            </h3>
            <div style={{ color: 'var(--color-text)' }}>
              <p><strong>Lunes a Viernes:</strong> 8:00 - 20:00</p>
              <p><strong>Sábados:</strong> 8:00 - 18:00</p>
              <p><strong>Domingos:</strong> 9:00 - 14:00</p>
              <p><strong>Emergencias:</strong> 24/7</p>
            </div>
          </div>
        </div>

        <div className="contacto-mapa">
          <h3 style={{ color: 'var(--color-primary)', marginBottom: '1rem', textAlign: 'center' }}>
            Nuestra Ubicación
          </h3>
          <div className="mapa-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.2412046106347!2d-70.70277308769785!3d-33.59904557321965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662d944194edecb%3A0xeb6ef5e24a4ec7b8!2sEsmeralda%2097%2C%208071269%20San%20Bernardo%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses!2scl!4v1761783715514!5m2!1ses!2scl"
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: '8px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de Veterinaria Pucará"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  )
}


