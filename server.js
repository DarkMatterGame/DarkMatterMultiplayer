//Another test comment
//Test comment #3

//*********************************************************//
//DARK MATTER MULTIPLAYER SERVER COMPONENT
//*********//
//LIAM OSLER
//LIAMOSLER.COM
//MARCH 2019
//*********************************************************//
//Math functions:
//Converts from degrees to radians, return number
Math.radians = function(degrees) {return degrees * Math.PI / 180;};
//Converts from radians to degrees, return number
Math.degrees = function(radians) {return radians * 180 / Math.PI;};
//Calculates Deps, return x axis distance between points
function deps(azimuth, distance){return distance*Math.sin(Math.radians(azimuth));}
//Calculates Lats, return y axis distance between points
function lats(azimuth, distance){return distance*Math.cos(Math.radians(azimuth));}
//Coordinate Inversion, return distance between two points
function inverse(x1, y1, x2, y2){return Math.sqrt((Math.pow(x2-x1,2))+(Math.pow(y2-y1, 2)));}
//Azimuth between two points:
function azCalc(x1, y1, x2, y2){
	var ang = Math.degrees(Math.atan2((y2-y1),(x2-x1)));
	if (x2>=x1){
		if(y2<=y1){return 90+ang;}
		else{return 90+ang;}
		}
	if (x2<=x1){
		if(y2>=y1){return 90+ang;}
		else{return 450+ang;}
		}
	}
//Calculate dirty math angle between two cartesian points	
function mathAng(x1, y1, x2, y2){return Math.atan2((y2-y1),(x2-x1));}
//Decimal Degrees --> ##° ##' ##" DMS conversion with spaces, text
function dms(dd){
	if (dd>360){dd=dd%360;}
	if (dd<0){dd=360+(dd%360);}
	var deg = Math.floor(dd);
	var min = Math.floor((dd-Math.floor(dd))*60);
	var sec = Math.floor((((dd-Math.floor(dd))*60)-Math.floor((dd-Math.floor(dd))*60))*60);
	return deg + '° ' + min + "' ";	
	}
//Calculates volume of sphere given radius:
function sphereVol(radius){return (4/3)*(Math.PI*(Math.pow(radius, 3)));}
//*********************************************************//

console.log("DARK MATTER Server started");

//Node and socket related variable calls:
	var express = require('express');
	var app = express();
	//localhost:3000
	var server = app.listen(3000);
	app.use(express.static('public'));
	var socket = require('socket.io');
	var io = socket(server);

//Variable keeping track of whether server is running, initializing, etc:
	var serverState = {
		initializing: false,
		running: true
	}

//Player related physics/position functions:
	//Object containing players connected to server's stats:
	var serverPlayers = {
		pin: [],
		id: [],
		posX: [],
		posY: []
	}
	//Splice player from serverPlayers (triggered on disconnection):
	function serverPlayerRemove(i){
		serverPlayers.pin.splice(i,1);
		serverPlayers.id.splice(i,1);
		serverPlayers.posX.splice(i,1);
		serverPlayers.posY.splice(i,1);
	}

