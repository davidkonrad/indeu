'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
  .controller('AdminForsideCtrl', function($scope, $q, Utils, $timeout, ESPBA, SelectArtikelModal, Notification) {

		ESPBA.get('frontpage', {}).then(function(f) {
			$scope.frontpage = f.data.length ? f.data[0] : {};

			//it should really never be null or 0, except under development
			if ($scope.frontpage.promoted_article_id && $scope.frontpage.promoted_article_id != 0) {
				ESPBA.get('article', { id:$scope.frontpage.promoted_article_id }).then(function(a) {
					$scope.promoted_article = a.data[0]
				});
			}
		});

		$scope.selectArtikel = function() {
			SelectArtikelModal.show($scope).then(function(a) {
				if (a) {
					var article = a[0];
					$scope.promoted_article = article;
					$scope.frontpage.promoted_article_id = article.id;
					ESPBA.update('frontpage', $scope.frontpage).then(function() {
						Notification.primary('Cover forside artikel ændret til <strong>'+article.header+'</strong>');
					})
				}	
			})
		}

});

