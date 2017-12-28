'use strict';

/**
 *
 *
 */
angular.module('indeuApp').factory('ConfirmModal', function($modal, $q) {

	var deferred;
	var local = this;

	local.modalInstance = ['$scope', 'confirmHeader', 'confirmMessage', function($scope, confirmHeader, confirmMessage) {
		$scope.header = confirmHeader ? confirmHeader : 'Bekræft';
		$scope.message = confirmMessage;
		$scope.closeModal = function(value){
			$scope.$hide();
			deferred.resolve(value)
		}
	}];

	return {
		show: function(message, header) {
			deferred = $q.defer();

			var modal = $modal({
				templateUrl: 'views/Confirm.modal.html',
				controller: local.modalInstance,
				backdrop: 'static',
				size: 'md',
				locals: { confirmMessage: message, confirmHeader: header }
			});

      return deferred.promise;
		}
	}
});


