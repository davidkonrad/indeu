'use strict';

/**
 *
 *
 */
angular.module('indeuApp').controller('AdminArtiklerCtrl', function($scope, $location, $q, ESPBA, Lookup, Meta, Utils, 
	DTOptionsBuilder, DTColumnBuilder, ArtikelModal, Const, $adminRights) {

		if (!$adminRights || !$adminRights.articleView) {
			$location.path('/admin-overblik').replace()
		}

		$scope.adminRights = $adminRights;
		
		$scope.dtInstanceCallback = function(instance) {
			$scope.dtInstance = instance;
    };

		var owners = {};

		$scope.dtColumns = [
      DTColumnBuilder.newColumn('id')
				.withTitle('')
				.notSortable()
				.withClass('no-click no-colvis')
				.renderWith(function(data, type, full) {
					if (type === 'display') {
						return '<a href="' + Utils.articleUrl(full.id, full.header) +'" target=_blank><i class="fa fa-eye cursor-pointer"></i></a>'
					} else {
						return data;
					}
				}),

      DTColumnBuilder.newColumn('created_timestamp')
				.withTitle('Dato')
				.renderWith(function(data, type, full) {
					if (type === 'display') {
						return moment(data).local().calendar()
					}
					return data
				}),

      DTColumnBuilder.newColumn('accepted')
				.withTitle('Godk.')
				.renderWith(function(data, type, full) {
					if (type === 'display') {
						data = parseInt(data);
						switch (data) {
							case 0:
								return '<i class="fa fa-remove text-danger"></i>';
								break;
							case 1:
								return '<i class="fa fa-check text-success"></i>';
								break;
							default:
								return '<i class="fa fa-question text-primary"></i>';
								break;
						}
					} else {
						return data;
					}
				}),

      DTColumnBuilder.newColumn('published')
				.withTitle('Publ.')
				.renderWith(function(data, type, full) {
					if (type === 'display') {
						data = parseInt(data);
						switch (data) {
							case 0:
								return '<i class="fa fa-remove text-danger"></i>';
								break;
							case 1:
								return '<i class="fa fa-check text-success"></i>';
								break;
							default:
								return '<i class="fa fa-question text-primary"></i>';
								break;
						}
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

      DTColumnBuilder.newColumn('user_id')
				.withTitle('Bruger')
				.renderWith(function(data, type, full) {
					if (type === 'display') {
						return Lookup.getUser(data).full_name
					} else {
						return data;
					}
				}),

/*
      DTColumnBuilder.newColumn('author_id')
				.withTitle('Forfatter')
				.renderWith(function(data, type, full) {
					if (type === 'display') {
						return parseInt(data)>0
							? Lookup.getUser(data).full_name
							: '';
					} else {
						return data;
					}
				}),
*/

      DTColumnBuilder.newColumn('header')
				.withClass('td-about-text')
				.withTitle('Overskrift'),

		];

		$scope.dtOptions = DTOptionsBuilder
			.fromFnPromise(function() {
				var defer = $q.defer();
				ESPBA.get('article', {}).then(function(res) {
					$scope.data = res.data;
					defer.resolve($scope.data);
				});
				return defer.promise;
	    })
			.withOption('drawCallback', function() {
			})
			.withOption('rowCallback', function(row, data /*, index*/) {
				$(row).attr('artikel-id', data.id);
			})
			.withOption('dom', 'Blfrtip')
			.withOption('stateSave', true)
			.withOption('language', Const.dataTables_daDk )
			.withButtons([ 
				{ extend : 'colvis',
					columns: ':not(.no-colvis)',
					text: 'Vis kolonner &nbsp;<i class="caret"></i>',
					className: 'btn btn-default btn-xs colvis-btn'
				},
				{ text: '<span><i class="fa fa-plus text-success"></i>&nbsp;Ny artikel</span>',
					className: 'btn btn-xs',
					action: function( /* e, dt, node, config */) {
						ArtikelModal.show().then(function() {
							$scope.dtInstance.reloadData();
						});
 					}
				}

			]);

		angular.element('#table-artikler').on('click', 'tbody td:not(.no-click)', function(e) {
			var id=$(this).parent().attr('artikel-id');
			ArtikelModal.show(id).then(function() {
				$scope.dtInstance.reloadData();
			});	
		});


});

