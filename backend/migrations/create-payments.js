export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('Payments', {
    idPayment: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'idPayment'
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
    idBooking: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('Payments');
};