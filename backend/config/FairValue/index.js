module.exports = {
  development: {
    HotelID: process.env.FV_HOTEL_ID, // string
    MotelName: process.env.FV_NAME,
    Phone: process.env.FV_PHONE, // string
    Address: process.env.FV_ADDRESS,
    RoomNum: parseInt(process.env.FV_ROOM_NUM, 10),
  },
  test: {
    HotelID: process.env.FV_HOTEL_ID,
    MotelName: process.env.FV_NAME,
    Phone: process.env.FV_PHONE,
    Address: process.env.FV_ADDRESS,
    RoomNum: parseInt(process.env.FV_ROOM_NUM, 10),
  },
  production: {
    HotelID: process.env.FV_HOTEL_ID,
    MotelName: process.env.FV_NAME,
    Phone: process.env.FV_PHONE,
    Address: process.env.FV_ADDRESS,
    RoomNum: parseInt(process.env.FV_ROOM_NUM, 10),
  },
};
