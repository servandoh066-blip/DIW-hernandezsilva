import express from "express";
import Paciente from "../modelos/Paciente.js";

const router = express.Router();

// Obtener todos
router.get("/", async (req, res) => {
  try {
    const pacientes = await Paciente.find();

    res.json(pacientes);
  } catch (error) {
    res.status(500).json({
      message: ("Error al obtener pacientes: ", error),
    });
  }
});

router.get("/:dni", async (req, res) => {
  try {
    const paciente = await Paciente.findOne({
      dnipac: req.params.dni,
    });

    if (!paciente) {
      return res.status(404).json({
        message: "Paciente no encontrado",
      });
    }

    res.json(paciente);
  } catch (error) {
    res.status(500).json({
      message: ("Error al obtener paciente: ", error),
    });
  }
});

// Crear

router.post("/", async (req, res) => {
  try {
    // Normalizamos el DNI: sin espacios y en mayúsculas
    const dni = String(req.body.dnipac || "").trim().toUpperCase();

    // Escape de caracteres especiales para usarlo seguro dentro del regex
    const dniEscapado = dni.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Comprobamos duplicados sin importar mayúsculas/minúsculas
    const pacienteExistente = await Paciente.findOne({
      dnipac: { $regex: `^${dniEscapado}$`, $options: "i" },
    });

    if (pacienteExistente) {
      return res.status(409).json({
        message: "El paciente con este DNI ya existe",
      });
    }

    // si no existe, se crea el paciente nuevo
    console.log("Datos recibidos:", req.body);
    const paciente = new Paciente({ ...req.body, dnipac: dni });

    const nuevoPaciente = await paciente.save();

    res.status(201).json(nuevoPaciente); //convierte json en string y lo envia al cliente
  } catch (error) {
    console.error("Error al crear paciente:", error);

    // Si falla la validación del modelo devolvemos 400, no 500
    const status = error.name === "ValidationError" ? 400 : 500;
    res.status(status).json({
      message: "Error al crear paciente",
      error: error.message,
    });
  }
});

router.delete("/:dnipac", async (req, res) => {
  try {
    const paciente = await Paciente.findOneAndDelete({
      dnipac: req.params.dnipac,
    });

    if (!paciente) {
      return res.status(404).json({
        mensaje: "Paciente no encontrado",
      });
    }

    res.json({ mensaje: "paciente eliminado" });
  } catch (error) {
    console.error("Error al eliminar paciente:", error);
    res.status(500).json({
      mensaje: ("Error al eliminar paciente", error),
    });
  }
});

router.put("/:dnipac", async (req, res) => {
  try {
    const paciente = await Paciente.findOneAndUpdate(
      { dnipac: req.params.dnipac },
      req.body,
      { new: true },
    );

    if (!paciente) {
      return res.status(404).json({
        mensaje: "Paciente no encontrado",
      });
    }

    res.json({ paciente });
  } catch (error) {
    res.status(500).json({
      mensaje: ("Error al actualizar paciente", error),
    });
  }
});
// O export
export default router;
