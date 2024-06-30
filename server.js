const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const utilities = require('./utilities/index');
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")


app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/layout");


app.use(express.static('public'));

//routes

app.use(async (req, res, next) => {
  res.locals.nav = await utilities.getNav();
  next();
});

app.get('/', (req, res) => {
  
  res.render('index', {title: 'home', });
});
app.use("/inv", inventoryRoute)

// app.get("/", baseController.buildHome)

app.get("/", utilities.handleErrors(baseController.buildHome))

app.get('/force-error', (req, res, next) => {
  const error = new Error('This is a forced error.');
  error.status = 500;
  next(error);
});



//errors
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})




//static 
app.use(static);

const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
