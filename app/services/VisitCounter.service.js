'use strict';

angular.module('indeuApp').factory('VisitCounter', function($q, $timeout, Login, ESPBA) {

	var cache = {};
	var cc = 0;

	return {

		/*
		count: function(hash) {
			if (cache[hash]) return cache[hash];
			var self = this;
			self.get(hash);
			var i = setInterval(function() {
				cc++;
				console.log('count interval', cc);
				clearInterval(i);
				return self.count(hash)
			}, 500);
		},
		*/
		get: function(hash) {
			ESPBA.get('visit_counter', { hash: hash }).then(function(v) {
				if (v.data && v.data.length) {
					var v = v.data[0];
					console.log('get', v);
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

