'use strict';

/**
 *
 *
 */
angular.module('indeuApp').controller('AdminBrugerRequestsCtrl', 
	function($scope, $q, $location, Utils, ESPBA, DTOptionsBuilder, DTColumnBuilder, BrugerRequestModal, Const, AdminRights) {

		if (!AdminRights.isLoaded() || !AdminRights.user_requestView()) {
			$location.path('/admin-overblik').replace()
		}

		//$scope.createRights = AdminRights.userCreate();

		$scope.dtInstanceCallback = function(instance) {
			$scope.dtInstance = instance;
    };

		$scope.dtColumns = [
      DTColumnBuilder.newColumn('created_timestamp').withTitle('Oprettet'),
			DTColumnBuilder.newColumn('email_confirmed')
				.withTitle('Bekræftet')
				.withClass('text-center')
				.renderWith(function(data, type, full, meta) {
					if (type === 'display') {
						return data == 1 ? '<i class="fa fa-check"></i>' : ''
					} else {
						return data;
					}
				}),
      DTColumnBuilder.newColumn('first_name').withTitle('Fornavn'),
      DTColumnBuilder.newColumn('last_name').withTitle('Efternavn'),
      DTColumnBuilder.newColumn('full_name').withTitle('Fulde navn'),
      DTColumnBuilder.newColumn('email').withTitle('Email'),
      DTColumnBuilder.newColumn('address').withTitle('Adresse')
		];

		$scope.dtOptions = DTOptionsBuilder
			.fromFnPromise(function() {
				var defer = $q.defer();
				ESPBA.get('user_request', {}).then(function(res) {
					$scope.data = res.data;
					defer.resolve($scope.data);
				});
				return defer.promise;
	    })
			.withOption('rowCallback', function(row, data) {
				$(row).attr('request-id', data.id);
			})
			.withOption('dom', 'lfrtip')
			.withOption('stateSave', true)
			.withOption('language', Const.dataTables_daDk );

		angular.element('#table-bruger-requests').on('click', 'tbody td:not(.no-click)', function(e) {
			var id=$(this).parent().attr('request-id');
			BrugerRequestModal.show(id).then(function() {
				$scope.dtInstance.reloadData();
			});	
		});


});

