/**
 * Created by Riter on 24/08/15.
 */
var api = "http://tennisya.apploadapps.com/web/api/";

var appTennisya = angular.module('tennisyaApp', ['ionic','ngCordova']);
//angular.module('tennisyaApp', ['ionic','ngCordova','tennisyaApp.controllers','tennisyaApp.services']);

appTennisya.run(function($ionicPlatform) {
        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if(window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if(window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    });

appTennisya.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
    $ionicConfigProvider.platform.ios.tabs.style('standard');
    $ionicConfigProvider.platform.ios.tabs.position('bottom');
    $ionicConfigProvider.platform.android.tabs.style('standard');
    $ionicConfigProvider.platform.android.tabs.position('standard');

    $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
    $ionicConfigProvider.platform.android.navBar.alignTitle('center');

    $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-back');
    $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-ios-arrow-back');

    $ionicConfigProvider.platform.ios.views.transition('ios');
    $ionicConfigProvider.platform.android.views.transition('android');

        $stateProvider
            .state('signin', {
                url: "/sign-in",
                templateUrl: "templates/inicio/sign-in.html",
                controller: 'SignInCtrl'
            })
            .state('signup', {
                url: "/sign-up",
                templateUrl: "templates/inicio/sign-up.html",
                controller: 'SignUpCtrl'
            })
            .state('tabs', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html"
            })
            .state('tabs.player', {
                url: "/players",
                views: {
                    'player-tab': {
                        templateUrl: "templates/jugadores/players.html",
                        controller: 'ListJugadoresCtrl'
                    }
                }
            })
            .state('tabs.newPartido', {
                url: "/new_partido",
                views: {
                    'newPartido-tab': {
                        templateUrl: "templates/partidos/newPartido.html"
                    }
                }
            })
            .state('tabs.partidos', {
                url: "/partidos",
                views: {
                    'partidos-tab': {
                        templateUrl: "templates/partidos/listPartidos.html"
                    }
                }
            })
            // ajustes
            .state('tabs.setting', {
                url: "/setting",
                views: {
                    'setting-tab': {
                        templateUrl: "templates/ajustes/setting.html"
                    }
                }
            })
            .state('tabs.disponibilidad', {
                url: "/disponibilidad",
                views: {
                    'setting-tab': {
                        templateUrl: "templates/ajustes/disponibilidad.html",
                        controller: 'DisponibilidadCtrl'
                    }
                }
            })
            .state('tabs.profile', {
                url: "/profile",
                views: {
                    'setting-tab': {
                        templateUrl: "templates/ajustes/profile.html"
                    }
                }
            })
            .state('tabs.share', {
                url: "/share",
                views: {
                    'setting-tab': {
                        templateUrl: "templates/ajustes/share.html"
                    }
                }
            })
            .state('tabs.info', {
                url: "/info",
                views: {
                    'setting-tab': {
                        templateUrl: "templates/ajustes/info.html"
                    }
                }
            })
        ;

        $urlRouterProvider.otherwise("/sign-in");

    });
