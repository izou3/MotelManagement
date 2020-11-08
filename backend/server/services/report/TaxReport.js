/**
 * Module Dependencies
 */
const { Parser } = require('json2csv');
const mongoose = require('mongoose');
const debug = require('debug')('motel:http');
const DailyReportSchema = require('../../models/DailyReport');

/**
 * Mongoose Schema Creation
 */
const DailyReportSch = mongoose.model(
  'DailyReport',
  DailyReportSchema,
  'DailyReport'
);

/**
 * Tax Report Class with Instance Method to Generate a New Tax
 * using MongoDB Aggregation Framework. For usage and documentation
 * please reference the README documention on this github repo
 */
class TaxReport {
  constructor(year, month) {
    this.year = year;
    this.month = month;
    this.fields = [
      {
        label: 'Date',
        value: 'Date',
      },
      {
        label: 'Occupied',
        value: 'Occupied',
      },
      {
        label: 'StayOver',
        value: 'StayOver',
      },
      {
        label: 'Weekly',
        value: 'Weekly',
      },
      {
        label: 'NoTaxStay',
        value: 'NoTaxStay',
      },
      {
        label: 'NetCash',
        value: 'NetCash',
      },
      {
        label: 'TaxCash',
        value: 'TaxCash',
      },
      {
        label: 'GrossCash',
        value: 'GrossCash',
      },
      {
        label: 'NetCard',
        value: 'NetCard',
      },
      {
        label: 'TaxCard',
        value: 'TaxCard',
      },
      {
        label: 'GrossCard',
        value: 'GrossCard',
      },
      {
        label: 'GrossNoTaxCash',
        value: 'GrossNoTaxCash',
      },
      {
        label: 'GrossNoTaxCard',
        value: 'GrossNoTaxCard',
      },
      {
        label: 'NetTotal',
        value: 'NetTotal',
      },
      {
        label: 'TaxTotal',
        value: 'TaxTotal',
      },
      {
        label: 'Refund',
        value: 'Refund',
      },
      {
        label: 'GrossTotal',
        value: 'GrossTotal',
      },
    ];
  }

  /**
   * Use json2csv module to parse an array of objects into a csv object
   *
   * @param data array of objects to be parsed into csv
   * @return CVS object to be downloaed in the user's browser
   */
  downloadTaxReport(data) {
    const Field = this.fields;
    const json2csv = new Parser({ Field });
    const csv = json2csv.parse(data);
    return csv;
  }

