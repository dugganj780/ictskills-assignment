"use strict";

const accounts = require("./accounts.js");
const logger = require("../utils/logger");
const goalsStore = require("../models/goals-store");
const assessmentsStore = require("../models/assessments-store");
const memberStore = require("../models/member-store")
const uuid = require("uuid");

const goals = {
  index(request, response) {
    logger.info("goals page rendering");
    const loggedInMember = accounts.getCurrentMember(request);
    const goals = goalsStore.orderGoalsByDate(loggedInMember.id);



    const viewData = {
      title: "Goals",
      firstname: loggedInMember.firstname,
      lastname: loggedInMember.lastname,
      goals: goals
    };
    logger.info("about to render", goalsStore.orderGoalsByDate(loggedInMember.id));
    response.render("goals", viewData);
  },

  deleteGoal(request, response) {
    const goalId = request.params.id;
    logger.debug(`Deleting Goal ${goalId}`);
    goalsStore.removeGoal(goalId);
    response.redirect("/goals");
  },

  addGoal(request, response) {
    const loggedInMember = accounts.getCurrentMember(request);
    const newGoal = {
      id: uuid.v1(),
      memberid: loggedInMember.id,
      weight: parseFloat(request.body.weight),
      status: "Open",
      isOpen: true,
      achieved: false,
      missed: false,
      yyyymmdd: request.body.yyyymmdd,

    };
    logger.debug("Creating a new Goal", newGoal);
    goalsStore.addGoal(newGoal);

    let status;
    let assessments = assessmentsStore.getMemberAssessments(loggedInMember.id);

    var i;
    for(i = 0; i === assessments.length-1; i++){
      if (newGoal.yyyymdd === assessments[i].yyyymmdd){
        if(newGoal.weight === assessments[i].weight){
          status = "Achieved!";
          newGoal.isOpen = false;
          newGoal.achieved = true;
          newGoal.missed = false;
        }
        else{
          status = "Missed";
          newGoal.isOpen = false;
          newGoal.achieved = false;
          newGoal.missed = true;
        }
      }
      else{
        status = "Open";
        newGoal.isOpen = true;
        newGoal.achieved = false;
        newGoal.missed = false;
      }

      newGoal.status = status;
      goalsStore.store.save();
    }
    response.redirect("/goals");
  }

};

module.exports = goals;