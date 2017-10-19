'use strict';

angular.module('indeuApp').
	directive('socialLinks', function($timeout, Utils) {
	return {
		//restrict: 'A',
		priority: 1000,
		link:	function(scope, element, attrs) {

			var obj;

			function getItem(attr, icon, title) {
				var value = obj[attr];
				if (!value || value=='' || value==null) return '';
				var html = '<div class="layout-social">';
				html += '<i class="fa fa-fw fa-x2 '+icon+'" title="'+title+'"></i>';
				html += '<a target=_blank href="'+value+'" title="'+title+'">'+Utils.plainText(value, 40)+'</a>';
				html += '</div>';
				return html;
			}

			attrs.$observe('socialLinks', function() {
				obj = attrs['socialLinks'];
				if (obj) {
					try {
						obj = JSON.parse(obj)
					} catch(e) {
						return
					}
				} else {
					return
				}

				var html = '';
				html += getItem('email', 'fa-envelope-o', 'Email');
				html += getItem('homepage', 'fa-external-link', 'Hjemmeside');
				html += getItem('facebook', 'fa-facebook-official', 'Facebook profil');
				html += getItem('twitter', 'fa-twitter', 'Twitter konto');
				html += getItem('linkedin', 'fa-linkedin', 'LinkedIn konto');

				element.append(html);
			});
		}
	}
});


