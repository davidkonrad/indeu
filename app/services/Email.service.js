'use strict';

angular.module('indeuApp').factory('Email', function($q) {

	return {

		//send email confirmation email
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
			})
		},

		//send user created and accepted email
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
			})
		},

		//send issue solved email
		issueSolved: function(email, full_name, issue_title, issue_id) {
			var body = 'Hej '+full_name+",<br><br>";
			body += 'Dit issue <a href="https://indeu.org/issues/se/'+issue_id+'" target=_blank>'+issue_title+'</a> er markeret som løst.';
			body += '<br><br>';
			body += 'Håber problemet er løst tilfredsstillende. Du er velkommen til at genåbne issuet eller oprette et nyt hvis du er uenig. ';
			body += '<br><br>';
			body += 'Bemærk: Denne mail kan ikke besvares. '+"<br><br>";
			body += 'med venlig hilsen'+"<br>"+'indeu.org';

			$.ajax({
				url: '/api/email.php',
				type: 'post',
				data: { 
					email: email,
					subject: 'Dit issue er blevet løst',	
					body: body
				}	
			}).done(function(response) {
			})
		}
			

	}

});

