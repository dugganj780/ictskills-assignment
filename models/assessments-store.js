"use strict";

const _ = require("lodash");
const JsonStore = require("./json-store");
const accounts = require("../controllers/accounts");
const memberStore = require("../models/member-store");
const dashboard = require("../controllers/dashboard");


const assessmentsStore = {
  store: new JsonStore("./models/assessments-store.json", {
    assessmentsCollection: []
  }),
  collection: "assessmentsCollection",

  getAllAssessments() {
    return this.store.findAll(this.collection);
  },

  getAssessment(id) {
    return this.store.findOneBy(this.collection, { id: id });
  },

  getLatestAssessment(memberid){
    const assessments = this.store.findBy(this.collection, { memberid: memberid });
    return assessments[assessments.length-1];
  },

  getMemberAssessments(memberid) {
    return this.store.findBy(this.collection, { memberid: memberid });
  },

  addAssessment(assessment) {
    this.store.add(this.collection, assessment);
    this.store.save();
  },

  removeAssessment(id) {
    const assessment = this.getAssessment(id);
    this.store.remove(this.collection, assessment);
    this.store.save();
  },

  removeAllMemberAssessments(memberid) {
    const member = memberStore.getMemberById(memberid)
    const assessments = this.store.findAll(this.collection);

    let i;
    for( i=0; i = assessments.length-1; i++){
      let assessment = assessments[i];
      if(assessment.memberid===member.id){
        this.store.remove(this.collection, assessment);
      }
    }
    this.store.save();
  },

  calculateBMI(memberid) {
    const loggedInMember = memberStore.getMemberById(memberid);

    let latestWeight = undefined;

    if (assessmentsStore.getMemberAssessments(memberid).length < 0){
      latestWeight = this.getLatestAssessment(memberid).weight;
    }



    const height = loggedInMember.height;
    let BMI = undefined;

    if(latestWeight==undefined) {
      BMI = (loggedInMember.startingweight) / ((height / 100) * (height / 100));
    }
    else
    {
      BMI = (latestWeight) / ((height / 100) * (height / 100));
    }
    return BMI;
  },

  orderAssessmentsByDate(memberid){
    let assessments;


    if (assessmentsStore.getMemberAssessments(memberid).length>=1){
      assessments = assessmentsStore.getMemberAssessments(memberid);
      assessments = assessments.reverse();





      if(assessments.length > 1){
        var i;
        for (i = 1; i < assessments.length - 1; i++ ){
          if (assessments[i].weight > assessments[i-1].weight){
            assessments[i-1].trend = true;
          }
          else{assessments[i-1].trend = false;}
        }
        if(assessments[assessments.length - 1].weight < memberStore.getMemberById(memberid).startingweight){
          assessments[assessments.length - 1].trend = true;
        }
        else{assessments[assessments.length - 1].trend = false}
      }
      else if (assessments.length == 1){
        if(assessments[0].weight < memberStore.getMemberById(memberid).startingweight) {
          assessments[0].trend = true;
        }
        else{
          assessments[0].trend = false;
        }
      }

      assessmentsStore.store.save();
    }
    else{assessments = undefined;}

    return assessments;
  }


};

module.exports = assessmentsStore;
