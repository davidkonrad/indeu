'use strict';

angular.module('indeuApp')
	.directive('eventParticipants', function($timeout, $compile, Utils, Login, ESPBA, Lookup) {

	return {
		templateUrl: "views/inc/inc.eventParticipants.html",
		restrict: 'A',
		replace: true,
		scope: {
			eventParticipants: '@'
		},
		link: function(scope, element, attrs) {

			function process(par) {
				var user_id = Login.isLoggedIn() ? Login.currentUser().id : false;
				var userParticipate = false;
				var p1 = [];
				var maybe_participants = 0;
				par.forEach(function(p) {
					p.feedback = parseInt(p.feedback);
					var u = Lookup.getUser(p.user_id);
					p.full_name = u.signature_str;
					p.urlLink = u.url; 
					switch (p.feedback) {
						case 1:
							maybe_participants = maybe_participants +1;
							break;

						case 2: 
							if (p.user_id == user_id) {
								userParticipate = true; 
								p.isUser = true;
								p1.unshift(p);
							} else {
								p1.push(p);
							}
							break;
						
						default: break;
					}

					$timeout(function() {
						console.log(maybe_participants);
						if (maybe_participants>0) {
							scope.maybe_participants = (maybe_participants==1) ? 'En anden deltager måske' : maybe_participants+' andre deltager måske'
						}
					})
				})

				scope.participants = p1;
				scope.sep = '';
				if (p1.length <= 0) {
					scope.message = 'Ingen har endnu tilkendegivet at deltage';
				}
				if (userParticipate) {
					if (p1.length == 1) {
						scope.message = 'Du deltager.';
					} 
					if (p1.length == 2) {
						scope.message = 'Du og';
					} 
					if (p1.length == 3) {
						scope.message = 'Du samt';
						scope.sep = ' og ';
					} 
					if (p1.length > 3) {
						scope.message = 'Du samt';
						scope.sep = ', ';
					} 
				}	else {
					if (p1.length == 2) {
						scope.sep = ' og ';
					} 
				}
			}

			attrs.$observe('eventParticipants', function() {
				scope.message = undefined;
				var id = attrs['eventParticipants'];
				if (id == '') return;
				ESPBA.get('event_user_feedback', { event_id: id }).then(function(p) {
					process(p.data)
				})
			});

		}

	}
});



