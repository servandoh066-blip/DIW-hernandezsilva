<template>
  <section class="hero">
    <video class="hero-video" autoplay muted loop playsinline aria-hidden="true">
      <source :src="videoInicio" type="video/mp4" />
    </video>
    <div class="hero-sobre" aria-hidden="true"></div>

    <div class="hero-conteido">
      <span class="etiqueta">SAÚDE E BENESTAR</span>
      <h2>Coidamos de ti</h2>
      <p>
        Benvido a XestiónApp, a túa solución integral para a xestión de
        pacientes, doctores e citas. Facilitamos a comunicación entre pacientes
        e profesionais para ofrecer unha atención máis próxima e eficiente.
      </p>
    </div>
  </section>
</template>

<script setup>
import videoInicio from '../assets/inicio.mp4';
</script>

<style scoped>
.hero {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  min-height: clamp(420px, 65vh, 620px);
  margin: 1.5rem auto;
  overflow: hidden;
  border: 1px solid rgba(23, 180, 115, 0.25);
  border-radius: 22px;
  box-shadow: 0 12px 30px rgba(40, 100, 60, 0.18);
}

.hero-video {
  position: absolute;
  inset: 0;
  z-index: -20;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-sobre {
  position: absolute;
  inset: 0;
  z-index: -10;
  background: linear-gradient(
    90deg,
    rgba(13, 54, 34, 0.86),
    rgba(22, 91, 55, 0.58),
    rgba(13, 54, 34, 0.25)
  );
}

.hero-conteido {
  max-width: 42rem;
  padding: 2.5rem;
  color: #ffffff;
}

.etiqueta {
  color: #d7f5df;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.hero-conteido h2 {
  margin: 0.6rem 0 1rem;
  font-size: clamp(2.2rem, 6vw, 4.5rem);
  font-weight: 500;
  line-height: 1.15;
}

.hero-conteido p {
  max-width: 36rem;
  margin: 0;
  font-size: 1rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 640px) {
  .hero-conteido {
    padding: 1.5rem;
  }
}
</style>
