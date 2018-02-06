'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
  .controller('AdminEventsCtrl', 
	function($scope, $q, Utils, ESPBA, DTOptionsBuilder, DTColumnBuilder, EventModal, Lookup, Const) {

		$scope.dtInstanceCallback = function(instance) {
			$scope.dtInstance = instance;
    };

		var owners = {};

		$scope.dtColumns = [
      DTColumnBuilder.newColumn('id')
				.withTitle('#')
				.notSortable()
				.withClass('no-click')
				.renderWith(function(data, type, full) {
					if (type === 'display') {
						return '<a href="#/event/'+full.id+'/'+Utils.urlName(full.name)+'"><i class="fa fa-eye"></i></a>'
					} else {
						return data;
					}
				}),

      DTColumnBuilder.newColumn('name').withTitle('Navn'),
      DTColumnBuilder.newColumn('date').withTitle('Dato'),
      DTColumnBuilder.newColumn('from').withTitle('Fra'),
      DTColumnBuilder.newColumn('to').withTitle('Til'),
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
				ESPBA.get('event', {}).then(function(res) {
					$scope.data = res.data;
					defer.resolve($scope.data);
				});
				return defer.promise;
	    })
			.withOption('drawCallback', function() {
			})
			.withOption('rowCallback', function(row, data /*, index*/) {
				$(row).attr('event-id', data.id);
			})
			.withOption('dom', 'Blfrtip')
			.withOption('stateSave', true)
			.withOption('language', Const.dataTables_daDk )
			.withButtons([ 
				{ extend : 'colvis',
					text: 'Vis kolonner &nbsp;<i class="caret" style="position:relative;top:-3px;"></i>',
					className: 'btn btn-default btn-xs colvis-btn'
				},
				{ text: '<span><i class="fa fa-plus text-success"></i>&nbsp;Ny event</span>',
					className: 'btn btn-xs',
					action: function( /* e, dt, node, config */) {
						EventModal.show($scope).then(function() {
							$scope.dtInstance.reloadData();
						});
 					}
				}

			]);

		angular.element('#table-events').on('click', 'tbody td:not(.no-click)', function(e) {
			var id=$(this).parent().attr('event-id');

			//should never happen with new delegated event structure
			if (!id || EventModal.isShown()) {
				e.preventDefault();
				e.stopPropagation();
				return;
			}

			EventModal.show($scope, id).then(function() {
				$scope.dtInstance.reloadData();
			});	
		});


});

