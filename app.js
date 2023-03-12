// ! Require and configure the dotenv module once you install it
require("dotenv").config(); // This is to access our environment variables on the .env file
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/wikiDB");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please check your data entry, username not specified"]
  },
  password: {
    type: String,
    required: [true, "Please check your data entry, password not specified"]
  }
})
// ! Itabi at never i-upload ang 'secret' sa web. Use env variables instead
// const secret = process.env.SECRET; 
// We are invoking the plugin method on the userSchema to encrypt fields. We are also passing in an object as the second argument and passing the secret variable and using the encryptedFields to specify the only fields that we want to be encrypted
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = mongoose.model("User", userSchema);
// Home
app.route("/")
.get((req, res) => {
  res.render("home");
})
// Register
app.route("/register")
.get((req, res) => {
  res.render("register");
})
.post((req, res) => {
  const newUser = new User(req.body);

  User.findOne({username: req.body.username}, (err, user) => {
    if (!err) {
      if (!user) {
        newUser.save((err) => {
          if (!err) {
            res.render("secrets");
          } else {
            res.send(err);
          }
        })
      } else {
        res.send("There is already a user with that username.")
      }
    } else {
      res.send(err);
    }
  })
})
// Login
app.route("/login")
.get((req, res) => {
  res.render("login");
})
.post((req, res) => {
  User.findOne({username: req.body.username}, (err, user) => {
    if (user) { // If this is true, meaning merong user with the username, now check if the password is the same
      if (user.password === req.body.password) {
        res.render("secrets");
      } else {
        res.send("Wrong password.");
      }
    } else {
      res.send("No account with that username.")
    }
  })
})

app.listen(3000, () => {
  console.log("Server started on port 3000.");
})