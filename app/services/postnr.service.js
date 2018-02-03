'use strict';

/**
	service for postnr
	JSON downloaded from http://geo.oiorest.dk/documentation/api/postnummer.aspx
*/

angular.module('indeuApp')
  .factory('PostNr', function($q, TicketService, KR) {

		var postnrJSON = null;

		return {
			init: function() {
				$.getJSON('assets/postnumre.json', function(json) {
					postnrJSON = json
				})
			},

			get: function() {
				return postnrJSON
			},

			getRemoteInfo: function(postnr) {
				var	deferred = $q.defer();

				//lookup postdistrikt
				var url='https://services.kortforsyningen.dk/?servicename=RestGeokeys_v2&method=postdistrikt&postnr=' + postnr + '&ticket='+TicketService.get();
		    $.getJSON(url, function(pd) {
					if (pd.features && pd.features.length) {
						var x = pd.features[0].bbox;
						var x1 = (x[0] + x[2]) / 2;
						var x2 = (x[1] + x[3]) / 2;
						var georef = pd.crs.properties.name;
						//lookup kommune
						url='https://services.kortforsyningen.dk/?servicename=RestGeokeys_v2&method=nadresse&geop='+x1+','+x2+'&georef='+georef+'&hits=1&ticket='+TicketService.get()
						$.getJSON(url, function(kommune) {
							var region = KR.kommuneByNr(kommune.features[0].properties.kommune_kode)
							var result = {
								postnr: postnr,
								kommune: kommune.features[0].properties.kommune_navn,
								region: region.region.navn.replace('Region ', '')
							}
				      deferred.resolve(result);
						})
					}
				})

	      return deferred.promise;
			},
	
			postnrToBy: function(postnr) {
			},

			byToPostnr: function(by) {
			}
				
		}
});

//initialize
angular.module('indeuApp').run(function(PostNr) {
	PostNr.init()
});


