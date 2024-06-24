const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");


app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/layout"); 

// index route

app.get('/', (req, res) => {
  res.render('index', {title: 'home'}); // Asegúrate de tener un archivo `index.ejs` en la carpeta `views`
});

app.use(static);

// Información del servidor
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

// Inicio del servidor
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(`Something broke! Error: ${err.message}`);
});
