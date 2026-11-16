import express from "express";
import mongoose from "mongoose";
import Cita from "../modelos/Cita.js";
import Paciente from "../modelos/Paciente.js";
import Doctor from "../modelos/Doctor.js";

const router = express.Router();

// Campos que interesan ao frontend para amosar cada referencia
const camposPaciente = "dnipac nomepac apelpac";
const camposDoutor = "iddoc nomedoc apeldoc espedoc";

// Devolve a consulta co paciente e o doutor xa resoltos (e non só os _id)
function conReferencias(consulta) {
  return consulta
    .populate("pacienteId", camposPaciente)
    .populate("doctorId", camposDoutor);
}

// Escape de caracteres especiais para usalo dentro dun regex
function escapeRegex(texto) {
  return String(texto).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// O formulario manda o DNI do paciente (ou o seu _id); a cita garda o _id
async function resolverPacienteId(valor) {
  const texto = String(valor ?? "").trim();

  if (!texto) {
    const erro = new Error("Falta o paciente da cita");
    erro.status = 400;
    throw erro;
  }

  if (mongoose.isValidObjectId(texto)) {
    const paciente = await Paciente.findById(texto);
    if (paciente) return paciente._id;
  }

  // Senón búscase polo DNI (sen importar maiúsculas/minúsculas)
  const paciente = await Paciente.findOne({
    dnipac: { $regex: `^${escapeRegex(texto)}$`, $options: "i" },
  });

  if (!paciente) {
    const erro = new Error("Non hai ningún paciente con ese DNI");
    erro.status = 400;
    throw erro;
  }

  return paciente._id;
}

// O formulario manda o ID do doctor (iddoc) ou o seu _id; a cita garda o _id
async function resolverDoctorId(valor) {
  const texto = String(valor ?? "").trim();

  if (!texto) {
    const erro = new Error("Falta o doctor da cita");
    erro.status = 400;
    throw erro;
  }

  if (mongoose.isValidObjectId(texto)) {
    const doctor = await Doctor.findById(texto);
    if (doctor) return doctor._id;
  }

  const doctor = await Doctor.findOne({ iddoc: texto });

  if (!doctor) {
    const erro = new Error("Non hai ningún doctor con ese ID");
    erro.status = 400;
    throw erro;
  }

  return doctor._id;
}

// Obter todas (ordenadas por data e hora)
router.get("/", async (_req, res) => {
  try {
    const citas = await conReferencias(
      Cita.find().sort({ fecha: 1, hora: 1 }),
    );
    res.json(citas);
  } catch (error) {
    console.error("Error al obtener citas:", error);
    res.status(500).json({ message: "Error al obtener las citas" });
  }
});

// Crear
router.post("/", async (req, res) => {
  try {
    const [pacienteId, doctorId] = await Promise.all([
      resolverPacienteId(req.body.pacienteId ?? req.body.idpaciente),
      resolverDoctorId(req.body.doctorId ?? req.body.iddoctor),
    ]);

    const datos = {
      idcita: req.body.idcita ?? "",
      fecha: req.body.fecha,
      hora: req.body.hora,
      motivo: req.body.motivo,
      observacions: req.body.observacions ?? "",
      estado: req.body.estado ?? "Pendente",
      pacienteId,
      doctorId,
    };

    console.log("Datos recibidos:", datos);
    const cita = await Cita.create(datos);
    const citaCompleta = await conReferencias(Cita.findById(cita._id));

    res.status(201).json(citaCompleta);
  } catch (error) {
    console.error("Error al crear cita:", error);
    res.status(error.status ?? 400).json({ message: error.message });
  }
});

// Actualizar
router.put("/:id", async (req, res) => {
  try {
    const datos = {
      idcita: req.body.idcita,
      fecha: req.body.fecha,
      hora: req.body.hora,
      motivo: req.body.motivo,
      observacions: req.body.observacions ?? "",
      estado: req.body.estado ?? "Pendente",
    };

    // Só se resolven as referencias se o corpo as trae
    if (req.body.pacienteId !== undefined || req.body.idpaciente !== undefined) {
      datos.pacienteId = await resolverPacienteId(
        req.body.pacienteId ?? req.body.idpaciente,
      );
    }
    if (req.body.doctorId !== undefined || req.body.iddoctor !== undefined) {
      datos.doctorId = await resolverDoctorId(
        req.body.doctorId ?? req.body.iddoctor,
      );
    }

    const cita = await conReferencias(
      Cita.findByIdAndUpdate(req.params.id, datos, {
        new: true,
        runValidators: true,
      }),
    );

    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    res.json(cita);
  } catch (error) {
    console.error("Error al actualizar cita:", error);
    res.status(error.status ?? 400).json({ message: error.message });
  }
});

// Eliminar
router.delete("/:id", async (req, res) => {
  try {
    const cita = await Cita.findByIdAndDelete(req.params.id);

    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    res.json({ message: "Cita eliminada", id: req.params.id });
  } catch (error) {
    console.error("Error al eliminar cita:", error);
    res.status(500).json({ message: "Error al eliminar la cita" });
  }
});

export default router;
