<template>
  <section class="servicios">
    <header class="cabecera">
      <span class="etiqueta">ATENCIÓN PRÓXIMA</span>
      <h1>Servicios médicos</h1>
      <p>Un equipo preparado para acompañarte en cada etapa de tu salud.</p>
    </header>

    <div class="reixa">
      <article v-for="servicio in servicios" :key="servicio.nombre" class="tarjeta">
        <img :src="servicio.foto" :alt="servicio.alt" loading="lazy" />
        <div class="corpo">
          <h2>{{ servicio.nombre }}</h2>
          <p>{{ servicio.descripcion }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
const servicios = [
  {
    nombre: 'Medicina familiar',
    descripcion: 'Seguimiento integral para cuidar tu salud y la de toda tu familia.',
    foto: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=85',
    alt: 'Profesional sanitario atendiendo a una paciente',
  },
  {
    nombre: 'Pediatría',
    descripcion: 'Atención cercana para acompañar el crecimiento y bienestar de los más pequeños.',
    foto: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=900&q=85',
    alt: 'Médica revisando a una niña',
  },
  {
    nombre: 'Cardiología',
    descripcion: 'Prevención, diagnóstico y control de la salud cardiovascular.',
    foto: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=85',
    alt: 'Profesional realizando una exploración cardiológica',
  },
  {
    nombre: 'Dermatología',
    descripcion: 'Cuidado especializado para mantener tu piel sana y protegida.',
    foto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=900&q=85',
    alt: 'Dermatóloga en consulta',
  },
  {
    nombre: 'Fisioterapia',
    descripcion: 'Recupera movilidad y bienestar con planes adaptados a tus necesidades.',
    foto: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=85',
    alt: 'Fisioterapeuta trabajando con un paciente',
  },
  {
    nombre: 'Salud mental',
    descripcion: 'Un espacio de escucha y apoyo para cuidar tu equilibrio emocional.',
    foto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=85',
    alt: 'Profesional conversando con una paciente',
  },
];
</script>

<style scoped>
.servicios {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 1rem;
  box-sizing: border-box;
}

.cabecera {
  max-width: 48rem;
  margin: 0 auto 2rem;
  text-align: center;
}

.etiqueta {
  color: #17b473;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.cabecera h1 {
  margin: 0.5rem 0 0;
  color: #173b2b;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
}

.cabecera p {
  margin: 1rem 0 0;
  color: #555555;
  font-size: 1rem;
  line-height: 1.7;
}

.reixa {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.tarjeta {
  overflow: hidden;
  border: 1px solid #d7ebe3;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 8px 24px rgba(40, 100, 60, 0.12);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.tarjeta:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 30px rgba(40, 100, 60, 0.18);
}

.tarjeta img {
  display: block;
  width: 100%;
  height: 13rem;
  object-fit: cover;
}

.corpo {
  padding: 1.25rem;
}

.corpo h2 {
  margin: 0;
  color: #17b473;
  font-size: 1.15rem;
}

.corpo p {
  margin: 0.75rem 0 0;
  color: #555555;
  line-height: 1.6;
}
</style>
