const mqtt = require("mqtt");
const axios = require('axios');
const db = require("../models");
const vehicleEntry= db.vehicleEntry;
const date = Date.now();


let facts = [];
let clients = [];

function sendEventsToAll(newFact) {
    clients.forEach(client => client.response.write(`data: ${newFact}\n\n`))
    console.log("Event data: ", newFact)
}


exports.mqttSubscribe = () => {
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
      let str = message.toString('utf8');
      str = str.replace(/'/g, '"');
      let parsedMessage = JSON.parse(str);
      let regNo = parsedMessage.plateNumber;
      console.log("Number plate: ", regNo);
      // const temp_reg = "DM-GHA- 118737";
        axios
          .post('http://localhost:8000/api/vehicle/entry/create', {
            vehicle_reg_no: regNo,
            entry_time: date,
          })
          .then(res => {

            console.log(`Data inserted to vehicle entry table.`)
            console.log(res.data)

            vehicleEntry.findAll({
                limit:1,
                order: [ [ 'createdAt', 'DESC' ]],
            })
            .then((vehicleEntry) => {
                const newFact = JSON.stringify(vehicleEntry);
                console.log("Response body: ", newFact);
                facts.push(newFact);
                console.log("Facts: ", facts);
            //    res.json(newFact);
                return sendEventsToAll(newFact);
            })
            .catch(error => {
                console.log("Error 1: ", error);
              })
          })
          .catch(error => {
            console.log("Error 2: ", error);
          })
    });
};

exports.eventsHandlerOfVehicleEntry = (request, response, next) =>{
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
      };
      response.writeHead(200, headers);
    
      const data = `data: ${JSON.stringify(facts)}`;
    
      response.write(data);
    
      const clientId = Date.now();
    
      const newClient = {
        id: clientId,
        response
      };
    
      clients.push(newClient);
    
      // request.on('close', () => {
      //   console.log(`${clientId} Connection closed`);
      //   clients = clients.filter(client => client.id !== clientId);
      // });
  }
