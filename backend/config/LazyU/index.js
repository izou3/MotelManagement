module.exports = {
  development: {
    HotelID: process.env.LU_HOTEL_ID,
    MotelName: process.env.LU_NAME,
    Phone: process.env.LU_PHONE, // string
    Address: process.env.LU_ADDRESS,
    RoomNum: parseInt(process.env.LU_ROOM_NUM, 10),
  },
  test: {
    HotelID: process.env.LU_HOTEL_ID,
    MotelName: process.env.LU_NAME,
    Phone: process.env.LU_PHONE, // string
    Address: process.env.LU_ADDRESS,
    RoomNum: parseInt(process.env.LU_ROOM_NUM, 10),
  },
  production: {
    HotelID: process.env.LU_HOTEL_ID,
    MotelName: process.env.LU_NAME,
    Phone: process.env.LU_PHONE, // string
    Address: process.env.LU_ADDRESS,
    RoomNum: parseInt(process.env.LU_ROOM_NUM, 10),
  },
};
