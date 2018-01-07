'use strict';

angular.module('indeuApp').factory('VisitCounter', function($q, $timeout, Login, ESPBA) {

	var cache = {};
	var cc = 0;

	return {

		get: function(hash) {
			ESPBA.get('visit_counter', { hash: hash }).then(function(v) {
				if (v.data && v.data.length) {
					var v = v.data[0];
					//console.log('get', v);
					cache[v.hash] = v.counter;
				}
			})
		},

		visit: function(hash) {
			var self = this;
			ESPBA.prepared('UpdateVisitCounter', { hash: hash }).then(function() {
				self.get(hash);
			})
		}

	}
});

