const sequelize = require("sequelize");
require("dotenv").config();
const db = new sequelize("userstore", "anmol", "java@1234", {
  host: "localhost",
  dialect: "mysql",
  define: {
    timestamps: true,
  },
});
db.authenticate()
  .then(() => {
    console.log("Database connected...");
  })
  .catch((err) => {
    console.log("Error: " + err);
  });
module.exports = db;
