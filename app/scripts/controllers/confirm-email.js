'use strict';

/**
 *
 *
 */
angular.module('indeuApp').controller('ConfirmEmailCtrl', function($scope, $routeParams, $interval, ESPBA, Redirect) {

	const hash = $routeParams.hash;

	ESPBA.get('user_request', { hash: hash }).then(function(r) {
		if (r.data && r.data.length == 1) {
			$scope.data = r.data[0];
			$scope.alreadyConfirmed = $scope.data.email_confirmed == 1;
			if (!$scope.data.email_confirmed) {
				ESPBA.update('user_request', { id: $scope.data.id, email_confirmed: 1 })
			}
			$scope.secs = 15;
			var interval = $interval(function() {
				$scope.secs--;
				if ($scope.secs == 0) {
					$interval.cancel(interval);
					Redirect.home();
				}
			}, 1000);

		} else {
			Redirect.home();
		}
	})


});

		

