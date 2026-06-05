const routerUser = require("express").Router();
const { getUserById, getUser } = require("../controllers/users.js");

routerUser.get("/users/me", getUser);
routerUser.get("/users/:id", getUserById);

module.exports = routerUser;