//Asteroid related physics/position functions:
	//Initialize array of asteroids:
	var serverAsteroids= {
		id: [],
		type:[],
		posX : [],
		posY : [],
		dispX: [],
		dispY: [],
		rotateX: [],
		rotateY: [],
		velX : [],
		velY : [],
		accX: [],
		accY:[],
		f: [],
		fX: [],
		fY: [],
		mass : [],
		radius: [],
		stat: [],
		collision: [],
		timer: []
	}
	//Remove item from serverAsteroids at given index (i):
	function serverAsteroidSplice(i){
		serverAsteroids.id.splice(i,1);
		serverAsteroids.type.splice(i,1);
		serverAsteroids.posX.splice(i,1);
		serverAsteroids.posY.splice(i,1);
		serverAsteroids.dispX.splice(i,1);
		serverAsteroids.dispY.splice(i,1);
		serverAsteroids.rotateX.splice(i,1);
		serverAsteroids.rotateY.splice(i,1);
		serverAsteroids.velX.splice(i,1);
		serverAsteroids.velY.splice(i,1);
		serverAsteroids.accX.splice(i,1);
		serverAsteroids.accY.splice(i,1);
		serverAsteroids.f.splice(i,1);
		serverAsteroids.fX.splice(i,1);
		serverAsteroids.fY.splice(i,1);
		serverAsteroids.mass.splice(i,1);
		serverAsteroids.radius.splice(i,1);
		serverAsteroids.stat.splice(i,1);
		serverAsteroids.collision.splice(i,1);
		serverAsteroids.timer.splice(i,1);
	}
	//Initialize array of asteroids:
	function iniatilizeserverAsteroids(){
		//populate asteroid array:
		for (var i = 0; i<100; i++){
			serverAsteroids.id    [i] = i;
			serverAsteroids.posX  [i] = (Math.random(i)*5000)+1000;
			serverAsteroids.posY  [i] = (Math.random(i)*5000)+1000; 
			serverAsteroids.velX  [i] = 0;
			serverAsteroids.velY  [i] = 0;
			serverAsteroids.radius[i] = (Math.random()*50)+20;
			serverAsteroids.fX    [i] = 0;
			serverAsteroids.fY    [i] = 0;
			serverAsteroids.stat  [i] = -1;
			serverAsteroids.timer [i] = 0;
			serverAsteroids.mass  [i] = sphereVol(serverAsteroids.radius[i])/10000;
		}
	}
	//Asteroid physics gravity calculation:
	function gravityCalcserverAsteroids(){
		var sumForceX;
		var	sumForceY;
		var dist, az, force, forceX, forceY;
		
		for (i = 0; i<serverAsteroids.id.length; i++){
			sumForceX = 0;
			sumForceY = 0;
			
			for (j = 0; j<serverAsteroids.id.length; j++){		
				if (i==j){
				}			
				else{				
					dist = inverse(serverAsteroids.posX[i], serverAsteroids.posY[i], serverAsteroids.posX[j], serverAsteroids.posY[j]);
					az = azCalc(serverAsteroids.posX[i], serverAsteroids.posY[i], serverAsteroids.posX[j], serverAsteroids.posY[j]);
					force = (serverAsteroids.mass[i]*serverAsteroids.mass[j])/(Math.pow(dist,2));
					forceX = deps(az, force);
					forceY = lats(az, force);
					
					sumForceX += forceX;
					sumForceY += forceY;			
				}
				
				serverAsteroids.fX[i] = sumForceX;
				serverAsteroids.fY[i] = sumForceY;
			}
				
		}
	}
	//Position increment (absolute xy positions in map space: 
	function positionsIncserverAsteroids(){
		for (i = 0; i<serverAsteroids.id.length; i++){
			serverAsteroids.posX[i]=serverAsteroids.posX[i]+serverAsteroids.velX[i];
			serverAsteroids.posY[i]=serverAsteroids.posY[i]+serverAsteroids.velY[i];
			}
	}
	//Velocity increment:
	function velocityIncserverAsteroids(){
		for (i = 0; i<serverAsteroids.id.length; i++){
			serverAsteroids.velX[i] = serverAsteroids.velX[i] +serverAsteroids.accX[i];
		    serverAsteroids.velY[i] = serverAsteroids.velY[i] +serverAsteroids.accY[i];
		}
	}
	//Calculate acceleration:
	function accelerationIncserverAsteroids(){
		for (i = 0; i<serverAsteroids.id.length; i++){
			serverAsteroids.accX[i] = (serverAsteroids.fX[i]/serverAsteroids.mass[i]);
			serverAsteroids.accY[i] = (serverAsteroids.fY[i]/serverAsteroids.mass[i]);
			}
	}
	//Calculate acceleration:
	function collisionDetectionserverAsteroids(){
		var v1, v2, m1, m2, moveAng1, moveAng2, contAng, v1X, v1Y, v2X, v2Y;
		var blackholeid;
		var blackholestatus = false;
		for (i = 0; i<serverAsteroids.id.length; i++){

			for (j = 0; j<serverAsteroids.id.length; j++){	
					if(i==j){
					}
					else{					
						var dist = inverse(serverAsteroids.posX[i], serverAsteroids.posY[i], serverAsteroids.posX[j], serverAsteroids.posY[j]);
						var az = azCalc(serverAsteroids.posX[i], serverAsteroids.posY[i], serverAsteroids.posX[j], serverAsteroids.posY[j]);
						
						m1= serverAsteroids.mass[i];
						m2= serverAsteroids.mass[j];
						v1 = Math.sqrt((Math.pow(serverAsteroids.velX[i], 2))+(Math.pow(serverAsteroids.velY[i], 2)));
						v2 = Math.sqrt((Math.pow(serverAsteroids.velX[j], 2))+(Math.pow(serverAsteroids.velY[j], 2)));
					
						if (dist<=serverAsteroids.radius[i]+serverAsteroids.radius[j]){
							serverAsteroids.collision[i] = true; serverAsteroids.collision[j]= true;
							moveAng1 = mathAng(serverAsteroids.posX[i],serverAsteroids.posY[i],serverAsteroids.posX[i]+serverAsteroids.velX[i],serverAsteroids.posY[i]+serverAsteroids.velY[i]);
							moveAng2 = mathAng(serverAsteroids.posX[j],serverAsteroids.posY[j],serverAsteroids.posX[j]+serverAsteroids.velX[j],serverAsteroids.posY[j]+serverAsteroids.velY[j]);
							contAng = (mathAng(serverAsteroids.posX[i],serverAsteroids.posY[i], serverAsteroids.posX[j],serverAsteroids.posY[j]));
							v1X =((((v1*(Math.cos(moveAng1-contAng))*(m1-m2))+(2*m2*v2*Math.cos(moveAng2-contAng)))/(m1+m2))*(Math.cos(contAng)))+(v1*(Math.sin(moveAng1-contAng))*(Math.sin(contAng)));
							v1Y =((((v1*(Math.cos(moveAng1-contAng))*(m1-m2))+(2*m2*v2*Math.cos(moveAng2-contAng)))/(m1+m2))*(Math.sin(contAng)))+(v1*(Math.sin(moveAng1-contAng))*(Math.cos(contAng)));
							v2X =((((v2*(Math.cos(moveAng2-contAng))*(m1-m2))+(2*m1*v1*Math.cos(moveAng1-contAng)))/(m2+m1))*(Math.cos(contAng)))+(v2*(Math.sin(moveAng2-contAng))*(Math.sin(contAng)));
							v2Y =((((v2*(Math.cos(moveAng2-contAng))*(m1-m2))+(2*m1*v1*Math.cos(moveAng1-contAng)))/(m2+m1))*(Math.sin(contAng)))+(v2*(Math.sin(moveAng2-contAng))*(Math.cos(contAng)));
							serverAsteroids.accX[i] = 0;
							serverAsteroids.accY[i] = 0;
							serverAsteroids.accX[j] = 0;
							serverAsteroids.accY[j] = 0;	
		
							
							serverAsteroids.velX[i] = v1X*0.1;
							serverAsteroids.velY[i] = v1Y*0.1;
							serverAsteroids.velX[j] = v2X*0.1;
							serverAsteroids.velY[j] = v2Y*0.1;		
							}	

							
	 					if(dist+1<serverAsteroids.radius[i]+serverAsteroids.radius[j]){
							serverAsteroids.posX[j] = serverAsteroids.posX[i]+deps(az, serverAsteroids.radius[i]+serverAsteroids.radius[j]);
							serverAsteroids.posY[j] = serverAsteroids.posY[i]-lats(az, serverAsteroids.radius[i]+serverAsteroids.radius[j]);		 
					}		
				}
				
				if(serverAsteroids.radius[i]>299){
					if(i==j){
							}
					else{	
						if(dist-700<serverAsteroids.radius[i]+serverserverAsteroidss.radius[j]){
							console.log("touch");
							c.fillStyle = "#FFF";
							c.beginPath();
							c.arc(serverAsteroids.dispX[i], serverAsteroids.dispY[i], serverAsteroids.radius[i]*mapScale, 0, Math.PI*2);
							c.closePath();
							c.fill();
							serverAsteroidsSplice(j);
						}
					}
				}	
			}	
		}
	}

