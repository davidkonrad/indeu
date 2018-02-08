'use strict';

angular.module('indeuApp')
  .directive('adresseOpslag', function($parse, TicketService) {
    return {
      restrict: 'A',
			link: function(scope, element, attrs) {

				var	adresseType = attrs['adresseType'] || 'adresser';
				var	value = attrs['adresseOnSelect'];
				var	onSelect = scope[value] ? scope[value] : null;

				function initialize() {
					$(element).typeahead('destroy')

					$(element).on('click', function() {
						var adresseItem = $(element).data('adresseItem');
						if (adresseItem) {
							var text = adresseItem.streetName;
							if (adresseItem.streetBuildingIdentifier) text+=' '+adresseItem.streetBuildingIdentifier;
							$(element).val(text);
							$(element).trigger('keyup');
						}
					});

					$(element).typeahead({
						displayText: function(item) {
							switch (attrs.adresseType) {
								case 'stednavne_v2' : 
									return item.presentationString
									break
								case 'adresser' :
									return item.presentationString
									break
								default :
									return null
							}
						},
						afterSelect: function(item) {
							$(element).data('adresseItem', item);
							if (onSelect) onSelect(item)
						}, 
						items: 15,
						source: function(query, process) {
							switch (attrs.adresseType) {
								case 'adresser' :
									var url = 'https://services.kortforsyningen.dk/Geosearch?search='+query+'&resources=adresser&crs=EPSG:4326&limit=15&ticket='+TicketService.get()
									//if query contain a number we probably search for a specific address
									if (query.match(/\d+/g)) url+='&type=addressAccess';
									break;
								//stednavne_v2 does not support EPSG:4326
								case 'stednavne_v2' :
									var url = 'https://services.kortforsyningen.dk/Geosearch?search='+query+'*&resources=stednavne_v2&limit=15&ticket='+TicketService.get()
									break;
								default :
									break;
							} 
					    return $.getJSON(url, function(resp) {
								if (resp.status == 'ERROR') {
									console.log(resp);
									console.error('indeu.org: services.kortforsyningen.dk virker til at være nede ...');
								}
								return process(resp.data || []);		
					    })
						}
					})
				}

				attrs.$observe('adresseType', function(value) {
					adresseType = value;
					initialize();
				});

			}
		}
});
