const express = require("express");
const app = express();
const { cors } = require("./middleware/cors")
const PORT = 4000;
const mongoose = require("mongoose");
const router = require('./routes/index.routes')
var dotenv = require('dotenv')
dotenv.config();
const cookieParser = require('cookie-parser')
app.options('*', cors);
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cookieParser())
app.use(cors)
const { DB } = require("./db");
app.set('trust proxy', true)

mongoose.set('strictQuery', false);
mongoose
  .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database Connected'))
  .catch(err => console.log(err));

const connection = mongoose.connection;

connection.once("open", function () {
  console.log("Connection with MongoDB was successful");
  console.log(process.env.NODE_ENV)
});

app.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
});

app.use("/api", router);