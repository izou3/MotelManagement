module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Create MotelRooms Table in MySQL
     */
    await queryInterface.createTable('MotelRooms', {
      Rooms: {
        type: Sequelize.MEDIUMINT,
        field: 'Rooms',
        primaryKey: true,
        allowNull: true,
      },
      LU: {
        type: Sequelize.MEDIUMINT,
        field: 'LU',
        allowNull: true,
      },
      FV: {
        type: Sequelize.MEDIUMINT,
        field: 'FV',
        allowNull: true,
      },
    });
  },

  down: async (queryInterface) => {
    /**
     * Drop MotelRooms Table in MySQL
     */
    await queryInterface.dropTable('MotelRooms');
  },
};
