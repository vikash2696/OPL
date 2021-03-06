/**
 * @author vikash
 */

var connection = require('../connection');
var uuid = require('node-uuid');
var path = require('path');
var fs = require('fs');
/**
 * Call for fetch admin details from DB and validate admin
 */
exports.login = function(req,res) {
var queryString = 'SELECT * FROM admin';

connection.query(queryString, function(err, rows, fields) {

	if(req.email == rows[0].username && req.password == rows[0].password) {
		console.log("valid user");
		res.render('admin/dashboard', {
			title : rows,
			validAdmin : 'Yes'
		});
	}
	else {
		console.log("Invalid user");
		res.render('pages/index', {
			title : rows,
			validAdmin : 'No'
		});
	}
	});
	
};
/**
 * call after validation failed in admin login
 */
exports.loginErr = function(req,res,errors){
	res.render('pages/index', {
		title : errors,
		validAdmin : 'No'
	});
};
/**
 * Call for list of all player
 */
exports.listdata = function(req,res) {
	var queryString = 'SELECT * FROM player';
	connection.query(queryString, function(err, rows, fields) {
		res.render('admin/playingTeam', {
			team : rows
		});
	});
};

/**
 * Call for list of all team
 */
exports.listTeam = function(req,res) {
	
	
	var myDate = new Date();
	var matchDate = (myDate.getFullYear())+ '-' +(myDate.getMonth()+1)+ '-' +(myDate.getDate()) ;
	
	var match_info_query = connection.query('SELECT * FROM match_info where match_date >= "'+ matchDate +'" order by id desc limit 1');
	var playerid1 = [];
	var playerid2 = [];
	var team = [];
	var count = '';
	var team1_name = '';
	var team2_name = '';
	match_info_query .on('result', function(row) {
	 if(row=='' ){
			count = "null";
		}else{
			count = row;
		}
	  }).on('end', function() {
	 	var team1_player_query = connection.query("SELECT * FROM player where team_id = '"+ count.first_team +"'");
		team1_player_query .on('result', function(row) {
			  playerid1.push({"id":row.id,"name":row.first_name});
			  });
		
		var team2_player_query = connection.query("SELECT * FROM player where team_id = '"+ count.second_team +"'");
		team2_player_query .on('result', function(row) {
			  playerid2.push({"id":row.id,"name":row.first_name});
			 
			  });
		
		var team1_query = connection.query("SELECT team_name FROM team where id = '"+ count.first_team +"'");
		team1_query.on('result', function(row) {
			team1_name = row.team_name;
			  });
		
		var team2_query = connection.query("SELECT team_name FROM team where id = '"+ count.second_team +"'");
		team2_query.on('result', function(row) {
			team2_name = row.team_name;
			  });
		
		var team_query = connection.query("SELECT * FROM team");
		team_query .on('result', function(row) {
		team.push(row);
			}).on('end',function(){
			  res.render('admin/showSetting', {
					team : team, 
					matchId : count,
					newMatch : 'Yes',
					playerlist1 : playerid1,
					playerlist2 : playerid2,
					team1_name : team1_name,
					team2_name : team2_name
			});
		 });
		
		  // all rows have been received 
	  });
};
/**
 * Call for list all team and player on add team (Admin panel)
 */
exports.listAllPlayer = function(req,res) {

	var queryPlayer = 'SELECT * FROM player';
	var queryTeam = 'SELECT * FROM team';
	var result = {};
    var user_array = [];
    var assigned_user_array = [];
    var title_array = [];
	connection.query(queryPlayer, function(err, rowsp, fields) {
		for(var i=0; i < rowsp.length; i++) {
			if(rowsp[i].team_id == 0) {
				user_array.push(rowsp[i].id);
				user_array.push(rowsp[i].first_name);
			}
			else {
				assigned_user_array.push(rowsp[i].team_id);
				assigned_user_array.push(rowsp[i].id);
				assigned_user_array.push(rowsp[i].first_name);
			}
		}
		
	});
	
	connection.query(queryTeam, function(err, rowst, fields) {
		for(var i=0; i < rowst.length; i++) {
			title_array.push(rowst[i].id );
			title_array.push(rowst[i].team_name );
		}
	});
	setTimeout(function(){
		res.render('admin/addTeam', {
			player: user_array,
			team: title_array,
			assigned_player: assigned_user_array
		});
	},1000);
};
/**
 * call for fetch team member(player list for particular team)
 */
exports.teamPlayer = function(data,res) {
	
	var queryString  = "SELECT * from player WHERE team_id = '"+ data +"'";
	
	connection.query(queryString, function(err, rows, fields) {
		console.log(rows);
		res.render('admin/playerList', {
			player : rows,
			id : data,
			errors : ''
		});
//		res.send(rows);
	});
};

