import { useNavigate } from 'react-router-dom'
import './BlogVeterinario.css'

const articulos = [
  {
    id: 1,
    titulo: 'Guía Completa para el Tutor de un Primer Cachorro',
    resumen: 'La llegada de un cachorro a tu hogar es una experiencia maravillosa y llena de alegría, pero también conlleva grandes responsabilidades. En esta guía completa te proporcionamos toda la información necesaria para garantizar el bienestar de tu nuevo compañero.',
    autor: 'Dr. Rafael León',
    fecha: '12/17/2024',
    tiempoLectura: '3 min read',
    imagen: '/assets/blog1.jpg'
  },
  {
    id: 2,
    titulo: 'Guía Completa para el Tutor de un Gatito Cachorro',
    resumen: 'Felicitaciones por dar la bienvenida a tu nuevo gatito cachorro a tu familia. Los gatitos requieren cuidados específicos desde temprana edad para asegurar su salud, nutrición y socialización adecuada. Te guiamos paso a paso.',
    autor: 'Dr. Rafael León',
    fecha: '12/17/2024',
    tiempoLectura: '3 min read',
    imagen: '/assets/blog2.avif'
  },
  {
    id: 3,
    titulo: 'Importancia de la Vacunación en Mascotas',
    resumen: 'Las vacunas son fundamentales para proteger a nuestras mascotas de enfermedades graves. Conoce el calendario de vacunación adecuado, las enfermedades que previenen y por qué es esencial seguir el programa de vacunación recomendado.',
    autor: 'Dra. Pilar Zoccola',
    fecha: '12/15/2024',
    tiempoLectura: '4 min read',
    imagen: '/assets/blog3.avif'
  },
  {
    id: 4,
    titulo: 'Nutrición Balanceada: Clave para la Salud de tu Mascota',
    resumen: 'Una alimentación adecuada es la base de una vida saludable. Descubre cómo elegir el alimento correcto según la edad, raza y necesidades específicas de tu mascota, y aprende a leer etiquetas nutricionales.',
    autor: 'Dr. Carlos Méndez',
    fecha: '12/10/2024',
    tiempoLectura: '5 min read',
    imagen: '/assets/blog4.avif'
  }
]

export default function BlogVeterinario() {
  const navigate = useNavigate()

  const handleClickArticulo = (articuloId) => {
    navigate(`/blog-veterinario/${articuloId}`)
  }

  return (
    <div className="page blog-page">
      <h1 className="blog-title">Blog Veterinario</h1>
      <p className="blog-subtitle">
        Consejos, guías y artículos educativos para el cuidado de tus mascotas
      </p>

      <div className="blog-grid">
        {articulos.map(articulo => (
          <article 
            key={articulo.id} 
            className="blog-card"
            onClick={() => handleClickArticulo(articulo.id)}
          >
            <div className="blog-imagen">
              <img src={articulo.imagen} alt={articulo.titulo} />
            </div>
            <div className="blog-content">
              <h2 className="blog-titulo">{articulo.titulo}</h2>
              <p className="blog-resumen">{articulo.resumen}</p>
              <div className="blog-meta">
                <span className="blog-autor">{articulo.autor}</span>
                <span className="blog-separador">·</span>
                <span className="blog-fecha">{articulo.fecha}</span>
                <span className="blog-separador">·</span>
                <span className="blog-tiempo">{articulo.tiempoLectura}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
