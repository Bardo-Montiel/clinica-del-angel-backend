require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 5000;
const { addUser, login } = require("./controllers/users.js");
const routerUser = require("./routes/users.js");
const routerCard = require("./routes/cards.js");
const {
  validateUserSignin,
  validateUserSignup,
} = require("./middlewares/validation.js");
const { requestLogger, errorLogger } = require("./middlewares/loggers.js");
const cors = require("cors");
const auth = require("./middlewares/auth.js");

mongoose.connect(process.env.MONGO_URI);

const allowedCors = [
  "https://clinicadelangel.mooo.com",
  "https://www.clinicadelangel.mooo.com",
];
app.use(cors({ origin: allowedCors }));

app.use(express.json());
app.use(requestLogger);

app.post("/signup", validateUserSignup, addUser);
app.post("/signin", validateUserSignin, login);

app.use("/appointment", auth, routerUser);
app.use("/appointment", auth, routerCard);

app.use(errorLogger);
app.use((err, req, res, next) => {
  console.error(err);
  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Datos de entrada inválidos" });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "ID inválido" });
  }
  if (err.name === "DocumentNotFoundError") {
    return res.status(404).json({ message: "No se encontró esta información" });
  }
  if (err.statusCode === 401) {
    return res.status(401).json({ message: "Acceso no Autorizado" });
  }
  if (err.statusCode === 403) {
    return res
      .status(403)
      .json({ message: "No se tiene derecho a completar la solicitud" });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "Este usuario ya existe" });
  }
  res.status(500).json({ message: "Se produjo un error en el servidor" });
});

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
