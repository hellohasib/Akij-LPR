module.exports = (sequelize, Sequelize) => {
    const vehicleEntry = sequelize.define("vehicle_entries", {
      id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
      },
      vehicle_reg_no:{
          type: Sequelize.STRING
      },
      entry_time: {
        type: Sequelize.DATE,
      },
    });
  
    return vehicleEntry;
  };