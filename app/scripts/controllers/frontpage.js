'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
  .controller('FrontpageCtrl', function($scope, $timeout, ESPBA, Lookup, Meta, Utils, Redirect, Notification) {

		Meta.setTitle('indeu.org');
		Meta.setDescription('bla bla.');

		function init() {
			ESPBA.get('frontpage_content').then(function(f) {
				//sort by rank
				f.data.sort(function(a,b) {
					return a.rank > b.rank
				})
				//set link and images
				f.data.forEach(function(c) {
					switch (c.type) {
						case 'Artikel':
							if (c.image) c.image_url = '../media/artikel/'+c.image;
							c.url = Utils.articleUrl(c.content_id, c.header);
							break;

						case 'Forening':
							if (c.image) c.image_url = '..media/forening/'+c.image;
							c.url = Utils.foreningUrl(c.content_id, c.header);
							break;

						case 'Event':
							if (c.image) c.image_url = '..media/artikel/'+c.image;
							c.url = Utils.eventUrl(c.content_id, c.header);
							break;

						default:
							break; //should really never happen
					}
				})
				$scope.promo = f.data[0];
				$scope.promo.extract = $scope.promo.extract ? '»'+$scope.promo.extract+'«' : null;
				$scope.sub_promos = f.data.slice(1);

				$scope.promoBackgroundStyle = {	'background':'#dadada' };
				if ($scope.promo.image_url) {
					var img = new Image();
					img.onload = function() {
						/*
							if height>width go for left aligned image, right aligned text
							if width>height and width > 500 go for fuul width
								if height < 400 place text at bottom
						*/							
		
						console.log(img.width, img.height);
						var ret = {
							'background-image':'url(' + $scope.promo.image_url + ')',
							'background-size': 'cover',
							'background-repeat': 'no-repeat',
							'background-position': 'center center'
				    };
	 						$scope.promoBackgroundStyle = ret
					}
					img.src = $scope.promo.image_url;
				}


			})
		}

		$scope.getBackgroundStyle = function(image) {
			return $scope.promoBackgroundStyle;
		}

		Lookup.init().then(function() {
			init();
		});

		if (Redirect.message()) {
			Notification(Redirect.message());
			Redirect.clear();
		}
	

});
