module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Payments', {
      paymentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'paymentId'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      paymentMethod: {
        type: Sequelize.ENUM('Credit Card', 'Debit Card', 'PayPal', 'Cash'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Completed', 'Failed'),
        allowNull: false,
        defaultValue: 'Pending'
      },
      bookingId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Bookings',
          key: 'bookingId'
        },
        onDelete: 'CASCADE'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Payments');
  }
};