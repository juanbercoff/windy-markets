const { DataTypes } = require('sequelize');
const db = require('../config/database');
const UserTrade = require('./UserTrade');

const User = db.define('user', {
	firstName: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	lastName: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	role: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});

User.hasMany(UserTrade);
UserTrade.belongsTo(User);

module.exports = User;
