module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Populate Payment Table in MySQL with IDs and Name
     */
    await queryInterface.bulkInsert('Payment', [
      {
        ID: 0,
        Payment: 'Card',
      },
      {
        ID: 1,
        Payment: 'Cash',
      },
      {
        ID: 2,
        Payment: 'Check',
      },
      {
        ID: 3,
        Payment: 'Others',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Delete Records in Payment Table
     */
    await queryInterface.bulkDelete('Payment', null, {});
  },
};