//save and update match setting
exports.saveMacthSetting = function(req,res) {
//	var myDate = " NOW();
//	console.log(myDate);
//	var matchDate = (myDate.getFullYear())+ '-' +(myDate.getMonth()+1)+ '-' +(myDate.getDate()) ;
	var uniqueId = '';
	var uuid = "select uuid() as record_id";
	connection.query(uuid, function(err, rows, fields) {
//		console.log("uid"+rows[0]['record_id']);
//		uniqueId.push(rows[0]['record_id']);
		uniqueId = rows[0]['record_id'];
	}).on('end',function(){
		  console.log("bbbbb"+uniqueId.record_id);
		  if(!req.match_id) {
				console.log("insert"+uniqueId);
				var queryString = "INSERT INTO match_info (id,first_team,second_team,total_over,over_limit,match_date) " +
						"values ('"+ uniqueId +"','"+ req.team1_name +"','"+ req.team2_name +"','"+ req.total_over +"','"+ req.over_limit +"',NOW());";
			}
			else {
				console.log("update");
				var queryString = "UPDATE match_info SET total_over ='"+ req.total_over +"' ,over_limit='"+ req.over_limit +"' ,first_team='"+ req.team1_name +"',second_team='"+ req.team2_name +"' where id = '"+ req.match_id +"'";
				console.log(queryString);
			}
			
			connection.query(queryString, function(err, rows, fields) {
				res.send(rows);
			});
	 });
	

};
//getmatchIdgetmatchSetting
exports.getmatchId = function(req,res) {
	var queryString = 'SELECT id FROM match_info order by id desc limit 1';
	connection.query(queryString, function(err, rows, fields) {
		res.render('admin/matchInfo', {
			matchId : rows
		});
	});
};




exports.addRuns = function(req,res) {
	console.log(req);
	var extraColumnName="",extraValue=0;
	if(req.extraruns=='0'){
			var queryString = "INSERT into ball " +
			  "(over_id,run,score,batsman_id,ball_id)" +
			  " values ('"+req.over+"','"+req.gainedruns+"','"+req.gainedruns+"','"+req.batsman_id+"','"+req.ball+"' )";
		}else{
			var score ;
			if(req.extratype == "wicket"){
				score = '0';
			}else{
				score =  parseInt(req.gainedruns)+1;
			}
			var queryString = "INSERT into ball " +
			  "(over_id,"+req.extratype+",run,score,batsman_id,ball_id)" +
			  " values ('"+req.over+"','1' ,'"+req.gainedruns+"','"+score+"','"+req.batsman_id+"','"+req.ball+"'  )";
		}

	connection.query(queryString, function(err, rows, fields) {
		res.send(req);
	});
	
};
exports.getTeamName = function(req,res) {
	var queryStringTeam = 'SELECT * FROM team';
	
	connection.query(queryStringTeam, function(err, rows, fields) {
		res.render('admin/playingTeam', {
			team : rows,
			matchId : '',
			newMatch : 'Yes'
		});
});
};
/**
 * fetch the player data for add team view
 */
exports.fetchPlayer = function(req,res) {

	var queryPlayer = 'SELECT * FROM player WHERE first_name like "%'+req.player_name+'%" and team_id = 0';
    var user_array = [];
	var abc = connection.query(queryPlayer, function(err, rowsp, fields) {
		for(var i=0; i < rowsp.length; i++) {
			user_array.push(rowsp[i].id);
			user_array.push(rowsp[i].first_name);
		}
		res.send(JSON.stringify(user_array));
	});
};

exports.assignPlayerToTeam = function(data,res) {
	var queryString = "UPDATE player SET team_id ='"+ data.team_id +"' where id = '"+ data.player_id +"'";
	connection.query(queryString);
};

exports.tournamentSetting = function(data,res) {
	var queryString = "SELECT * FROM tournament ";
	var tournament_year = [];
	var flag = 1;
	var current_year = new Date().getFullYear();
	connection.query(queryString, function(err, rowsp, fields) {
		for(var i=0; i < rowsp.length; i++) {
			tournament_year.push(rowsp[i].tournament_year);
			if(rowsp[i].tournament_year == current_year) {
				flag = 0;
			}
		}
		if(flag) {
			tournament_year.push(current_year);
		}
		res.render('admin/tournamentSetting', {
			tournamentYear : tournament_year,
		});
	});

};
exports.fetchSelectedYearData = function(data,res) {
	var where = '';
	if(typeof data.selected_year != "undefined"){
		where = " WHERE tournament_year = '"+data.selected_year+"'";
	}

	var queryString = "SELECT *, t.id as tournamentId FROM tournament as t LEFT JOIN team as te ON t.id=te.tournament_id "+where;
	var tournament_data = [];
	var flag = 1;
	var current_year = new Date().getFullYear();
	connection.query(queryString, function(err, rowsp, fields) {
		for(var i=0; i < rowsp.length; i++) {
			if(rowsp[i].tournament_year != current_year) {
				rowsp[i].edit = 0;
			}
		}
		//console.log(rowsp);
		res.render('admin/tournamentInfoTemplate', {
			selectedData : rowsp,
		});
	});

};

