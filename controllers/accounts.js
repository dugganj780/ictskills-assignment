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

  register(request, response) {
    const member = request.body;
    member.startingBMI = Math.round((member.startingweight) / ((member.height / 100) * (member.height / 100))*100)/100;
    member.id = uuid.v1();
    memberstore.addMember(member);
    logger.info(`registering ${member.email}`);
    response.redirect("/");
  },

  authenticate(request, response) {
    const member = memberstore.getMemberByEmail(request.body.email);
    if (member) {
      response.cookie("assessment", member.email);
      logger.info(`logging in ${member.email} and ${member.BMI}`);
      response.redirect("/dashboard");
    } else {
      response.redirect("/login");
    }
  },

  getCurrentMember(request) {
    const memberEmail = request.cookies.assessment;
    return memberstore.getMemberByEmail(memberEmail);
  }
};

module.exports = accounts;
