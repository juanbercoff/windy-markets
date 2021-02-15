const express = require('express');
const exphbs  = require('express-handlebars');
const dotenv = require('dotenv');
const app = express();
const path = require('path');

dotenv.config();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//Middleware
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.json());


// Database
const db = require('./config/database')

/* db.authenticate()
    .then(()=> console.log('Database connected...'))
    .catch(err=>console.log('Error ' + err)) */


// Routes
const authRoute = require('./routes/auth');

app.use('/api/user/', authRoute);

 
app.get('/', function (req, res) {
    res.render('index');
});
 
app.listen(3000);