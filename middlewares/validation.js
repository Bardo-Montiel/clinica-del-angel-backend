const { Joi, celebrate } = require("celebrate");

const validateUserSignup = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    /*.valid(Joi.ref("password")) hace referencia a mi contraseña,
    indicando que el valor de confirmPassowrd sea igual a password.*/
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .messages({ "any.only": "Las contraseñas no coinciden" }),
  }),
});

const validateUserSignin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
});

const validateCard = celebrate({
  body: Joi.object().keys({
    patientName: Joi.string().min(2).required(),
    phoneNumber: Joi.string()
      .length(10)
      .required()
      .pattern(/^[0-9]+$/),
    date: Joi.date().required().min("now").messages({
      "date.min": "Lafecha de la cita no puede ser anterior a la fecha actual",
    }),
    typeOfAppointment: Joi.string().required(),
    age: Joi.number().integer().max(100).min(1).required(),
    area: Joi.string().required(),
  }),
});

module.exports = {
  validateUserSignin,
  validateUserSignup,
  validateCard,
};
