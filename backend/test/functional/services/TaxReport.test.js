const chai = require('chai');
const mongoose = require('mongoose');

const { expect } = chai;

const mongoDB = require('../../../server/lib/mongo');
const config = require('../../../server/config/index')['test'];
const TestReportSchmema = require('../../../server/models/DailyReport.js');

const ReportTestModel = mongoose.model('DailyReport', TestReportSchmema, 'DailyReport');
const ReportTestService = require('../../../server/services/report/TaxReport.js');

// Daily Reports for Month 10/2020
const DailyReports = [
  {
    YearID: 2020,
    MonthID: 9,
    Date: '2020-09-18T00:00:00.000Z',
    Refund: {
      Amount: 1000,
      Notes: "Hello"
    },
    Stays:{
      101:{
        Room: {
          BookingID: 0,
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
        }
      },
      102:{
        Room: {
          BookingID: 1,
          type: "S/O",
          payment: "CC",
          startDate: '2020-09-18T12:00:00.000Z',
          endDate: '2020-09-20T12:00:00.000Z',
          paid: true,
          rate: 90,
          tax: 78,
          initial: "IZ",
        },
        HouseKeeping: {
          status: "C",
          type: "W",
        }
      },
      103:{
        Room: {
          BookingID: 2,
          type: "S/O",
          payment: "CC",
          startDate: '2020-09-18T12:00:00.000Z',
          endDate: '2020-09-20T12:00:00.000Z',
          paid: true,
          rate: 90,
          tax: 78,
          initial: "IZ",
        },
        HouseKeeping: {
          status: "C",
          type: "W",
        }
      },
      104:{
        Room: {
          BookingID: 3,
          type: "S/O",
          payment: "",
          startDate: '2020-09-18T12:00:00.000Z',
          endDate: '2020-09-20T12:00:00.000Z',
          paid: true,
          rate: 0,
          tax: 0,
          initial: "",
        },
        HouseKeeping: {
          status: "C",
          type: "W",
        }
      },
    }
  },
  {
    YearID: 2020,
    MonthID: 10,
    Date: '2020-10-02T00:00:00.000Z',
    Refund: {
      Amount: 100,
      Notes: "Deposit"
    },
    Stays:{
      101:{
        Room: {
          BookingID: 0,
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
        }
      },
      102:{
        Room: {
          BookingID: 1,
          type: "NO",
          payment: "C",
          startDate: '2020-10-02T12:00:00.000Z',
          endDate: '2020-10-28T12:00:00.000Z',
          paid: true,
          rate: 800,
          tax: 0,
          initial: "IZ",
        },
        HouseKeeping: {
          status: "C",
          type: "W",
        }
      },
      103:{
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
          status: "C",
          type: "W",
        }
      },
      104:{
        Room: {
          BookingID: 3,
          type: "S/O",
          payment: "CC",
          startDate: '2020-10-02T12:00:00.000Z',
          endDate: '2020-10-03T12:00:00.000Z',
          paid: true,
          rate: 100,
          tax: 10.90,
          initial: "IZ",
        },
        HouseKeeping: {
          status: "C",
          type: "W",
        }
      },
    }
  },
  {
    YearID: 2020,
    MonthID: 10,
    Date: '2020-10-13T00:00:00.000Z',
    Refund: {
      Amount: 0,
      Notes: ""
    },
    Stays:{
      101:{
        Room: {
          BookingID: 0,
          type: "N",
          payment: "CC",
          startDate: '2020-10-13T12:00:00.000Z',
          endDate: '2020-10-13T12:00:00.000Z',
          paid: true,
          rate: 107.98,
          tax: 9.90,
          initial: "IZ",
        },
        HouseKeeping: {
          status: "C",
          type: "W",
        }
      },
      102:{
        Room: {},
        HouseKeeping: {
          status: "C",
          type: "W",
        }
      },
      103:{
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
          status: "C",
          type: "W",
        }
      },
      104:{
        Room: {},
        HouseKeeping: {
          status: "C",
          type: "W",
        }
      },
    }
  },
  {
    YearID: 2020,
    MonthID: 10,
    Date: '2020-10-14T00:00:00.000Z',
    Refund: {
      Amount: 76.99,
      Notes: "Deposit"
    },
    Stays:{
      101:{
        Room: {
          BookingID: 0,
          type: "WK3",
          payment: "CC",
          startDate: '2020-10-14T12:00:00.000Z',
          endDate: '2020-10-20T12:00:00.000Z',
          paid: true,
          rate: 200,
          tax: 18.67,
          initial: "IZ",
        },
        HouseKeeping: {
          status: "C",
          type: "W",
        }
      },
      102:{
        Room: {
          BookingID: 1,
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
          status: "C",
          type: "W",
        }
      },
      103:{
        Room: {
          BookingID: 2,
          type: "WK2",
          payment: "C",
          startDate: '2020-10-14T12:00:00.000Z',
          endDate: '2020-10-27T12:00:00.000Z',
          paid: true,
          rate: 450,
          tax: 45.90,
          initial: "IZ",
        },
        HouseKeeping: {
          status: "C",
          type: "W",
        }
      },
      104:{
        Room: {
          BookingID: 3,
          type: "S/O",
          payment: "C",
          startDate: '2020-10-14T12:00:00.000Z',
          endDate: '2020-10-14T12:00:00.000Z',
          paid: true,
          rate: 89.90,
          tax: 10.90,
          initial: "IZ",
        },
        HouseKeeping: {
          status: "C",
          type: "W",
        }
      },
    }
  },
  {
    YearID: 2020,
    MonthID: 10,
    Date: '2020-10-18T00:00:00.000Z',
    Refund: {
      Amount: 0,
      Notes: "Deposit"
    },
    Stays:{
      101:{
        Room: {
          BookingID: 0,
          type: "NO",
          payment: "CC",
          startDate: '2020-10-18T12:00:00.000Z',
          endDate: '2020-10-24T12:00:00.000Z',
          paid: true,
          rate: 190,
          tax: 3.47,
          initial: "IZ",
        },
        HouseKeeping: {
          status: "C",
          type: "W",
        }
      },
      102:{
        Room: {
          BookingID: 1,
          type: "WK4", // Should Not Be counted in occupied
          payment: "C",
          startDate: '2020-10-02T12:00:00.000Z',
          endDate: '2020-10-28T12:00:00.000Z',
          paid: true,
          rate: 800,
          tax: 0,
          initial: "IZ",
        },
        HouseKeeping: {
          status: "C",
          type: "W",
        }
      },
      103:{
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
          status: "C",
          type: "W",
        }
      },
      104:{
        Room: {
          BookingID: 3,
          type: "N",
          payment: "CC",
          startDate: '2020-10-18T12:00:00.000Z',
          endDate: '2020-10-18T12:00:00.000Z',
          paid: true,
          rate: 23,
          tax: 190,
          initial: "IZ",
        },
        HouseKeeping: {
          status: "C",
          type: "W",
        }
      },
    }
  },
  {
    YearID: 2020,
    MonthID: 10,
    Date: '2020-10-31T00:00:00.000Z',
    Refund: {
      Amount: 159.90,
      Notes: "Deposit"
    },
    Stays:{
      101:{
        Room: {},
        HouseKeeping: {
          status: "C",
          type: "W",
        }
      },
      102:{
        Room: {},
        HouseKeeping: {
          status: "C",
          type: "W",
        }
      },
      103:{
        Room: {},
        HouseKeeping: {
          status: "C",
          type: "W",
        }
      },
      104:{
        Room: {},
        HouseKeeping: {
          status: "C",
          type: "W",
        }
      },
    }
  },
];

