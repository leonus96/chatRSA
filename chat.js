'use strict';

const express = require('express'),
 app = express(),
 http = require('http').createServer(app),
 io = require('socket.io')(http),
 port = process.env.PORT || 3011,
 math = require('mathjs'),
 publicDir = express.static(`${__dirname}/public`);

app
    .use(publicDir)
    .get('/', (req, res, next) =>{
        res.sendFile(`${publicDir}/index.html`);
    });

http.listen(port, ()=> console.log(`Chat RSA corriendo en el puerto http://localhost:${port}`));

let numUsers = 0;
let keyA;
let keyB;

io.on('connection', socket=>{ //conexion para un usuario:

	// cuando un usuario ingresa:
	socket.on('login', username =>{
		if(numUsers > 1){
			console.log('No pasa');
			return;
		}
		console.log("Pasó");

		socket.username = username;
		++numUsers;

		//Cuando es el primer usuario
		if(numUsers < 2){
			socket.emit('wait', "Esperando al otro usuario...")
		}
		//Cuando es el segundo usuario
		if(numUsers == 2){
			socket.broadcast.emit('diffie hellman');
		}	
	});

	socket.on('diffie hellman connect', (diffieKey)=>{
		console.log('diffie hellman connect');
		socket.broadcast.emit('diffie hellman get', diffieKey);
	});

	socket.on('diffie hellman response', (data)=>{
		keyA = data.keyGeneral;
		socket.broadcast.emit('diffie hellman set', data.A);
	});

	socket.on('diffie hellman finish', (keyBData)=>{
		keyB = keyBData;
		console.log(keyB);
		if(math.equal(keyA, keyB)){
			socket.broadcast.emit('autenticado', "Usuarios autenticados");
		}else{
			socket.emit('intruso', "Usuarios intrusos!");
		}
	});

	socket.on('loginRSA', usernameData =>{
		console.log('loginRSA');
		var dataKey ={
			n: usernameData.n,
			e: usernameData.e
		};
		socket.broadcast.emit('connect init', dataKey);
	});

	socket.on('connect response', (dataKey)=>{
		socket.broadcast.emit('finish connect', dataKey);
	});

	//cuando el usuario envia un mensaje
    socket.on('new message', crypt => {
		/*for(var i = 0; i < crypt.length; i++){
			console.log(crypt[i].value);
		}*/
    	let message = {
    		crypt: crypt,
			username: socket.username
		}
        socket.broadcast.emit('user says', message);
    });

    //Cuando el usuario se desconecta:
    socket.on('disconnect', ()=>{
        console.log('Ha salido un usuario del chat');
        socket.broadcast.emit('bye bye user', {
            message: 'Ha salido un usuario del chat'
        });
        numUsers--;
    });
});


