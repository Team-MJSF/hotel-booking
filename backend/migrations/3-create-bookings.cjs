module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ensure Users and Rooms tables exist before creating Bookings
    const [users] = await queryInterface.sequelize.query(
      'SHOW TABLES LIKE "Users"'
    );
    const [rooms] = await queryInterface.sequelize.query(
      'SHOW TABLES LIKE "Rooms"'
    );

    if (!users.length || !rooms.length) {
      throw new Error('Users and Rooms tables must exist before creating Bookings');
    }

    await queryInterface.createTable('Bookings', {
      bookingId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'bookingId'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'userId'
        },
        onDelete: 'CASCADE'
      },
      roomId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Rooms',
          key: 'roomId'
        },
        onDelete: 'CASCADE',
        field: 'roomId'
      },
      bookingDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'bookingDate'
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Confirmed', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Pending',
        field: 'status'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Bookings');
  }
};