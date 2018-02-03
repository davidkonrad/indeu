'use strict';

angular.module('indeuApp')
  .factory('ImageUploadModal', function($modal, $location, $compile, $http, $q, $timeout, Upload) {

		var deferred = null;
		var modal = null;

		var path;
		if ($location.host() === 'localhost') {
			path = 'http://localhost/html/indeu/app/api/';
		} else {
			path = 'https://indeu.org/api/';
		}

		var defaults = {
			target: '',
			title: 'Tilføj billede',
			btnOk: 'Upload',
			btnCancel: 'Fortryd',
			currentImage: null,
			noImageCaption: '<br><br>Intet billede valgt<br>Klik for at tilføje billede',
			selectedFile: null
		};

		return {

			delete: function(filename) {
				deferred = $q.defer();
				$http({
					url: path + 'delete-image.php', 
					method: 'GET',
					params: { filename: filename }
				}).then(function(r) {
		      deferred.resolve(r);
				});
	      return deferred.promise;
			},				

			show: function($scope, target) {
				var settings = $.extend({}, defaults);

				//originally, target was a string
				if (typeof target == 'object') {
					$.extend(settings, target);
				} else {
					settings.target = target
				}
				$scope.__upload = settings;

				$scope.__upload.noImage = function() {
					var u = $scope.__upload;
					if (u.selectedFile) return false;
					return u.currentImage == null || u.currentImage == '' || u.currentImage == undefined
				}
				
				$scope.uploadFile = function() {
					if ($scope.__upload.selectedFile) {
						Upload.upload({
							url: path + 'upload-image.php', 
							method: 'POST',
							file: $scope.__upload.selectedFile,
							data: {
				        'targetPath' : '../media/' + $scope.__upload.target + '/'
							}
						}).then(function(r) {
							//console.log(r);
							modal.hide();
				      deferred.resolve(r.data);
						});
					} else {
			      deferred.resolve(false);
					}
				};

				$scope.canUpload = function() {
					return $scope.__upload && $scope.__upload.selectedFile !== null;
				};

				$scope.triggerSelect = function() {
					angular.element('#selectBtn').click();
				};

				$scope.registerFile = function(file, errFiles) {
					$('#upload-image-modal').attr('ngf-src', "__upload.selectedFile").attr('ngf-background', "__upload.selectedFile");
					$compile(angular.element('.upload-image-area').contents())($scope);

        	//$scope.f = file;
					$scope.errFile = errFiles && errFiles[0];
					$scope.__upload.selectedFile = file;

					$timeout(function() {
						$(window).trigger('resize');
						$scope.$apply();
					});
		    };
 
				deferred = $q.defer();
				modal = $modal({
					scope: $scope,
					templateUrl: 'views/image.upload.modal.html',
					backdrop: 'static',
					show: true
				});

				modal.$promise.then(modal.show).then(function() {
					$compile(angular.element('#upload-image-modal').contents())($scope);
				});

				$scope.modalClose = function(value) {
					delete $scope.__upload;

					$('#upload-image-modal').removeAttr('ngf-src').removeAttr('ngf-background');

					modal.hide();
		      deferred.resolve(value);
				};

	      return deferred.promise;
			}

		};

});

