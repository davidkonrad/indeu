'use strict';

/**
 *
 *
 */
angular.module('indeuApp').factory('Wait', function($modal, $q) {

	var deferred;
	var local = this;

	local.modalInstance = ['$scope', '$rootScope', 'message', function($scope, $rootScope, message) {
		$scope.message = message;

		$rootScope.$on('wait.cancel', function() {
			$scope.$hide();
			deferred.resolve()
		})

	}];

	return {
		show: function(message) {
			deferred = $q.defer();

			var modal = $modal({
				templateUrl: 'views/Wait.modal.html',
				controller: local.modalInstance,
				backdrop: 'static',
				locals: { message: message }
			});

      return deferred.promise;
		}
	}
});


