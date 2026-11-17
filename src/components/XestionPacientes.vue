<template>
  <div class="xestion-paciente">
    <h4>👥 Xestión de pacientes</h4>
    <form @submit.prevent="guardarPaciente">
      <div class="fila">
        <div class="campo campo-dni">
          <label>DNI/CIF:</label>
          <input v-model="novoPaciente.dnipac" v-on:input="novoPaciente.dnipac = novoPaciente.dnipac.toUpperCase()"
            type="text" required style="text-align: center;" />
        </div>
        <div v-if="novoPaciente.dnipac !== '' && (!validarDni() || !validarDni2())" class="error-message">
          <p class="error">O DNI/CIF non é válido</p>
        </div>
        <button type="button" @click="limpiaFormpac">Limpar</button>
        <button type="button" @click="buscarPaciente">Buscar</button>
        <div class="campo campo-nome">
          <label>Nome:</label>
          <input v-model="novoPaciente.nomepac" type="text" @keyup.enter="corrixirNome()" @blur="corrixirNome()"
            required />
        </div>
        <div class="campo campo-apelido">
          <label>Apelido:</label>
          <input v-model="novoPaciente.apelpac" type="text" @keyup.enter="corrixirApelido()" @blur="corrixirApelido()"
            required />
        </div>
      </div>
      <div class="fila">
        <div class="campo campo-data-nacimiento">
          <label>Data de nacemento:</label>
          <input v-model="novoPaciente.nacipac" type="date" required />
        </div>
        <div class="campo campo-correo">
          <label>Correo:</label>
          <input v-model="novoPaciente.mailpac" type="email" required
            :class="{ 'campo-invalido': correoInvalido }" />
        </div>
        <p v-if="correoInvalido" class="error">O correo non é válido</p>
        <div class="campo campo-dirección">
          <label>Dirección:</label>
          <input v-model="novoPaciente.dirpac" type="text" required />
        </div>
      </div>
      <div class="fila">
        <div class="campo campo-telefono">
          <label>Telefono:</label>
          <input v-model="novoPaciente.movilpac" type="tel" inputmode="numeric" required
            style="text-align: center;" :class="{ 'campo-invalido': movilInvalido }"
            @input="validarMovilEnEntrada" />
        </div>
        <div v-if="novoPaciente.movilpac !== '' && (!validarTelf())" class="error-message">
          <p class="error">O teléfono non é válido</p>
        </div>
        <div class="campo campo-provincia">
          <label>Provincia:</label>
          <select id="provincia" v-model="novoPaciente.propac" @change="cargarMunicipios()" required>
            <option value="">Selecciona unha provincia</option>
            <option v-for="provincia in provincias" :key="provincia.id" :value="provincia.nm">
              {{ provincia.nm }}
            </option>
          </select>
        </div>
        <div class="campo campo-municipio">
          <label>Municipio:</label>
          <select id="municipio" v-model="novoPaciente.munipac" required :disabled="!novoPaciente.propac">
            <option value="">Selecciona un municipio</option>
            <option v-for="municipio in municipios" :key="municipio.id" :value="municipio.nm">
              {{ municipio.nm }}
            </option>
          </select>
        </div>
      </div>
      <div class="campo-condicions">
        <label>
          <input v-model="novoPaciente.lodpac" type="checkbox" /> Aceptar a
          <a :href="$router.resolve({ name: 'PoliticaPrivacidad' }).href" target="_blank" rel="noopener noreferrer">
            Política de privacidade e confidencialidade
          </a>
        </label>
      </div>
      <button type="submit" class="btn-guardar" :disabled="
        novoPaciente.dnipac === '' ||
        novoPaciente.nomepac === '' ||
        novoPaciente.apelpac === '' ||
        novoPaciente.movilpac === '' ||
        !novoPaciente.lodpac
        ">
        Gardar
      </button>
    </form>
    <div class="cabecera-listaxe">
      <h4>📋 Listaxe de pacientes</h4>
      <button
        type="button"
        class="btn-pdf"
        :disabled="pacientes.length === 0"
        title="Exportar a PDF"
        @click="exportarPdf"
      >
        📄 Exportar PDF
      </button>
    </div>
    <table v-if="pacientes.length > 0">
      <thead>
        <tr>
          <th>#</th>
          <th>DNI/CIF</th>
          <th>Apelidos</th>
          <th>Nome</th>
          <th>Correo</th>
          <th>Provincia</th>
          <th>Accións</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(u, index) in pacientes" :key="index">
          <td style="text-align: center;">{{ index + 1 }}</td>
          <td style="text-align: center;">{{ u.dnipac }}</td>
          <td>{{ u.apelpac }}</td>
          <td>{{ u.nomepac }}</td>
          <td>{{ u.mailpac }}</td>
          <td>{{ u.propac }}</td>
          <td style="text-align: center;">
            <button
              @click="seleccionarPaciente(u)"
              :title="pacienteStore.dnipac === u.dnipac ? 'Paciente seleccionado (desmarcar)' : 'Seleccionar para citas'"
              :aria-label="pacienteStore.dnipac === u.dnipac ? 'Paciente seleccionado (desmarcar)' : 'Seleccionar para citas'"
              :aria-pressed="pacienteStore.dnipac === u.dnipac"
            >{{ pacienteStore.dnipac === u.dnipac ? '✅' : '👤' }}</button>
            <button @click="editarUsuario(index)" title="Editar">✏️</button>
            <button @click="eliminarPaciente(index)" title="Eliminar">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>Non hai paciente cargados.</p>
  </div>
