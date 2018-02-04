'use strict';

angular.module('indeuApp').factory('Const', ['$q', function($q) {

	var daDk = {
    sEmptyTable:     "Ingen tilgængelige data (prøv en anden søgning)",
    sInfo:           "Viser _START_ til _END_ af _TOTAL_ rækker",
    sInfoEmpty:      "Viser 0 til 0 af 0 rækker",
	  sInfoFiltered:   "(filtreret ud af _MAX_ rækker ialt)",
	  sInfoPostFix:    "",
	  sInfoThousands:  ",",
	  sLengthMenu:     "Vis _MENU_ rækker",
    sLoadingRecords: "Henter data...",
    sProcessing:     "Processing...",
    sSearch:         "Filter:",
    sZeroRecords:    "Ingen rækker matchede filter",
    oPaginate: {
			sFirst:    "Første",
			sLast:     "Sidste",
			sNext:     "Næste",
			sPrevious: "Forrige"
    },
    oAria: {
      sSortAscending:  ": Sorter kolonne faldende",
      sSortDescending: ": Sorter kolonne stigende"
    }
	};

	//
	return {

		ACCESS_LEVEL_PUBLIC: 1,
		ACCESS_LEVEL_USERS: 2,
		ACCESS_LEVEL_CLOSED: 3,

		VISIBILITY_LEVEL_PUBLIC: 1,
		VISIBILITY_LEVEL_USERS: 2,
		VISIBILITY_LEVEL_CLOSED: 3,

		//
		articleLimitToItems: [
			{ id: '6', navn: '6' },
			{ id: '12', navn: '12' },
			{ id: '24', navn: '24' },
			{ id: '', navn: 'Alle' }
		],
		articleOrderByItems: [
			{ id: '-created_timestamp', navn: 'Nyeste' },
			{ id: '-stars', navn: 'Højest ratede' },
			{ id: '-counter', navn: 'Mest læste' }
		],

		//
		eventLimitToItems: [
			{ id: '6', navn: '6' },
			{ id: '12', navn: '12' },
			{ id: '24', navn: '24' },
			{ id: '', navn: 'Alle' }
		],
		eventOrderByItems: [
			{ id: '-dateExact', navn: 'Tidspunkt' },
			{ id: '-feedback2', navn: 'Tilmeldte' },
			{ id: '-created_timestamp', navn: 'Oprettet' }
		],

		//
		defaultMap: function() {
			var defaultMap = {
				events: {
					map: {
						enable: [], //'zoomstart', 'drag', 'click', 'dblclick', 'mouseover'],
						logic: 'emit'
					}
				},
				markers: {
					marker: {
						lat: 56.126627523318206,
						lng: 11.457741782069204
					}
				},
				center: {
					lat: 56.126627523318206,
					lng: 11.457741782069204,
					zoom: 5
				},
				defaults: {
					zoomAnimation: true,
					markerZoomAnimation: true,
					fadeAnimation: true
				},
				layers: {
	        baselayers: {
						googleTerrain: {
					    name: 'Google Terrain',
					    layerType: 'TERRAIN',
					    type: 'google',
							visible: true,
							layerOptions: {
								mapOptions: {
									styles: this.defaultGoogleStyles()
							  }
							}
					  },
					  googleHybrid: {
					    name: 'Google Hybrid',
					    layerType: 'HYBRID',
					    type: 'google',
							visible: false,
							layerOptions: {
								mapOptions: {
									styles: this.defaultGoogleStyles()
							  }
							}
					  }
					}
				}
			};
			return $.extend({}, defaultMap);
		},

		defaultGoogleStyles: function() {
			var style = [
			{
				//remove unwanted transport lines, færgeruter osv	
		    featureType: "transit.line",
		    elementType: "geometry",
		    stylers: [{ 
					visibility: "off" 
				}]
			}, {
		   //remove "Danmark / Denmark"
		   featureType: "administrative.country",
		   elementType: 'labels',
		   stylers: [{
		     visibility: 'off'
		   }]
		  }, {
		   //remove points of interest
		   featureType: "poi",
		   elementType: 'all',
		   stylers: [{
		     visibility: 'off'
		   }]
			}];
			return style;
		},

		//
		dataTables_daDk: daDk


	}


}]);
	


