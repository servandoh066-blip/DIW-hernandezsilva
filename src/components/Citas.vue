<template>
  <div class="xestion-citas">
    <header class="cabecera">
      <h1>📅 Xestión de Citas 🩺</h1>
    </header>

    <form class="formulario-citas" @submit.prevent="gardarCita">
      <!-- Fila 1: ID cita (xérase ao gardar), data e botón de limpar -->
      <div class="fila">
        <div class="campo">
          <label for="idcita">ID cita</label>
          <input
            id="idcita"
            :value="editandoId || '—'"
            type="text"
            disabled
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

      <!-- Fila 2: paciente e doctor, tomados da selección das súas pestañas -->
      <div class="fila">
        <div class="campo">
          <label for="paciente-cita">Paciente</label>
          <select
            id="paciente-cita"
            :value="pacienteStore.dnipac || ''"
            disabled
          >
            <option v-if="!pacienteStore.dnipac" value="">
              Selecciona un paciente na súa pestana
            </option>
            <option v-else :value="pacienteStore.dnipac">
              {{ pacienteStore.nomepac }} {{ pacienteStore.apelpac }} — {{ pacienteStore.dnipac }}
            </option>
          </select>
        </div>

        <div class="campo">
          <label for="doctor-cita">Doctor</label>
          <select
            id="doctor-cita"
            :value="doctorStore.id || ''"
            disabled
          >
            <option v-if="!doctorStore.id" value="">
              Selecciona un doctor na súa pestana
            </option>
            <option v-else :value="doctorStore.id">
              {{ doctorStore.nombre }} {{ doctorStore.apellido }} — {{ doctorStore.especialidad }}
            </option>
          </select>
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
            maxlength="250"
            placeholder="Describe brevemente o motivo"
            required
          />
        </div>

        <div class="campo">
          <label for="estado">Estado</label>
          <select id="estado" v-model="cita.estado">
            <option value="pendente">Pendente</option>
            <option value="confirmada">Confirmada</option>
            <option value="realizada">Realizada</option>
            <option value="cancelada">Cancelada</option>
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
            maxlength="1000"
            placeholder="Información opcional"
          ></textarea>
        </div>
      </div>

      <!-- Indica que falta seleccionar paciente/doctor para poder gardar -->
      <p v-if="faltanSeleccion.length" class="aviso-seleccion">
        {{ avisoSeleccion }}
      </p>

      <div class="botons-formulario">
        <button
          type="submit"
          class="btn-gardar"
          :disabled="guardando || !formularioValido"
        >
          {{ guardando ? "Gardando…" : editandoId ? "Actualizar" : "Gardar" }}
        </button>
        <button
          type="button"
          class="btn-pdf"
          :disabled="citas.length === 0"
          title="Exportar a PDF"
          aria-label="Exportar a PDF"
          @click="exportarPdf"
        >
          📄 Exportar PDF
        </button>
        <button
          type="button"
          class="btn-recargar"
          :disabled="cargando"
          title="Recargar listado"
          aria-label="Recargar listado"
          @click="cargarCitas"
        >
          ↻
        </button>
        <button
          v-if="editandoId"
          type="button"
          class="btn-cancelar"
          @click="limparFormulario"
        >
          Cancelar
        </button>
      </div>
    </form>

    <div class="cabecera-listaxe">
      <h4>📋 Listaxe de citas</h4>
    </div>

    <p v-if="cargando">
      Cargando citas…
    </p>

    <table v-else-if="citas.length">
      <thead>
        <tr>
          <th>ID cita</th>
          <th>Data</th>
          <th>Hora</th>
          <th>Motivo</th>
          <th>Estado</th>
          <th>Accións</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in citas" :key="item._id || index">
          <td>{{ item.idcita || item._id }}</td>
          <td>{{ formatarData(item.fecha) }}</td>
          <td>{{ item.hora }}</td>
          <td>{{ item.motivo }}</td>
          <td>
            <span :class="['estado', `estado-${String(item.estado || '').toLowerCase()}`]">
              {{ etiquetaEstado(item.estado) }}
            </span>
          </td>
          <td style="text-align: center;">
            <button @click="editarCita(item)" title="Editar" aria-label="Editar cita">✏️</button>
            <button @click="eliminarCita(item)" title="Eliminar" aria-label="Eliminar cita">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>
      Non hai citas que amosar.
    </p>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { usepacienteStore } from "../store/pacienteStore";
import { usedoctorStore } from "../store/doctorStore";
import { getCitas, saveCita, modifyCita, deleteCita } from "../api/citas.js";
import {
  alertaExito,
  alertaError,
  alertaConfirmacion,
} from "../utils/alertas.js";
import { exportarCitas } from "../utils/pdf.js";

// Seleccións feitas nas pestañas de pacientes e doctores
const pacienteStore = usepacienteStore();
const doctorStore = usedoctorStore();

// Valores iniciais reutilizados polo formulario en altas e edicións
const citaVacia = () => ({
  fecha: "",
  hora: "",
  motivo: "",
  estado: "pendente",
  observacions: "",
});

