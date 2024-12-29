const dotenv = require("dotenv");
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/tasks-app";
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "secret";

module.exports = {
  MONGODB_URI,
  PORT,
  JWT_SECRET,
};
