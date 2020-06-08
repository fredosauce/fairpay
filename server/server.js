const path = require('path');
const express = require('express');
const passport = require('passport');
const cookieSession = require('cookie-session');
require('./passport-setup');
// const dotenv = require('dotenv');
// dotenv.config();

const app = express();
const PORT = 3000;

// routers
const authRouter = require('./routes/auth.js');
// controllers
const fairpayController = require('./controllers/fairpayControllers');

app.use(express.json());

// set up session cookies
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: ['wonderpus']
}));

// initializes passport and passport sessions
app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV === 'production') {
    app.use('/build', express.static(path.resolve(__dirname, '../build')))  
    app.get('/', (req, res) => res.status(200).sendFile(path.resolve(__dirname, '../index.html')));
} 

// route handlers
app.use('/auth', authRouter);

if (process.env.NODE_ENV === 'production') {
  app.use('/build', express.static(path.resolve(__dirname, '../build')));

  app.get('/', (req, res) =>
    res.status(200).sendFile(path.resolve(__dirname, '../index.html'))
  );
}

app.get('/api/test', fairpayController.getUser, (req, res) => {
  res.status(200).json(res.locals.userData);
});

app.post('/api/user', fairpayController.createUser, (req, res) => {
  //res.status(200).json(res.locals.userData);
});

app.use(
  '/api/company/:linkedin_user_id',
  fairpayController.getCurrentUser,
  fairpayController.getCompanyData,
  (req, res) => {
    res.status(200).json([res.locals.currentUser, res.locals.companyData.rows]);
  }
);

// route error handler
app.use('*', (req, res) => res.sendStatus(404));

// global middleware error handler
app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 400,
    message: {
      err: 'An error occurred',
    },
  };
  const errorObj = Object.assign({}, defaultErr);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, () => console.log('Server started on port ', PORT));

module.exports = app;
