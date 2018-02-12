'use strict';

angular.module('indeuApp').factory('Redirect', function($location, $window, Login, Utils) {

	var _redirectMessage = undefined;

	return {

		checkLogin: function(redirectMessage) {
			if (!Login.isLoggedIn()) {
				_redirectMessage = redirectMessage;
				$location.path('/forside').replace()
			}
		},

		message: function(clear) {
			if (clear) {
				var m = _redirectMessage;
				this.clear();
				return m;
			}
			return _redirectMessage
		},

		clear: function() {
			_redirectMessage = undefined
		},

		home: function(redirectMessage) {
			_redirectMessage = redirectMessage;
			$location.path('/forside').replace()
		},

		_404: function() {
			$location.path('/404').replace()
		},

		search: function(term) {
			_redirectMessage = term;
			var path = Utils.isLocalHost() ? '#/soeg' : '/soeg';
			$window.location.assign(path)
		}


	}

});


