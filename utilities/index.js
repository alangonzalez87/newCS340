const invModel = require("../models/inventory-model")
const pool = require('../database/');
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inventory_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inventory_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


/* **************************************
* Build the vehicle detail HTML
* ************************************ */
Util.buildVehicleDetailHTML = function(vehicle) {
  
  let html = `
    <div class="vehicle-detail">
      <h1>${vehicle.inv_make} ${vehicle.inv_model}</h1>
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
      <p>${vehicle.inv_description}</p>
      <p>Price: $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>
      <h2>Specifications:</h2>
      <ul>
  `
  html += `
      </ul>
    </div>
  `
  return html
}

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"';
      if (classification_id != null && row.classification_id == classification_id) {
          classificationList += " selected ";
      }
      classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

Util.handleErrors= fn=> (req,res,next)=> Promise.resolve(fn(req,res,next)).catch(next)
/**
 * Middleware to check token validity
 */
Util.checkJWTToken = (req, res, next) =>{
  if(req.cookies.jwt){
      jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, function (err, accountData){
          if (err){
              req.flash("notice","Please log in");
              res.clearCookie("jwt");
              return res.redirect("/account/login");
          }
          res.locals.accountData = accountData;
          res.locals.loggedin = 1;
          next();
      });
  }
  else{
      next();
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

 /**************
 * Build header Login/Logout
 *************/
Util.getTools = (req) =>{
  if(req.cookies.jwt){
      try{
          const cookieData = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
          let html = `<p>Welcome,</p>
          <a title="Click to access account management" href="/account/">${cookieData.account_firstname}</a>
                      <a title="Click to log out" href="/account/logout">Log out</a>`;
          return html;
      }
      catch (error){
          throw new Error (error);
      }
  }
  else{
      let html = '<a title="Click to log in" href="/account/login">My account</a>';
      return html;
  }
}


Util.authorizedAccounts = (req, res, next) =>{
  if(req.cookies.jwt){
      try{
          const cookieData = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
          if (cookieData.account_type == "Employee" || cookieData.account_type == "Admin"){
              next();
          }
          else{
              req.flash("notice", "Forbidden access");
              res.status(401).redirect("/account/login");
          }
      }
      catch (error){
          throw new Error (error);
      }
  }
  else{
      res.status(401).redirect("/account/login");
  }
}




module.exports = Util

