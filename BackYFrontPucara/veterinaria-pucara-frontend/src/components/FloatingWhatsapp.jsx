import './styles/FloatingWhatsApp.css'

export default function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/123456789"
      target="_blank"
      className="floating-whatsapp"
      rel="noopener noreferrer"
    >
      <img src="public/assets/icons/whatsapp.svg.webp" alt="WhatsApp" />
    </a>
  )
}
