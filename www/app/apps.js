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

appTennisya.config(function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('signin', {
                url: "/sign-in",
                templateUrl: "templates/sign-in.html",
                controller: 'SignInCtrl'
            })
            .state('signup', {
                url: "/sign-up",
                templateUrl: "sign-up.html",
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
                        templateUrl: "templates/players.html",
                        controller: 'HomeTabCtrl'
                    }
                }
            })
            .state('tabs.newPartido', {
                url: "/new_partido",
                views: {
                    'newPartido-tab': {
                        templateUrl: "templates/newPartido.html"
                    }
                }
            })
            .state('tabs.partidos', {
                url: "/partidos",
                views: {
                    'partidos-tab': {
                        templateUrl: "templates/partidos.html"
                    }
                }
            })
            .state('tabs.setting', {
                url: "/setting",
                views: {
                    'setting-tab': {
                        templateUrl: "templates/setting.html"
                    }
                }
            })
            .state('tabs.todos', {
                url: "/todos",
                views: {
                    'todos-tab': {
                        templateUrl: "templates/players.html",
                        controller: 'HomeTabCtrl'
                    }
                }
            });

        $urlRouterProvider.otherwise("/sign-in");

    });
