'use strict';

/*
	render out a social_media record
*/

angular.module('indeuApp')
	.directive('socialMediaLinks', function($timeout) {
	return {
		restrict: 'E',
		scope: {
			record: '@'
		},
		controller: function($scope) {
			$scope.links = [
				{ 
					name: 'homepage',
					desc: 'Hjemmeside: ',
					fa: 'fa-external-link'
				},
				{ 
					name: 'twitter',
					desc: 'Twitter konto: ',
					fa: 'fa-twitter'
				},
				{ 
					name: 'facebook',
					desc: 'Facebook konto: ',
					fa: 'fa-facebook-square'
				},
				{ 
					name: 'linkedin',
					desc: 'LinkedIn profil: ',
					fa: 'fa-linkedin'
				},
				{ 
					name: 'youtube',
					desc: 'Youtube kanal: ',
					fa: 'fa-youtube'
				},
				{ 
					name: 'instagram',
					desc: 'Instagram side: ',
					fa: 'fa-instagram'
				},
				{ 
					name: 'googleplus',
					desc: 'Google+ konto: ',
					fa: 'fa-google-plus'
				},
			]
		},
		templateUrl: "views/inc/inc.socialMediaLinks.html",
		replace: true,
		link: function(scope, element, attrs) {
			attrs.$observe('record', function(record) {
				var record = JSON.parse(record);
				for (var i=0, l=scope.links.length; i<l; i++) {
					var link = scope.links[i];
					if (record[link.name]) {
						link.url = record[link.name];
						
						//remove https(s) amd www.
						var showUrl = record[link.name].replace(/(^\w+:|^)\/\//, '').replace('www.', '');
						//remove trailing /
						showUrl = showUrl.replace(/\/$/, "");
					
						link.showUrl = showUrl;
						console.log(link);
					}
				}
			})
		}
	}
});

