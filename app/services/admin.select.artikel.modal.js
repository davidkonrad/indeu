'use strict';

/**
 *
 *
 */
angular.module('indeuApp')
	.factory('SelectArtikelModal', 
	function($modal, $q, ESPBA, Lookup, Utils, Const, DTOptionsBuilder, DTColumnBuilder) {

	var deferred = null;
	var modal = null;

	return {

		isShown: function() {
			return modal != null;
		},
		show: function($scope) {

			deferred = $q.defer();

			$scope.__modal = {
				btnOk: 'Vælg og luk',
				title: 'Vælg en artikel'
			};

			$scope.__modal.dtInstanceCallback = function(instance) {
				$scope.__modal.dtInstance = instance;
	    };

			$scope.__modal.dtColumns = [

	      DTColumnBuilder.newColumn('created_timestamp')
					.withTitle('Oprettet'),

	      DTColumnBuilder.newColumn('user_id')
					.withTitle('Forfatter')
					.renderWith(function(data) {
						return Lookup.getUser(data).full_name
					}),

	      DTColumnBuilder.newColumn('header')
					.withClass('max400')
					.withTitle('Overskrift')
			];

			$scope.__modal.dtOptions = DTOptionsBuilder
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
				.withOption('scrollY', 280)
				.withOption('paging', false)
				.withOption('rowCallback', function(row, data /*, index*/) {
					$(row).attr('article-id', data.id);
				})
				.withSelect({
					style: 'single',
					selector: 'tr'
        })
				.withOption('dom', 'ft')
				.withOption('stateSave', true)
				.withOption('language', Const.dataTables_daDk );

			modal = $modal({
				scope: $scope,
				templateUrl: 'views/admin.select.artikel.modal.html',
				backdrop: 'static',
				show: true,
				keyboard: false
			});

			$('body').on('click', '#table-artikler tr', function() {
				$scope.$apply()
			});

			$scope.__modal.canSave = function() {
				if (!$scope.__modal.dtInstance) return false;
				return $scope.__modal.dtInstance.DataTable.rows( { selected: true } )[0].length > 0;
			};

			$scope.__modalClose = function(value) {

				function close() {
					modal.hide();
					modal.destroy();
					modal = null;
				}

				if (value) {
					var article = [];
					$scope.__modal.dtInstance.DataTable.rows( { selected: true } ).every(function(rowIdx, tableLoop, rowLoop) {
						article.push(this.data());
					})
					close();
					deferred.resolve(article);
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
