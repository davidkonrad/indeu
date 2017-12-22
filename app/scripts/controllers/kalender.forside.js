'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
  .controller('KalenderForsideCtrl', function($scope, $location, Login, $timeout, leafletData, ESPBA, Lookup, Meta, Utils, Const, uiCalendarConfig) {

		ESPBA.get('user', {}).then(function(r) {
			console.log(r);
		})

		Lookup.init();

		Meta.setTitle('indeu.org');
		Meta.setTitle('Kalender');
		Meta.setDescription('Kalender');

		var recentParams = {};
		if (Login.isLoggedIn()) {
			$scope.isLoggedIn = true;
			recentParams.user_id = Login.currentUser().id
		} else {
			$scope.isLoggedIn = false;
		}

		var params = $scope.isLoggedIn ? {} : { visibility_level: 1 };		

		$scope.eventMap = Const.defaultMap();
		$scope.eventMap.center = {
			lat: 56.126627523318206, /*56.126627523318206*/
			lng: 11.697741782069204, /*11.457741782069204*/
			zoom: 6
		};
		$scope.eventMap.layers.baselayers.googleTerrain.visible = false;
		var def = $scope.eventMap.layers.baselayers;
		$scope.eventMap.layers.baselayers = {};
		$scope.eventMap.layers.baselayers.bw = {
			visible: true,
			name: 'Nedtonet sort / hvidt',
			type: 'xyz',
			maxZoom: 18,
			minZoom: 5,
			url: 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
			layerOptions: {
				subdomains: ['a', 'b', 'c'],
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				continuousWorld: true
			}
		}
		$.extend($scope.eventMap.layers.baselayers, def);

		var iconBlue = {
			iconUrl: 'assets/images/blue.png',
			iconSize: [15, 26],
			iconAnchor: [12, 21], 
			shadowAnchor: [4, 62], 
			popupAnchor: [-4, -20] 
		};
		var iconGreen = {
			iconUrl: 'assets/images/green.png',
			iconSize: [15, 26],
			iconAnchor: [12, 21], 
			shadowAnchor: [4, 62], 
			popupAnchor: [-4, -20] 
		};

		$scope.$on('leafletDirectiveMarker.click', function(e, args) {
			leafletData.getMap().then(function(map) {
				var center = $.extend( {}, args.leafletObject._latlng);
				center.zoom = map._zoom +1;
				$scope.eventMap.center = center;
			})
		});

		$scope.uiConfig = {
			calendar: {
				height: 'auto',
				editable: false,
				displayEventTime: false,
				header: {
					center: '',
					right: 'prev,next'
				},
				eventClick: $scope.eventClick,
				dayClick: $scope.dayClick,
				viewRender: function(view, element) {
					var params = { start_date: view.start.format("YYYY-MM-DD"), end_date: view.end.format("YYYY-MM-DD") };
					ESPBA.prepared('EventsByPeriod', params).then(function(r) {
						console.log(r.data);
						var events = [];
						$scope.eventMap.markers = [];
						r.data.forEach(function(e) {
							//markers
							var lat = parseFloat(e.lat);
							var lng = parseFloat(e.lng);
							if (lat && lng) {
								$scope.eventMap.markers.push({
									lat: lat,
									lng: lng,
									icon: iconBlue
								});
							}
							//calendar
							events.push({
								title: e.name,
								date: new Date(e.date),
								event_id: e.id,
								color: '#257e4a'
							})
						});

						$timeout(function() {
							uiCalendarConfig.calendars.calendar.fullCalendar('removeEvents');
							uiCalendarConfig.calendars.calendar.fullCalendar('addEventSource', events);
						})
					})
				}
			}
		}

		$scope.eventClick = function(indeuEvent, element, constructor) {
			//var path = Utils.isLocalHost() ? '/event/' : '/event/';
			var path = '/event/';
			path += indeuEvent.event_id +'/';
			path += Utils.urlName(indeuEvent.title);
			$location.path(path);
		}

		$scope.dayClick = function(date) {
			//alert('ok')
		}

});
