const data = null;

const xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener('readystatechange', function () {
	if (this.readyState === this.DONE) {
		console.log(this.responseText);
	}
});

xhr.open('GET', 'https://air-quality-by-api-ninjas.p.rapidapi.com/v1/airquality?city=Seattle');
xhr.setRequestHeader('x-rapidapi-key', 'e39efddf8dmsh13864a298f2a67cp147cbfjsn2441b2a5341a');
xhr.setRequestHeader('x-rapidapi-host', 'air-quality-by-api-ninjas.p.rapidapi.com');

xhr.send(data);