exports.saveTournamentData = function(data,res) {
	
	if((typeof data.tournament_id != "undefined") && (data.tournament_id != "")) {
		var queryStringTournament = "UPDATE tournament SET tournament_name = '"+data.tournament_name +"', tournament_year = '"+ new Date().getFullYear() +"', no_of_teams='"+ data.no_of_teams +"',max_number_of_players='"+ data.max_number_of_players +"' WHERE id='"+data.tournament_id+"'";
		var uniqueIdTournament = data.tournament_id;
	}
	else {
		var uniqueIdTournament = uuid.v1();
		var queryStringTournament = "INSERT INTO tournament values ('"+ uniqueIdTournament +"','"+ data.tournament_name +"','"+ new Date().getFullYear() +"','"+ data.no_of_teams +"','"+ data.max_number_of_players +"');";
	}
	var queryStringTeam = 'INSERT INTO team values ';
	var teamData = new Array();
	connection.query(queryStringTournament, function(err, rows, fields) {
		var queryStringTeamDelete = "DELETE FROM team where tournament_id='"+data.tournament_id+"'";
		connection.query(queryStringTeamDelete);
		for(var i = 1; i <= data.no_of_teams; i ++) {
			var uniqueIdTeam = uuid.v1();
			queryStringTeam += "('"+ uniqueIdTeam +"','"+ uniqueIdTournament +"','Team "+i+"','Captain "+i+"','','','',''),";
			teamData[i] = {
				team_id: uniqueIdTeam, 
				tournament_id: uniqueIdTournament, 
				team_name: "Team "+i,
				captain_name: "Captain "+i,
			};
		}
		teamData[parseInt(data.no_of_teams) + 1] = {isError : 0};
		if(data.no_of_teams >= 1) {
			connection.query(queryStringTeam.slice(0,-1), function(err, rows, fields) {
				res.send(teamData);
			});
		}
	});
};

exports.saveTeamData = function(data,res,upload) {
	console.log(data);
	for(var i = 0; i < data.total_rows; i ++) {
		var fileUpload = 0;
		if(typeof upload["logo_"+i] != "undefined") {
			var tempPath = upload["logo_"+i].path;
			var extension = path.extname(upload["logo_"+i].name);
			targetPath = path.resolve('./uploads/'+data["team_id_"+i]+extension);
			var ext = ['.gif','.png','.jpg','.jpeg'];
			for(var j = 0,len = ext.length; j < len; j ++) {
				if(fs.existsSync('./uploads/'+data["team_id_"+i]+ext[j])){
					fs.unlinkSync('./uploads/'+data["team_id_"+i]+ext[j]);
				}
			}
			fs.rename(tempPath, targetPath, function(err) {
			   if (err) throw err;
			});
			var fileUpload = 1;
		}
		if(fileUpload) {
			var queryString = "UPDATE team SET team_name = '"+data["team_name_"+i]+"',captain='"+data["captain_"+i]+"', logo='"+data["team_id_"+i]+extension+"' WHERE id='"+data["team_id_"+i]+"' AND tournament_id='"+data["tournament_id_"+i]+"'";
		}
		else {
			var queryString = "UPDATE team SET team_name = '"+data["team_name_"+i]+"',captain='"+data["captain_"+i]+"' WHERE id='"+data["team_id_"+i]+"' AND tournament_id='"+data["tournament_id_"+i]+"'";
		}
		connection.query(queryString);
	}
	res.send("");
};

//for playing 11 team select
exports.playing11Team = function(data,res) {
	console.log("modeldata"+data.player11_id[0]);
	for(var i =0; i <=data.player11_id.length; i++) {
		var queryString = "UPDATE player SET match_id ='"+ data.match_id +"' where id = '"+ data.player11_id[i] +"'";
		connection.query(queryString, function(err, rows, fields) {
			res.send(rows);
		});
	}
};

/* 
 * @author :jyoti
 * starting match setting*/

