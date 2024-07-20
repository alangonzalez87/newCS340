const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const utilities = require('./utilities/index');
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute= require("./routes/accountRoute")
const session = require("express-session");
const pool = require('./database/');
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/layout");


app.use(express.static('public'));

// Session Middleware
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}));

app.use(cookieParser())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) 

app.use(utilities.checkJWTToken)

// Flash Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Add nav to response locals
app.use(async (req, res, next) => {
  res.locals.nav = await utilities.getNav();
  next();
});

// Routes
app.get('/', baseController.buildHome);
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);

// Error Handling
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  const message = err.status == 500 ? err.message : ' Oh no! There was a crash. Maybe try a different route?';
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav,
  });
});

// Static Routes
app.use(static);

const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
