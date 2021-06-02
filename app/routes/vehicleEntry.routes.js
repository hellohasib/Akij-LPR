const vehicleEntry = require("../controllers/vehicleEntry.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    app.post("/api/vehicle/entry/create", vehicleEntry.createVehicleEntry)
    app.get("/api/vehicle/find/all", vehicleEntry.getAllVehicleEntry)
    app.get("/api/vehicle/find/:vehicle_reg_no", vehicleEntry.findPerVehicleEntry)
   
};