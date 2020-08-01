"use strict";

const _ = require("lodash");
const JsonStore = require("./json-store");
const accounts = require("./accounts.js");

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

  removeAllAssessments() {
    this.store.removeAll(this.collection);
    this.store.save();
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

module.exports = assessmentsStore;