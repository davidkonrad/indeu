'use strict';

/**
 *
 *
 */
angular.module('indeuApp').controller('AdminBrugereCtrl', 
	function($scope, $q, $location, Utils, ESPBA, DTOptionsBuilder, DTColumnBuilder, BrugerModal, Const, AdminRights) {

		if (!AdminRights.isLoaded() || !AdminRights.userView()) {
			$location.path('/admin-overblik').replace()
		}

		$scope.createRights = AdminRights.userCreate();

		$scope.dtInstanceCallback = function(instance) {
			$scope.dtInstance = instance;
    };

		$scope.dtColumns = [
      DTColumnBuilder.newColumn('id')
				.withTitle('#')
				.withClass('no-click')
				.notSortable()
				.renderWith(function(data, type, full, meta) {
					if (type === 'display') {
						return '<a href="'+Utils.userUrl(full.id, full.full_name)+'"><i class="fa fa-eye"></i></a>'
					} else {
						return data;
					}
				}),

      DTColumnBuilder.newColumn('first_name').withTitle('Fornavn'),
      DTColumnBuilder.newColumn('last_name').withTitle('Efternavn'),
      DTColumnBuilder.newColumn('alias').withTitle('Alias'),
      DTColumnBuilder.newColumn('email').withTitle('Email'),
      DTColumnBuilder.newColumn('logged_in')
				.withTitle('Online')
				.withClass('text-center')
				.renderWith(function(data, type, full, meta) {
					if (type === 'display') {
						return data == 1 ? '<i class="fa fa-check"></i>' : ''
					} else {
						return data;
					}
				}),

      DTColumnBuilder.newColumn('last_seen').withTitle('Sidst set').withOption('visible', false),
      DTColumnBuilder.newColumn('created_timestamp').withTitle('Oprettet'),
		];

		$scope.dtOptions = DTOptionsBuilder
			.fromFnPromise(function() {
				var defer = $q.defer();
				ESPBA.get('user', {}).then(function(res) {
					$scope.data = res.data;
					defer.resolve($scope.data);
				});
				return defer.promise;
	    })
			.withOption('rowCallback', function(row, data) {
				$(row).attr('user-id', data.id);
			})
			.withOption('dom', 'Blfrtip')
			.withOption('stateSave', true)
			.withOption('language', Const.dataTables_daDk )
			.withButtons([ 
				{ extend : 'colvis',
					text: 'Vis kolonner &nbsp;<i class="caret" style="position:relative;top:-3px;"></i>',
					className: 'btn btn-default btn-xs colvis-btn'
				},
				{ text: '<span><i class="fa fa-plus text-success"></i>&nbsp;Ny bruger</span>',
					className: $scope.createRights ? 'btn btn-xs' : 'btn btn-xs disabled',
					action: function() {
						BrugerModal.show().then(function() {
							$scope.dtInstance.reloadData();
						});
 					}
				}

			]);

		angular.element('#table-brugere').on('click', 'tbody td:not(.no-click)', function(e) {
			var id=$(this).parent().attr('user-id');
			BrugerModal.show(id).then(function() {
				$scope.dtInstance.reloadData();
			});	
		});


});

