'use strict';

/**
 *
 *
 */
angular.module('indeuApp').factory('SelectContentModal', function($modal, $q) {

	var deferred = null;
	var modal = null;
	var local = this;

	local.modalInstance = ['$scope', 'ESPBA', 'Lookup', 'Utils', 'Const', 'DTOptionsBuilder', 'DTColumnBuilder', 'content_type',
	function($scope, ESPBA, Lookup, Utils, Const, DTOptionsBuilder, DTColumnBuilder, content_type) {

		$scope.btnOk = 'Vælg og luk';

		switch (content_type) {
			case 'article': 
				$scope.title = 'Vælg en <strong>artikel</strong> fra listen';
				break;
			case 'association': 
				$scope.title = 'Vælg en <strong>forening</strong> fra listen';
				break;
			case 'event': 
				$scope.title = 'Vælg en <strong>event</strong> fra listen';
				break;
			case 'static_page': 
				$scope.title = 'Vælg en <strong>statisk side</strong> fra listen';
				break;
			default:
				console.error('SelectContentModal: severe error');
				break;
		}

		$scope.dtInstanceCallback = function(instance) {
			if ($scope.dtInstance) {
				console.log('clear')
				$scope.dtInstance.DataTable.clear();
			}
			$scope.dtInstance = instance;
			$scope.dtInstance.rerender()
    };

		switch (content_type) {
			case 'article' :
				$scope.dtColumns = [
		      DTColumnBuilder.newColumn('created_timestamp').withTitle('Oprettet'),
		      DTColumnBuilder.newColumn('user_id').withTitle('Forfatter').renderWith(function(data) {
						return Lookup.getUser(data).full_name
					}),
		      DTColumnBuilder.newColumn('header').withClass('max400').withTitle('Overskrift')
				];
				break;

			case 'association' :
				$scope.dtColumns = [
		      DTColumnBuilder.newColumn('created_timestamp').withTitle('Oprettet'),
		      DTColumnBuilder.newColumn('short_name').withTitle('kort navn'),
		      DTColumnBuilder.newColumn('name').withClass('max400').withTitle('Navn')
				];
				break;

			case 'event' :
				$scope.dtColumns = [
		      DTColumnBuilder.newColumn('created_timestamp').withTitle('Oprettet'),
		      DTColumnBuilder.newColumn('date').withTitle('Dato'),
		      DTColumnBuilder.newColumn('name').withTitle('Navn'),
		      DTColumnBuilder.newColumn('about').withClass('max400').withTitle('Beskrivelse')
				];
				break;

			case 'static_page' :
				$scope.dtColumns = [
		      DTColumnBuilder.newColumn('created_timestamp').withTitle('Oprettet'),
		      DTColumnBuilder.newColumn('header').withTitle('Overskrift'),
		      DTColumnBuilder.newColumn('sub_header').withTitle('Manchet')
				];
				break;

			default:
				$scope.modalClose(false);
				break;
		}

		if (!$scope.dtInstance) {
		$scope.dtOptions = DTOptionsBuilder
			.fromFnPromise(function() {
				var defer = $q.defer();
				ESPBA.get(content_type, {}).then(function(res) {
					/*
					$scope.data = res.data;
					defer.resolve($scope.data);
					*/
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
			//.withOption('stateSave', true)
			.withOption('language', Const.dataTables_daDk );
		} else {
			console.log('reloading!');
			$scope.dtInstance.rerender() //loadData()
		}

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
				//$scope.dtInstance.DataTable.ngDestroy();
				//$scope.dtInstance.DataTable.destroy();
				//$scope.dtInstance.DataTable.clear();
				modal.hide();
				modal.destroy();
				modal = null;
			}

			if (value) {
				/*
				var content = [];
				$scope.dtInstance.DataTable.rows( { selected: true } ).every(function(rowIdx, tableLoop, rowLoop) {
					content.push(this.data());
				})
				*/
				var content = $scope.dtInstance.DataTable.rows( { selected: true } ).data();
				close();
				console.log(content);
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

		show: function(content_type) {
			deferred = $q.defer();
			modal = $modal({
				controller: local.modalInstance,
				templateUrl: 'views/admin/select.content.modal.html',
				backdrop: 'static',
				show: true,
				keyboard: false,
				locals: {
					content_type: content_type
				}
			});
      return deferred.promise;
		}

	}

});
