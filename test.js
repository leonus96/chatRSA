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