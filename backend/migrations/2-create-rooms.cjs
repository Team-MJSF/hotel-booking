module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Rooms', {
      roomId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'roomId'
      },
      roomNumber: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true,
        field: 'roomNumber'
      },
      roomType: {
        type: Sequelize.ENUM('Single', 'Double', 'Suite', 'Deluxe'),
        allowNull: false,
        field: 'roomType'
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'capacity'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        field: 'price'
      },
      status: {
        type: Sequelize.ENUM('Available', 'Occupied', 'Maintenance'),
        allowNull: false,
        defaultValue: 'Available',
        field: 'status'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Rooms');
  }
};