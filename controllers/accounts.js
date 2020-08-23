"use strict";

const memberstore = require("../models/member-store");
const logger = require("../utils/logger");
const uuid = require("uuid");

const accounts = {
  index(request, response) {
    const viewData = {
      title: "Login or Signup"
    };
    response.render("index", viewData);
  },

  login(request, response) {
    const viewData = {
      title: "Login to the Service"
    };
    response.render("login", viewData);
  },

  logout(request, response) {
    response.cookie("assessment", "");
    response.redirect("/");
  },

  signup(request, response) {
    const viewData = {
      title: "Login to the Service"
    };
    response.render("signup", viewData);
  },

  update(request, response){

    const viewData = {
      title: "Update Your Account",
      };
    response.render("updatesettings", viewData);
  },

  register(request, response) {
    const member = request.body;
    member.startingBMI = Math.round((member.startingweight) / ((member.height / 100) * (member.height / 100))*100)/100;
    member.id = uuid.v1();
    member.isTrainer = false;
    memberstore.addMember(member);
    logger.info(`registering ${member.email}`);
    response.redirect("/");
  },

  authenticate(request, response) {
    const member = memberstore.getMemberByEmail(request.body.email);
    if (member && member.isTrainer == false) {
      response.cookie("assessment", member.email);
      logger.info(`logging in ${member.email} and ${member.BMI}`);
      response.redirect("/dashboard");
    } else if(member && member.isTrainer){
      response.cookie("assessment", member.email);
      logger.info(`logging in ${member.email}`);
      response.redirect("/trainerdashboard");
    } else {
      response.redirect("/login");
    }
  },

  getCurrentMember(request) {
    const memberEmail = request.cookies.assessment;
    return memberstore.getMemberByEmail(memberEmail);
  },

  updateAccount(request, response) {
    /*const loggedInMember = memberstore.getMemberById(memberid);

    let firstname;
    let lastname;
    let address;
    let startingweight;
    let height;

    loggedInMember.firstname = firstname;
    loggedInMember.lastname = lastname;
    loggedInMember.address = address;
    loggedInMember.startingweight = startingweight;
    loggedInMember.height = height;
    loggedInMember.startingBMI = Math.round((startingweight) / ((height / 100) * (height / 100))*100)/100;


    response.redirect("/dashboard");*/
    const member = accounts.getCurrentMember(request);

    let firstname = request.body.firstname;
    let lastname = request.body.lastname;
    let address = request.body.address;
    let startingweight = parseFloat(request.body.startingweight);
    let height = parseFloat(request.body.height);


    member.firstname = firstname;
    member.lastname = lastname;
    member.address = address;
    member.startingweight = startingweight;
    member.height = height;
    member.startingBMI = Math.round((startingweight) / ((height / 100) * (height / 100)) * 100) / 100;;

    memberstore.store.save();

    response.redirect("/dashboard");
  }
};

module.exports = accounts;
