'use strict';

/**
 *
 *
 */
angular.module('indeuApp').factory('ConfirmModal', function($modal, $q) {

	var deferred;
	var local = this;

	local.modalInstance = ['$scope', 'params', function($scope, params) {
		$scope.header = params.header ? params.header : 'Bekræft';
		$scope.message = params.message;
		$scope.ok_text = params.ok_text ? params.ok_text : 'Ok';
		$scope.modalClass = params.modalClass ? params.modalClass : 'small-dialog';
		$scope.closeModal = function(value){
			$scope.$hide();
			deferred.resolve(value)
		}
	}];

	return {
		show: function(params) {
			deferred = $q.defer();

			var modal = $modal({
				templateUrl: 'views/Confirm.modal.html',
				controller: local.modalInstance,
				backdrop: 'static',
				locals: { params: params }
			});

      return deferred.promise;
		}
	}
});