//On new connection:
	io.on('connection', function(socket){
		console.log('New client connected: ' +socket.id); 
		//Add new clientPlayer.pin[] and clientPlayer.id[] to end of clienPlayer object arrays:
		serverPlayers.pin[serverPlayers.pin.length] = serverPlayers.pin.length;
		serverPlayers.id[serverPlayers.id.length] = socket.id;
		console.log("Clients connected: " +serverPlayers.pin.length);
		console.log("Connected id list: " +serverPlayers.id);
			/* 	socket.on('mouse', mouseMsg);
				function mouseMsg(data){
					socket.broadcast.emit('mouse', data);
					//io.sockets.emit('mouse', data);
					//console.log(data);
				} */
		
		//On client disconnection/window close:
		socket.on('disconnecting', function(){
			//Scan through clientPlayer:
			for( var i=0; i<serverPlayers.pin.length; i++){
				//Check if socket id matches clientPlayer's id
				if(socket.id.localeCompare(serverPlayers.id[i])==0){
					serverPlayerRemove(i);
					console.log("Client: " + socket.id + " disconnected.");
				}
			}
			console.log('Client Disconnect'); 
		});
	})

//Time variable:
	var t =0;


//Repeating function called ever 25 milliseconds: 
	setInterval(function () {
		if (serverPlayers.pin.length<1){
			serverState.initializing=false;
			serverState.running = false;
			t = 0;
			//console.log("No players connected");
		}
		if (serverPlayers.id.length==1 && serverState.initializing==false){
			console.log("First player connected, initializing server");
			serverState.initializing=true;
			serverState.running = true;
			iniatilizeserverAsteroids();
			console.log(serverAsteroids);
		}	
		if(serverState.running==true){	
			
			collisionDetectionserverAsteroids();
			gravityCalcserverAsteroids();
			accelerationIncserverAsteroids();
			velocityIncserverAsteroids();
			positionsIncserverAsteroids()
		
			io.sockets.emit('clientList', serverPlayers);
			io.sockets.emit('asteroidList', serverAsteroids);
			
			//console.log('Sending serverPlayers to clients (emiting clientList socket)');	
			//console.log('Sending serverAsteroids to clients (emiting asteroidList socket)');
			
			//Log server time, if server is running (t>1):
			//Increase server timer:
			t+=1;
		}
	}, 25); 
