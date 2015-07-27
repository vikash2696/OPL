/**
 * @author vikash
 */
var model = require('../model/adminmodel');
//var connection = require('../connection');
var path = require('path');	
var fs = require('fs');

exports.playerList = function(req, res) {
	model.listdata(req,res);
};

exports.teamList = function(req, res) {
	model.listTeam(req,res);
};

exports.login = function(req, res) {
	res.render('admin/login', {
		title : '',
		errors: '',
	})
};

exports.loginuser = function(req, res) {
    req.assert('email', 'A valid email is required').isEmail();  
    req.assert('password', 'Password is required').notEmpty();
    
    var errors = req.validationErrors();  
    console.log(errors);
    if( !errors){   //No errors were found.  Passed Validation! 
        model.login(req.body,res);
    }
    else {   //Display errors to user
    	model.loginErr(req.body,res,errors);
    }
  
};

exports.teamAdd = function(req, res) {
	model.listAllPlayer(req,res);
		
};
exports.teamAddData = function(req, res) { 
    model.addTeamData(req.body,res);
};
exports.teamPlayer = function(req, res) {
	model.teamPlayer(req.params,res);
};


exports.addRuns = function(req, res) {
	model.addRuns(req.params,res);
};