const cita = ref(citaVacia());
// Listaxe de citas amosada na parte inferior
const citas = ref([]);
// _id da cita que se está a editar, ou null se é unha alta
const editandoId = ref(null);
// Indicadores de carga e garda para evitar envíos duplicados
const cargando = ref(false);
const guardando = ref(false);

// Datos que faltan nas seleccións para poder crear ou editar
const faltanSeleccion = computed(() => {
  const faltan = [];
  if (!pacienteStore.dnipac) faltan.push("o paciente");
  if (!doctorStore.id) faltan.push("o doctor");
  return faltan;
});

// Mensaxe contextual segundo o que faltseleccionar
const avisoSeleccion = computed(() => {
  if (faltanSeleccion.value.length === 2) {
    return "Para crear ou editar unha cita, selecciona un paciente e un doctor nas súas pestanas. Mentres non haxa selección, o listado mostra todas as citas.";
  }
  return `Falta seleccionar ${faltanSeleccion.value.join(" e ")} nas súas pestanas. O listado está filtrado pola selección actual.`;
});

// Habilita o envío só cando os campos necesarios teñen conteúdo útil
const formularioValido = computed(() =>
  Boolean(
    cita.value.fecha &&
    cita.value.hora &&
    pacienteStore.dnipac &&
    doctorStore.id &&
    cita.value.motivo.trim() &&
    cita.value.estado,
  ),
);

// Carga as citas, filtradas pola selección actual das pestañas
async function cargarCitas() {
  const dniInicial = pacienteStore.dnipac;
  const idDoctorInicial = doctorStore.id;
  cargando.value = true;

  try {
    const datos = await getCitas({
      pacienteDNI: dniInicial || undefined,
      doctorId: idDoctorInicial || undefined,
    });

    // Ignora unha resposta tardía se mentres cambiou algunha selección
    if (
      String(pacienteStore.dnipac ?? "") !== String(dniInicial ?? "") ||
      String(doctorStore.id ?? "") !== String(idDoctorInicial ?? "")
    ) {
      return;
    }

    // Segunda comprobación no cliente, por si o backend aínda non filtra
    const lista = Array.isArray(datos) ? datos : [];
    citas.value = lista.filter(
      (item) =>
        (!dniInicial ||
          normalizarDNI(dniDe(item)) === normalizarDNI(dniInicial)) &&
        (!idDoctorInicial || idDoctorDe(item) === String(idDoctorInicial)),
    );
    ordenarCitas();
  } catch (erro) {
    console.error("Erro ao cargar as citas:", erro);
    alertaError(mensajeError(erro, "Non se puideron cargar as citas."));
  } finally {
    cargando.value = false;
  }
}

// Garda a cita no backend (ou actualiza a que se está a editar)
async function gardarCita() {
  if (!formularioValido.value || guardando.value) return;

  guardando.value = true;
  const datos = {
    pacienteDNI: pacienteStore.dnipac,
    doctorId: doctorStore.id,
    fecha: cita.value.fecha,
    hora: cita.value.hora,
    motivo: cita.value.motivo.trim(),
    observacions: (cita.value.observacions || "").trim(),
    estado: cita.value.estado,
  };

  try {
    if (editandoId.value) {
      await modifyCita(editandoId.value, datos);
      await alertaExito("Cita actualizada con éxito");
    } else {
      await saveCita(datos);
      await alertaExito("Cita gardada con éxito");
    }

    limparFormulario();
    await cargarCitas();
  } catch (erro) {
    console.error("Erro ao gardar a cita:", erro);
    alertaError(mensajeError(erro, "Non se puido gardar a cita"));
  } finally {
    guardando.value = false;
  }
}

// Carga a cita no formulario para modificala
function editarCita(item) {
  editandoId.value = item._id;
  Object.assign(cita.value, {
    fecha: fechaParaInput(item.fecha),
    hora: item.hora || "",
    motivo: item.motivo || "",
    observacions: item.observacions || "",
    estado: normalizarEstado(item.estado),
  });
}

// Pide confirmación e elimina a cita do backend
async function eliminarCita(item) {
  const confirmacion = await alertaConfirmacion(
    `¿Eliminar a cita do ${formatarData(item.fecha)} ás ${item.hora}?`,
    "Eliminar cita",
  );

  if (!confirmacion.isConfirmed) return;

  try {
    await deleteCita(item._id);

    if (editandoId.value === item._id) {
      limparFormulario();
    }

    await alertaExito("Cita eliminada con éxito");
    await cargarCitas();
  } catch (erro) {
    console.error("Erro ao eliminar a cita:", erro);
    alertaError(mensajeError(erro, "Non se puido eliminar a cita"));
  }
}

// Restablece o formulario e termina o modo de edición
function limparFormulario() {
  editandoId.value = null;
  cita.value = citaVacia();
}

