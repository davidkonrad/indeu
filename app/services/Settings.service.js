'use strict';

/**
 * Settings factory
 * maintain a cookie with settings, checks, defaults etc
 * populate a scope with a $settings literal which is $watched
 * and can be used as ng-models
**/
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

	return {
		
		init: function($scope) {
			scope = $scope;
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

		/*
			$settings can be updated with $settings.prop = value
			but to be sure the value is catched by $watch we need a $timeout 
			this is a shorthand for doing this
			using ng-model="$settings.prop" will be triggered as expected
		*/
		update: function(prop, value) {
			$timeout(function() {
				scope.$settings[prop] = value
			})
		},

		load: function() {
			var self = this;

			if (!settings) {
				var s = $cookies.get(cookieName);
				try {
					s = JSON.parse(s);
				} catch(e) {
					s = undefined;
				}
				settings = s
				settings = (!s || typeof s != 'object') 
					? $.extend( {}, defaultSettings)
					: s;
			}
	
			scope.$settings = settings;

			scope.$watch('$settings', function(newVal, oldVal) {
				//console.log('Settings changed', newVal);
				settings = newVal;
				self.save();
			}, true);

				//angularstrap/collapse.js return array with negative values upon deletion
				//if (newVal.groupEditCollapse && newVal.groupEditCollapse[0] == -1) return;

			/*
			//always at least 1 search area
			if (!scope.Settings.searchWithinEvents &&	
					!scope.Settings.searchWithinArticles &&	
					!scope.Settings.searchWithinBulletins) {
				scope.Settings.searchWithinArticles = true
			}
			*/
		}


	}

});

