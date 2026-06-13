const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { default: isEmail } = require("validator/lib/isEmail");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 2,
    validate: {
      //valida que el string sea con lestras del alfabeto español
      validator: (val) => validator.isAlpha(val, "es-ES", { ignore: " " }),
      message: "El nombre solo puede contener letras y espacios.",
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: validator.isEmail,
      message: "Por favor, ingresa un correo electrónico válido",
    },
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
    select: false,
    validate: {
      //valida si la contraseña es fuerte(con mayusculas, signos y números)
      validator: validator.isStrongPassword,
      message:
        "La contraseña es muy debil, Debe incluir mayúsculas, minúsculas, números y símbolos",
    },
  },
});

userSchema.statics.findUserByCredentials = async function findUserByCredentials(
  email,
  password,
) {
  //comprueba si existe el email ingresado en la base de datos
  const user = await this.findOne({ email }).select("+password");
  /*select("+password") es para que el método  findOne() pueda traer la contraseña
  de la base de datos ya que le pusimos la propiedad select:false al campo*/
  if (!user) {
    const error = new Error("Correo o contraseña incorrectos");
    error.statusCode = 401;
    throw error;
  }
  //compara la contraseña ingresada con la del correo encontrado
  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    const error = new Error("Correo o contraseña incorrectos");
    error.statusCode = 401;
    throw error;
  }
  return user;
};

module.exports = mongoose.model("user", userSchema);
