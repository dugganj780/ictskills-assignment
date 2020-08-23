"use strict";

const accounts = require("./accounts.js");
const logger = require("../utils/logger");
const assessmentsStore = require("../models/assessments-store");
const memberStore = require("../models/member-store")
const goalsStore = require("../models/goals-store");
const uuid = require("uuid");

const trainerview = {
  index(request, response) {
    logger.info("trainer view rendering");
    const memberId = request.params.id;
    const member = memberStore.getMemberById(memberId)



    const viewData = {
      title: "Trainer View",
      firstname: member.firstname,
      lastname: member.lastname,
      assessments: assessmentsStore.getMemberAssessments(member.id),
      memberId: memberId,
      //BMIpresent: false,
      //BMI: assessmentsStore.getLatestAssessment(loggedInMember.id).BMI,
      //startingBMI: loggedInMember.startingBMI,
      //BMI: assessmentsStore.calculateBMI(loggedInMember.id),
      /*BMI: function() {
        let BMI;
        if (assessmentsStore.getMemberAssessments(loggedInMember).length===0){BMI = loggedInMember.startingBMI;}
        else{BMI = assessmentsStore.getLatestAssessment(loggedInMember.id).BMI}
        return BMI;
      }*/
      BMI: trainerview.calculateBMI(member.id),
      BMIcategory: trainerview.BMIcategory(member.id),
      isIdealBodyWeight: trainerview.isIdealBodyWeight(member.id)
    };
    logger.info("about to render", assessmentsStore.getAllAssessments());
    response.render("trainerview", viewData);
  },



  deleteAssessment(request, response) {
    const assessmentId = request.params.id;
    logger.debug(`Deleting Assessment ${assessmentId}`);
    assessmentsStore.removeAssessment(assessmentId);
    response.redirect("/trainerview");
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
      comment: undefined,

    };
    logger.debug("Creating a new Assessment", newAssessment);
    assessmentsStore.addAssessment(newAssessment);
    response.redirect("/trainerview");
  },

  calculateBMI(memberid) {
    const loggedInMember = memberStore.getMemberById(memberid);

    let BMI;
    if (assessmentsStore.getMemberAssessments(loggedInMember.id).length===0){BMI = loggedInMember.startingBMI;}
    else{BMI = assessmentsStore.getLatestAssessment(loggedInMember.id).BMI}
    return BMI;
  },

  BMIcategory(memberid){
    const loggedInMember = memberStore.getMemberById(memberid);
    const currentBMI = trainerview.calculateBMI(loggedInMember.id);

    let category;
    if(currentBMI<18.5){category="UNDERWEIGHT";}
    if((currentBMI>=18.5)&&(currentBMI<=24.9)){category="HEALTHY WEIGHT RANGE";}
    if((currentBMI>=25)&&(currentBMI<=29.9)){category="OVERWEIGHT";}
    if((currentBMI>=30)&&(currentBMI<=39.9)){category="OBESE";}
    if(currentBMI>=40){category="VERY SEVERELY OBESE";}
    return category;
  },

  isIdealBodyWeight(memberid){
    const loggedInMember = memberStore.getMemberById(memberid);

    const heightInInches = loggedInMember.height * 0.393701;
    const heightRemainder = heightInInches - 60;

    let latestWeight;

    if(assessmentsStore.getMemberAssessments(memberid).length<0){
      latestWeight = assessmentsStore.getLatestAssessment(memberid).weight;}
    else{latestWeight = loggedInMember.startingweight;}

    let isIdealBodyWeight = false;

    let idealBodyWeight;
    if (heightRemainder<=0){
      idealBodyWeight = 45.5;
    }
    else{
      idealBodyWeight = 45.5 + (heightRemainder * 2.3);
    }

    if (latestWeight <= idealBodyWeight + 0.2 && latestWeight >= idealBodyWeight - 0.2) {
      isIdealBodyWeight = true;
    }
    return  isIdealBodyWeight;
  },

  addComment(request, response){
    const assessmentId = request.params.id;
    const comment = request.body.comment;
    const assessment = assessmentsStore.getAssessment(assessmentId);
    const memberId = assessment.memberid;

    assessment.comment = comment;

    assessmentsStore.store.save();

    response.redirect("/trainerview/"+memberId);
  },

  addGoal(request, response) {
    const memberId = request.params.id;
    const loggedInMember = memberStore.getMemberById(memberId);
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
    response.redirect("/trainerview/"+newGoal.memberid);
  }



};

module.exports = trainerview;
