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
				par.forEach(function(p) {
					p.feedback = parseInt(p.feedback);
					p.full_name = Lookup.getUser(p.user_id).full_name;
					p.urlName = Utils.urlName(p.full_name);
					p.urlLink = Utils.isLocalHost() 
						? '#/medlemmer/'+p.user_id+'/'+p.urlName
						: '/medlemmer/'+p.user_id+'/'+p.urlName;

					switch (p.feedback) {
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
				
				$timeout(function() {
					//$compile(angular.element(element).contents())(scope);
					//console.log('eventParticipants $ompile instead of ');
					//scope.$apply()
	        //$compile(element)(scope);
				})
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



