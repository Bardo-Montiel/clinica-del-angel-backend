const routerCard = require("express").Router();
const {
  addCard,
  findCardById,
  findCardsByName,
  deleteCardsById,
  getMyCards,
  donwloadAppointmentPDF,
} = require("../controllers/cards.js");
const { validateCard } = require("../middlewares/validation.js");

routerCard.post("/appointments", validateCard, addCard);
routerCard.get("/appointments", findCardsByName);
routerCard.get("/my-appointments", getMyCards);
routerCard.get("/appointments/:id", findCardById);
routerCard.get("/appointments/:id/pdf", donwloadAppointmentPDF);
routerCard.delete("/appointments/:id", deleteCardsById);

module.exports = routerCard;
