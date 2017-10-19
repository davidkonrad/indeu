'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
  .controller('AdminCtrl', function($scope, $location, $timeout, ESPBA, Lookup, Meta, Utils, Login, Redirect) {

		if (!Login.isLoggedIn()) {
			Redirect.home('Du er ikke logget ind');
		} else {
			if (!Login.isAdmin()) {
				Redirect.home('Du er ikke administrator');
			}
		}

});

