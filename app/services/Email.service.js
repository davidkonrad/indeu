'use strict';

angular.module('indeuApp').factory('Email', function($q) {

	return {

		requestConfirmation: function(email, full_name, hash) {
		
			var body = 'Hej '+full_name+"<br><br>";
			body += 'Tak for din oprettelse på indeu.org!'+"<br><br>";
			body += 'Besøg <a href="https://indeu.org/confirm/'+hash+'">https://indeu.org/confirm/'+hash+'</a> for at bekræfte din emailadresse.'+"<br><br>";
			body += 'Du vil snarest modtage en email med bekræftelse på at oprettelsen er gennemført.'+ "<br><br>";
			body += 'med venlig hilsen'+"<br>"+'indeu.org';

			$.ajax({
				url: '/api/email.php',
				type: 'post',
				data: { 
					email: email,
					subject: 'Bekræft email',	
					body: body
				}	
			}).done(function(response) {
				//console.log(response)
			})
		},

		requestAccepted: function(email, full_name, hash) {
			var body = 'Hej '+full_name+"<br><br>";
			body += 'Din medlemsoprettelse på indeu.org er fuldført.'+"<br><br>";
			body += 'Log ind med '+"<br><br>";
			body += email+"<br>";
			body += hash+"<br><br>";
			body += 'Du kan ændre passwordet når du er logget ind. '+"<br><br>";
			body += 'med venlig hilsen'+"<br>"+'indeu.org';

			$.ajax({
				url: '/api/email.php',
				type: 'post',
				data: { 
					email: email,
					subject: 'Bruger er oprettet',	
					body: body
				}	
			}).done(function(response) {
				//console.log(response)
			})
		}

	}

});

