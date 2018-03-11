'use strict';

/**
 *
 *
 */
angular.module('indeuApp').factory('Wait', function($modal, $q) {

	var deferred;
	var local = this;

	local.modalInstance = ['$scope', 'message', function($scope, message) {
		$scope.message = message;
		$scope.closeModal = function(value){
			$scope.$hide();
			deferred.resolve(value)
		}
	}];

	return {
		show: function(message, header) {
			deferred = $q.defer();

			var modal = $modal({
				templateUrl: 'views/Wait.modal.html',
				controller: local.modalInstance,
				backdrop: 'static',
				size: 'md',
				locals: { alertMessage: message, alertHeader: header }
			});

      return deferred.promise;
		}
	}
});


