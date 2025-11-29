import { useParams, useNavigate } from 'react-router-dom'
import './BlogDetalle.css'

const articulosCompletos = {
  1: {
    id: 1,
    titulo: 'Guía Completa para el Tutor de un Primer Cachorro',
    autor: 'Dr. Rafael León',
    fecha: '12/17/2024',
    tiempoLectura: '3 min read',
    imagen: '/assets/blog1.jpg',
    contenido: `
      <p>La llegada de un cachorro a tu hogar es una experiencia maravillosa y llena de alegría, pero también conlleva grandes responsabilidades. En esta guía completa te proporcionamos toda la información necesaria para garantizar el bienestar de tu nuevo compañero.</p>
      
      <h2>Preparación del Hogar</h2>
      <p>Antes de traer a tu cachorro a casa, es importante preparar el espacio. Asegúrate de tener:</p>
      <ul>
        <li>Cama cómoda y acogedora</li>
        <li>Bowl para agua y comida</li>
        <li>Juguetes apropiados para su edad</li>
        <li>Correa y collar identificatorio</li>
        <li>Área designada para hacer sus necesidades</li>
      </ul>
      
      <h2>Alimentación</h2>
      <p>Los cachorros requieren una alimentación especial rica en nutrientes para su crecimiento. Consulta con tu veterinario sobre el tipo y cantidad de alimento adecuado según la raza y tamaño de tu cachorro.</p>
      
      <h2>Socialización</h2>
      <p>La socialización temprana es crucial para el desarrollo del cachorro. Exponlo gradualmente a diferentes personas, animales, sonidos y ambientes de manera positiva.</p>
      
      <h2>Cuidados Veterinarios</h2>
      <p>Programa una visita veterinaria dentro de los primeros días. El veterinario establecerá un calendario de vacunación, desparasitación y chequeos regulares.</p>
    `
  },
  2: {
    id: 2,
    titulo: 'Guía Completa para el Tutor de un Gatito Cachorro',
    autor: 'Dr. Rafael León',
    fecha: '12/17/2024',
    tiempoLectura: '3 min read',
    imagen: '/assets/blog2.avif',  
    contenido: `
      <p>Felicitaciones por dar la bienvenida a tu nuevo gatito cachorro a tu familia. Los gatitos requieren cuidados específicos desde temprana edad para asegurar su salud, nutrición y socialización adecuada. Te guiamos paso a paso.</p>
      
      <h2>Preparación del Ambiente</h2>
      <p>Los gatitos necesitan un espacio seguro donde puedan explorar. Prepara:</p>
      <ul>
        <li>Arenero con arena limpia</li>
        <li>Comedero y bebedero separados</li>
        <li>Rascador para mantener sus uñas</li>
        <li>Espacio para esconderse y descansar</li>
        <li>Juguetes apropiados para gatitos</li>
      </ul>
      
      <h2>Alimentación Específica</h2>
      <p>Los gatitos tienen necesidades nutricionales especiales. Requieren alimento rico en proteínas y taurina. Elige alimento específico para gatitos hasta que cumplan un año.</p>
      
      <h2>Cuidados de Salud</h2>
      <p>Es importante llevar a tu gatito al veterinario para vacunación, desparasitación y examen físico completo. Los gatitos son especialmente vulnerables a enfermedades.</p>
      
      <h2>Socialización</h2>
      <p>La socialización temprana ayuda a los gatitos a convertirse en gatos adultos bien adaptados. Acarícialo suavemente, juega con él y exponlo gradualmente a diferentes experiencias.</p>
    `
  },
  3: {
    id: 3,
    titulo: 'Importancia de la Vacunación en Mascotas',
    autor: 'Dra. Pilar Zoccola',
    fecha: '12/15/2024',
    tiempoLectura: '4 min read',
    imagen: '/assets/blog3.avif',
    contenido: `
      <p>Las vacunas son fundamentales para proteger a nuestras mascotas de enfermedades graves. Conoce el calendario de vacunación adecuado, las enfermedades que previenen y por qué es esencial seguir el programa de vacunación recomendado.</p>
      
      <h2>¿Por qué vacunar a tu mascota?</h2>
      <p>Las vacunas preparan el sistema inmunológico de tu mascota para combatir enfermedades específicas. Ayudan a prevenir enfermedades graves, algunas de las cuales pueden ser mortales.</p>
      
      <h2>Calendario de Vacunación</h2>
      <p>El calendario de vacunación varía según la especie, edad y estilo de vida de tu mascota. Consulta con tu veterinario para establecer el programa adecuado.</p>
      
      <h2>Vacunas Esenciales</h2>
      <p>Las vacunas esenciales protegen contra enfermedades comunes y peligrosas. Para perros incluyen moquillo, parvovirus y rabia. Para gatos incluyen panleucopenia, calicivirus y rabia.</p>
    `
  },
  4: {
    id: 4,
    titulo: 'Nutrición Balanceada: Clave para la Salud de tu Mascota',
    autor: 'Dr. Carlos Méndez',
    fecha: '12/10/2024',
    tiempoLectura: '5 min read',
    imagen: '/assets/blog4.avif',
    contenido: `
      <p>Una alimentación adecuada es la base de una vida saludable. Descubre cómo elegir el alimento correcto según la edad, raza y necesidades específicas de tu mascota, y aprende a leer etiquetas nutricionales.</p>
      
      <h2>Nutrientes Esenciales</h2>
      <p>Las mascotas necesitan una dieta balanceada que incluya proteínas, carbohidratos, grasas, vitaminas y minerales en las proporciones adecuadas.</p>
      
      <h2>Alimentación Según la Edad</h2>
      <p>Cachorros, adultos y adultos mayores tienen diferentes necesidades nutricionales. Elige alimentos específicos para cada etapa de vida.</p>
      
      <h2>Leer Etiquetas Nutricionales</h2>
      <p>Aprende a interpretar las etiquetas de los alimentos para mascotas. Busca ingredientes de calidad y valores nutricionales adecuados.</p>
      
      <h2>Hidratación</h2>
      <p>El agua fresca y limpia debe estar siempre disponible para tu mascota. La hidratación adecuada es esencial para su salud.</p>
    `
  }
}

export default function BlogDetalle() {
  const { articuloId } = useParams()
  const navigate = useNavigate()
  
  const articulo = articulosCompletos[articuloId]

  if (!articulo) {
    return (
      <div className="page blog-detalle-page">
        <h1>Artículo no encontrado</h1>
        <button onClick={() => navigate('/blog-veterinario')}>Volver al blog</button>
      </div>
    )
  }

  return (
    <div className="page blog-detalle-page">
      <button className="back-btn" onClick={() => navigate('/blog-veterinario')}>
        ← Volver al blog
      </button>

      <div className="blog-detalle-container">
        <div className="blog-detalle-imagen">
          <img src={articulo.imagen} alt={articulo.titulo} />
        </div>

        <div className="blog-detalle-content">
          <h1 className="blog-detalle-titulo">{articulo.titulo}</h1>
          
          <div className="blog-detalle-meta">
            <span className="blog-detalle-autor">{articulo.autor}</span>
            <span className="blog-detalle-separador">·</span>
            <span className="blog-detalle-fecha">{articulo.fecha}</span>
            <span className="blog-detalle-separador">·</span>
            <span className="blog-detalle-tiempo">{articulo.tiempoLectura}</span>
          </div>

          <div 
            className="blog-detalle-contenido"
            dangerouslySetInnerHTML={{ __html: articulo.contenido }}
          />
        </div>
      </div>
    </div>
  )
}

