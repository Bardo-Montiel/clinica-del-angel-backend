require("dotenv").config();
const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//controlador para obtener el email y autorizar el login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findUserByCredentials(email, password);
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    res.status(200).json({
      token: token,
      message: "El usuario ingresó exitosamente",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

//controlador para agregar un usuario
async function addUser(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    res.status(201).json({
      message: "El usuario ha sido creado con éxito",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

//controlador para obtener un usuario por su ID
async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id).orFail(() => {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      return error;
    });
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
}

//controlador para obtener un usuario
async function getUser(req, res, next) {
  try {
    //el id lo sacamos de req.user de auth.js
    const ownerId = req.user._id;
    const user = await User.find({ _id: ownerId }).orFail(() => {
      const error = new Error("No se encontró este usuario");
      error.statusCode(404);
      return error;
    });
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addUser,
  getUserById,
  getUser,
  login,
};