</template>

<script setup>
/// Zona de declaracións
import { ref, reactive, onMounted, computed } from 'vue'
import { obtenerMunicipios, obtenerProvincias } from "../api/municipios.js"
import {
  savePaciente,
  getPacientes,
  deletePaciente,
  modifyPaciente,
  getPacienteByDni
} from "../api/pacientes.js"
import { alertaConfirmacion, alertaExito, alertaError } from "../utils/alertas.js"
import { exportarPacientes } from "../utils/pdf.js"

// Descarga a listaxe de pacientes en PDF
function exportarPdf() {
  try {
    exportarPacientes(pacientes.value)
  } catch (erro) {
    console.error("Erro ao xerar o PDF:", erro)
    alertaError("Non se puido xerar o PDF")
  }
}
import { usepacienteStore } from '../store/pacienteStore.js'

const provincias = ref([])
const municipios = ref([])

const pacientes = ref([])  //almacena la lista de paciente e os seus cambios
const editando = ref(false);

// Selección actual do paciente (úsase en citas e para marcar a fila escollida)
const pacienteStore = usepacienteStore()

// Validacións en tempo real (avísanse mentres se escribe)
const movilInvalido = computed(() => {
  const valor = novoPaciente.movilpac.trim();
  return valor !== "" && !validarTelf();
});

const correoInvalido = computed(() => {
  const valor = novoPaciente.mailpac.trim();
  return valor !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
});

const novoPaciente = reactive({
  dnipac: "",
  nomepac: "",
  apelpac: "",
  nacipac: "",
  mailpac: "",
  movilpac: "",
  dirpac: "",
  propac: "",
  munipac: "",
  lodpac: false //campo para acaptacion de lod
});



/// Zona de ciclo de vida

onMounted(async () => {
  provincias.value = await obtenerProvincias();
  pacientes.value = await getPacientes(); //carga os pacientes desde o backend
  ordenarPacientes();
})

// Mantén a listaxe ordenada por apelidos e nome (igual que o listado de doctores)
function ordenarPacientes() {
  pacientes.value.sort((a, b) => {
    const apelidosA = String(a.apelpac || "").trim();
    const apelidosB = String(b.apelpac || "").trim();
    const comparacion = apelidosA.localeCompare(apelidosB, "es", { sensitivity: "base" });
    if (comparacion !== 0) return comparacion;
    return String(a.nomepac || "").localeCompare(String(b.nomepac || ""), "es", { sensitivity: "base" });
  });
}

