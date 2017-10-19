'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
  .controller('KalenderForsideCtrl', function($scope, $location, Login, $timeout, leafletData, ESPBA, Lookup, Meta, Utils, Const) {

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
			name: '123',
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

		ESPBA.prepared('RecentEvents', recentParams).then(function(r) {
			$scope.eventMap.markers = [];
			r.data.forEach(function(e) {
				var lat = parseFloat(e.lat);
				var lng = parseFloat(e.lng);
				if (lat && lng) {
					$scope.eventMap.markers.push({
						lat: lat,
						lng: lng,
						icon: iconBlue
					});
				}
			});
			//console.log('recentEvents', r);
		});

		ESPBA.get('event', params).then(function(e) {
			$scope.events = [];
			e.data.forEach(function(event) {
				$scope.events.push({
					title: event.name,
					date: new Date(event.date),
					event_id: event.id,
					color: '#257e4a'
				});
			});
			$scope.eventSources = { events: $scope.events };

			$scope.uiConfig = {
				calendar:{
	        height: 'auto',
	        editable: false,
					displayEventTime: false,
					header:{
						center: 'title',
						right:   'prev,next'
					},
	        eventDrop: $scope.alertOnDrop,
	        eventResize: $scope.alertOnResize,
	        eventRender: $scope.eventRender,
					eventSources: $scope.eventSources,
	        eventClick: $scope.eventClick,
					dayClick: $scope.dayClick
				}
			};
		});

		$scope.eventClick = function(indeuEvent, element, constructor) {
			//var path = Utils.isLocalHost() ? '/event/' : '/event/';
			var path = '/event/';
			path += indeuEvent.event_id +'/';
			path += Utils.urlName(indeuEvent.title);
			$location.path(path);
		}

		$scope.dayClick = function(date) {
			alert('ok')
		}

		$scope.eventRender = function(indeuEvent, element, constructor) {
			//indeuEvent.className.push('text-danger');
			//console.log(indeuEvent);
			//console.log(element);
			$(element).addClass('text-muted');
			//console.log($(element))
		}

		function init() {
		}

		Lookup.init().then(function() {
			init();
		});


});
