// index.js
const app = require("./app");
const { PORT } = require("./config");

const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server on port ` + PORT);
    });
  } catch (error) {
    console.error("Error starting server: ", error);
  }
};

start();