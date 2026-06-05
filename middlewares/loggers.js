const winston = require("winston");
const expressWinson = require("express-winston");

const requestLogger = expressWinson.logger({
  transports: [new winston.transports.File({ filename: "request.log" })],
  format: winston.format.json(),
});

const errorLogger = expressWinson.errorLogger({
  transports: [new winston.transports.File({ filename: "error.log" })],
  format: winston.format.json(),
});

module.exports = { requestLogger, errorLogger };
