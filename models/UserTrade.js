const { DataTypes } = require('sequelize');
const db = require('../config/database');

const UserTrade = db.define(
	'user_trades',
	{
		amount: {
			type: DataTypes.FLOAT,
			allowNull: false,
		},

		price: {
			type: DataTypes.FLOAT,
			allowNull: true,
		},
		imageURL: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		tradeId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		closePrice: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		status: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		freezeTableName: true,
	}
);

module.exports = UserTrade;
