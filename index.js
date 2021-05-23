const express = require('express');
const dotenv = require('dotenv');

const cookieParser = require('cookie-parser');
const app = express();
const httpServer = require('http').createServer(app);
dotenv.config();
const { verifyToken } = require('./verifyToken');

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
const authRoute = require('./routes/auth');
const tradesRoute = require('./routes/trades');
const userTradesRoute = require('./routes/userTrades');
const imagesRoute = require('./routes/images');

app.use('/api/user/', authRoute);
app.use('/api/trades/', tradesRoute);
app.use('/api/userTrades/', verifyToken, userTradesRoute);
app.use('/api/images/', imagesRoute);

httpServer.listen(3000);
