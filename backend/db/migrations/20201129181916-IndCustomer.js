module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Create IndCustomer Table in MySQL
     */
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable(
        'IndCustomer',
        {
          BookingID: {
            type: Sequelize.BIGINT,
            field: 'BookingID',
            primaryKey: true,
            allowNull: false,
          },
          CustomerID: {
            type: Sequelize.STRING,
            field: 'CustomerID',
            allowNull: false,
          },
          price_paid: {
            type: Sequelize.DOUBLE(6, 2),
            field: 'price_paid',
            allowNull: false,
          },
          tax: {
            type: Sequelize.DOUBLE(6, 2),
            field: 'tax',
            allowNull: false,
          },
          check_in: {
            type: Sequelize.DATE,
            field: 'check_in',
            allowNull: false,
          },
          check_out: {
            type: Sequelize.DATE,
            field: 'check_out',
            allowNull: false,
          },
          Num_Guests: {
            type: Sequelize.TINYINT,
            field: 'Num_Guests',
            allowNull: false,
          },
          ReservationID: {
            type: Sequelize.TINYINT,
            field: 'ReservationID',
            allowNull: false,
          },
          PaymentID: {
            type: Sequelize.TINYINT,
            field: 'PaymentID',
            allowNull: false,
          },
          RoomID: {
            type: Sequelize.TINYINT,
            field: 'RoomID',
            allowNull: false,
          },
          HotelID: {
            type: Sequelize.MEDIUMINT,
            field: 'HotelID',
            allowNull: false,
          },
          StyleID: {
            type: Sequelize.TINYINT,
            field: 'StyleID',
            allowNull: false,
          },
          comments: {
            type: Sequelize.TEXT('tiny'),
            field: 'comments',
            allowNull: true,
          },
          created_at: {
            type: Sequelize.DATE,
            field: 'created_at',
            defaultValue: Sequelize.fn('NOW'),
            allowNull: false,
          },
        },
        { transaction }
      );
      await queryInterface.addIndex('IndCustomer', ['BookingID'], {
        transaction,
      });

      await queryInterface.addIndex('IndCustomer', ['CustomerID'], {
        transaction,
      });

      await queryInterface.addConstraint('IndCustomer', {
        type: 'foreign key',
        fields: ['CustomerID'],
        references: {
          table: 'Customer',
          field: 'ID',
        },
      });

      await queryInterface.addConstraint('IndCustomer', {
        type: 'foreign key',
        fields: ['ReservationID'],
        references: {
          table: 'Reservations',
          field: 'ID',
        },
      });

      await queryInterface.addConstraint('IndCustomer', {
        type: 'foreign key',
        fields: ['PaymentID'],
        references: {
          table: 'Payment',
          field: 'ID',
        },
      });

      await queryInterface.addConstraint('IndCustomer', {
        type: 'foreign key',
        fields: ['HotelID'],
        references: {
          table: 'Motels',
          field: 'ID',
        },
      });

      await queryInterface.addConstraint('IndCustomer', {
        type: 'foreign key',
        fields: ['StyleID'],
        references: {
          table: 'RoomStyle',
          field: 'ID',
        },
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Drop IndCustomer Table in MySQL
     */
    await queryInterface.dropTable('IndCustomer');
  },
};
