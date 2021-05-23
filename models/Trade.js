const { DataTypes } = require('sequelize');
const db = require('../config/database');
const UserTrade = require('./UserTrade');
const Image = require('./Image');

const Trade = db.define('trade', {
	stock: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	contractType: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	strike: {
		type: DataTypes.FLOAT,
		allowNull: false,
	},
	expirationDate: {
		type: DataTypes.DATEONLY,
		allowNull: false,
	},
	status: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	price: {
		type: DataTypes.FLOAT,
		allowNull: true,
	},
	closePrice: {
		type: DataTypes.FLOAT,
		allowNull: true,
	},
});

Trade.hasMany(UserTrade, {
	onDelete: 'CASCADE',
});
UserTrade.belongsTo(Trade);

Trade.hasMany(Image, {
	onDelete: 'CASCADE',
});
Image.belongsTo(Trade);

module.exports = Trade;
