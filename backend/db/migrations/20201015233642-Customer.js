module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Create Customer Table in MySQL
     *
     * */
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable(
        'Customer',
        {
          ID: {
            type: Sequelize.STRING,
            field: 'id',
            primaryKey: true,
            allowNull: false,
          },
          YearID: {
            type: Sequelize.SMALLINT,
            field: 'YearID',
            allowNull: false,
          },
          MonthID: {
            type: Sequelize.SMALLINT,
            field: 'MonthID',
            allowNull: false,
          },
          first_name: {
            type: Sequelize.STRING,
            field: 'first_name',
            allowNull: false,
          },
          last_name: {
            type: Sequelize.STRING,
            field: 'last_name',
            allowNull: false,
          },
          email: {
            type: Sequelize.STRING,
            field: 'email',
            allowNull: true,
          },
          phone: {
            type: Sequelize.BIGINT,
            field: 'phone',
            allowNull: true,
          },
          state: {
            type: Sequelize.STRING,
            field: 'state',
            allowNull: true,
          },
        },
        { transaction }
      );
      await queryInterface.addIndex('Customer', ['first_name', 'last_name'], {
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Drop Customer Table in MySQL
     */
    await queryInterface.dropTable('Customer');
  },
};
