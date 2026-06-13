const mongoose = require("mongoose");
const validator = require("validator");

const cardSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true,
    minLength: 2,
    validate: {
      validator: (val) => validator.isAlpha(val, "es-ES", { ignore: " " }),
      message: "El nombre solo puede contener letras y espacios",
    },
  },
  phoneNumber: {
    type: String,
    required: true,
    minLength: 10,
    maxLength: 10,
    validate: {
      validator: (val) => validator.isMobilePhone(val, "any"),
      message: "No es un número telefónico válido",
    },
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        //saca la fecha de hoy
        const today = new Date();
        //value es la fecha que ingresamos y las compara para que no ingresemos fechas pasadas
        return value.getTime() >= today.setHours(0, 0, 0, 0);
      },
      message: "No puedes agendar una cita en una fecha pasada.",
    },
  },
  typeOfAppointment: {
    type: String,
    required: true,
    enum: {
      values: ["primera vez", "subsecuente"],
      message: "Debes seleccionar alguna de las dos opciones.",
    },
  },
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  area: {
    type: String,
    required: true,
    enum: {
      values: [
        "Traumatología y Orpedia",
        "Clínica de heridas",
        "Fisioterapia",
        "Cirugía",
        "Pediatría",
        "Otorrinolaringología",
      ],
      message: "Esta especialidad no está en la clínica",
    },
  },
  //Relaciona el modelo de la tarjeta con el modelo de usuario, para que guardemos el ID del usuario dueño de esta cita
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

module.exports = mongoose.model("card", cardSchema);
