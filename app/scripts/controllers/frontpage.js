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
							//c.image_url = c.image ? '/media/artikel/'+c.image : '/media/statisk/indeu-default.png';
							if (c.image) c.image_url = '/media/artikel/'+c.image;
							c.url = Utils.articleUrl(c.content_id, c.header);
							break;

						case 'Forening':
							//c.image_url = c.image ? '/media/forening/'+c.image : '/media/statisk/indeu-default.png';
							if (c.image) c.image_url = '/media/forening/'+c.image;
							c.url = Utils.foreningUrl(c.content_id, c.header);
							break;

						case 'Event':
							//c.image_url = c.image ? '/media/event/'+c.image : '/media/statisk/indeu-default.png';
							if (c.image) c.image_url = '/media/event/'+c.image;
							c.url = Utils.eventUrl(c.content_id, c.header);
							break;

						case 'Statisk':
							//c.image_url = c.image ? '/media/statisk/'+c.image : '/media/statisk/indeu-default.png';
							if (c.image) c.image_url = '/statisk/artikel/'+c.image;
							c.url = Utils.staticUrl(c.content_id, c.header);
							break;

						default:
							break; //should really never happen
					}

					c.image_style = {	'background':'#dadada' };
					if (c.image_url) {
						var img = new Image();
						img.onload = function() {
							var ret = {
								'background-image':'url(' + c.image_url + ')',
								'background-size': 'cover',
								'background-repeat': 'no-repeat',
								'background-position': 'center center'
					    };
							c.image_style = ret;
						}
						img.src = c.image_url;
					}(c)
				})
				$scope.promo = f.data[0];
				$scope.promo.extract = $scope.promo.extract ? $scope.promo.extract : null;
				$scope.sub_promos = f.data.slice(1);

				if ($scope.promo.image_url) {
					var img = new Image();
					img.onload = function() {
						var ret = {
							'background-image':'url(' + $scope.promo.image_url + ')',
							'background-size': 'cover',
							'background-repeat': 'no-repeat',
							'background-position': 'center center'
				    };
 						$scope.promoBackgroundStyle = ret
					}
					img.src = $scope.promo.image_url;
				} else {
					$scope.promoBackgroundStyle = {	'background':'#dadada' };
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
