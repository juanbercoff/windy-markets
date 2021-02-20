const express = require('express');
const exphbs  = require('express-handlebars');
const dotenv = require('dotenv');
const app = express();
const path = require('path');
const verifyToken = require('./verifyToken');
const cors = require('cors')

dotenv.config();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//Middleware
app.use(cors())
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.json());

app.get('/getPosts', verifyToken, (req, res) => {
    res.send(req.user)
})

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


app.get('/getData', (req, res) => {
    res.send('ASD IS THE VALUE OF THE RESPONSE, THIS IS A LONG VALUE VALUE VALUE')
})

 
app.get('/', function (req, res) {
    res.render('index');
});
 
app.listen(3000);