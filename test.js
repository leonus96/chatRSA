/**
 * Created by joseph on 18/07/17.
 */

console.log(sieveOfErathosthenesRandom(1000, 9999));

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


function getDiffieHellman(a, g, p){
	var A = exp(p, g, a);
	return A;
}


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