module.exports = {
  up: async (queryInterface) => {
    /**
     * Populate RoomStyle Table with corresponding Roomss and Names
     */
    await queryInterface.bulkInsert('MotelRooms', [
      {
        Rooms: 101,
        LU: 101,
        FV: 101,
      },
      {
        Rooms: 102,
        LU: 102,
        FV: 102,
      },
      {
        Rooms: 103,
        LU: 103,
        FV: 103,
      },
      {
        Rooms: 104,
        LU: 104,
        FV: 104,
      },
      {
        Rooms: 105,
        LU: 105,
        FV: 105,
      },
      {
        Rooms: 106,
        LU: 106,
        FV: 106,
      },
      {
        Rooms: 107,
        LU: 107,
        FV: 107,
      },
      {
        Rooms: 108,
        LU: 108,
        FV: 108,
      },
      {
        Rooms: 109,
        LU: 109,
        FV: 109,
      },
      {
        Rooms: 110,
        LU: 110,
        FV: 110,
      },
      {
        Rooms: 111,
        LU: 111,
        FV: 111,
      },
      {
        Rooms: 112,
        LU: 112,
        FV: 112,
      },
      {
        Rooms: 113,
        LU: 114,
        FV: 114,
      },
      {
        Rooms: 114,
        LU: 115,
        FV: 201,
      },
      {
        Rooms: 115,
        LU: 116,
        FV: 202,
      },
      {
        Rooms: 116,
        LU: 117,
        FV: 203,
      },
      {
        Rooms: 117,
        LU: 118,
        FV: 204,
      },
      {
        Rooms: 118,
        LU: 119,
        FV: 205,
      },
      {
        Rooms: 119,
        LU: 120,
        FV: 206,
      },
      {
        Rooms: 120,
        LU: 121,
        FV: 207,
      },
      {
        Rooms: 121,
        LU: 122,
        FV: 208,
      },
      {
        Rooms: 122,
        LU: 123,
        FV: 209,
      },
      {
        Rooms: 123,
        LU: 124,
        FV: 210,
      },
      {
        Rooms: 124,
        LU: 125,
        FV: 211,
      },
      {
        Rooms: 125,
        LU: 126,
        FV: 212,
      },
      {
        Rooms: 126,
      },
    ]);
  },

  down: async (queryInterface) => {
    /**
     * Delete Everything in RoomStyle Table
     */
    await queryInterface.bulkDelete('MotelRooms', null, {});
  },
};
