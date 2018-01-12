'use strict';

/**
	service for kommuner & regioner 
	JSON downloaded from oiorest
*/

angular.module('indeuApp')
  .factory('KR', function($http) {

		var kommuner = null;

		return {
			init: function() {
				$.getJSON('assets/kommuner.json', function(json) {
					kommuner = json
				})
			},

			kommuneByNr: function(kommuneNr) {
				kommuneNr = kommuneNr ? kommuneNr.trim() : ''
				for (var i=0, l=kommuner.length; i<l; i++) {
					if (kommuner[i].nr.trim() == kommuneNr ) return kommuner[i]
				}
				return false
			},

			regionByKommuneNr: function(kommuneNr) {
				kommuneNr = kommuneNr ? kommuneNr.trim() : ''
				for (var i=0, l=kommuner.length; i<l; i++) {
					if (kommuner[i].nr.trim() == kommuneNr ) return kommuner[i].region.navn
				}
				return false
			}
				
		}
});

//initialize
angular.module('indeuApp').run(function(KR) {
	KR.init()
});

