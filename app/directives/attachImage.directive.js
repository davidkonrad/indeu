'use strict';

angular.module('indeuApp')
	.directive('attachImage', function(ImageUploadModal, Utils) {

	return {
		templateUrl: "views/inc/attachImage.directive.html",
		restrict: 'AE',
		transclude: true,
    require: '?ngModel', 
		scope: {
			type: '@',
			size: '@',
			title: '@'
		},
		replace: true,
		controller: function($scope) {
		},
		link: function(scope, element, attrs, ngModel) {

			scope.image = '';

			scope.getSizeClass = function() {
				var size = attrs['size'] || 'auto';
				if (size == 'auto') {
					var h = attrs['height'] || 200;
					element.css('height', h);
					element.css('max-height', h);
					element.css('overflow', 'hidden');
				}
				var ret = scope.image ? '' : 'attach-image-icon ';
				return ret + 'attach-image-' + size;
			}

			scope.getImageStyle = function() {
				var h = attrs['height'];
				if (h) {
					return {
						'height': h+'px',
						'max-height': h+'px'
					}
				}
				return ''
			}

			scope.defaultImage = '<i class="fa fa-user"></i>';

			var _title = attrs['title'] || 'Skift billede';
			var _target;
			var _url;

			ngModel.$render = function() {
				_target = '';
				_url = ''; 
				var value = ngModel.$modelValue;
				var type = attrs['type'].toString().toLowerCase().slice(0,1);

				switch(type) {
					case 'a' :
						scope.defaultImage = '<i class="fa fa-picture-o"></i>';
						_target = 'artikel';
						break;
					case 'e' :
						scope.defaultImage = '<i class="fa fa-calendar"></i>';
						_target = 'event';
						break;
					case 'u' :
						scope.defaultImage = '<i class="fa fa-user"></i>';
							_target = 'medlem';
						break;
					case 'g' :
						scope.defaultImage = '<i class="fa fa-group"></i>';
						_target = 'gruppe';
						break;
					case 'f' :
						scope.defaultImage = '<i class="fa fa-sitemap"></i>';
						_target = 'forening';
						break;
					case 's' :
						scope.defaultImage = '<i class="fa fa-file-code-o"></i>';
						_target = 'statisk';
						break;
					case 'i' :
						scope.defaultImage = '<i class="fa fa-bug"></i>';
						_target = 'issue';
						break;
					default:
						break;
				};
				_url += 'media/' + _target + '/' + value;
				scope.image = value ? _url : '';
			}

			//
			scope.loadImage = function() {
				var options = {
					target: _target,
					title: _title,
					btnOk: 'Gem og luk',
					btnCancel: 'Fortryd',
					currentImage: scope.image
				};
				ImageUploadModal.show(scope, options).then(function(image) {
					if (image) {
						ngModel.$setViewValue(image.filename);
						ngModel.$render();
					}
				});
			}

			//
			scope.resetImage = function(e) {
				e.stopPropagation();
		    ngModel.$setViewValue('');
				scope.image = '';
			}

		}

	}

});
