'use strict';

angular.module('indeuApp').factory('Form', function(Utils, Login, ESPBA) {

	return {

			isEdited: function(id) {
				var form = document.querySelector(id)
				if (form) {
					var i; 
					var inputs = form.querySelectorAll('input:not(.exclude-from-form)');
					var textareas = form.querySelectorAll('textarea:not(.exclude-from-form)');
					var selects = form.querySelectorAll('button[bs-select]');
					var checks = form.querySelectorAll('button.button-checkbox');

					for (i=0; i<inputs.length; i++) {
						if (angular.element(inputs[i]).hasClass('ng-dirty')) {
							return true;
						}
					}
					for (i=0; i<selects.length; i++) {
						if (angular.element(selects[i]).hasClass('ng-dirty')) {
							return true;
						}
					}
					for (i=0; i<textareas.length; i++) {
						if (angular.element(textareas[i]).hasClass('ng-dirty')) {
							return true;
						}
					}
					for (i=0; i<checks.length; i++) {
						if (angular.element(checks[i]).hasClass('ng-dirty')) {
							return true;
						}
					}

				}
				return false;
			},

			reset: function(id) {
				var form = document.querySelector(id)
				if (form) {
					var i;
					var inputs = form.querySelectorAll('input:not(.exclude-from-form)');
					var textareas = form.querySelectorAll('textarea:not(.exclude-from-form)');
					var selects = form.querySelectorAll('button[bs-select]');
					var checks = form.querySelectorAll('button.button-checkbox');

					for (i=0; i<inputs.length; i++) {
						angular.element(inputs[i]).removeClass('ng-dirty');
						angular.element(inputs[i]).removeClass('ng-touched');
						angular.element(inputs[i]).addClass('ng-pristine');
					}
					for (i=0; i<selects.length; i++) {
						angular.element(selects[i]).removeClass('ng-dirty');
					}
					for (i=0; i<textareas.length; i++) {
						angular.element(textareas[i]).removeClass('ng-dirty');
						angular.element(textareas[i]).removeClass('ng-touched');
						angular.element(textareas[i]).addClass('ng-pristine');
					}
					for (i=0; i<checks.length; i++) {
						angular.element(checks[i]).removeClass('ng-dirty');
						angular.element(textareas[i]).removeClass('ng-touched');
						angular.element(textareas[i]).addClass('ng-pristine');
					}

				}
			},

			formSetDirty: function(id) {
				var form = document.querySelector(id)
				if (form) {
					var i=0, inputs = form.querySelectorAll('input');
					for (i; i<inputs.length; i++) {
						angular.element(inputs[i]).addClass('ng-dirty')
					}
				}
			},

			elementType: function(e) {
				return e.type ? e.type.toString().toLowerCase() : ''
			},

			toObj: function(id) {
				var form = document.querySelector(id);
				var obj = {};

				if (form) {
					var e, name, isDatePicker, isCheckbox, isRadio;
					var inputs = form.querySelectorAll('input, textarea');

					for (var i=0, l=inputs.length; i<l; i++) {
						e = inputs[i];
						name = e.getAttribute('name');
						isDatePicker = e.getAttribute('bs-datepicker');
						isCheckbox = this.elementType(e) == 'checkbox';
						isRadio = this.elementType(e) == 'radio';

						if (name) {
							if (isDatePicker) {
								obj[name] = 'qwerty' //Utils.systemDate(e.value);
							} else if (isCheckbox) {
								obj[name] = e.value == 'on' ? 1 : 0;
							} else if (isRadio) {
								obj[name] = $('input[name="'+name+'"]:checked').val()
							} else {
								obj[name] = e.value;
							}
						}
					}
				}
				return obj
			},

		}

});