function seleccionarPaciente(paciente){
  // Se xa estaba seleccionado, desmarcar para poder ver todas as citas outra vez
  if (pacienteStore.dnipac && pacienteStore.dnipac === paciente.dnipac) {
    pacienteStore.limpiarPaciente();
    return;
  }
  pacienteStore.seleccionarPaciente(paciente);
}

async function cargarMunicipios() {
  if (novoPaciente.propac === "") {
    municipios.value = [];
    return;
  }

  const provincia = provincias.value.find(
    p => p.nm === novoPaciente.propac
  );

  municipios.value = await obtenerMunicipios(provincia.id)

}

/// Zona de métodos ou funcións

async function clear() {
  Object.assign(novoPaciente, {
    dnipac: "",
    nomepac: "",
    apelpac: "",
    mailpac: "",
    propac: "",
    munipac: "",
    movilpac: "",
    dirpac: "",
    nacipac: "",
    lodpac: false
  });
  municipios.value = [];
}


async function guardarPaciente() {
  if (!validarDni() || !validarDni2()) {
    alertaError("O DNI/CIF non é válido");
    return;
  } else if (!validarTelf()) {
    alertaError("O teléfono non é válido");
    return;
  }
  
  try {
    const respuesta = await alertaConfirmacion(
      editando.value ? "¿Estás seguro de modificar este paciente?" : "¿Estás seguro de gardar este paciente?"
    );

    if (!respuesta.isConfirmed) return;

    // Eliminamos _id e __v antes de enviar ao backend
    const { _id, __v, ...datos } = novoPaciente;

    if (editando.value) {
      const pacienteModificado = await modifyPaciente(datos.dnipac, datos);

      const index = pacientes.value.findIndex((p) => p.dnipac === datos.dnipac);
      if (index !== -1) {
        pacientes.value[index] = pacienteModificado;
      }
      alertaExito("Paciente modificado con éxito");
      seleccionarPaciente(pacienteModificado);
    } else {
      const pacienteGuardado = await savePaciente(datos);
      pacientes.value.push(pacienteGuardado);
      alertaExito("Paciente gardado con éxito");
      seleccionarPaciente(pacienteGuardado);
    }

    ordenarPacientes();
    await clear();
    editando.value = false;
  } catch (error) {
    console.error("Erro ao gardar o paciente:", error);
    alertaError("Erro ao gardar o paciente. Contacte co administrador.");
  }
}



/*
function gardarPaciente() {
  if (!validarDni() || !validarDni2()) {
    return;
    } else if (!validarTelf()) {
      return;
      }
      paciente.value.push({ ...novoPaciente })  //engade o novo paciente á lista (copia do obxecto)
      // Object.assign(novoPaciente, { dnipac: "", nomepac: "", mailpac: "", propac: "", munipac: "", movilpac: "", dirpac: "", nacipac: "" }) //reinicia o formulario
      }
      */
     async function eliminarPaciente(index) {
       try {
        const confirmacion = await alertaConfirmacion("¿Estás seguro?");
        if(confirmacion.isConfirmed) {
         await deletePaciente(pacientes.value[index].dnipac);
         pacientes.value.splice(index, 1)
    console.log("Paciente eliminado correctamente");
    alertaExito("Paciente eliminado con éxito");
    getPacientes();
        }
        else {
          console.log("Eliminación cancelada");
          return;
        }
  } catch (error) {
    console.error("Erro ao eliminar o paciente:", error);
    alertaError("Erro ao eliminar o paciente. Contacte con el administrador.");
  }
  pacientes.value.splice(index, 1);   //elimina o paciente da lista
}

async function editarUsuario(index) {
  const paciente = pacientes.value[index];   //carga os datos do paciente elixido no formulario
  Object.assign(novoPaciente, paciente);  // carga os datos do paciente no formulario recorda v-model do formulario é novoPaciente
  // Formateamos a data para que o input type="date" a poida amosar
  novoPaciente.nacipac = formatearFechaParaInput(paciente.nacipac);
  //evitar que se cargue el _id de mongoDB en el formulario
  delete novoPaciente._id;
  editando.value = true;
  seleccionarPaciente(novoPaciente);
  //cargar los municipios
  await cargarMunicipios();
}

