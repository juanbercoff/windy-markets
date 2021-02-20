const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Trade = db.define('trade', {
    stock: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contractType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    strike: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    imageURL: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expirationDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
})

module.exports = Trade;