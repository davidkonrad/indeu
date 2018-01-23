'use strict';

angular.module('indeuApp').factory('Settings', function($cookies, $rootScope, $timeout, Login, ESPBA) {

	//defaults
	var defaultSettings = {

		//show visited events also
		recentEventsShowVisited: true,

		//show visited articles also
		recentArticlesShowVisited: true,

		//show 5 reactions or all last 7 days
		recentReactionsShowAll: false,

		//search
		searchWithinEvents: true,
		searchWithinArticles: true,
		searchWithinBulletins: true,

		//group edit
		groupEditCollapse: [0,1]

	};

	var settings = undefined;
	var cookieName = 'indeu.settings';
	var scope = undefined;
	var scopes = [];

	return {
		
		init: function($scope) {
			scope = $scope;
			scopes.push($scope);
			this.load();
		},

		getExpireDate: function() {
			var expireDate = new Date();
			expireDate.setTime(expireDate.getTime()+(365*24*60*60*1000)); //one year
			return expireDate;
		},

		save: function() {
			$cookies.put(cookieName, JSON.stringify(settings), { expires: this.getExpireDate() } );
		},

		load: function() {
			var s = $cookies.get(cookieName);
			var self = this;

			try {
				s = JSON.parse(s);
			} catch(e) {
				s = undefined;
			}

			settings = (!s || typeof s != 'object') 
				? $.extend( {}, defaultSettings)
				: s;

			scope.Settings = settings;

			scope.$watch('Settings', function(newVal, oldVal) {
				//angularstrap/collapse.js return array with negative values upon deletion
				if (newVal.groupEditCollapse && newVal.groupEditCollapse[0] == -1) return;

				settings = newVal;
				self.save();

				scopes.forEach(function(s) {
					if (s) s.Settings = settings
				});
				$rootScope.$broadcast('settings.changed');

			}, true);


			//always at least 1 search area
			if (!scope.Settings.searchWithinEvents &&	
					!scope.Settings.searchWithinArticles &&	
					!scope.Settings.searchWithinBulletins) {
				scope.Settings.searchWithinArticles = true
			}
		}


	}

});
		

