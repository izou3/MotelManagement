module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Populate Reservation Table with corresponding IDs and Names
     */
    await queryInterface.bulkInsert('Reservations', [
      {
        ID: 0,
        Reservation: 'Booking.com',
      },
      {
        ID: 1,
        Reservation: 'ExpediaPartners',
      },
      {
        ID: 2,
        Reservation: 'Phone Call',
      },
      {
        ID: 3,
        Reservation: 'WalkIn',
      },
      {
        ID: 4,
        Reservation: 'Others',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Delete Everything in Reservations Table
     */
    await queryInterface.bulkDelete('Reservations', null, {});
  },
};
