"use strict";

const express = require("express");
const router = express.Router();

const accounts = require("./controllers/accounts.js");
const dashboard = require("./controllers/dashboard.js");
const trainerdashboard = require("./controllers/trainerdashboard.js");
const trainerview = require("./controllers/trainerview.js");
const about = require("./controllers/about.js");
const assessment = require("./controllers/assessment.js");

router.get("/", accounts.index);
router.get("/login", accounts.login);
router.get("/signup", accounts.signup);
router.get("/logout", accounts.logout);
router.get("/update", accounts.update);
router.post("/register", accounts.register);
router.post("/authenticate", accounts.authenticate);
router.post("/updateAccount", accounts.updateAccount);

router.get("/dashboard", dashboard.index);
router.get("/dashboard/deleteassessment/:id", dashboard.deleteAssessment);
router.post("/dashboard/addassessment", dashboard.addAssessment);

router.get("/trainerdashboard", trainerdashboard.index);
router.get("/trainerdashboard/deletemember/:id", trainerdashboard.deleteMember);

router.get("/trainerview/:id", trainerview.index);
router.post("/trainerview/:id/addComment", trainerview.addComment);

router.get("/about", about.index);
router.get("/assessment/:id", assessment.index);


module.exports = router;
