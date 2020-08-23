"use strict";

const accounts = require("./accounts.js");
const logger = require("../utils/logger");
const assessmentsStore = require("../models/assessments-store");
const goalsStore = require("../models/goals-store");
const memberStore = require("../models/member-store")
const uuid = require("uuid");

const dashboard = {
  index(request, response) {
    logger.info("dashboard rendering");
    const loggedInMember = accounts.getCurrentMember(request);
    const assessments = assessmentsStore.orderAssessmentsByDate(loggedInMember.id);
    const lastestGoal = goalsStore.getLatestGoal(loggedInMember.id);



    const viewData = {
      title: "Assessments Dashboard",
      firstname: loggedInMember.firstname,
      lastname: loggedInMember.lastname,
      assessments: assessments,
      latestGoal: lastestGoal,

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
      BMI: dashboard.calculateBMI(loggedInMember.id),
      BMIcategory: dashboard.BMIcategory(loggedInMember.id),
      isIdealBodyWeight: dashboard.isIdealBodyWeight(loggedInMember.id)
    };
    logger.info("about to render render", assessmentsStore.orderAssessmentsByDate(loggedInMember.id));
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
      weight: parseFloat(request.body.weight),
      chest: parseFloat(request.body.chest),
      thigh: parseFloat(request.body.thigh),
      upperArm: parseFloat(request.body.upperArm),
      waist: parseFloat(request.body.waist),
      hips: parseFloat(request.body.hips),
      date: new Date(),
      BMI: Math.round((request.body.weight) / ((loggedInMember.height / 100) * (loggedInMember.height / 100))*100)/100,

    };
    logger.debug("Creating a new Assessment", newAssessment);
    assessmentsStore.addAssessment(newAssessment);

    let dd = newAssessment.date.getDate();
    if(dd >=1 && dd <= 9){
      dd = "0"+ dd;
    }

    let mm = newAssessment.date.getMonth()+1;
    if(mm >=1 && mm <= 9){
      mm = "0"+ mm;
    }

    const yyyy = newAssessment.date.getFullYear();
    newAssessment.yyyymmdd = dd + "/" + mm + "/" + yyyy;
    newAssessment.time  = newAssessment.date.getHours() + ":" + newAssessment.date.getMinutes() + ":" + newAssessment.date.getSeconds();

    //newAssessment.trend = dashboard.trend(loggedInMember.id);

    assessmentsStore.store.save();
    response.redirect("/dashboard");
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
    const currentBMI = dashboard.calculateBMI(loggedInMember.id);

    let category;
    if(currentBMI<18.5){category="UNDERWEIGHT";}
    if((currentBMI>=18.5)&&(currentBMI<=24.9)){category="HEALTHY WEIGHT RANGE";}
    if((currentBMI>=25)&&(currentBMI<=29.9)){category="OVERWEIGHT";}
    if((currentBMI>=30)&&(currentBMI<=39.9)){category="OBESE";}
    if(currentBMI>=40){category="VERY SEVERELY OBESE";}
    return category;
  },

  isIdealBodyWeight(memberid){
    let isIdealBodyWeight = false;
    const loggedInMember = memberStore.getMemberById(memberid);
    const heightInInches = loggedInMember.height * 0.393701;
    const heightRemainder = heightInInches - 60;
    let latestWeight;
    let idealBodyWeight;

    if(assessmentsStore.getMemberAssessments(memberid).length>0){
    latestWeight = assessmentsStore.getLatestAssessment(memberid).weight;}
    else{latestWeight = loggedInMember.startingweight;}


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

  /*trend(memberid){
    let trend = false;
    let assessments = assessmentsStore.orderAssessmentsByDate(memberid);
    const member = memberStore.getMemberById(memberid);

    if (assessments.length>1) {
      if(assessments[assessments.length - 2].weight > assessments[assessments.length - 1].weight){
      trend = true;
      }
    } else if (assessments.length=1){
      if(member.startingweight > assessments[assessments.length - 1].weight){
        trend = true;
      }
    } else {assessments = undefined;}
    return trend;
  },

  /*reorderTrends(memberid){
    let assessments = assessmentsStore.orderAssessmentsByDate(memberid)
  }*/

};

module.exports = dashboard;
