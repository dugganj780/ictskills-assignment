"use strict";

const accounts = require("./accounts.js");
const logger = require("../utils/logger");
const assessmentsStore = require("../models/assessments-store");
const memberStore = require("../models/member-store")
const uuid = require("uuid");

const trainerdashboard = {
  index(request, response) {
    logger.info("trainer dashboard rendering");
    const loggedInMember = accounts.getCurrentMember(request);

    const viewData = {
      title: "Trainer Dashboard",
      firstname: loggedInMember.firstname,
      lastname: loggedInMember.lastname,
      members: memberStore.getAllMembers(),

    };
    logger.info("about to render ", assessmentsStore.getAllAssessments());
    response.render("trainerdashboard", viewData);
  },


  deleteMember(request, response) {
    const memberId = request.params.id;

    logger.debug(`Deleting Member ${memberId}`);
    assessmentsStore.removeAllMemberAssessments(memberId);
    memberStore.removeMember(memberId);
    response.redirect("/trainerdashboard");
  },

};

module.exports = trainerdashboard;
