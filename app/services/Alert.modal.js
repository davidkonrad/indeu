'use strict';

/**
 *
 *
 */
angular.module('indeuApp').factory('AlertModal', function($modal, $q) {

	var deferred;
	var local = this;

	local.modalInstance = ['$scope', 'alertHeader', 'alertMessage', function($scope, alertHeader, alertMessage) {
		$scope.header = alertHeader || 'OBS';
		$scope.message = alertMessage;
		$scope.closeModal = function(value){
			$scope.$hide();
			deferred.resolve(value)
		}
	}];

	return {
		show: function(message, header) {
			deferred = $q.defer();

			var modal = $modal({
				templateUrl: 'views/Alert.modal.html',
				controller: local.modalInstance,
				backdrop: 'static',
				size: 'md',
				locals: { alertMessage: message, alertHeader: header }
			});

      return deferred.promise;
		}
	}
});


