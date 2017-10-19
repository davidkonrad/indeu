'use strict';

/**
 *
 *
 */
angular.module('indeuApp').controller('AdminForeningerCtrl', 
	function($scope, $q, ESPBA, Utils, Const, Log, Login, ForeningModal, DTOptionsBuilder, DTColumnBuilder, DTDefaultOptions) {

		DTDefaultOptions.setLoadingTemplate('<img src="images/ajax-loader.gif">');

		$scope.dtInstanceCallback = function(instance) {
			$scope.dtInstance = instance;
    };

		$scope.dtColumns = [
      DTColumnBuilder.newColumn('id')
				.withTitle('#')
				.notSortable()
				.withClass('no-click')
				.renderWith(function(data, type, full) {
					if (type === 'display') {
						return '<a href="'+Utils.foreningUrl(full.id, full.name)+'" target=_blank><i class="fa fa-eye"></i></a>'
					} else {
						return data;
					}
				}),

      DTColumnBuilder.newColumn('created_timestamp')
				.withTitle('Oprettet')
				.renderWith(function(data) {
					return moment(data).calendar()
				}),

      DTColumnBuilder.newColumn('active')
				.withTitle('')
				.renderWith(function(data) {
					return data == '1'
						? '<i class="fa fa-check text-success"></i>'
						: '<i class="fa fa-remove"></i>';
				}),

      DTColumnBuilder.newColumn('name')
				.withTitle('Navn')

		];

		$scope.dtOptions = DTOptionsBuilder
			.fromFnPromise(function() {
				var defer = $q.defer();
				ESPBA.get('association', {}).then(function(res) {
					$scope.data = res.data;
					defer.resolve($scope.data);
				});
				return defer.promise;
	    })
			.withOption('rowCallback', function(row, data /*, index*/) {
				$(row).attr('forening-id', data.id);
			})
			.withOption('dom', 'Blfrtip')
			.withOption('stateSave', true)
			.withOption('language', Const.dataTables_daDk )
			.withButtons([ 
				{ extend : 'colvis',
					columns: ':not(.no-colvis)',
					text: 'Vis kolonner &nbsp;<i class="caret" style="position:relative;top:-3px;"></i>',
					className: 'btn btn-default btn-xs colvis-btn'
				},
				{ text: '<span><i class="fa fa-plus text-success"></i>&nbsp;Ny Forening</span>',
					className: 'btn btn-xs',
					action: function( /* e, dt, node, config */) {
						ForeningModal.show($scope).then(function(f) {
							if (f) {
								$scope.dtInstance.reloadData();
							}
						});
 					}
				}
			]);

		angular.element('#table-foreninger').on('click', 'tbody td:not(.no-click)', function(e) {
			var id=$(this).parent().attr('forening-id');
			ForeningModal.show($scope, id).then(function(f) {
				if (f) {
					$scope.dtInstance.reloadData();
				}
			});	
		});


});