// Mongo garda a data como ISO (con hora), e o input type="date" só acepta AAAA-MM-DD
function formatearFechaParaInput(fecha) {
  if (!fecha) return "";

  if (typeof fecha === "string") return fecha.slice(0, 10);

  if (fecha instanceof Date && !Number.isNaN(fecha.getTime())) {
    return fecha.toISOString().slice(0, 10);
  }

  return "";
}

async function buscarPaciente() {
  try {
    const dni = novoPaciente.dnipac.trim();

    if (!dni) {
      console.log("Introduce un DNI");
      return;
    }

    const paciente = await getPacienteByDni(dni);

    Object.assign(novoPaciente, paciente);
    novoPaciente.nacipac = formatearFechaParaInput(paciente.nacipac);
    seleccionarPaciente(paciente);
    await cargarMunicipios();

    console.log("Paciente encontrado:", paciente);

  } catch (error) {
    if (error.response?.status === 404) {
      console.log("Paciente no encontrado");      
    } else {
      console.error("Error al buscar paciente: ", error)
    }
  }
}

//===================================================================================
// Funciones auxiliares

// Letras de control do DNI/NIE
const letrasDni = "TRWAGMYFPDXBNJZSQVHLCKE";

// Valida o formato: DNI (8 díxitos + letra), NIE (X/Y/Z + 7 díxitos + letra)
// e CIF (letra + 7 díxitos + control)
function validarDni() {
  const valor = String(novoPaciente.dnipac || "").trim().toUpperCase();

  if (/^[0-9]{8}[A-Z]$/.test(valor)) return true;      // DNI
  if (/^[XYZ][0-9]{7}[A-Z]$/.test(valor)) return true; // NIE
  return /^[A-HJ-NP-SUVW][0-9]{7}[0-9A-J]$/.test(valor); // CIF
}

function validarDni2() {
  const valor = String(novoPaciente.dnipac || "").trim().toUpperCase();

  // No CIF o díxito de control pode ser número ou letra: valídase o formato
  if (/^[A-HJ-NP-SUVW][0-9]{7}[0-9A-J]$/.test(valor)) return true;

  let numerosDni;

  if (/^[0-9]{8}[A-Z]$/.test(valor)) {
    numerosDni = Number.parseInt(valor.slice(0, 8), 10); // DNI
  } else if (/^[XYZ][0-9]{7}[A-Z]$/.test(valor)) {
    // NIE: a inicial equivalente a 0 (X), 1 (Y) ou 2 (Z)
    const normalizado = valor.slice(0, 8).replace("X", "0").replace("Y", "1").replace("Z", "2");
    numerosDni = Number.parseInt(normalizado, 10);
  } else {
    return false;
  }

  return letrasDni[numerosDni % 23] === valor[8];
}

