'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
  .controller('BlivMedlemCtrl', function($scope, ESPBA, KR, Meta, Utils, Redirect) {

	$scope.reg = {};

	$scope.canRegister = function() {
		var canRegister = $scope.reg.first_name && 
			$scope.reg.last_name && 
			$scope.reg.full_name && 
			$scope.reg.email && 
			$scope.reg.address && 
			$scope.reg.postal_code && 
			$scope.reg.city;

		return canRegister
	}

	$scope.register = function() {
		$scope.reg.hash = Utils.getHash()+'ur';
		ESPBA.insert('user_request', $scope.reg).then(function(r) {
			Redirect.home('<h3 class="no-padding">Tak for din tilmelding!</h3>Om et øjeblik vil du modtage en mail med et link du skal klikke på. <br>Det er for at validare din email-adresse. <br>Du får en mail når brugerne har godkendt dig som medlem');
		})
	}

	$scope.adresseSelect = function(item) {
		$scope.reg.postal_code = item.postCodeIdentifier;
		$scope.reg.city = item.districtName;
		$scope.reg.lat = item.y || item.yMin;
		$scope.reg.lng = item.x || item.xMin;
		$scope.reg.municipality = item.municipalityName;
		$scope.reg.region = KR.regionByKommuneNr(item.municipalityCode);
		$scope.$apply();
	}


});

