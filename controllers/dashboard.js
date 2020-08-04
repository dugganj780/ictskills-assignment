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
      //BMIpresent: false,
      //BMI: assessmentsStore.getLatestAssessment(loggedInMember.id).BMI,
      //startingBMI: loggedInMember.startingBMI,
      //BMI: assessmentsStore.calculateBMI(loggedInMember.id),
      BMI: function() {
        let BMI;
        if (assessmentsStore.getMemberAssessments(loggedInMember).length==0){BMI = loggedInMember.startingBMI;}
        else{BMI = assessmentsStore.getLatestAssessment(loggedInMember.id).BMI}
        return BMI;
      }
    };
    logger.info("about to render render", assessmentsStore.getAllAssessments());
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
      BMI: Math.round((request.body.weight) / ((loggedInMember.height / 100) * (loggedInMember.height / 100))*100)/100,
      BMIpresent: true,

    };
    logger.debug("Creating a new Assessment", newAssessment);
    assessmentsStore.addAssessment(newAssessment);
    response.redirect("/dashboard");
  },

  calculateBMI(memberid) {
    const latestWeight = assessmentsStore.getLatestAssessment(memberid).weight;
    const height = accounts.getCurrentMember(memberid).height;

    if(latestWeight==undefined) {
      let BMI = (loggedInMember.startingweight) / ((height / 100) * (height / 100));
    }
    else
    {
      let BMI = (latestWeight) / ((height / 100) * (height / 100));
    }
    return BMI;
  },

};

module.exports = dashboard;
