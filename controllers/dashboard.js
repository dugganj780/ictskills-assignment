"use strict";

const accounts = require("./accounts.js");
const logger = require("../utils/logger");
const assessmentsStore = require("../models/assessments-store");
const memberStore = require("../models/member-store")
const uuid = require("uuid");

const dashboard = {
  index(request, response) {
    logger.info("dashboard rendering");
    const loggedInMember = accounts.getCurrentMember(request);
    const viewData = {
      title: "Assessments Dashboard",
      firstname: loggedInMember.firstname,
      lastname: loggedInMember.lastname,
      assessments: assessmentsStore.getMemberAssessments(loggedInMember.id),
      BMI: assessmentsStore.calculateBMI(loggedInMember.id),
    };
    logger.info("about to render", assessmentsStore.getAllAssessments());
    response.render("dashboard", viewData);
  },

  deleteAssessment(request, response) {
    const assessmentId = request.params.id;
    logger.debug(`Deleting Playlist ${assessmentId}`);
    assessmentsStore.removeAssessment(assessmentId);
    response.redirect("/dashboard");
  },

  addAssessment(request, response) {
    const loggedInMember = accounts.getCurrentMember(request);
    const newAssessment = {
      id: uuid.v1(),
      memberid: loggedInMember.id,
      title: request.body.title,
      weight: request.body.weight,
      chest: request.body.chest,
      thigh: request.body.thigh,
      upperArm: request.body.upperArm,
      waist: request.body.waist,
      hips: request.body.hips,
      date: Date.now(),

    };
    logger.debug("Creating a new Assessment", newAssessment);
    assessmentsStore.addAssessment(newAssessment);
    response.redirect("/dashboard");
  },


};

module.exports = dashboard;
