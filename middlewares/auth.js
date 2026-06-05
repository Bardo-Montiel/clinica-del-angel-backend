require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  //busca el token en los parámetros de la URL para generar el PDF del frontend
  const tokenFromUrl = req.query.token;
  if (
    (!authorization || !authorization.startsWith("Bearer ")) &&
    !tokenFromUrl
  ) {
    const error = new Error("Se necesita autorización");
    error.statusCode = 401;
    return next(error);
  }
  //deja solo el token generado sin la palabra "Bearer" en caso de que el token no venga en URL de la petición
  const token = tokenFromUrl
    ? tokenFromUrl
    : authorization.replace("Bearer ", "");
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
    //verify me va a extraer el _id que le inyecté como dato en mi controlador login dentro del método jwt.sign (si le hubiera inyectado más datos además del _id también los extrae)
  } catch (error) {
    error.message = "El token no es válido";
    error.statusCode = 401;
    return next(error);
  }
  req.user = payload; //Guarda los datos inyectados en login en el método jwt.sign (en este caso _id: user._id) en la solicitud
  next();
};
