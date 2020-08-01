"use strict";

const logger = require("../utils/logger");
const assessmentsStore = require("../models/assessments-store");
const uuid = require("uuid");

const assessment = {
  index(request, response) {
    const assessmentId = request.params.id;
    logger.debug("Assessment id = ", assessmentId);
    const viewData = {
      title: "Assessment",
      assessment: assessmentsStore.getAssessment(assessmentId)
    };
    response.render("playlist", viewData);
  },

};

module.exports = assessment;
