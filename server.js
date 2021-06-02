const env = require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Db');
// });
db.sequelize.sync();



require('./app/routes/vehicleEntry.routes')(app);
require('./app/routes/mqttSubscription.routes')(app);

const PORT = process.env.APP_PORT;
app.listen(process.env.APP_PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
