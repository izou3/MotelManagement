module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Populate RoomStyle Table with corresponding IDs and Names
     */
    await queryInterface.bulkInsert('RoomStyle', [
      {
        ID: 0,
        Style: 'Single Queen',
      },
      {
        ID: 1,
        Style: 'Single King',
      },
      {
        ID: 2,
        Style: 'Double Queen',
      },
      {
        ID: 3,
        Style: 'Kitchenette',
      },
      {
        ID: 4,
        Style: 'Triple Queen',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Delete Everything in RoomStyle Table
     */
    await queryInterface.bulkDelete('RoomStyle', null, {});
  },
};
