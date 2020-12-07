const chai = require('chai');
const { expect } = chai;

const DailyReportClass = require('../../../server/lib/ReportClass/DailyReport.js');

const PrevDailyReport = {
  YearID: 2020,
  MonthID: 10,
  Date: '2020-10-19T00:00:00.000Z',
  Refund: {
    Amount: 100,
    Notes: "Deposit"
  },
  Stays:{
    101:{
      // Guest is Due
      Room: {
        BookingID: 100,
        type: "WK1",
        payment: "",
        startDate: '2020-10-18T12:00:00.000Z',
        endDate: '',
        paid: false,
        rate: 0,
        tax: 0,
        initial: "",
      },
      HouseKeeping: {
        status: "C",
        type: "W",
        houseKeeper: 'Shelly',
        notes: 'Need To Kick out',
      }
    },
    102:{
      // Guest DNE
      Room: {},
      HouseKeeping: {
        status: "C",
        type: "W",
        houseKeeper: '',
        notes: '',
      }
    },
    103:{
      // Guest is Not Yet Due
      Room: {
        BookingID: 2,
        type: "NO",
        payment: "",
        startDate: '2020-10-02T12:00:00.000Z',
        endDate: '2020-10-28T12:00:00.000Z',
        paid: true,
        rate: 0,
        tax: 0,
        initial: "IZ",
      },
      HouseKeeping: {
        status: "O",
        type: "S",
        houseKeeper: '',
        notes: 'Toilet',
      }
    },
    104:{
      // Guest is Due
      Room: {
        BookingID: 3,
        type: "N",
        payment: "CC",
        startDate: '2020-10-19T12:00:00.000Z',
        endDate: '2020-10-19T12:00:00.000Z',
        paid: true,
        rate: 100,
        tax: 10.90,
        initial: "IZ",
      },
      HouseKeeping: {
        status: "R",
        type: "S",
        houseKeeper: '',
        notes: 'Toilet',
      }
    },
  }
};

describe('generateDailyReport() method used for generateDailyReport Jobs', function() {
  const DailyReport = new DailyReportClass("58566");

  // Expect That all Data passed to here has already been validated as they're server
  // generated. Any Error that occurs will be caught and the job will fail.
  // These tests are only to tets functionality
  context('Previous Day\'s DailyReport Obj Does Not Exist', function() {
    it('Should Generate New DailyReport from Empty Stay\'s Obj', function() {
      const result = DailyReport.generateDailyReport('2020-10-19T12:00:00.000Z', '2020-10-20T12:00:00.000Z', {});

      expect(result.YearID).to.equal('2020');
      expect(result.MonthID).to.equal('10');
      expect(result.Date).to.equal('2020-10-20T12:00:00.000Z');
      expect(result.Refund).to.include({
        Amount: 0,
        Notes: ""
      });

      expect(result.Stays['101'].Room).to.be.an('Object').that.is.empty;
      expect(result.Stays['102'].Room).to.be.an('Object').that.is.empty;
      expect(result.Stays['103'].Room).to.be.an('Object').that.is.empty;
      expect(result.Stays['104'].Room).to.be.an('Object').that.is.empty;

      expect(result.Stays['101'].HouseKeeping).to.include({
        status: "R",
        type: "S",
        houseKeeper: '',
        notes: '',
      });
      expect(result.Stays['102'].HouseKeeping).to.include({
        status: "R",
        type: "S",
        houseKeeper: '',
        notes: '',
      });
      expect(result.Stays['103'].HouseKeeping).to.include({
        status: "R",
        type: "S",
        houseKeeper: '',
        notes: '',
      });
      expect(result.Stays['104'].HouseKeeping).to.include({
        status: "R",
        type: "S",
        houseKeeper: '',
        notes: '',
      });
    });
  });

  context('Previous Day\'s DailyReport Obj Does', function() {
    it('Should Generate New DailyReport from Existing Stay\'s Obj', function() {
      const result = DailyReport.generateDailyReport('2020-10-19T12:00:00.000Z', '2020-10-20T12:00:00.000Z',
        PrevDailyReport.Stays);

      expect(result.YearID).to.equal('2020');
      expect(result.MonthID).to.equal('10');
      expect(result.Date).to.equal('2020-10-20T12:00:00.000Z');
      expect(result.Refund).to.include({
        Amount: 0,
        Notes: ""
      });

      expect(result.Stays['101'].Room).to.include({
        BookingID: 100,
        type: "WK1",
        payment: "",
        startDate: '2020-10-20T12:00:00Z',
        endDate: '',
        paid: false,
        rate: 0,
        tax: 0,
        initial: "",
      });
      expect(result.Stays['102'].Room).to.be.an('Object').that.is.empty;
      expect(result.Stays['103'].Room).to.include({
        BookingID: 2,
        type: "NO",
        payment: "",
        startDate: '2020-10-02T12:00:00.000Z',
        endDate: '2020-10-28T12:00:00.000Z',
        paid: true,
        rate: 0,
        tax: 0,
        initial: "",
      });
      expect(result.Stays['104'].Room).to.include({
        BookingID: 3,
        type: "N",
        payment: "",
        startDate: '2020-10-20T12:00:00Z',
        endDate: '',
        paid: false,
        rate: 0,
        tax: 0,
        initial: "",
      });

      expect(result.Stays['101'].HouseKeeping).to.include({
        status: "C",
        type: "W",
        houseKeeper: '',
        notes: 'Need To Kick out',
      });

      expect(result.Stays['102'].HouseKeeping).to.include({
        status: "C",
        type: "W",
        houseKeeper: '',
        notes: '',
      });
      expect(result.Stays['103'].HouseKeeping).to.include({
        status: "O",
        type: "S",
        houseKeeper: '',
        notes: 'Toilet',
      });
      expect(result.Stays['104'].HouseKeeping).to.include({
        status: "R",
        type: "S",
        houseKeeper: '',
        notes: 'Toilet',
      });
    });
  });
});

