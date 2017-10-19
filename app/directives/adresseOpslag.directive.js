'use strict';

angular.module('indeuApp')
  .directive('adresseOpslag', function($parse, TicketService) {
    return {
      restrict: 'A',
			link: function(scope, element, attrs) {

				var	adresseType = attrs['adresseType'];
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
							//console.log(item);
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
						items : 20,
						source: function(query, process) {
							switch (attrs.adresseType) {
								case 'adresser' :
									var url = 'https://services.kortforsyningen.dk/Geosearch?search=*'+query+'*&resources=adresser&crs=EPSG:4326&limit=10&ticket='+TicketService.get()
									break;
								//stednavne_v2 does not support EPSG:4326
								case 'stednavne_v2' :
									var url = 'https://services.kortforsyningen.dk/Geosearch?search='+query+'*&resources=stednavne_v2&limit=10&ticket='+TicketService.get()
									break;
								default :
									break;
							}
					    return $.getJSON(url, function(resp) {
								var data = [], caption = '';
								for (var i in resp.data) {
									data.push(resp.data[i]);
								}			
								return process(data);		
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
