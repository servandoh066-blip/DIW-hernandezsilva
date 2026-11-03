<template>
  <div class="xestion-citas">
    <header class="cabecera">
      <h1>📅 Xestión de Citas 🩺</h1>
    </header>

    <form class="formulario-citas" @submit.prevent="gardarCita">
      <!-- Fila 1: ID cita, data e botón de limpar -->
      <div class="fila">
        <div class="campo">
          <label for="idcita">ID cita</label>
          <input
            id="idcita"
            v-model.trim="cita.idcita"
            type="text"
            placeholder="ID cita"
            required
          />
        </div>

        <div class="campo">
          <label for="fecha">Data</label>
          <input
            id="fecha"
            v-model="cita.fecha"
            type="date"
            placeholder="dd/mm/aaaa"
            required
          />
        </div>

        <button
          type="button"
          class="btn-limpar"
          title="Limpar campos"
          aria-label="Limpar campos"
          @click="limparFormulario"
        >
          🧹
        </button>
      </div>

      <!-- Fila 2: ID do paciente e ID do doctor -->
      <div class="fila">
        <div class="campo">
          <label for="idpaciente">ID do paciente</label>
          <input
            id="idpaciente"
            v-model.trim="cita.idpaciente"
            type="text"
            placeholder="ID do paciente"
            required
          />
        </div>

        <div class="campo">
          <label for="iddoctor">ID Doctor</label>
          <input
            id="iddoctor"
            v-model.trim="cita.iddoctor"
            type="text"
            placeholder="ID Doctor"
            required
          />
        </div>
      </div>

      <!-- Fila 3: hora, motivo e estado -->
      <div class="fila">
        <div class="campo">
          <label for="hora">Hora Cita</label>
          <input
            id="hora"
            v-model="cita.hora"
            type="time"
            placeholder="--:--"
            required
          />
        </div>

        <div class="campo campo-motivo">
          <label for="motivo">Motivo da cita</label>
          <input
            id="motivo"
            v-model.trim="cita.motivo"
            type="text"
            placeholder="Motivo da cita"
            required
          />
        </div>

        <div class="campo">
          <label for="estado">Estado</label>
          <select id="estado" v-model="cita.estado">
            <option value="Pendente">Pendente</option>
            <option value="Completada">Completada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      <!-- Fila 4: observacións -->
      <div class="fila">
        <div class="campo campo-observacions">
          <label for="observacions">Observacións adicionais</label>
          <textarea
            id="observacions"
            v-model.trim="cita.observacions"
            rows="4"
            placeholder="Observacións adicionais"
          ></textarea>
        </div>
      </div>

      <button type="submit" class="btn-gardar">Gardar</button>
    </form>

    <section class="listaxe">
      <header class="cabecera-listaxe">
        <h2>📑 Listaxe de Citas</h2>
        <button
          type="button"
          class="btn-recargar"
          title="Recargar listado"
          aria-label="Recargar listado"
          @click="cargarCitas"
        >
          ↻
        </button>
      </header>

      <p v-if="citas.length === 0" class="estado-vacio">
        Non hai citas cargadas ou falla a conexión coa BBDD.
      </p>

      <div v-else class="taboa-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID cita</th>
              <th>Data</th>
              <th>Hora</th>
              <th>ID paciente</th>
              <th>ID doctor</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th>Observacións</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in citas" :key="item.idcita || index">
              <td>{{ item.idcita }}</td>
              <td>{{ formatarData(item.fecha) }}</td>
              <td>{{ item.hora }}</td>
              <td>{{ item.idpaciente }}</td>
              <td>{{ item.iddoctor }}</td>
              <td>{{ item.motivo }}</td>
              <td>
                <span :class="['estado', `estado-${item.estado.toLowerCase()}`]">
                  {{ item.estado }}
                </span>
              </td>
              <td>{{ item.observacions || "—" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const API_URL = "http://localhost:3000/api/citas";

// Obxecto reactivo enlazado ao formulario mediante v-model
const cita = ref({
  idcita: "",
  fecha: "",
  idpaciente: "",
  iddoctor: "",
  hora: "",
  motivo: "",
  estado: "Pendente",
  observacions: "",
});

// Listaxe de citas amosada na parte inferior
const citas = ref([]);

// Se o backend aínda non está dispoñible, mantense a listaxe actual
// e amósase a mensaxe de estado vacío.
async function cargarCitas() {
  try {
    const resposta = await fetch(API_URL);

    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status}`);
    }

    const datos = await resposta.json();
    citas.value = Array.isArray(datos) ? datos : [];
  } catch (erro) {
    console.warn("Non se puideron cargar as citas:", erro);
  }
}

function gardarCita() {
  citas.value.push({ ...cita.value });
  limparFormulario();
}

function limparFormulario() {
  Object.assign(cita.value, {
    idcita: "",
    fecha: "",
    idpaciente: "",
    iddoctor: "",
    hora: "",
    motivo: "",
    estado: "Pendente",
    observacions: "",
  });
}

function formatarData(data) {
  if (!data) return "";

  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

onMounted(cargarCitas);
</script>

<style scoped>
.xestion-citas {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 1rem;
  background-color: #ffffff;
  color: #333333;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.cabecera {
  background-color: #17b473;
  color: #ffffff;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  text-align: center;
}

.cabecera h1 {
  margin: 0;
  color: #ffffff;
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  line-height: 1.3;
}

.formulario-citas {
  background-color: #f7fbf9;
  border: 1px solid #d7ebe3;
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fila {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  width: 100%;
}

.campo {
  display: flex;
  flex: 1 1 220px;
  min-width: 0;
  flex-direction: column;
  gap: 0.35rem;
}

.campo-motivo {
  flex: 2 1 280px;
}

.campo-observacions {
  flex: 1 1 100%;
}

.campo label {
  color: #333333;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: left;
}

.campo input,
.campo select,
.campo textarea {
  width: 100%;
  padding: 0.6rem 0.7rem;
  border: 1px solid #cfd8d3;
  border-radius: 8px;
  background-color: #ffffff;
  color: #333333;
  font: inherit;
  box-sizing: border-box;
}

.campo textarea {
  min-height: 110px;
  resize: vertical;
}

.campo input:focus,
.campo select:focus,
.campo textarea:focus {
  outline: 2px solid rgba(23, 180, 115, 0.25);
  border-color: #17b473;
}

.btn-limpar {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  border: 1px solid #cfd8d3;
  border-radius: 8px;
  background-color: #ffffff;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
}

.btn-limpar:hover {
  background-color: #e8f7f1;
}

.btn-gardar {
  align-self: center;
  margin-top: 0.25rem;
  padding: 0.7rem 2.25rem;
  border: none;
  border-radius: 8px;
  background-color: #17b473;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-gardar:hover {
  background-color: #129662;
}

.listaxe {
  border: 1px solid #d7ebe3;
  border-radius: 10px;
  overflow: hidden;
  background-color: #ffffff;
}

.cabecera-listaxe {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem 1rem;
  background-color: #17b473;
  color: #ffffff;
}

.cabecera-listaxe h2 {
  margin: 0;
  color: #ffffff;
  font-size: 1.1rem;
}

.btn-recargar {
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
}

.btn-recargar:hover {
  background-color: rgba(255, 255, 255, 0.32);
}

.estado-vacio {
  margin: 0;
  padding: 1.5rem 1rem;
  color: #555555;
  text-align: center;
}

.taboa-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th,
td {
  padding: 0.7rem;
  border-bottom: 1px solid #e1ece7;
  text-align: left;
  white-space: nowrap;
}

th {
  background-color: #e8f7f1;
  color: #333333;
  font-weight: 600;
}

tbody tr:hover {
  background-color: #f7fbf9;
}

.estado {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.estado-pendente {
  background-color: #fff4d6;
  color: #8a6100;
}

.estado-completada {
  background-color: #d9f5e8;
  color: #0f6b45;
}

.estado-cancelada {
  background-color: #fde0e0;
  color: #a12222;
}

@media (max-width: 768px) {
  .xestion-citas {
    padding: 0.5rem;
  }

  .fila {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-limpar {
    width: 100%;
  }
}
</style>
