module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Create Motel Table in MySQL
     */
    await queryInterface.createTable('Motels', {
      ID: {
        type: Sequelize.MEDIUMINT,
        field: 'ID',
        primaryKey: true,
        allowNull: false,
      },
      Abbreviation: {
        type: Sequelize.STRING,
        field: 'Abbreviation',
        allowNull: false,
      },
      MotelName: {
        type: Sequelize.STRING,
        field: 'MotelName',
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Drop Motel Table in MySQL
     */
    await queryInterface.dropTable('Motels');
  },
};
