'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
  .controller('MedlemCtrl', ['$scope', '$q', '$routeParams', '$timeout', 'ESPBA', 'Lookup', 'Meta', 'Utils',
	function($scope, $q, $routeParams, $timeout, ESPBA, Lookup, Meta, Utils) {

	$scope.reg = {};

	$scope.canRegister = function() {
		return $scope.reg.fuldeNavn && $scope.reg.email && $scope.reg.adresse && $scope.reg.postnr && $scope.reg.by;
	}

	

}]);

