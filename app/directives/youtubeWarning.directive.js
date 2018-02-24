;'use strict';

angular.module('indeuApp').directive('youtubeWarning', function($timeout, $cookies) {
	
	var template = '<div class="alert alert-warning alert-dismissable line-height-110">';
	template += '<a class="close youtube-warning-dismiss" data-dismiss="alert" aria-label="close" title="Vis ikke denne besked igen">&times;</a>';
	template += '<strong>Video kan ikke afspilles?</strong><br><br>';
	template += 'Du har muligvis <strong>track-blockers</strong> eller <strong>ad-blockers</strong> installeret.  Og det er en god ting! ';
	template += 'Prøv at disable dem for denne side. ';
	template += '<br><br>';
	template += 'Der er ingen reklamer på indeu.org, og der findes ingen skjulte tracking-scripts eller share-knapper. Det er YouTube / Google der ønsker det. Der arbejdes på en permanent løsning.  ';
	template += '</div>';

	var cookieName = 'indeu.youtubeWarning.dismissed';

	function setCookie() {
		var expireDate = new Date();
		expireDate.setTime(expireDate.getTime()+(30*24*60*60*1000)) //30 days
		$cookies.put(cookieName, '1', { expires: expireDate } )
	}

	return {
		restrict: 'E',
		replace: true,
		link: function($scope, element, attrs) {
			if ($cookies.get(cookieName) == '1') return;
			$timeout(function() {
				if ($('iframe').length>0) {
					element.html(template).show(); 
					$('.youtube-warning-dismiss').on('click', function() {
						setCookie()
					})
				}
			}, 5000)
		}
	}
});

