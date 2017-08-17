(function (d, io) {
    'use strict';
	var io = io(),
		chatForm = d.querySelector('#chat-form'),
		messageText = d.querySelector('#message-text'),
		buttonEnviar = d.querySelector('#buttonEnviar'),
		chat = d.querySelector('#chat'),
		nBox = d.querySelector('#n'),
		eBox = d.querySelector('#e'),
		dBox = d.querySelector('#d'),
		nPublicBox = d.querySelector('#nPublic'),
		ePublicBox = d.querySelector('#ePublic'),
		keysMe,
		publicKey,
		//variables Diffie-Hellman:
		gDiffie = 5,
		pDiffie = 23,
		contactDiffie;

	//Desabilitamos el chat:
	messageText.disabled = true;
	buttonEnviar.disabled = true


    //Pedimos el username:
	var username = prompt('Ingresa tu nombre');
	var keyDiffie = prompt('Ingresa un número secreto');
	if(username != null && username != "") {
		//Generamos claves:
		chat.insertAdjacentHTML('beforeend', '<li class="avisos">Diffie Hellman:</li>');

		keysMe = getKeys();

		nBox.innerHTML = keysMe.n.toString();
		eBox.innerHTML = keysMe.e.toString();
		dBox.innerHTML = keysMe.d.toString();

		io.emit('login', username);

	}

	io.on('wait', function(message){
		chat.insertAdjacentHTML('beforeend', '<li class="avisos"> ' + message + '</li>');
	});

	io.on('diffie hellman', function(){
		var B = getDiffieHellman(keyDiffie, gDiffie, pDiffie);
		chat.insertAdjacentHTML('beforeend', '<li class="avisos"> enviando B: ' + B + '</li>');
		io.emit('diffie hellman connect', B);
	});

	io.on('diffie hellman get', function(diffieKey){
		console.log(diffieKey);
		contactDiffie = getDiffieHellman(keyDiffie, diffieKey, pDiffie);		
		var data = {
			keyGeneral: contactDiffie,
			A: getDiffieHellman(keyDiffie, gDiffie, pDiffie)
		}
			
		chat.insertAdjacentHTML('beforeend', '<li class="avisos"> enviando A: ' + data.A + '</li>');
		io.emit('diffie hellman response', data);

	});

	io.on('diffie hellman set', function(diffieKey){
		console.log(diffieKey);
		contactDiffie = getDiffieHellman(keyDiffie, diffieKey, pDiffie);
		io.emit('diffie hellman finish', contactDiffie);

	})

	io.on('autenticado', function(message){
		chat.insertAdjacentHTML('beforeend', '<li class="avisos"> ' + message + '</li>');
		console.log('loginRSA');
		var usernameData = {
			username: username,
			n: math.bignumber(keysMe.n.toString()),
			e: math.bignumber(keysMe.e.toString()),
		};
		io.emit('loginRSA', usernameData);
	});

	io.on('intruso', function(message){
		chat.insertAdjacentHTML('beforeend', '<li class="avisos"> ' + message + '</li>');
		alert("sal de chat!!!!");
		alert("sal de chat!!!!");
		alert("sal de chat!!!!");

	});

	io.on('connect init', function (dataKey) {
		publicKey = {
			n: math.bignumber(dataKey.n.value + ""),
			e: math.bignumber(dataKey.e.value + "")
		};
		chat.insertAdjacentHTML('beforeend', '<li class="avisos"> ' + "Otro usuario conectándose..." + '</li>');
		chat.insertAdjacentHTML('beforeend', '<li class="avisos"> ' + "Llegó la clave pública (n, e)..." + '</li>');

		console.log("--- Llegó la llave pública ---");
		console.log("- n (publica): " + publicKey.n.toString());
		console.log("- e (publica): " + publicKey.e.toString());

		nPublicBox.innerHTML = publicKey.n.toString();
		ePublicBox.innerHTML = publicKey.e.toString();

		console.log('- Enviando tu llave pública...')
		chat.insertAdjacentHTML('beforeend', '<li class="avisos"> ' + "Enviando tu clave (n, e)..." + '</li>');
		io.emit('connect response', {
			n: keysMe.n,
			e: keysMe.e
		});
		chat.insertAdjacentHTML('beforeend', '<li class="avisos"> ' + "Listo para chatear!" + '</li>');

		messageText.disabled = false;
		buttonEnviar.disabled = false;
		console.log('Listo para chatear');


	});

	io.on('finish connect', function (dataKey) {
		publicKey = {
			n: math.bignumber(dataKey.n.value + ""),
			e: math.bignumber(dataKey.e.value + "")
		}
		console.log("--- Llegó la llave pública ---");

		chat.insertAdjacentHTML('beforeend', '<li class="avisos"> ' + "Llegó la clave pública (n, e)..." + '</li>');

		nPublicBox.innerHTML = publicKey.n.toString();
		ePublicBox.innerHTML = publicKey.e.toString();

		console.log("- n (publica): " + publicKey.n.toString());
		console.log("- e (publica): " + publicKey.e.toString());
		chat.insertAdjacentHTML('beforeend', '<li class="avisos"> ' + "Listo para chatear!" + '</li>');
		console.log('Listo para chatear');
		messageText.disabled = false;
		buttonEnviar.disabled = false;
	})


	//Cuando el usuario envía un mensaje
    chatForm.onsubmit = function (e) {
        e.preventDefault();
        console.log('--- Encriptando mensaje ---')
		var crypt = encrypt(messageText.value, publicKey.n, publicKey.e);
		//Enviamos el mensaje al servidor:
        io.emit('new message', crypt);
		chat.insertAdjacentHTML('beforeend', '<li class="avisos"> Mensaje encriptado: ' + crypt + '</li>');
		chat.insertAdjacentHTML('beforeend', '<li class="local"><span class="author">Yo</span> <span class="message">' + messageText.value + '</span></li>');
        messageText.value = null;
        return false;
    }

	//LLega un mensaje del otro usuario:
    io.on('user says', function (message) {
    	//Desencriptamos antes de mostrar:
		var crypt = [];
		for(var i = 0; i < message.crypt.length; i++){
			crypt.push(math.bignumber(message.crypt[i].value + ""));
		}

		var uncrypt = decrypt(crypt, keysMe.n, keysMe.d);

		console.log('Texto desencriptado: ' + uncrypt);
		chat.insertAdjacentHTML('beforeend', '<li class="avisos"> Mensaje encriptado: ' + crypt + '</li>');
        chat.insertAdjacentHTML('beforeend', '<li class="remote"><span class="author">' + message.username + '</span> <span class="message">' + uncrypt + '</span></li>');
    });



    io.on('bye bye user', function (byeByeUser) {
        console.log(byeByeUser.message);
        messageText.disabled = true;
        buttonEnviar.disabled = true;
        publicKey = null;

		chat.insertAdjacentHTML('beforeend', '<li class="avisos"> Usuario desconectado, esperando a el otro usuario.. </li>');
    });


})(document, io);