  /**
   * Use mongo aggregation framework to generate a TaxReport from the
   * DailyReport documents of specified month and year
   *
   * @return an array of objects representing the Tax Report
   */
  generateTaxReport() {
    return new Promise((resolve, reject) => {
      DailyReportSch.aggregate(
        [
          {
            $match: {
              YearID: Number(this.year),
              MonthID: Number(this.month),
            },
          },
          {
            $project: {
              _id: 0,
              Date: '$Date',
              Refund: '$Refund',
              YearID: '$YearID',
              MonthID: '$MonthID',
              Stays: {
                $objectToArray: '$Stays',
              },
            },
          },
          {
            $project: {
              Date: '$Date',
              YearID: '$YearID',
              MonthID: '$MonthID',
              Refund: '$Refund.Amount',
              Stays: '$Stays.v.Room',
            },
          },
          {
            $project: {
              Date: '$Date',
              YearID: '$YearID',
              MonthID: '$MonthID',
              Refund: '$Refund',
              Stays: {
                $filter: {
                  input: '$Stays',
                  as: 'room',
                  cond: {
                    $eq: ['$$room.paid', true],
                  },
                },
              },
            },
          },
          {
            $unwind: {
              path: '$Stays',
              includeArrayIndex: 'stayOfDate',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              Date: '$Date',
              YearID: '$YearID',
              MonthID: '$MonthID',
              Refund: '$Refund',
              StayOfDate: {
                $cond: {
                  if: {
                    $eq: ['$stayOfDate', null],
                  },
                  then: -1,
                  else: '$stayOfDate',
                },
              },
              StayOver: {
                $cond: {
                  if: {
                    $or: [
                      {
                        $eq: ['$Stays.type', 'N'],
                      },
                      {
                        $eq: ['$Stays.type', 'S/O'],
                      },
                    ],
                  },
                  then: 1,
                  else: 0,
                },
              },
              Weekly: {
                $cond: {
                  if: {
                    $or: [
                      {
                        $eq: ['$Stays.type', 'WK1'],
                      },
                      {
                        $eq: ['$Stays.type', 'WK2'],
                      },
                      {
                        $eq: ['$Stays.type', 'WK3'],
                      },
                    ],
                  },
                  then: 1,
                  else: 0,
                },
              },
              NoTaxStay: {
                $cond: {
                  if: {
                    $eq: ['$Stays.type', 'NO'],
                  },
                  then: 1,
                  else: 0,
                },
              },
              PaymentType: '$Stays.payment',
              PaymentNet: {
                $subtract: ['$Stays.rate', '$Stays.tax'],
              },
              PaymentTax: '$Stays.tax',
              PaymentGross: '$Stays.rate',
              GrossNoTax: {
                $cond: {
                  if: {
                    $eq: ['$Stays.type', 'NO'],
                  },
                  then: '$Stays.rate',
                  else: 0,
                },
              },
            },
          },
          {
            $group: {
              _id: {
                Date: '$Date',
                PaymentType: '$PaymentType',
                YearID: '$YearID',
                MonthID: '$MonthID',
                Refund: '$Refund',
              },
              StayOvers: {
                $sum: '$StayOver',
              },
              Weekly: {
                $sum: '$Weekly',
              },
              NoTaxStay: {
                $sum: '$NoTaxStay',
              },
              Net: {
                $sum: '$PaymentNet',
              },
              Tax: {
                $sum: '$PaymentTax',
              },
              Gross: {
                $sum: '$PaymentGross',
              },
              GrossNoTax: {
                $sum: '$GrossNoTax',
              },
            },
          },
          {
            $addFields: {
              netCash: {
                $cond: {
                  if: {
                    $eq: ['$_id.PaymentType', 'C'],
                  },
                  then: {
                    $round: ['$Net', 2],
                  },
                  else: 0,
                },
              },
              taxCash: {
                $cond: {
                  if: {
                    $eq: ['$_id.PaymentType', 'C'],
                  },
                  then: {
                    $round: ['$Tax', 2],
                  },
                  else: 0,
                },
              },
              grossCash: {
                $cond: {
                  if: {
                    $eq: ['$_id.PaymentType', 'C'],
                  },
                  then: {
                    $round: ['$Gross', 2],
                  },
                  else: 0,
                },
              },
              netCard: {
                $cond: {
                  if: {
                    $eq: ['$_id.PaymentType', 'CC'],
                  },
                  then: {
                    $round: ['$Net', 2],
                  },
                  else: 0,
                },
              },
              taxCard: {
                $cond: {
                  if: {
                    $eq: ['$_id.PaymentType', 'CC'],
                  },
                  then: {
                    $round: ['$Tax', 2],
                  },
                  else: 0,
                },
              },
              grossCard: {
                $cond: {
                  if: {
                    $eq: ['$_id.PaymentType', 'CC'],
                  },
                  then: {
                    $round: ['$Gross', 2],
                  },
                  else: 0,
                },
              },
              grossNoTaxCash: {
                $cond: {
                  if: {
                    $eq: ['$_id.PaymentType', 'C'],
                  },
                  then: {
                    $round: ['$GrossNoTax', 2],
                  },
                  else: 0,
                },
              },
              grossNoTaxCredit: {
                $cond: {
                  if: {
                    $eq: ['$_id.PaymentType', 'CC'],
                  },
                  then: {
                    $round: ['$GrossNoTax', 2],
                  },
                  else: 0,
                },
              },
            },
          },
          {
            $group: {
              _id: {
                Date: '$_id.Date',
                YearID: '$_id.YearID',
                MonthID: '$_id.MonthID',
                Refund: '$_id.Refund',
              },
              StayOver: {
                $sum: '$StayOvers',
              },
              Weekly: {
                $sum: '$Weekly',
              },
              NoTaxStay: {
                $sum: '$NoTaxStay',
              },
              NetCash: {
                $sum: '$netCash',
              },
              TaxCash: {
                $sum: '$taxCash',
              },
              GrossCash: {
                $sum: '$grossCash',
              },
              NetCard: {
                $sum: '$netCard',
              },
              TaxCard: {
                $sum: '$taxCard',
              },
              GrossCard: {
                $sum: '$grossCard',
              },
              GrossNoTaxCash: {
                $sum: '$grossNoTaxCash',
              },
              GrossNoTaxCredit: {
                $sum: '$grossNoTaxCredit',
              },
            },
          },
          {
            $addFields: {
              Refund: '$_id.Refund',
              occupied: {
                $add: ['$StayOver', '$Weekly', '$NoTaxStay'],
              },
              NetTotal: {
                $add: ['$NetCash', '$NetCard'],
              },
              TaxTotal: {
                $add: ['$TaxCash', '$TaxCard'],
              },
              GrossTotal: {
                $subtract: [
                  {
                    $add: ['$GrossCash', '$GrossCard'],
                  },
                  '$_id.Refund',
                ],
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
          {
            $facet: {
              TaxReport: [
                {
                  $group: {
                    _id: {
                      YearID: '$_id.YearID',
                      MonthID: '$_id.MonthID',
                    },
                    TaxReport: {
                      $push: {
                        Date: {
                          $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$_id.Date',
                          },
                        },
                        Occupied: '$occupied',
                        StayOver: '$StayOver',
                        Weekly: '$Weekly',
                        NoTaxStay: '$NoTaxStay',
                        NetCash: '$NetCash',
                        TaxCash: '$TaxCash',
                        GrossCash: '$GrossCash',
                        NetCard: '$NetCard',
                        TaxCard: '$TaxCard',
                        GrossCard: '$GrossCard',
                        GrossNoTaxCash: '$GrossNoTaxCash',
                        GrossNoTaxCard: '$GrossNoTaxCredit',
                        NetTotal: '$NetTotal',
                        TaxTotal: '$TaxTotal',
                        Refund: '$Refund',
                        GrossTotal: '$GrossTotal',
                      },
                    },
                  },
                },
              ],
              FinalReport: [
                {
                  $group: {
                    _id: {
                      YearID: '$_id.YearID',
                      MonthID: '$_id.MonthID',
                    },
                    Occupied: {
                      $avg: '$occupied',
                    },
                    StayOver: {
                      $avg: '$StayOver',
                    },
                    Weekly: {
                      $avg: '$Weekly',
                    },
                    NoTaxStay: {
                      $avg: '$NoTaxStay',
                    },
                    NetCash: {
                      $sum: '$NetCash',
                    },
                    TaxCash: {
                      $sum: '$TaxCash',
                    },
                    GrossCash: {
                      $sum: '$GrossCash',
                    },
                    NetCard: {
                      $sum: '$NetCard',
                    },
                    TaxCard: {
                      $sum: '$TaxCard',
                    },
                    GrossCard: {
                      $sum: '$GrossCard',
                    },
                    GrossNoTaxCash: {
                      $sum: '$GrossNoTaxCash',
                    },
                    GrossNoTaxCard: {
                      $sum: '$GrossNoTaxCredit',
                    },
                    NetTotal: {
                      $sum: '$NetTotal',
                    },
                    TaxTotal: {
                      $sum: '$TaxTotal',
                    },
                    Refund: {
                      $sum: '$Refund',
                    },
                    GrossTotal: {
                      $sum: '$GrossTotal',
                    },
                  },
                },
              ],
            },
          },
          {
            $project: {
              IndTaxReport: {
                $arrayElemAt: ['$TaxReport', 0],
              },
              FinalReport: {
                $arrayElemAt: ['$FinalReport', 0],
              },
            },
          },
          {
            $project: {
              IndTaxReport: '$IndTaxReport.TaxReport',
              FinalReport: [
                {
                  Date: '$FinalReport._id.MonthID',
                  Occupied: {
                    $round: ['$FinalReport.Occupied', 2],
                  },
                  StayOver: {
                    $round: ['$FinalReport.StayOver', 2],
                  },
                  Weekly: {
                    $round: ['$FinalReport.Weekly', 2],
                  },
                  NoTaxStay: {
                    $round: ['$FinalReport.NoTaxStay', 2],
                  },
                  NetCash: {
                    $round: ['$FinalReport.NetCash', 2],
                  },
                  TaxCash: {
                    $round: ['$FinalReport.TaxCash', 2],
                  },
                  GrossCash: {
                    $round: ['$FinalReport.GrossCash', 2],
                  },
                  NetCard: {
                    $round: ['$FinalReport.NetCard', 2],
                  },
                  TaxCard: {
                    $round: ['$FinalReport.TaxCard', 2],
                  },
                  GrossCard: {
                    $round: ['$FinalReport.GrossCard', 2],
                  },
                  GrossNoTaxCash: {
                    $round: ['$FinalReport.GrossNoTaxCash', 2],
                  },
                  GrossNoTaxCard: {
                    $round: ['$FinalReport.GrossNoTaxCard', 2],
                  },
                  NetTotal: {
                    $round: ['$FinalReport.NetTotal', 2],
                  },
                  TaxTotal: {
                    $round: ['$FinalReport.TaxTotal', 2],
                  },
                  Refund: {
                    $round: ['$FinalReport.Refund', 2],
                  },
                  GrossTotal: {
                    $round: ['$FinalReport.GrossTotal', 2],
                  },
                },
              ],
            },
          },
          {
            $project: {
              FinalReport: {
                $concatArrays: ['$IndTaxReport', '$FinalReport'],
              },
            },
          },
        ],
        (err, result) => {
          if (err || result.length === 0) {
            reject(new Error('Failed to Generate Report'));
          }
          resolve(result);
        }
      );
    });
  }
}

module.exports = TaxReport;
