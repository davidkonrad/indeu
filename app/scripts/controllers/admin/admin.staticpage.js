'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
  .controller('AdminStatiskCtrl', 
	function($scope, $q, Utils, ESPBA, DTOptionsBuilder, DTColumnBuilder, StaticPageModal, Lookup, Const) {

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
						return '<a href="'+Utils.staticUrl(full.id, full.header)+'"><i class="fa fa-eye"></i></a>'
					} else {
						return data;
					}
				}),

      DTColumnBuilder.newColumn('created_timestamp').withTitle('Oprettet'),
      DTColumnBuilder.newColumn('user_full_name').withTitle('Bruger'),
      DTColumnBuilder.newColumn('header').withTitle('Overskrift')

		];

		$scope.dtOptions = DTOptionsBuilder
			.fromFnPromise(function() {
				var defer = $q.defer();
				ESPBA.prepared('StaticPagesAll', {}).then(function(res) {
					$scope.data = res.data;
					defer.resolve($scope.data);
				});
				return defer.promise;
	    })
			.withOption('drawCallback', function() {
			})
			.withOption('rowCallback', function(row, data /*, index*/) {
				$(row).attr('static-page-id', data.id);
			})
			.withOption('dom', 'Blfrtip')
			.withOption('stateSave', true)
			.withOption('language', Const.dataTables_daDk )
			.withButtons([ 
				{ extend : 'colvis',
					text: 'Vis kolonner &nbsp;<i class="caret"></i>',
					className: 'btn btn-default btn-xs colvis-btn'
				},
				{ text: '<span><i class="fa fa-plus text-success"></i>&nbsp;Ny statisk side</span>',
					className: 'btn btn-xs',
					action: function( e, dt, node, config ) {
						StaticPageModal.show().then(function() {
							$scope.dtInstance.reloadData();
						});
 					}
				}

			]);

		angular.element('#table-statisk').on('click', 'tbody td:not(.no-click)', function(e) {
			var id=$(this).parent().attr('static-page-id');
			StaticPageModal.show(id).then(function() {
				$scope.dtInstance.reloadData();
			});	
		});


});
