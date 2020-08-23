"use strict";

const _ = require("lodash");
const JsonStore = require("./json-store");
const accounts = require("../controllers/accounts");
const memberStore = require("../models/member-store");
const assessmentsStore = require("../models/assessments-store");
const dashboard = require("../controllers/dashboard");


const goalsStore = {
  store: new JsonStore("./models/goals-store.json", {
    goalsCollection: []
  }),
  collection: "goalsCollection",

  getAllGoals() {
    return this.store.findAll(this.collection);
  },

  getGoal(id) {
    return this.store.findOneBy(this.collection, { id: id });
  },

  getLatestGoal(memberid){
    const goals = this.store.findBy(this.collection, { memberid: memberid });
    return goals[goals.length-1];
  },

  getMemberGoals(memberid) {
    return this.store.findBy(this.collection, { memberid: memberid });
  },

  addGoal(goal) {
    this.store.add(this.collection, goal);
    this.store.save();
  },

  removeGoal(id) {
    const goal = this.getGoal(id);
    this.store.remove(this.collection, goal);
    this.store.save();
  },

  removeAllMemberGoals(memberid) {
    const member = memberStore.getMemberById(memberid)
    const goals = this.store.findAll(this.collection);

    let i;
    for( i=0; i = goals.length-1; i++){
      let goal = goals[i];
      if(goal.memberid===member.id){
        this.store.remove(this.collection, goal);
      }
    }
    this.store.save();
  },

  orderGoalsByDate(memberid){
    let goals;


    if (goalsStore.getMemberGoals(memberid).length>=1){
      goals = goalsStore.getMemberGoals(memberid);
      goals = goals.reverse();

      let assessments = assessmentsStore.getMemberAssessments(memberid);

      var i;
      var j;
      for(i = 0; i === assessments.length-1; i++){
        for(j = 0; j === goals.length-1; j++)
          if (goals[j].yyyymmdd == assessments[i].yyyymmdd && goals[j].weight === assessments[i].weight){
              goals[j].status = "Achieved!";
              goals[j].isOpen = false;
              goals[j].achieved = true;
              goals[j].missed = false;
            }
            else if (goals[j].yyyymmdd == assessments[i].yyyymmdd && goals[j].weight !== assessments[i].weight){
              goals[j].status = "Missed";
              goals[j].isOpen = false;
              goals[j].achieved = false;
              goals[j].missed = true;
            }
            else{
            goals[j].status = "Open";
            goals[j].isOpen = true;
            goals[j].achieved = false;
            goals[j].missed = false;
          }
        goalsStore.store.save();
      }
    }
    else{goals = undefined;}

    return goals;
  }


};

module.exports = goalsStore;
