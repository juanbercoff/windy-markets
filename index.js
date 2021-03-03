const express = require('express');
const exphbs  = require('express-handlebars');
const dotenv = require('dotenv');
const app = express();
const path = require('path');
const verifyToken = require('./verifyToken');
const cookieParser = require('cookie-parser');

dotenv.config();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//Middleware
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.json());


// Database
const db = require('./config/database')

/* db.authenticate()
    .then(()=> console.log('Database connected...'))
    .catch(err=>console.log('Error ' + err)) */


// Routes
const authRoute = require('./routes/auth');
const tradesRoute = require('./routes/trades');

app.use('/api/user/', authRoute);
app.use('/api/trades/', tradesRoute);


 
app.get('/', function (req, res) {
    res.render('index');
});
 
app.listen(3000);