require("dotenv").config();

const express = require("express");
var bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const cors = require("cors");

const user = require("./routes/userRouters");


const port = 8080;
const app = express();

app.use(cors());
app.use(bodyParser.json());


const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:5000"];

app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
}));



mongoose
  .connect("mongodb://localhost:27017/Home_Provision")
  .then(() => {
    app.listen(port, () => {
      console.log("App is runing");
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/user", user);



app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const mesg = err.message;
  const data = err.data;
  res.status(statusCode).json({ mesg,  data });
});
