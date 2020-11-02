module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Create Reservation table in MySQL
     */
    await queryInterface.createTable('Reservations', {
      ID: {
        type: Sequelize.TINYINT,
        field: 'id',
        primaryKey: true,
        allowNull: false,
      },
      Reservation: {
        type: Sequelize.STRING,
        field: 'Reservation',
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     *  Drop Reservation table in MySQL
     */
    await queryInterface.dropTable('Reservations');
  },
};
