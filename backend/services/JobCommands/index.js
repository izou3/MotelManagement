const mongoose = require('mongoose');

const DailyReportClass = require('../../lib/data-access/ReportClass/DailyReport');
const PendingReservationClass = require('../../lib/data-access/ReservationClass/PendingReservation');
const CurrentReservationClass = require('../../lib/data-access/ReservationClass/CurrentReservation');

const GenerateDailyReportCommand = async (HotelID, today, yesterday) => {
  const DailyReport = new DailyReportClass(HotelID);
  const dateQuery = { Date: yesterday };
  const response = await DailyReport.getReport(dateQuery);

  const PrevReport = response ? response.Stays : {};

  const newDailyReport = DailyReport.generateDailyReport(
    yesterday,
    today,
    PrevReport
  );

  // Final Report is an Array of Objects with Length 1
  const FinalReport = await DailyReport.insertReport(newDailyReport);

  if (FinalReport.length === 1) {
    return 'Success';
  }
  throw new Error('Failed Job');
};

const UpdateToCurrentReservationsCommand = async (
  HotelID,
  StartDate,
  EndDate
) => {
  const CurrentReservation = new CurrentReservationClass(HotelID);
  const PendingReservation = new PendingReservationClass(HotelID);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result1 = await PendingReservation.getReservationByCheckIn(
      StartDate,
      EndDate
    );

    if (result1.length === 0) {
      // No Reservations Exist within the check-in time period
      // Returned Empty Array as to not let Job Fail
      await session.abortTransaction();
      return [];
    }

    const result2 = await CurrentReservation.createManyNewReservations(
      result1,
      session
    );
    if (!result2 || result2.length === 0)
      throw new Error('Failed to Move Reservations');

    const query = {
      $and: [
        {
          checkIn: {
            $gte: StartDate,
            $lt: EndDate,
          },
        },
        { HotelID },
      ],
    };

    const deleteObjInfo = await PendingReservation.deleteManyReservation(
      query,
      session
    );

    if (deleteObjInfo.count === 0) {
      throw new Error('Failed to Move Reservations');
    }

    await session.commitTransaction();
    return result1;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

module.exports = {
  GenerateDailyReportCommand,
  UpdateToCurrentReservationsCommand,
};
