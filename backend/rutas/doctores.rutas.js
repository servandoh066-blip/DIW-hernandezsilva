import express from "express";
import mongoose from "mongoose";
import Doctor from "../modelos/Doctor.js";

const router = express.Router();

// Permite localizar un doctor polo _id de MongoDB ou polo ID do propio doctor (iddoc)
function filtroPorId(id) {
  if (mongoose.isValidObjectId(id)) {
    return { $or: [{ _id: id }, { iddoc: id }] };
  }
  return { iddoc: id };
}

// Obtener todos
router.get("/", async (req, res) => {
  try {
    const doctores = await Doctor.find();

    res.json(doctores);
  } catch (error) {
    res.status(500).json({
      message: ("Error al obtener doctores: ", error),
    });
  }
});

// Obtener un doctor por _id ou por iddoc
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findOne(filtroPorId(req.params.id));

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor no encontrado",
      });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({
      message: ("Error al obtener doctor: ", error),
    });
  }
});

// Crear
router.post("/", async (req, res) => {
  try {
    // O _id e __v son xestionados por MongoDB, nunca se reciben do formulario
    const { _id, __v, ...datos } = req.body;

    const doctorExistente = await Doctor.findOne({ iddoc: datos.iddoc });

    if (doctorExistente) {
      return res.status(400).json({
        message: "El doctor con este ID ya existe",
      });
    }

    // si no existe, se crea el doctor nuevo
    console.log("Datos recibidos:", datos);
    const doctor = new Doctor(datos);

    const nuevoDoctor = await doctor.save();

    res.status(201).json(nuevoDoctor); //convierte json en string y lo envia al cliente
  } catch (error) {
    console.error("Error al crear doctor:", error);

    res.status(500).json({
      message: "Error al crear doctor",
    });
  }
});

// Actualizar un doctor xa creado (por _id de MongoDB ou por iddoc)
router.put("/:id", async (req, res) => {
  try {
    const { _id, __v, ...datos } = req.body;

    const doctor = await Doctor.findOneAndUpdate(
      filtroPorId(req.params.id),
      datos,
      { new: true, runValidators: true },
    );

    if (!doctor) {
      return res.status(404).json({
        mensaje: "Doctor no encontrado",
      });
    }

    res.json(doctor);
  } catch (error) {
    console.error("Error al actualizar doctor:", error);
    res.status(500).json({
      mensaje: "Error al actualizar doctor",
    });
  }
});

// Eliminar (por _id de MongoDB ou por iddoc)
router.delete("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndDelete(filtroPorId(req.params.id));

    if (!doctor) {
      return res.status(404).json({
        mensaje: "Doctor no encontrado",
      });
    }

    res.json({ mensaje: "doctor eliminado" });
  } catch (error) {
    console.error("Error al eliminar doctor:", error);
    res.status(500).json({
      mensaje: "Error al eliminar doctor",
    });
  }
});
// O export
export default router;
