'use strict';

/**
 *
 *
 */
angular.module('indeuApp').controller('AdminGrupperCtrl', 
	function($scope, $q, $location, Utils, ESPBA, DTOptionsBuilder, DTColumnBuilder, GruppeModal, Lookup, Const, AdminRights) {

		if (!AdminRights.groupView()) {
			$location.path('/admin-overblik').replace()
		}

		$scope.dtInstanceCallback = function(instance) {
			$scope.dtInstance = instance;
    };

		var owners = {};

		$scope.dtColumns = [
      DTColumnBuilder.newColumn('id')
				.withTitle('#')
				.withClass('no-click')
				.renderWith(function(data, type, full, meta) {
					if (type === 'display') {
						return '<a href="'+Utils.gruppeUrl(full.id, full.name)+'"><i class="fa fa-eye"></i></a>'
					} else {
						return data;
					}
				}),

      DTColumnBuilder.newColumn('name').withTitle('Navn'),
      DTColumnBuilder.newColumn('owner_id')
				.withTitle('Ejer')
				.renderWith(function(data, type /*, full, meta*/) {
					if (type === 'display') {
						if (!isNaN(data)) {
							var id = parseInt(data);
							return Lookup.getUser(id).full_name
						}
						return data
					} else {
						return data;
					}
				}),
      DTColumnBuilder.newColumn('about')
				.withTitle('Beskrivelse')
				.withClass('td-about-text')
				.renderWith(function(data, type /*, full, meta*/) {
					if (type === 'display') {
						return $(data).text()
					} else {
						return data;
					}
				}),
      DTColumnBuilder.newColumn('access_level')
				.withTitle('Niveau')
				.renderWith(function(data, type /*, full, meta*/) {
					if (type === 'display') {
						return Lookup.accessLevelName(data)
					} else {
						return data;
					}
				}),
      DTColumnBuilder.newColumn('visibility_level')
				.withTitle('Synlighed')
				.renderWith(function(data, type /*, full, meta*/) {
					if (type === 'display') {
						return Lookup.visibilityLevelName(data)
					} else {
						return data;
					}
				}),

		];

		$scope.dtOptions = DTOptionsBuilder
			.fromFnPromise(function() {
				var defer = $q.defer();
				ESPBA.get('group', {}).then(function(res) {
					$scope.data = res.data;
					defer.resolve($scope.data);
				});
				return defer.promise;
	    })
			.withOption('drawCallback', function() {
			})
			.withOption('rowCallback', function(row, data /*, index*/) {
				$(row).attr('group-id', data.id);
			})
			.withOption('dom', 'Blfrtip')
			.withOption('stateSave', true)
			.withOption('language', Const.dataTables_daDk )
			.withButtons([ 
				{ extend : 'colvis',
					text: 'Vis kolonner &nbsp;<i class="caret"></i>',
					className: 'btn btn-default btn-xs colvis-btn'
				},
				{ text: '<span><i class="fa fa-plus text-success"></i>&nbsp;Ny gruppe</span>',
					className: 'btn btn-xs',
					action: function( /* e, dt, node, config */) {
						GruppeModal.show($scope).then(function() {
							$scope.dtInstance.reloadData();
						});
 					}
				}

			]);

		angular.element('#table-grupper').on('click', 'tbody td:not(.no-click)', function(e) {
			var id=$(this).parent().attr('group-id');

			//should never happen with new delegated event structure
			if (!id || GruppeModal.isShown()) {
				e.preventDefault();
				e.stopPropagation();
				return;
			}

			GruppeModal.show($scope, id).then(function() {
				$scope.dtInstance.reloadData();
			});	
		});


});

