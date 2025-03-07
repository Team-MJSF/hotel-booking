module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      userId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'userId'
      },
      fullName: {
        type: Sequelize.STRING(255),
        allowNull: false,
        field: 'fullName'
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('Guest', 'Customer', 'Admin'),
        allowNull: false,
        defaultValue: 'Guest'
      },
      phoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: false,
        field: 'phoneNumber'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};