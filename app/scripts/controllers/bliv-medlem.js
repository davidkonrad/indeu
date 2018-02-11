'use strict';

/**
 *
 *
 */
angular.module('indeuApp').controller('BlivMedlemCtrl', function($scope, ESPBA, KR, Meta, Utils, Redirect, Email) {

	$scope.reg = {};
	$scope.error = ' ';

	$scope.canRegister = function() {
		var canRegister = $scope.reg.first_name && 
			$scope.reg.last_name && 
			$scope.reg.full_name && 
			$scope.reg.email && 
			$scope.reg.address && 
			$scope.reg.postal_code && 
			$scope.reg.city &&
			$scope.isValidEmail

		return canRegister
	}

	//https://stackoverflow.com/questions/46155/how-can-an-email-address-be-validated-in-javascript
	function validateEmail(email) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	}

	$scope.$watch('reg.email', function(newVal, oldVal) {
		$scope.isValidEmail = validateEmail($scope.reg.email);
		if ($scope.isValidEmail) {
			ESPBA.get('user', { email: $scope.reg.email }).then(function(r) {
				if (r.data && r.data.length>0) {
					$scope.error = 'Emailadressen er allerede i brug';
					$scope.isValidEmail = false;
				} else {
					$scope.error = ' '
				}
			})
		}
	}, true)

	$scope.register = function() {
		$scope.reg.hash = Utils.getHash()+'ur';
		ESPBA.insert('user_request', $scope.reg).then(function(r) {
			r = r.data[0];
			Email.requestConfirmation(r.email, r.full_name, r.hash);
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

