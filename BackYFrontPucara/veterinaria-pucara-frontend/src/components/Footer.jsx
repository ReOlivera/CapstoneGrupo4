import './styles/Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section logo-section">
          <img src="/assets/logo-pucara-transparent.png" alt="Veterinaria Pucará" className="footer-logo" />
          {/* Si tienes un logo con texto, puedes reemplazar o agregar texto */}
        </div>

        <div className="footer-section info-section">
          <h4>INFORMACIÓN</h4>
          <ul>
            <li><a href="#">Nuestra Clínica</a></li>
            <li><a href="#">Preguntas Frecuentes</a></li>
            <li><a href="#">Sugerencias y Reclamos</a></li>
            <li><a href="#">Trabaja con Nosotros</a></li>
          </ul>
        </div>

        <div className="footer-section empresa-section">
          <h4>EMPRESA</h4>
          <ul>
            <li><a href="#">Políticas de Reembolso</a></li>
            <li><a href="#">Políticas de Privacidad</a></li>
            <li><a href="#">Términos y Condiciones</a></li>
          </ul>
        </div>

        <div className="footer-section contact-section">
          <h4>CONTÁCTANOS</h4>
          <ul>
            <li>Esmeralda 97, San Bernardo, Región Metropolitana.</li>
            <li><a href="tel:+56222129498">+56 (2) 2859 2840</a></li>
            <li><a href="mailto:contacto@veterinaria.cl">contacto@veterinaria.cl</a></li>
            <li>Clínica Veterinaria Pucará Spa</li>
            <li>RUT: 79.769.550‑5</li>
            <li>Representante legal: Jacqueline Ballesty Lee</li>
          </ul>
        </div>

        
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Clínica Veterinaria Pucará. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
