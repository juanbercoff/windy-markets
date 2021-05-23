const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Image = db.define(
	'images',
	{
		imageURL: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		tradeId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		freezeTableName: true,
	}
);

module.exports = Image;