//Algoritmos para el RSA:

//exponenciacion:
function exp(n, a, k){
	k = (k >>> 0);
	k = k.toString(2);
	let b = 1;
	if(k == 0)
		return b;
	let A = a;
	if(k[k.length - 1] == "1"){
		b = a;
	}
	for(let i = 1; i < k.length; ++i){
		A = math.mod(math.pow(A, 2), n);
		if(k[k.length - 1 - i] == "1"){
			b = math.mod(math.multiply(A, b), n);
		}
	}
	return b;
}

// Diffie-Hellman:


function getDiffieHellman(a, g, p){
	var A = exp(p, g, a);
	return A;
}

//euclides:
function gcd(a, b) {
    var r = math.bignumber('0');
    while (math.compare(b, 0) != 0) {
        r = math.mod(a, b);
        a = b;
        b = r;
    }
    return a;
}
//euclides extendido:
function gcdEx(N, A){
	var x = math.bignumber('1');
	var y =  math.bignumber('0');
	var x1 = math.bignumber('0');
	var x2 = math.bignumber('1');
	var y1 = math.bignumber('1');
	var y2 = math.bignumber('0');

	//console.log(x.toString());

	var n = N;
	var a = A;
	var d = a;
	var r;
	var q;
	//console.log(math.compare(n, 0) == 1);
	while (math.compare(n, 0) == 1) {
		q = math.floor(math.divide(a, n));
		r = math.subtract(a, math.multiply(q, n));
		x = math.subtract(x2, math.multiply(q, x1));
		y = math.subtract(y2, math.multiply(q, y1));
		a = n;
		n = r;
		x2 = x1;
		x1 = x;
		y2 = y1;
		y1 = y;
		d = a;
		x = x2;
		y = y2;
	}

	while (math.compare(x, 0) == -1) {
		x = math.add(x, N);
	}
	return x.toString();
}

