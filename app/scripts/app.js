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
	'ngSanitize',
	'ngTouch',
	'mgcrea.ngStrap',
	'datatables',
	'datatables.buttons',
	'datatables.bootstrap',
	'datatables.select',
	'datatables.options',
	'ngTagsInput',
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
	'angular-smilies'
  ])
  .config(function ($locationProvider, $routeProvider, cfpLoadingBarProvider, NotificationProvider, $tooltipProvider) {

    cfpLoadingBarProvider.includeSpinner = false;
	
		if (window.location.host == 'localhost:9000') {
			$locationProvider.html5Mode(false);
		  $locationProvider.hashPrefix('');
		} else {
			$locationProvider.html5Mode(true);
		}

		NotificationProvider.setOptions({
			delay: 10000,
			startTop: 20,
			startRight: 10,
			verticalSpacing: 20,
			horizontalSpacing: 20,
			positionX: 'left',
			positionY: 'top'
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
        controllerAs: 'frontpage'
      })
      .when('/forside', {
        templateUrl: 'views/frontpage.html',
        controller: 'FrontpageCtrl',
        controllerAs: 'frontpage'
      })
      .when('/bliv-medlem', {
        templateUrl: 'views/bliv-medlem.html',
        controller: 'BlivMedlemCtrl',
        controllerAs: 'blivmedlem'
      })
      .when('/medlem', {
        templateUrl: 'views/medlem.html',
        controller: 'MedlemCtrl',
        controllerAs: 'medlem'
      })

			//static
			.when('/s/:url*', {
				templateUrl: function(urlattr) {
					return '/pages/' + urlattr.name + '.html';
				},
				 controller: 'CMSController'
			})

			//member frontpage
      .when('/dig', {
        templateUrl: 'views/dig.forside.html',
        controller: 'DigForsideCtrl',
        controllerAs: 'digside'
      })

			//official "open" member frontpage
      .when('/medlemmer/:id/:navn', {
        templateUrl: 'views/medlem.forside.html',
        controller: 'MedlemForsideCtrl',
        controllerAs: 'medlemforside'
      })

			//official "open" group frontpage
      .when('/grupper/:id/:navn', {
        templateUrl: 'views/gruppe.forside.html',
        controller: 'GruppeForsideCtrl',
        controllerAs: 'gruppeforside'
      })

			//official "open" article frontpage
      .when('/artikel/:id/:header', {
        templateUrl: 'views/article.forside.html',
        controller: 'ArticleForsideCtrl',
        controllerAs: 'articleforside'
      })

			//official "open" event frontpage
      .when('/event/:id/:navn', {
        templateUrl: 'views/event.forside.html',
        controller: 'EventForsideCtrl',
        controllerAs: 'eventforside'
      })

			//official "open" forening frontpage
      .when('/forening/:id/:navn', {
        templateUrl: 'views/forening.forside.html',
        controller: 'ForeningForsideCtrl',
        controllerAs: 'foreningforside'
      })

			//official "open" event summary / calendar
      .when('/det-sker', {
        templateUrl: 'views/kalender.forside.html',
        controller: 'KalenderForsideCtrl',
        controllerAs: 'kalenderforside'
      })

			//search
      .when('/soeg', {
        templateUrl: 'views/search.html',
        controller: 'SearchCtrl',
        controllerAs: 'search'
      })

			//administration
      .when('/admin-forside', {
        templateUrl: 'views/admin.forside.html',
        controller: 'AdminForsideCtrl',
        controllerAs: 'adminforside'
      })
      .when('/admin-overblik', {
        templateUrl: 'views/admin.overblik.html',
        controller: 'AdminCtrl',
        controllerAs: 'administration'
      })
      .when('/admin-foreninger', {
        templateUrl: 'views/admin.foreninger.html',
        controller: 'AdminForeningerCtrl',
        controllerAs: 'administration'
      })
      .when('/admin-artikler', {
        templateUrl: 'views/admin/admin.artikler.html',
        controller: 'AdminArtiklerCtrl',
        controllerAs: 'administration'
      })
      .when('/admin-brugere', {
        templateUrl: 'views/admin.brugere.html',
        controller: 'AdminBrugereCtrl',
        controllerAs: 'brugere'
      })
	   .when('/admin-grupper', {
        templateUrl: 'views/admin.grupper.html',
        controller: 'AdminGrupperCtrl',
        controllerAs: 'grupper'
      })
      .when('/admin-events', {
        templateUrl: 'views/admin.events.html',
        controller: 'AdminEventsCtrl',
        controllerAs: 'events'
      })

      .otherwise({
        redirectTo: '/'
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
			//ESPBA.setHost('https://indeu.org/');
			ESPBA.setHost('https://opgavesnyd.dk/');
		}
		ESPBA.setApiPath('api/espba.php');
		ESPBA.init().then(function() {
			Lookup.init();
		});

		//moment
		moment.tz.setDefault("Europe/Copenhagen"); 
	
		
});

