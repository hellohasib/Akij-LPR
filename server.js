const env = require("dotenv").config();
const express = require("express");
const cors = require("cors");

const mqtt = require("mqtt");
const axios = require("axios");
const date = Date.now();





const app = express();

app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
const vehicleEntry = db.vehicleEntry;

let facts = [];
let clients = [];
// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Db');
// });
db.sequelize.sync();



require('./app/routes/vehicleEntry.routes')(app);
// require('./app/routes/mqttSubscription.routes')(app);

const PORT = process.env.APP_PORT;
app.listen(process.env.APP_PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});



const OPTIONS = {
  clean: true,
  connectTimeout: 4000,
  clientId: "mqtt_AkijWeb",
  username: "admin",
  password: "public",
  reconnectPeriod: 1000,
};
const retain_qos = {
  retain: true,
  qos: 2,
};
const client = mqtt.connect("mqtt://18.221.204.152", OPTIONS);

const topic_entry = "wc/AkijLPR";

console.log("subscribing to topics");
client.subscribe(topic_entry, { qos: 2 });

client.on("message", function (topic, message, response) {
  console.log("message is " + message);
  console.log("topic is " + topic);
  let str = message.toString("utf8");
  str = str.replace(/'/g, '"');
  let parsedMessage = JSON.parse(str);
  let regNo = parsedMessage.plateNumber;
  var previous = '';
  let newData = regNo;
  console.log("Number plate: ", regNo);
  // const temp_reg = "DM-GHA- 118737";
  if (newData !== previous){
    axios
    .post("http://localhost:8000/api/vehicle/entry/create", {
      vehicle_reg_no: regNo,
      entry_time: date,
    })
    .then((res) => {
      console.log(`Data inserted to vehicle entry table.`);
      console.log(res.data);

      vehicleEntry
        .findAll({
          limit: 1,
          order: [["createdAt", "DESC"]],
        })
        .then((vehicleEntry) => {
          const newFact = JSON.stringify(vehicleEntry);
          console.log("Response body: ", newFact);
          facts.push(newFact);
          return sendEventsToAll(newFact);
          
          
        })
        .catch((error) => {
          console.log("Error 1: ", error);
        });
    })
    .catch((error) => {
      console.log("Error 2: ", error);
    });
    
    previous = newData;
    console.log("New Data: ", newData);
    console.log("Previous data: ", previous);

  }else {
    console.log("Error");
  }
  
});
function sendEventsToAll(newFact) {
  clients.forEach((client) => client.response.write(`data: ${newFact}\n\n`));
  console.log("Event data: ", newFact);
}

function eventsHandler(request, response, next) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  response.writeHead(200, headers);
  const data = `data: ${JSON.stringify(facts)}\n\n`;

  response.write(data);

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    response
  };

  clients.push(newClient);

  request.on('close', () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter(client => client.id !== clientId);
  });
}

app.get('/events', eventsHandler);