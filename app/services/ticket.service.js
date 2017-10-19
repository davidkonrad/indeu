
angular.module('indeuApp')
  .factory('TicketService', ['$cookies', function($cookies) {

		var cookieName = 'indeuTicket';
		var	pass = 	"&login=davidkonrad&password=nhmdzm";

		return {

			get: function() {
				var ticket = $cookies.get(cookieName)
				if (!ticket) {
					$.get('http://services.kortforsyningen.dk/service?service=META&request=GetTicket'+pass, function(newTicket) {
						ticket = newTicket
						var expireDate = new Date()
						expireDate.setDate(expireDate.getDate() + 1);
						$cookies.put(cookieName, ticket, { expires: expireDate } )
						return ticket
					})
				} else {
					return ticket
				}
			}

		}


	}]);