describe('Test Tax Report Service', function() {
  before('Establish Mongo Connection', function() {
    return mongoDB.connectMongo(config.database.mongo);
  });

  after('Close Mongo Connection', function() {
    return mongoose.connection.close();
  });

  context('Test generateTaxReport() method', function() {
    before('Insert DailyReport Objs into DailyReport Collection', function() {
      const promise1 = ReportTestModel.insertMany(DailyReports);
      return Promise.all([promise1]);
    });

    after('Delete DailyReport Objs from DailyReport Collection', function() {
      const promise1 = ReportTestModel.deleteMany({});
      return Promise.all([promise1]);
    });

    it('Should Have 6 Report In DailyReport Collection', function(done) {
      ReportTestModel.find({})
        .then((res) => {
          expect(res.length).to.equal(6);
          done();
        })
        .catch(err => done(err));
    });

    it('Test Report Obj Returned from generateTaxReport()', function(done) {
      const TaxReport = new ReportTestService(2020, 10);
      TaxReport.generateTaxReport()
        .then((res) => {
          // console.log(res[0].FinalReport);
          expect(res[0].FinalReport).to.be.an('array');
          expect(res[0].FinalReport.length).to.equal(6); // Including Last Row of Sums

          // Date: 10/02
          expect(res[0].FinalReport[0].Date).to.equal('2020-10-02');
          expect(res[0].FinalReport[0].Occupied).to.equal(3);
          expect(res[0].FinalReport[0].StayOver).to.equal(1);
          expect(res[0].FinalReport[0].Weekly).to.equal(0);
          expect(res[0].FinalReport[0].NoTaxStay).to.equal(2);
          expect(res[0].FinalReport[0].NetCash).to.equal(800);
          expect(res[0].FinalReport[0].TaxCash).to.equal(0);
          expect(res[0].FinalReport[0].GrossCash).to.equal(800);
          expect(res[0].FinalReport[0].NetCard).to.equal(89.1);
          expect(res[0].FinalReport[0].TaxCard).to.equal(10.9);
          expect(res[0].FinalReport[0].GrossCard).to.equal(100);
          expect(res[0].FinalReport[0].GrossNoTaxCash).to.equal(800);
          expect(res[0].FinalReport[0].GrossNoTaxCard).to.equal(0);
          expect(res[0].FinalReport[0].NetTotal).to.equal(889.1);
          expect(res[0].FinalReport[0].TaxTotal).to.equal(10.9);
          expect(res[0].FinalReport[0].Refund).to.equal(100);
          expect(res[0].FinalReport[0].GrossTotal).to.equal(800);

          // Date: 10/02
          expect(res[0].FinalReport[1].Date).to.equal('2020-10-13');
          expect(res[0].FinalReport[1].Occupied).to.equal(2);
          expect(res[0].FinalReport[1].StayOver).to.equal(1);
          expect(res[0].FinalReport[1].Weekly).to.equal(0);
          expect(res[0].FinalReport[1].NoTaxStay).to.equal(1);
          expect(res[0].FinalReport[1].NetCash).to.equal(0);
          expect(res[0].FinalReport[1].TaxCash).to.equal(0);
          expect(res[0].FinalReport[1].GrossCash).to.equal(0);
          expect(res[0].FinalReport[1].NetCard).to.equal(98.08);
          expect(res[0].FinalReport[1].TaxCard).to.equal(9.9);
          expect(res[0].FinalReport[1].GrossCard).to.equal(107.98);
          expect(res[0].FinalReport[1].GrossNoTaxCash).to.equal(0);
          expect(res[0].FinalReport[1].GrossNoTaxCard).to.equal(0);
          expect(res[0].FinalReport[1].NetTotal).to.equal(98.08);
          expect(res[0].FinalReport[1].TaxTotal).to.equal(9.9);
          expect(res[0].FinalReport[1].Refund).to.equal(0);
          expect(res[0].FinalReport[1].GrossTotal).to.equal(107.98);

          // Date: 10/12
          expect(res[0].FinalReport[2].Date).to.equal('2020-10-14');
          expect(res[0].FinalReport[2].Occupied).to.equal(4);
          expect(res[0].FinalReport[2].StayOver).to.equal(1);
          expect(res[0].FinalReport[2].Weekly).to.equal(2);
          expect(res[0].FinalReport[2].NoTaxStay).to.equal(1);
          expect(res[0].FinalReport[2].NetCash).to.equal(483.1);
          expect(res[0].FinalReport[2].TaxCash).to.equal(56.8);
          expect(res[0].FinalReport[2].GrossCash).to.equal(539.90);
          expect(res[0].FinalReport[2].NetCard).to.equal(181.33);
          expect(res[0].FinalReport[2].TaxCard).to.equal(18.67);
          expect(res[0].FinalReport[2].GrossCard).to.equal(200);
          expect(res[0].FinalReport[2].GrossNoTaxCash).to.equal(0);
          expect(res[0].FinalReport[2].GrossNoTaxCard).to.equal(0);
          expect(res[0].FinalReport[2].TaxTotal).to.equal(75.47);
          expect(res[0].FinalReport[2].Refund).to.equal(76.99);
          expect(res[0].FinalReport[2].GrossTotal).to.equal(662.91);

          // Date: 10/18
          expect(res[0].FinalReport[3].Date).to.equal('2020-10-18');
          expect(res[0].FinalReport[3].Occupied).to.equal(3);
          expect(res[0].FinalReport[3].StayOver).to.equal(1);
          expect(res[0].FinalReport[3].Weekly).to.equal(0);
          expect(res[0].FinalReport[3].NoTaxStay).to.equal(2);
          expect(res[0].FinalReport[3].NetCash).to.equal(800);
          expect(res[0].FinalReport[3].TaxCash).to.equal(0);
          expect(res[0].FinalReport[3].GrossCash).to.equal(800);
          expect(res[0].FinalReport[3].NetCard).to.equal(19.53);
          expect(res[0].FinalReport[3].TaxCard).to.equal(193.47);
          expect(res[0].FinalReport[3].GrossCard).to.equal(213);
          expect(res[0].FinalReport[3].GrossNoTaxCash).to.equal(0);
          expect(res[0].FinalReport[3].GrossNoTaxCard).to.equal(190);
          expect(res[0].FinalReport[3].NetTotal).to.equal(819.53);
          expect(res[0].FinalReport[3].TaxTotal).to.equal(193.47);
          expect(res[0].FinalReport[3].Refund).to.equal(0);
          expect(res[0].FinalReport[3].GrossTotal).to.equal(1013);

          // Date 10/21
          expect(res[0].FinalReport[4].Date).to.equal('2020-10-31');
          expect(res[0].FinalReport[4].Occupied).to.equal(0);
          expect(res[0].FinalReport[4].Refund).to.equal(159.9);
          expect(res[0].FinalReport[4].GrossTotal).to.equal(-159.9);

          // Final Sum
          expect(res[0].FinalReport[5].Date).to.equal(10);
          expect(res[0].FinalReport[5].Occupied).to.equal(2.4);
          expect(res[0].FinalReport[5].StayOver).to.equal(0.8);
          expect(res[0].FinalReport[5].Weekly).to.equal(0.4);
          expect(res[0].FinalReport[5].NoTaxStay).to.equal(1.2);
          expect(res[0].FinalReport[5].NetCash).to.equal(2083.1);
          expect(res[0].FinalReport[5].TaxCash).to.equal(56.8);
          expect(res[0].FinalReport[5].GrossCash).to.equal(2139.9);
          expect(res[0].FinalReport[5].NetCard).to.equal(388.04);
          expect(res[0].FinalReport[5].TaxCard).to.equal(232.94);
          expect(res[0].FinalReport[5].GrossCard).to.equal(620.98);
          expect(res[0].FinalReport[5].GrossNoTaxCash).to.equal(800);
          expect(res[0].FinalReport[5].GrossNoTaxCard).to.equal(190);
          expect(res[0].FinalReport[5].NetTotal).to.equal(2471.14);
          expect(res[0].FinalReport[5].TaxTotal).to.equal(289.74);
          expect(res[0].FinalReport[5].Refund).to.equal(336.89);
          expect(res[0].FinalReport[5].GrossTotal).to.equal(2423.99);

          done();
        })
        .catch(err => done(err));
    });

  });
});
