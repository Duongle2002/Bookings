const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bookingRoutes = require('./routers/bookingRoutes');
const connectDB = require('./config/DBconfig');
const authRoutes = require('./routers/auth');
const app = express();

connectDB()

const session = require('express-session');
const flash = require('connect-flash');
const authenticateToken = require('./middleware/authenticateToken');

// const cookieParser = require('cookie-parser');
// app.use(cookieParser());  


app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true
}));

// app.use('/auth', authRoutes);

app.use(flash());
// Cấu hình view engine và thư mục public
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Định tuyến
app.use('/', bookingRoutes);   //authenticateToken,

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