function corrixirNome() {
  if (novoPaciente.nomepac.length > 0) {
    novoPaciente.nomepac = novoPaciente.nomepac
    .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

function corrixirApelido() {
  if (novoPaciente.apelpac.length > 0) {
    novoPaciente.apelpac = novoPaciente.apelpac
    .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    }
  }
  
  function validarTelf() {
    const telfRegex = /^[67]\d{8}$/;
    if (novoPaciente.movilpac != "") {
      return telfRegex.test(novoPaciente.movilpac.trim());
  }
}

// Deixa escribir só díxitos no campo do teléfono
function validarMovilEnEntrada() {
  novoPaciente.movilpac = novoPaciente.movilpac.replace(/\D/g, "");
}

const limpiaFormpac = () => {
  Object.assign(novoPaciente, {
    dnipac: "",
    nomepac: "",
    apelpac: "",
    nacipac: "",
    mailpac: "",
    movilpac: "",
    dirpac: "",
    propac: "",
    munipac: "",
    lodpac: false
  });
  municipios.value = [];
  editando.value = false;
}


</script>

<style scoped>
.error {
  color: red;
  font-size: 0.9rem;
  margin-top: 0.2rem;
}

.xestion-paciente {
  width: 100%;
  /* opcional para que no crezca demasiado en pantallas muy grandes */
  background: white;
  padding: 2rem;
  overflow: visible;
  border-radius: 2px;
  flex-wrap: wrap;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

form {
  display: flex;
  padding: 2rem;
  align-self: center;
  width: 100%;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.fila {
  flex-wrap: wrap;
  display: flex;
  gap: 1rem;
  width: 100%;
}

.fila-centrada {
  justify-content: center;
}

.campo {
  flex-wrap: wrap;
  display: flex;
  align-items: center;
  /* label e input en la misma línea */
  gap: 0.5rem;
  border-radius: 0px;
}

.campo-dni {
  flex: 3;
  /* ocupa menos espacio */
  border-radius: 0px;
}

.campo-nome {
  flex: 3;
  /* ocupa más espacio */
  border-radius: 0px;
}

.campo-data-nacemento {
  flex: 0.5;
  /* ocupa menos espacio */
}

.campo-correo {
  flex: 2;
  /* ocupa más espacio */
  border-radius: 0px;
}

.campo select {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 0px;
  width: 100%;
  background-color: #fff;
  color: #333;
}

.campo select option {
  background-color: #fff;
  color: #333;
}

.campo-provincia {
  flex: 1;
  /* ocupa menos espacio */
  border-radius: 0px;
  
}

.campo label {
  max-width: 100px;
  /* ancho fijo para alinear */
  font-weight: 500;
  font: bold
}

.campo input {
  background-color: #f9f9f9;
  flex: 1;
  /* ocupa todo el espacio restante */
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 15px;
  box-sizing: border-box;
  color: #333;
}

/* Campo marcado como inválido polas validacións en tempo real */
.campo input.campo-invalido,
.campo-invalido {
  border: 2px solid #dc3545 !important;
  box-shadow: 0 0 0 1px rgba(220, 53, 69, 0.15);
}

.fila > button:not(.btn-guardar) {
  align-self: center;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 15px;
  box-sizing: border-box;
  cursor: pointer;
}

.btn-guardar {
  background-color: #30c9a3;
  color: white;
  border: 3px solid #6fd6bc;
  border-image: white;
  /* Define los dos colores y el ángulo */
  padding: 20px;
  padding: 0.4rem 1.5rem;
  border-radius: 0px;
  cursor: pointer;
  margin: 0 auto;
  display: block;
}

.btn-guardar:hover {
  background-color: #637a76;
  border-radius: 0px;
}

.btn-guardar:disabled {
  background-color: #e0e0e0;
  color: #979696;
  border-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7
}

.btn-guardar:disabled:hover {
  background-color: #e0e0e0;
}

.button {
  background: none;
  border: 2px solid #ddd;
  cursor: pointer;
  font-size: 1rem;
}

.inline-control {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding-right: 5rem;
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

h4 {
  width: 100%;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 600;
  background-color: #17b473;
  color: white;
}

@media (max-width: 768px) {
  .xestion-paciente {
    padding: 1rem;
    /* reducir el padding en pantallas pequeñas */
  }

  .fila {
    flex-direction: column;
    /* apila los campos verticalmente en móviles */
    gap: 0.5rem;
    /* opcional: un pequeño espacio entre ellos */
  }

  .campo-dni {
    background-color: red;
  }

  .fila > button:not(.btn-guardar) {
    width: 100%;
  }
}
.cabecera-listaxe {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.btn-pdf {
  padding: 0.35rem 0.9rem;
  border: 1px solid #d7ebe3;
  border-radius: 8px;
  background-color: #e8f7f1;
  color: #173b2b;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-pdf:hover:not(:disabled) {
  background-color: #d1f0e3;
}

.btn-pdf:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
