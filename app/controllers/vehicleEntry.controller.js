const db = require("../models")
const vehicleEntry = db.vehicleEntry;
const Op = db.Sequelize.Op;


exports.createVehicleEntry = (req, res) => {
    // Create a temporary vehicle entry exit
    const Vehicle_Entry = {
        vehicle_reg_no: req.body.vehicle_reg_no,
        entry_time: req.body.entry_time,
        
    };
  
    vehicleEntry.create(Vehicle_Entry)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Some error occurred while creating the Permission.",
        });
      });
  };


  exports.getAllVehicleEntry = (req, res) => {
    vehicleEntry.findAll()
      .then((vehicleEntry) => {
        res.send(vehicleEntry);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  };


  exports.findPerVehicleEntry = (req, res) => {
    const reg_no = req.params.vehicle_reg_no;
  
    vehicleEntry.findAll({
      where:{
          vehicle_reg_no: {
          [Op.substring]: reg_no,
        }
      }
    })
      .then((vehicleEntry) => {
        res.send(vehicleEntry);
      })
      .catch((err) => {
        res.status(500).send({
          message: `Error retrieving vehicle entry information with id =  ${vehicle_reg_no}`,
        });
      });
  };
  