function getKeys(){
	console.log("--- Generando claves ---")
	var p = sieveOfErathosthenesRandom(1000, 9999), q;
	do{
		q = sieveOfErathosthenesRandom(1000, 9999);
	}while(p == q);
	p = math.bignumber(p + "");
	q = math.bignumber(q + "");
	var n = math.multiply(p, q),
		fi = math.multiply(math.subtract(p, 1), math.subtract(q, 1)),
		e = math.bignumber('1');

	console.log("- n: " + n.toString());
	console.log("- p: " + p.toString());
	console.log("- q: " + q.toString());
	console.log("- fi: " + fi.toString());
	//TODO: implementar random
	while(math.compare(e, fi) == -1){
		e = math.add(e, 1);
		if(math.equal(gcd(e, fi), 1)) break;
	}
	//e = math.bignumber('13');
	console.log("- e :" + e.toString());
	var d = math.bignumber('0');
	if(math.equal(gcd(e, fi), 1)){
		d = math.add(d, gcdEx(fi, e));
	}
	console.log('- d:' + d.toString());


	return {
		n: n,
		e: e,
		d: d
	}
}

function encrypt(m, n, e) {
	console.log("encryp(" + m + ", " + n.toString() + ", " + e.toString() + ")");
	console.log(" - Pasamos el mensaje a ASCII-96:")
	var ascii = [];
	for(var i = 0; i < m.length; ++i){
		ascii.push(m.charCodeAt(i));
	}
	console.log('  - Códigos ascii: ' + ascii);
	console.log(' - Dividimos el código en pares:')

	var pares = [];
	for(var i = 0; i < ascii.length; i = i+2){

		var x;
		x = ascii[i];
		if(ascii[i] >= 100){
			x = x - 90;
		}
		x = x + "";

		var y;
		if(i + 1 >= ascii.length){
			y = "32";
		}else{
			y = ascii[i + 1]
			if(ascii[i + 1] >= 100){
				y = y - 90;
			}
			y = y + "";
		}
		pares.push(math.bignumber(x + y));

	}
	for(var i  = 0; i < pares.length; ++i){
		console.log("  -" + pares[i].toString());
	}

	console.log(' - Convertimos codigos con RSA:')
	var c = [];
	for(var i = 0; i < pares.length; ++i){
		c.push(exp(n, pares[i], e));
	}

	for(var i = 0; i < c.length; i++){
		console.log('  - ' + c[i].toString())
	}

	return c;
}

function decrypt(c, n, d) {
	var pares = [];
	for(var i = 0; i < c.length; ++i){
		pares.push(exp(n, c[i], d));
	}
	for(var i = 0; i < pares.length; ++i){
		console.log(pares[i].toString());
	}
	var ascii = []
	for(var i = 0; i < pares.length; ++i){
		ascii.push(parseInt(pares[i].toString().substring(0, 2)));
		ascii.push(parseInt(pares[i].toString().substring(2)));
	}
	for(var i = 0; i < ascii.length; ++i){
	 console.log(ascii[i]);
	}
	var m = "";
	for(var i = 0; i < ascii.length; ++i){
		if(ascii[i] < 32){
			m = m + String.fromCharCode(ascii[i] + 90);
		}else{
			m = m + String.fromCharCode(ascii[i]);
		}
	}

	return m;
}


function sieveOfErathosthenesRandom(min, max) {
	var flags = [];
	var primes = [];
	var prime = 2;

	var n = max;
	while(n--) {
		flags[max-n] = true;
	}

	for (prime = 2; prime < Math.sqrt(max); prime++) {
		if (flags[prime]) {
			for (var j = prime + prime; j < max; j += prime) {
				flags[j] = false;
			}
		}
	}

	for (var i = 2; i < max; i++) {
		if (flags[i]) {
			if(i >= min)
				primes.push(i);
		}
	}

	var random =Math.floor(Math.random() * primes.length);

	return primes[random];
}