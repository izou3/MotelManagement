module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Create Payment Table in MySQL
     */
    await queryInterface.createTable('Payment', {
      ID: {
        type: Sequelize.TINYINT,
        field: 'id',
        primaryKey: true,
        allowNull: false,
      },
      Payment: {
        type: Sequelize.STRING,
        field: 'Payment',
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Drop Payment Table in MySQL
     */
    await queryInterface.dropTable('Payment');
  },
};
