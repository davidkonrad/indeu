'use strict';

angular.module('indeuApp').directive('bsCollapseIcons', function($timeout) {
	return {
		restrict: 'A',
		priority: 1000,
		link: function($scope, element, attrs) {

			element.on('click', '.panel-heading', function() {
				var $this = $(this);
				var $i = $this.find('i');
				var _in = $this.parent().find('.in').length;
				if (_in) {
					$i.removeClass('fa-plus').removeClass('fa-minus').addClass('fa-plus')
				} else {
					$i.removeClass('fa-plus').removeClass('fa-minus').addClass('fa-minus')
				}
			});

			//update or inject <i>
			$timeout(function() {
				var panels = element.find('.panel-heading');
				for (var i=0, l=panels.length; i<l; i++) {
					var $this = $(panels[i]);
					var $i = $this.find('i');
					if (!$i.length) {
						var $a = $this.find('a').first();
						var html = $a.html();
						$a.html('<i></i>' + html);
						$i = $a.find('i');
						$i.addClass('fa text-muted');
					}		
					var _in = $this.parent().find('.in').length == 1;
					if (!_in) {
						$i.removeClass('fa-plus').removeClass('fa-minus').addClass('fa-plus')
					} else {
						$i.removeClass('fa-plus').removeClass('fa-minus').addClass('fa-minus')
					}
				}
			}, 100)

		}
	}

});

