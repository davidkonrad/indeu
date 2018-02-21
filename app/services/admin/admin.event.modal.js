'use strict';

/**
 *
 *
 */
angular.module('indeuApp').factory('EventModal', function($modal, $q) {

	var modal;
	var deferred;
	var local = this;

	local.modalInstance = ['$scope', 'ESPBA', 'KR', 'Lookup', 'Utils', 'Const', 'SelectBrugerModal', 'DTOptionsBuilder', 'DTColumnBuilder', 'event_id', 
	function($scope, ESPBA, KR, Lookup, Utils, Const, SelectBrugerModal, DTOptionsBuilder, DTColumnBuilder, event_id) {

		$scope.eventTypes = Lookup.eventTypes();
		$scope.visibilityLevels = Lookup.visibilityLevels();

		$scope.__eventModal = {
			btnOk: event_id ? 'Gem og luk' : 'Opret event og luk',
			user_btn_caption: 'Vælg bruger'
		};

		$scope.edit = {};
		if (event_id) {
			ESPBA.get('event', { id: event_id }).then(function(r) {
				$scope.edit = r.data[0];
				$scope.edit.visibility_level = parseInt($scope.edit.visibility_level);
				$scope.edit.event_type_id = parseInt($scope.edit.event_type_id);
				$scope.edit.from = Utils.createTime( $scope.edit.from );
				$scope.edit.to = Utils.createTime( $scope.edit.to );

				$scope.__eventModal.title = 'Rediger <span class="text-muted">#'+$scope.edit.id+'</span>, <strong>'+$scope.edit.name+'</strong>';
				if ($scope.edit.user_id) {
					$scope.__eventModal.user_btn_caption = Lookup.getUser($scope.edit.user_id).full_name
				} 
			})
		} else {
			$scope.__eventModal.title = 'Opret event';
			$scope.__eventModal.create = true;
		}

		$scope.canSave = function() {
			return $scope.edit.firstName != undefined &&
				$scope.edit.lastName != undefined;
		};

		$scope.__eventModal.selectUser = function() {
			SelectBrugerModal.show($scope, false, $scope.edit.user_id).then(function(user) {
				if (user) {
					$scope.edit.user_id = user[0].id;
					$scope.__eventModal.user_btn_caption = user[0].full_name;
				}
			})
		}

		$scope.__eventModal.medlemmer = {};
		$scope.__eventModal.medlemmer.dtOptions = DTOptionsBuilder
			.fromFnPromise(function() {
				var defer = $q.defer();
				ESPBA.get('group_user', { group_id: $scope.edit.id }).then(function(r) {
					$scope.__eventModal.medlemmer.data = [];
					for (var i=0,l=r.data.length;i<l;i++) {
						$scope.__eventModal.medlemmer.data.push(Lookup.getUser(r.data[i].user_id))
					}	
					defer.resolve($scope.__eventModal.medlemmer.data);
				});
				return defer.promise;
	    })
			.withOption('drawCallback', function() {
			})
			.withOption('scrollY', 200)
			.withOption('paging', false)
			.withOption('rowCallback', function(row, data /*, index*/) {
				$(row).attr('user-id', data.id);
			})
			.withOption('dom', 'ft')
			.withOption('stateSave', true)
			.withOption('language', Const.dataTables_daDk )
			.withButtons([ 
				{ text: '<span><i class="fa fa-plus text-success"></i>&nbsp;Tilføj medlem</span>',
					className: 'btn btn-xs',
					action: function( /* e, dt, node, config */) {
						SelectBrugerModal.show($scope, false).then(function(user) {
							console.log(user);
							$scope.dtInstance.reloadData();
						});
 					}
				}
			]);

		$scope.__eventModal.medlemmer.dtColumns = [
      DTColumnBuilder.newColumn('id').withTitle('#'),
      DTColumnBuilder.newColumn('first_name').withTitle('Fornavn'),
      DTColumnBuilder.newColumn('last_name').withTitle('Efternavn'),
      DTColumnBuilder.newColumn('alias').withTitle('Alias'),
      DTColumnBuilder.newColumn('email').withTitle('Email'),
      DTColumnBuilder.newColumn('created_timestamp').withTitle('Oprettet'),
		];

		$scope.adresseClick = function() {
			var item = $('#adresse').data('item');			
			if (item) {
				$('#adresse').val( item.streetName+' ');
				$('#adresse').trigger('keyup');
			}
		}
		$scope.adresseSelect = function(item) {

			function setLatLng(e, form, lat, lng) {
				form.find('input[name="lat"]').val( lat );
				form.find('input[name="lng"]').val( lng );
				/*
				if (!e.map.marker) {
					e.map.marker = {
						lat: lat,
						lng: lng,
						focus: true,
						icon: iconRed,
						message: 'Zoom helt ind på kortet og klik for at angive den helt nøjagtige position.',
						draggable: true
					}
					e.map.markers['marker'] = e.map.marker;
				} else {
					e.map.marker.lat = lat;
					e.map.marker.lng = lng;
				}

				e.map.center = {
					lat: lat,
					lng: lng,
					zoom: 16
				}
				$scope.$apply();
				*/
			}

			function formatAdresse(a,p,b,k,r) {
				var r = a;
				r += ', ' + p + ' ' + b;
				return r;
			}

			var kommuneNr = item.municipalityCode ? item.municipalityCode : item.municipalityCodes;
			var kommune = KR.kommuneByNr( kommuneNr );

			$('#adresse').val( formatAdresse(
				adresse,
				item.postCodeIdentifier, 
				item.districtName,
				kommune ? kommune.navn : '',
				kommune ? kommune.region.navn : ''
			));

			/*
			var form = angular.element('#formLokalitet'+eksperiment_id);
			var e = $scope.eksperimentById(eksperiment_id);
			switch (adresseType) {
				case 'adresser': 
					wkt.read(item.geometryWkt);
					var point = wkt.components[0] && !wkt.components[0].length 
						? wkt.components[0]
						: wkt.components[0][0];

					if (point && !point.length) setLatLng(e, form, point.y, point.x);
							
					var kommuneNr = item.municipalityCode ? item.municipalityCode : item.municipalityCodes;
					var kommune = KR.kommuneByNr( kommuneNr );

					var adresse = item.streetName;
					adresse += item.streetBuildingIdentifier ? ' '+item.streetBuildingIdentifier : '';

					form.find('input[name="geometryWkt"]').val( item.geometryWkt );
					form.find('input[name="postnr"]').val( item.postCodeIdentifier );
					form.find('input[name="by"]').val( item.districtName );

					if (kommune) {
						form.find('input[name="kommune"]').val( kommune.navn );
						form.find('input[name="region"]').val( kommune.region.navn.replace('Region', '').trim() );
					}
	
					//store item on the input
					form.find('input[name="adresse"]').data('item', item);

					form.find('input[name="adresse"]').val( formatAdresse(
						adresse,
						item.postCodeIdentifier, 
						item.districtName,
						kommune ? kommune.navn : '',
						kommune ? kommune.region.navn : ''
					));

					Utils.formSetDirty('#formLokalitet'+eksperiment_id);
					break;

				case 'stednavne_v2': 
					wkt.read(item.geometryWkt);
					var point = wkt.components[0] && !wkt.components[0].length 
						? wkt.components[0]
						: wkt.components[0][0]

					var latLng = Geo.EPSG25832_to_WGS84(point.x, point.y)
					setLatLng(e, form, latLng.lng, latLng.lat)
					
					$scope.findNearestAddress(point.x, point.y).then(function(adresse) {
						var a = adresse[0].properties ? adresse[0].properties : null;
						if (a) {
							var kommune = KR.kommuneByNr( a.kommune_kode )
							form.find('input[name="adresse"]').val( item.skrivemaade_officiel +', ' + a.vej_navn +' '+ a.husnr )
							form.find('input[name="postnr"]').val( a.postdistrikt_kode )
							form.find('input[name="by"]').val( a.postdistrikt_navn )
							form.find('input[name="kommune"]').val( a.kommune_navn )
							form.find('input[name="region"]').val( kommune ? kommune.region.navn.replace('Region', '').trim() : '' )
						}
					})

					break;

				default:
					break;
				*/
			}

		$scope.eventModalClose = function(value) {

			function close() {
				modal.hide();
				modal.destroy();
				modal = null;
				delete $scope.__eventModal;
	      deferred.resolve(value)
			}

			if (value) {
				if (user_id) {
					ESPBA.update('event', $scope.edit).then(function(r) {
						close()
					})
				} else {
					$scope.edit.hash = Utils.getHash();
					ESPBA.insert('event', $scope.edit).then(function(r) {
						close()
					})
				}
			} else {
				close()
			}
		};

		angular.element('body').on('keydown', function(e) {
			if (e.charCode == 27) $scope.gruppeModalClose(false)
		});

	}];

	return {

		show: function(event_id) {
			deferred = $q.defer()
			modal = $modal({
				templateUrl: 'views/admin.event.modal.html',
				backdrop: 'static',
				show: true,
				keyboard: false,
				controller: local.modalInstance,
				locals: { event_id: event_id }
			});
      return deferred.promise;
		}

	}

});
