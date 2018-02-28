'use strict';

/*
	render out a raw list of events as a series of boxes
	intended to be used by forside, gruppe, forening, medlem
	rely on article.css
*/
angular.module('indeuApp')
	.directive('eventsBoxList', function(Utils) {

	return {
		templateUrl: "views/inc/inc.eventsBoxList.html",
		restrict: 'E',
		scope: {
			events: '@',
			orderBy: '@',
			limitTo: '@'
		},
		link: function(scope, element, attrs) {

			attrs.$observe('events', function(newVal) {
				if (!newVal) return;
				var events = JSON.parse(newVal);
				var now = new Date();
				events.forEach(function(item) {
					item.url = Utils.eventUrl(item.id, item.name);
					item.when = Utils.calendarDate(item.date);
					item.whenFrom = Utils.removeSecs(item.from);
					item.where = item.place_name ? item.place_name : item.address;
					item.dateExact = new Date(item.date+' '+item.from);
					item.dateDue = item.dateExact >= now;
					item.showDate = moment(item.date).format('dddd D MMMM, YYYY');

					if (item.feedback2>0) {
						item.feedback2Text = item.feedback2 + ' ';
						item.feedback2Text += item.feedback2>1 ? 'tilmeldinger. ' : 'tilmeldt. '
					}
					if (item.feedback1>0) {
						item.feedback1Text = item.feedback1 + ' ';
						if (item.feedback2Text) item.feedback1Text += item.feedback1>1 ? 'andre ' : 'anden ';
						item.feedback1Text += 'deltager måske. ';
					}

				})
				scope.events = events;
			})

		}
	}

});

