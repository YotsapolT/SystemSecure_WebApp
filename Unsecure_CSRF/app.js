const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const path = require("path");
const ejs = require("ejs");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "qead8T31",
  database: "SystemSecure",
});

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(session({
    secret: "secret", //random session id(default = "secret") or use other random mechanism 
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", function (request, response) {
  // Render login template
  response.render("login");
});

app.post("/auth", function (request, response) {
  // Capture the input fields
  let username = request.body.username;
  let password = request.body.password;
  // Ensure the input fields exists and are not empty
  if (username && password) {
    //Secure SQL-Injection
    const queryWithParameters = connection.format(
      "SELECT * FROM account WHERE username = ? AND pwd = ?",
      [username, password]
    );

    //Unsecure SQL-Injection
    // const myQuery =
    //   "SELECT * FROM account WHERE username = '" + username + "' AND pwd = '" + password + "'";

    // console.log(myQuery);
    console.log(queryWithParameters);
    connection.query(queryWithParameters, function (error, results) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      if (results.length > 0) {
        // Authenticate the user
        request.session.loggedin = true;
        request.session.username = username;

        // Redirect to home page
        response.redirect("/home");
      } else {
        response.send("Incorrect Username and/or Password!");
      }
      response.end();
    });
  }else {
    response.send("Please enter Username and Password!");
    response.end();
  }
});

app.post("/registerEmail", function (request, response) {
  let email = request.body.email;
  let username = request.session.username;

  if (email) {
    // let myQuery =
    //   "UPDATE account SET email = '" + email + "' WHERE username = '" + username + "';";

    const queryWithParameters = connection.format(
      "UPDATE account SET email = ? WHERE username = ?;",
      [email, username]
    );
    console.log(queryWithParameters)
    connection.query(queryWithParameters);
    response.render('home', { success: 'success', username: username })
  }else {
    response.send("not have email!");
    response.end();
  }
});

app.post("/viewEmail", function (request, response) {
  let username = request.session.username;
  const myQuery = "SELECT * FROM account WHERE username = '" + username + "'";
  connection.query(myQuery, function (error, results, fields) {
    if (error) throw error;
    if (results.length > 0) {
      const email = results[0].email;

      //Unsecure Stored-XSS
      // response.send('your email: ' + results[0].email);

      //Secure Stored-XSS
      response.render('viewEmail', {email: email});
    } else {
      response.send('email not found');
      response.end();
    }
  });
});

app.get("/home", function (request, response) {
  // If the user is loggedin
  if (request.session.loggedin) {
    // Logged in
    response.render("home", { username: request.session.username, success: '' });
  } else {
    // Not logged in
    response.send("Please login to view this page!");
  }
});

app.post("/showtext", (request, response) => {
  const text = request.body.text;
  //Unsecure Reflect-XSS
  // response.send(text);

  //Secure Reflect-XSS
  response.render("showtext", { text: text});
});

const port = 4000;
app.listen(port, console.log("server run on port: http://localhost:" + port));
