const express = require("express");

const doctorController = require("../../controller/doctorController");

const router = express.Router();

router.get("/getAllPatients/:doctorId",doctorController.getAllPatients);


module.exports = router;
