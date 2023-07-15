const express = require("express");

const patientController = require("../../controller/patientController");

const router = express.Router();

router.post("/makeAppointment",patientController.makeAppointment);
router.get("/getAllPendingApp/:doctorId", patientController.getPendingApp);

router.post("/complaint",patientController.compaint);


module.exports = router;