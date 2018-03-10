'use strict';

/**
 *
 *
 */
angular.module('indeuApp').factory('SelectGruppeModal', 
	function($modal, $q, ESPBA, Lookup, Utils, DTOptionsBuilder, DTColumnBuilder) {

	var deferred = null;
	var modal = null;

	return {

		isShown: function() {
			return modal != null;
		},
		show: function($scope, multi, group_ids) {

			deferred = $q.defer();

			$scope.__modal = {
				btnOk: 'Vælg og luk',
				title: multi ? 'Vælg en eller flere grupper' : 'Vælg en gruppe'
			};

			$scope.__modal.dtInstanceCallback = function(instance) {
				$scope.__modal.dtInstance = instance;
	    };

			$scope.__modal.dtColumns = [
	      DTColumnBuilder.newColumn('id').withTitle('#'),
	      DTColumnBuilder.newColumn('name').withTitle('Navn')
			];

			$scope.__modal.dtOptions = DTOptionsBuilder
				.fromFnPromise(function() {
					var defer = $q.defer();
					ESPBA.get('group', {}).then(function(res) {
						if (group_ids) {
							$scope.data = res.data.filter(function(g) {
								if (!~group_ids.indexOf(g.id)) return g
							})
						} else {
							$scope.data = res.data;
						}
						defer.resolve($scope.data);
					});
					return defer.promise;
		    })
				.withOption('drawCallback', function() {
				})
				.withOption('scrollY', 280)
				.withOption('paging', false)
				.withOption('rowCallback', function(row, data /*, index*/) {
					$(row).attr('group-id', data.id);
				})
				.withSelect({
					style: multi ? 'multi' : 'single',
					selector: 'tr'
        })
				.withOption('dom', 'ft')
				.withOption('stateSave', true)
				.withOption('language', Utils.dataTables_daDk);

			modal = $modal({
				scope: $scope,
				templateUrl: 'views/admin.select.gruppe.modal.html',
				backdrop: 'static',
				show: true,
				keyboard: false
			});

			$scope.__modal.canSave = function() {
				if (!$scope.__modal.dtInstance) return false;
				return $scope.__modal.dtInstance.DataTable.rows( { selected: true } )[0].length > 0;
			};

			$('body').on('click', '#table-grupper tr', function() {
				$scope.$apply()
			});

			$('body').on('dblclick', '#table-grupper tr', function(e) {
				if (!$scope.__modal) return;
				$scope.__modal.dtInstance.DataTable.row(this).select();
				e.stopPropagation();
				$scope.__modalClose(true);
			});


			$scope.__modalClose = function(value) {

				function close() {
					if (!modal) return;
					modal.hide();
					modal.destroy();
					modal = null;
				}

				if (value) {
					var groups = [];
					$scope.__modal.dtInstance.DataTable.rows( { selected: true } ).every(function(rowIdx, tableLoop, rowLoop) {
						groups.push(this.data());
					})
					close();
					deferred.resolve(groups);
				} else {
					close();
					deferred.resolve(false);
				}
			};

			angular.element('body').on('keydown', function(e) {
				if (e.charCode == 27) $scope.__modalClose(false)
			});

      return deferred.promise;
		}

	}

});
