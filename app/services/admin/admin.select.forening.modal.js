'use strict';

/**
 *
 *
 */
angular.module('indeuApp').factory('SelectForeningModal', function($modal, $q) {

	var deferred = null;
	var modal = null;
	var local = this;

	local.modalInstance = ['$scope', 'ESPBA', 'Lookup', 'Utils', 'Const', 'DTOptionsBuilder', 'DTColumnBuilder',
	function($scope, ESPBA, Lookup, Utils, Const, DTOptionsBuilder, DTColumnBuilder) {

		$scope.btnOk = 'Vælg og luk';
		$scope.title = 'Vælg en forening fra listen';

		$scope.dtInstanceCallback = function(instance) {
			$scope.dtInstance = instance;
    };

		$scope.dtColumns = [
      DTColumnBuilder.newColumn('created_timestamp').withTitle('Oprettet'),
      DTColumnBuilder.newColumn('short_name').withTitle('kort navn'),
      DTColumnBuilder.newColumn('name').withClass('max400').withTitle('Navn')
		];

		$scope.dtOptions = DTOptionsBuilder
			.fromFnPromise(function() {
				var defer = $q.defer();
				ESPBA.get('association', {}).then(function(res) {
					defer.resolve(res.data);
				});
				return defer.promise;
	    })
			.withOption('scrollY', 280)
			.withOption('paging', false)
			.withOption('rowCallback', function(row, data) {
				$(row).attr('id', data.id);
			})
			.withSelect({
				style: 'single',
				selector: 'tr'
       })
			.withOption('dom', 'ft')
			.withOption('stateSave', true)
			.withOption('language', Const.dataTables_daDk );

		$('body').on('click', '#table-content tr', function() {
			$scope.$apply()
		});

		$('body').on('dblclick', '#table-content tr', function(e) {
			if (!modal) return;
			e.stopPropagation();
			var row = $scope.dtInstance.DataTable.row(this);
			if (row) {
				row.select();
				$scope.modalClose(true)
			}
		});

		$scope.canSave = function() {
			if (!$scope.dtInstance) return false;
			return $scope.dtInstance.DataTable.rows( { selected: true } )[0].length > 0;
		};

		$scope.modalClose = function(value) {

			function close() {
				modal.hide();
				modal.destroy();
				modal = null;
			}

			if (value) {
				var content = $scope.dtInstance.DataTable.rows( { selected: true } ).data();
				close();
				deferred.resolve(content);
			} else {
				close();
				deferred.resolve(false);
			}
		};

		angular.element('body').on('keydown', function(e) {
			if (e.charCode == 27) $scope.modalClose(false)
		});

	}];

	return {

		show: function() {
			deferred = $q.defer();
			modal = $modal({
				controller: local.modalInstance,
				templateUrl: 'views/admin/select.content.modal.html',
				backdrop: 'static',
				show: true,
				keyboard: false
			});
      return deferred.promise;
		}

	}

});
