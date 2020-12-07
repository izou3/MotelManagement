module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Populate Motels Table with corresponding IDs, Names, and Abbreviations
     */
    await queryInterface.bulkInsert('Motels', [
      {
        ID: 58566,
        Abbreviation: 'LU',
        MotelName: 'Lazy U Motel',
      },
      {
        ID: 58567,
        Abbreviation: 'FV',
        MotelName: 'Fair Value Inn',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Delete Everything in Motels Table
     */
    await queryInterface.bulkDelete('Motels', null, {});
  },
};