exports.startMatch = function(req,res) {
	var matchId,battingTeam,bowlerTeam;
	var playerid1 = [];
	var playerid2 = [];

	var queryString = 'SELECT id,first_team,second_team,toss_won,opt_for FROM match_info order by match_date desc limit 1';
	connection.query(queryString, function(err, rows, fields) {
		matchId = rows[0].id;
		if(rows[0].first_team == rows[0].toss_won) {
			if(rows[0].opt_for == "bat") {
				battingTeam = rows[0].first_team; 
			}
			else {
				battingTeam = rows[0].second_team;
			}
		}
		else {
			if(rows[0].opt_for == "ball") {
				battingTeam = rows[0].first_team; 
			}
			else {
				battingTeam = rows[0].second_team;
			}
		}
		bowlingTeam = (rows[0].first_team == battingTeam)? rows[0].second_team :rows[0].first_team;
		
	}).on('end',function(){
	var fetchbattingPlayerQuery = connection.query("SELECT id,first_name,last_name from player where match_id='"+matchId+"' and team_id ='"+battingTeam+"'");
	fetchbattingPlayerQuery .on('result', function(row) {
		  playerid1.push({"id":row.id,"name":row.first_name});
		  });
	
	var fetchbowlingQuery = connection.query("SELECT id,first_name,last_name from player where match_id='"+matchId+"' and team_id ='"+bowlingTeam+"'");
		fetchbowlingQuery.on('result', function(row) {
		  playerid2.push({"id":row.id,"name":row.first_name});
		 
		  }).on('end',function(){
				res.render('admin/startMatch', {
					matchId : matchId,
					battinglist : playerid1,
					bowlinglist : playerid2,
					battingTeam : battingTeam,
					bowlingTeam : bowlingTeam,
					
			});
			});
		 });
};

//Toss match
exports.tossMatch = function(req,res) {
	var myDate = new Date();
	var matchDate = (myDate.getFullYear())+ '-' +(myDate.getMonth()+1)+ '-' +(myDate.getDate()) ;
	
	 var team1, team2, team1name ,team2name ,match_id;
	var queryString = connection.query('SELECT * FROM match_info where match_date >= "'+ matchDate +'" order by id desc limit 1');
	queryString.on('result', function(row) {
	 team1 = row.first_team;
	 team2 = row.second_team;
	 match_id = row.id;
	  }).on('end',function(){
		  console.log(team1);
		  var queryString2 = connection.query("SELECT team_name FROM team where id='"+team1+"'");
			queryString2.on('result', function(row1) {
			 team1name = row1.team_name;
			 console.log("team1name"+row1.team_name);
		  });
			 var queryString3 = connection.query("SELECT team_name FROM team where id='"+team2+"'");
				queryString3.on('result', function(row2) {
				 team2name = row2.team_name;
				 console.log("team1name"+row2.team_name);
				 
				 
			  }).on('end',function(){
					res.render('admin/tossMatch', {
						team1Name : team1name,
						team2Name : team2name,
						team1 : team1,
						team2 : team2,
						match_id : match_id
				});
			  });
				
		});
};

//for toss update match info table
exports.tossUpdateData = function(data,res) {
		var queryString = "UPDATE match_info SET toss_won ='"+ data.toss_select +"',opt_for ='"+ data.opt_select +"' where id = '"+ data.match_id +"'";
		connection.query(queryString, function(err, rows, fields) {
			res.send(rows);
		});
};


exports.fetchPlayerForMatchModel = function(req,res){
	var bowlers_array = [];
	var batsman_array = [];
	var match_id = "";
	var tossWinningTeamId;
	var tossLossingTeamId;
	var batting_team_id = '';
	var bowling_team_id = '';
	var player_list = [];
	var queryForMatchInfo = connection.query("SELECT * FROM match_info ORDER BY match_date DESC LIMIT 1;");
 	queryForMatchInfo.on('result',function(rows){
 		match_id = rows.id;
 		tossWinningTeamId = rows.toss_won;
 		if(tossWinningTeamId!="" && rows.opt_for!=""){
 			if(rows.first_team == tossWinningTeamId){
 				tossLossingTeamId = rows.second_team;
 			}else{
 				tossLossingTeamId = rows.first_team;
 			}
 			if(rows.opt_for == 'bat'){
 				batting_team_id = tossWinningTeamId;
 				bowling_team_id = tossLossingTeamId;
 			}else if(rows.opt_for == 'bowl'){
 				bowling_team_id = tossWinningTeamId;
 				batting_team_id = tossLossingTeamId;
 			}
 		}else{
 			batting_team_id = rows.first_team;
 			bowling_team_id = rows.second_team;	
 		}		
 	}).on('end',function(){	
 		var queryForMatchPlayer = connection.query("SELECT * FROM player where match_id='"+match_id+"'");
		queryForMatchPlayer.on('result', function(rows) {			
				tempObj = {};
				if(rows.team_id == bowling_team_id){
					tempObj = {'name':rows.first_name , 'id' : rows.id}
					bowlers_array.push(tempObj);
				}else if(rows.team_id == batting_team_id){
					tempObj = {'name':rows.first_name , 'id' : rows.id}
					batsman_array.push(tempObj);
				}
		}).on('end',function(){
			res.render('admin/index', {
			  	bowlers_array : bowlers_array,
			  	batsman_array: batsman_array,
			});
		});	
 	});
};