// Mantén a listaxe ordenada por data e hora, igual que a devolve o backend
function ordenarCitas() {
  citas.value.sort((a, b) => {
    const porFecha = String(a.fecha || "").localeCompare(String(b.fecha || ""));
    if (porFecha !== 0) return porFecha;
    return String(a.hora || "").localeCompare(String(b.hora || ""));
  });
}

// DNI da cita (campo pacienteDNI do esquema)
function dniDe(item) {
  return item.pacienteDNI || "";
}

// _id do doctor da cita, tanto se veñen poboado como cru
function idDoctorDe(item) {
  const referencia = item.doctorId;
  if (referencia && typeof referencia === "object") {
    return String(referencia._id ?? "");
  }
  return String(referencia ?? "");
}

function normalizarDNI(dni) {
  return String(dni ?? "").trim().toUpperCase();
}

// Converte calquera variante gardada no código de estado do formulario
function normalizarEstado(estado) {
  const codigo = String(estado ?? "").trim().toLowerCase();
  const validos = ["pendente", "confirmada", "realizada", "cancelada", "completada"];
  return validos.includes(codigo) ? codigo : "pendente";
}

// Converte o código interno de estado nunha etiqueta legible
function etiquetaEstado(estado) {
  const etiquetas = {
    pendente: "Pendente",
    confirmada: "Confirmada",
    realizada: "Realizada",
    completada: "Completada",
    cancelada: "Cancelada",
  };
  const codigo = String(estado ?? "").trim().toLowerCase();
  if (etiquetas[codigo]) return etiquetas[codigo];
  return estado || "—";
}

// Mongo pode gardar a data como ISO con hora; o input type="date" só acepta AAAA-MM-DD
function fechaParaInput(fecha) {
  if (!fecha) return "";

  if (typeof fecha === "string") return fecha.slice(0, 10);

  if (fecha instanceof Date && !Number.isNaN(fecha.getTime())) {
    return fecha.toISOString().slice(0, 10);
  }

  return "";
}

function formatarData(data) {
  if (!data) return "";

  const [ano, mes, dia] = String(data).slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

// Extrae a mensaxe do backend desde Axios ou devolve o texto alternativo
function mensajeError(erro, porDefecto) {
  return (
    erro?.response?.data?.message ||
    erro?.response?.data?.mensaje ||
    porDefecto
  );
}

// Descarga a listaxe actual en PDF
function exportarPdf() {
  try {
    exportarCitas(citas.value);
  } catch (erro) {
    console.error("Erro ao xerar o PDF:", erro);
    alertaError("Non se puido xerar o PDF");
  }
}

// Ao abrir a pantalla cárgase a listaxe coa selección que haxa
onMounted(async () => {
  await cargarCitas();
});

// Se cambia a selección de paciente ou doctor, réstase o formulario e recárgase
watch(() => [pacienteStore.dnipac, doctorStore.id], async () => {
  limparFormulario();
  await cargarCitas();
});
</script>

<style scoped>
.xestion-citas {
  width: 100%;
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

.campo input:disabled,
.campo select:disabled {
  background-color: #f1f5f3;
  color: #6b7770;
  cursor: not-allowed;
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

.aviso-seleccion {
  margin: 0;
  padding: 0.65rem 0.85rem;
  border: 1px solid #f2e3b8;
  border-radius: 8px;
  background-color: #fff9ea;
  color: #8a6100;
  font-size: 0.9rem;
  line-height: 1.5;
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

.btn-gardar:hover:not(:disabled) {
  background-color: #129662;
}

.btn-gardar:disabled {
  background-color: #a8dcc7;
  cursor: not-allowed;
}

.botons-formulario {
  display: flex;
  align-self: center;
  margin-top: 0.25rem;
  gap: 0.75rem;
}

.btn-cancelar {
  padding: 0.7rem 2.25rem;
  border: 1px solid #cfd8d3;
  border-radius: 8px;
  background-color: #ffffff;
  color: #333333;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancelar:hover {
  background-color: #e8f7f1;
}

.cabecera-listaxe {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.cabecera-listaxe h4 {
  width: 100%;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 600;
  background-color: #17b473;
  color: white;
}

.btn-pdf,
.btn-recargar {
  padding: 0.35rem 0.9rem;
  border: 1px solid #d7ebe3;
  border-radius: 8px;
  background-color: #e8f7f1;
  color: #173b2b;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-pdf:hover:not(:disabled),
.btn-recargar:hover:not(:disabled) {
  background-color: #d1f0e3;
}

.btn-pdf:disabled,
.btn-recargar:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

table {
  width: 100%;
  border-collapse: separate;
  align-self: center;
  margin-top: 1rem;
  font-size: 0.8rem;
  border: 1px solid #ddd;
}

th,
td {
  border: 1px solid #ddd;
  padding: 0.7rem;
  text-align: left;
}

th {
  text-align: center;
  background-color: #f8f9fa;
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

.estado-confirmada {
  background-color: #dceafa;
  color: #1f5f9e;
}

.estado-realizada {
  background-color: #d9f5e8;
  color: #0f6b45;
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
