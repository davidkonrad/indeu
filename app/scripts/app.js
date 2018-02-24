'use strict';

/**
 *
 *
 */
angular.module('indeuApp', [
	'ngAnimate',
	'ngCookies',
	'ngResource',
	'ngRoute',
	//'ngSanitize',
	'ngTouch',
	'mgcrea.ngStrap',
	'datatables',
	'datatables.buttons',
	'datatables.bootstrap',
	'datatables.select',
	'datatables.options',
	'bootstrap3-typeahead',
	'textAngular',
	'textAngularSetup',
	'ngFileUpload',
	'fancyboxplus',
	'ESPBA',
	'Meta',
	'angular-loading-bar',
	'ui.calendar',
	'leaflet-directive',
	'ui-notification',
	'ngRateIt',
	'angular-smilies',
	'angular-sortable-view'
  ])
  .config(function($locationProvider, $routeProvider, cfpLoadingBarProvider, NotificationProvider, $tooltipProvider, $provide) {

    cfpLoadingBarProvider.includeSpinner = false;
	
		if (window.location.host == 'localhost:9000') {
			$locationProvider.html5Mode(false);
		  $locationProvider.hashPrefix('');
		} else {
			$locationProvider.html5Mode(true);
		}

		NotificationProvider.setOptions({
			delay: 5000,
			startTop: 20,
			startRight: 10,
			verticalSpacing: 20,
			horizontalSpacing: 20,
			positionX: 'right',
			positionY: 'top'
		});

		$provide.decorator('taTranslations', function($delegate) {
			$delegate.heading.tooltip = 'Overskrift ';
			$delegate.quote.tooltip = 'Citeret tekst';
			$delegate.ul.tooltip = 'Punkt liste';
			$delegate.ol.tooltip = 'Nummereret liste';
			$delegate.html.tooltip = 'Skift mellem tekst / HTML';
			$delegate.justifyLeft.tooltip = 'Venstrejustér';
			$delegate.justifyCenter.tooltip = 'Centrér';
			$delegate.justifyRight.tooltip = 'Højrejustér';
			$delegate.bold.tooltip = 'Fed skrift';
			$delegate.italic.tooltip = 'Kursiv skrift';
			$delegate.underline.tooltip = 'Understreget skrift';
			$delegate.strikeThrough.tooltip = 'Overstreget skrift';
			$delegate.insertLink.tooltip = 'Indsæt / redigér link';
			$delegate.insertLink.dialogPrompt = "Skriv link URL";
			$delegate.editLink.targetToggle.buttontext = "Åbn i nyt vindue";
			$delegate.editLink.reLinkButton.tooltip = "Rediger link";
			$delegate.editLink.unLinkButton.tooltip = "Fjern link";
			$delegate.insertVideo.tooltip = 'Indsæt video';
			$delegate.insertVideo.dialogPrompt = 'Skriv Youtube video URL, der skal indsættes';
			$delegate.clear.tooltip = 'Ryd formattering';
			return $delegate;
		});

	  angular.extend($tooltipProvider.defaults, {
	    //animation: 'am-fade-and-slide-top',
	    placement: 'top',
			container: 'body',
			trigger: 'hover'
	  });

    $routeProvider
      .when('/', {
        templateUrl: 'views/blank.forside.html',
        controller: 'BlankCtrl',
	    })
      .when('/404', {
        templateUrl: 'views/404.html',
        controller: 'BlankCtrl',
      })
      .when('/forside', {
        templateUrl: 'views/frontpage.html',
        controller: 'FrontpageCtrl'
      })
      .when('/bliv-medlem', {
        templateUrl: 'views/bliv-medlem.html',
        controller: 'BlivMedlemCtrl'
      })
      .when('/medlem', {
        templateUrl: 'views/medlem.html',
        controller: 'MedlemCtrl'
      })

			//member frontpage
      .when('/dig', {
        templateUrl: 'views/dig.forside.html',
        controller: 'DigForsideCtrl'
      })

			//official "open" member frontpage
      .when('/medlem/:id/:navn', {
        templateUrl: 'views/medlem.forside.html',
        controller: 'MedlemForsideCtrl'
      })

			//official "open" group frontpage
      .when('/gruppe/:id/:navn', {
        templateUrl: 'views/gruppe.forside.html',
        controller: 'GruppeForsideCtrl'
      })

			//official "open" article frontpage
      .when('/artikel/:id/:header', {
        templateUrl: 'views/article.forside.html',
        controller: 'ArticleForsideCtrl'
      })

			//official "open" event frontpage
      .when('/event/:id/:navn', {
        templateUrl: 'views/event.forside.html',
        controller: 'EventForsideCtrl'
      })

			//official "open" forening frontpage
      .when('/forening/:id/:navn', {
        templateUrl: 'views/forening.forside.html',
        controller: 'ForeningForsideCtrl'
      })

			//official "open" event summary / calendar
      .when('/det-sker', {
        templateUrl: 'views/kalender.forside.html',
        controller: 'KalenderForsideCtrl'
      })

			//static page
      .when('/s/:id/:header', {
        templateUrl: 'views/staticpage.html',
        controller: 'StaticPageCtrl'
      })

			//search
      .when('/soeg', {
        templateUrl: 'views/search.html',
        controller: 'SearchCtrl'
      })

			//confirm email
      .when('/confirm/:hash', {
        templateUrl: 'views/confirm-email.html',
        controller: 'ConfirmEmailCtrl'
      })

			//administration
      .when('/admin-forside', {
        templateUrl: 'views/admin/admin.forside.html',
        controller: 'AdminForsideCtrl',
				resolve: {
					$adminRights: function(AdminRights) {
						return AdminRights.getAdminRights()
					}
				}
      })
      .when('/admin-overblik', {
        templateUrl: 'views/admin/admin.overblik.html',
        controller: 'AdminCtrl',
				resolve: {
					$adminRights: function(AdminRights) {
						return AdminRights.getAdminRights()
					}
				}
      })
      .when('/admin-foreninger', {
        templateUrl: 'views/admin/admin.foreninger.html',
        controller: 'AdminForeningerCtrl',
				resolve: {
					$adminRights: function(AdminRights) {
						return AdminRights.getAdminRights()
					}
				}
      })
      .when('/admin-artikler', {
        templateUrl: 'views/admin/admin.artikler.html',
        controller: 'AdminArtiklerCtrl',
				resolve: {
					$adminRights: function(AdminRights) {
						return AdminRights.getAdminRights()
					}
				}
      })
      .when('/admin-brugere', {
        templateUrl: 'views/admin/admin.brugere.html',
        controller: 'AdminBrugereCtrl',
				resolve: {
					$adminRights: function(AdminRights) {
						return AdminRights.getAdminRights()
					}
				}
      })
      .when('/admin-bruger-requests', {
        templateUrl: 'views/admin/admin.brugerrequests.html',
        controller: 'AdminBrugerRequestsCtrl',
				resolve: {
					$adminRights: function(AdminRights) {
						return AdminRights.getAdminRights()
					}
				}
      })
	   .when('/admin-grupper', {
        templateUrl: 'views/admin/admin.grupper.html',
        controller: 'AdminGrupperCtrl',
				resolve: {
					$adminRights: function(AdminRights) {
						return AdminRights.getAdminRights()
					}
				}
      })
      .when('/admin-events', {
        templateUrl: 'views/admin/admin.events.html',
        controller: 'AdminEventsCtrl',
				resolve: {
					$adminRights: function(AdminRights) {
						return AdminRights.getAdminRights()
					}
				}
      })
      .when('/admin-statiske-sider', {
        templateUrl: 'views/admin/admin.staticpage.html',
        controller: 'AdminStatiskCtrl',
				resolve: {
					$adminRights: function(AdminRights) {
						return AdminRights.getAdminRights()
					}
				}
      })

      .otherwise({
        redirectTo: '/forside'
      });

  })
	.run(function($rootScope, $location, Lookup, ESPBA, Meta, Login, DTDefaultOptions) {

		$rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){ 
			// this is required if you want to prevent the $UrlRouter reverting the URL to the previous valid location
			event.preventDefault();
		});

		$rootScope.$on('$routeChangeSuccess', function () {
			Login.updateLastSeen()
		});

		//set ajax wheel on all datatables
		DTDefaultOptions.setLoadingTemplate('<img src="images/ajax-loader.gif">');

		if ($location.host() === 'localhost') {
			ESPBA.setHost('http://localhost/html/indeu/app/');
		} else {
			ESPBA.setHost('https://indeu.org/');
		}
		ESPBA.setApiPath('api/espba.php');
		ESPBA.init().then(function() {
			Lookup.init();
		});

		//moment
		//moment.tz.setDefault("Europe/Copenhagen");
		moment.tz.guess();
	
		//meta
		Meta.setTitleSuffix(' | indeu.org');
		
});

