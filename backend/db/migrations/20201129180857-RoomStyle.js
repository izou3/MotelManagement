module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Create RoomStyle table in MySQL
     */
    await queryInterface.createTable('RoomStyle', {
      ID: {
        type: Sequelize.TINYINT,
        field: 'ID',
        primaryKey: true,
        allowNull: false,
      },
      Style: {
        type: Sequelize.STRING,
        field: 'Style',
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     *  Drop RoomStyle table in MySQL
     */
    await queryInterface.dropTable('RoomStyle');
  },
};
