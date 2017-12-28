'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
	.factory('SelectBrugerModal', function($modal, $q, ESPBA, Lookup, Utils, Const, DTOptionsBuilder, DTColumnBuilder) {

	var deferred = null;
	var modal = null;

	return {

		isShown: function() {
			return modal != null;
		},
		show: function($scope, multi, current_user_ids) {
			deferred = $q.defer()

			$scope.__modal = {
				btnOk: 'Gem og luk',
				title: multi ? 'Vælg en eller flere brugere' : 'Vælg en bruger'
			};

			$scope.__modal.dtInstanceCallback = function(instance) {
				$scope.__modal.dtInstance = instance;
	    };

			$scope.__modal.dtColumns = [
	      DTColumnBuilder.newColumn('id').withTitle('#'),
	      DTColumnBuilder.newColumn('first_name').withTitle('Fornavn'),
	      DTColumnBuilder.newColumn('last_name').withTitle('Efternavn'),
	      DTColumnBuilder.newColumn('alias').withTitle('Alias'),
	      DTColumnBuilder.newColumn('email').withTitle('Email'),
	      DTColumnBuilder.newColumn('created_timestamp').withTitle('Oprettet'),
			];

			$scope.__modal.dtOptions = DTOptionsBuilder
				.fromFnPromise(function() {
					var defer = $q.defer();
					ESPBA.get('user', {}).then(function(res) {
						var data = [];
						res.data.forEach(function(d) {
							if (current_user_ids) {
								if (!~current_user_ids.indexOf(d.id)) data.push(d);
							} else {
								data.push(d);
							}
						});
						$scope.data = data;						
						defer.resolve($scope.data);
					});
					return defer.promise;
		    })
				.withOption('drawCallback', function() {
				})
				.withOption('scrollY', 280)
				.withOption('paging', false)
				.withOption('rowCallback', function(row, data /*, index*/) {
					$(row).attr('user-id', data.id);
				})
				.withSelect({
					style: multi ? 'os' : 'single',
					selector: 'tr'
        })
				.withOption('dom', 'ft')
				.withOption('stateSave', true)
				.withOption('language', Const.dataTables_daDk );

			$scope.__modal.canSave = function() {
				if (!$scope.__modal.dtInstance) return false;
				return $scope.__modal.dtInstance.DataTable.rows( { selected: true } )[0].length > 0;
			};

			$('body').on('click', '#table-brugere tr', function() {
				$scope.$apply() //???
			});

			$('body').on('dblclick', '#table-brugere tr', function(e) {
				if (!$scope.__modal) return;
				$scope.__modal.dtInstance.DataTable.row(this).select();
				e.stopPropagation();
				$scope.__modalClose(true)
			});

			modal = $modal({
				scope: $scope,
				templateUrl: 'views/admin.select.bruger.modal.html',
				backdrop: 'static',
				show: false,
				keyboard: false
			});

			modal.$promise.then(function() {
				//console.log('modal promise');
			});

			modal.$promise.then(modal.show).then(function() {
				//console.log('modal show');
			});

			$scope.__modalClose = function(value) {

				function close() {
					modal.hide();
					modal.destroy();
					modal = null;
					delete $scope.__modal;
				}

				if (value) {
					var users = [];
					$scope.__modal.dtInstance.DataTable.rows( { selected: true } ).every(function(rowIdx, tableLoop, rowLoop) {
						users.push(this.data());
					})
					close();
					deferred.resolve(multi ? users : users[0]);
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
