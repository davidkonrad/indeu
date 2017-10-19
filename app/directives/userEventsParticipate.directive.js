'use strict';

angular.module('indeuApp')
	.directive('userEventsParticipate', function($timeout, Utils, Lookup, ESPBA) {

	return {
		templateUrl: "views/inc/inc.userEventsParticipate.html",
		restrict: 'A',
		transclude: true,
		scope: {
			userEventsParticipate: '@'
		},
		replace: true,
		link: function(scope, element, attrs) {
			attrs.$observe('userEventsParticipate', function(user_id) {
				var user = attrs['userEventsParticipate'];
				if (typeof user == 'string' && user.length>0) user = JSON.parse(user);
				if (!user || !user.id) return;
				ESPBA.prepared('UserEventsParticipate', { user_id: user.id }).then(function(e) {
					var now = new Date().valueOf();
					var events = e.data.filter(function(item) {
						return new Date(item.date).valueOf() >= now
					})
					events.forEach(function(item) {
						item.urlName = Utils.urlName(item.name);
						item.urlLink = Utils.isLocalHost() 
							? '#/event/'+item.event_id+'/'+item.urlName
							: '/event/'+item.event_id+'/'+item.urlName;
					})
					scope.events = events;
//------------
					scope.calEvents = e.data.map(function(event) {
						return {
							title: event.name,
							date: new Date(event.date),
							event_id: event.id,
							color: '#257e4a'
						}
					});
					scope.eventSources = { events: scope.calEvents };

				});
			});
			//scope.eventSources = { events: scope.calEvents };


			scope.uiConfig = {
				calendar:{
					axisFormat: 'HH:mm',
	        height: 'auto',
	        editable: false,
					displayEventTime: false,
			    defaultView: 'agendaFourDay',
					views: {
		        agendaFourDay: {
	            type: 'agenda',
	            duration: { days: 3 },
	            buttonText: '4 day',

							allDaySlot: false,
							allDayText: 'all-day',
							slotDuration: '02:00:00',
							minTime: '06:00:00',
							maxTime: '24:00:00',
							slotEventOverlap: true,
							columnFormat: 'DD/MM',
					}
		    },
				header: {
					left: '',
					center: '',
					right: 'prev,next'
				},
					/*
	        eventDrop: $scope.alertOnDrop,
	        eventResize: $scope.alertOnResize,
	        eventRender: $scope.eventRender,
					eventSources: $scope.eventSources,
	        eventClick: $scope.eventClick,
					dayClick: $scope.dayClick
					*/
				}
			};

		}
	}
});

