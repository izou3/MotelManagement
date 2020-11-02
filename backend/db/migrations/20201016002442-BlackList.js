module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Create Blacklist Table in MySQL
     */
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable(
        'BlackList',
        {
          BookingID: {
            type: Sequelize.BIGINT,
            field: 'BookingID',
            primaryKey: true,
            allowNull: false,
          },
          Comments: {
            type: Sequelize.TEXT,
            field: 'comments',
            allowNull: false,
          },
        },
        { transaction }
      );
      await queryInterface.addIndex('BlackList', ['BookingID'], {
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
     * Drop Blacklist Table in MySQL
     *
     */
    await queryInterface.dropTable('BlackList');
  },
};
