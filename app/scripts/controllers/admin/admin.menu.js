'use strict';

/**
 *
 *
 */
angular.module('indeuApp').controller('AdminMenu', function($scope, AdminRights) {
	AdminRights.getAdminRights().then(function(d) {
		$scope.adminRights = d
	})
});

