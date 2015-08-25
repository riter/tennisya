/**
 * Created by Riter on 24/08/15.
 */

angular.module('ionicApp', ['ionic'])


    .config(function($stateProvider, $urlRouterProvider) {

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

    })
    .controller('SignInCtrl', function($scope, $state) {

        $scope.signIn = function(user) {
            console.log('Sign-In', user);
            $state.go('tabs.player');
        };
        $scope.signInFacebook = function() {
            console.log('signInFacebook');
        };
        $scope.signInTwitter = function(user) {
            console.log('signInTwitter');
        };
        $scope.signInGoogle = function(user) {
            console.log('signInGoogle');
        };
        $scope.register = function(user) {
            $state.go('signup');
        };

    })
    .controller('SignUpCtrl', function($scope, $state) {
        $scope.signUp = function(user) {
            console.log('Registro de Usuario:', user);
            $state.go('tabs.player');
        };
    })
    .controller('HomeTabCtrl', function($scope) {
        console.log('HomeTabCtrl');
    });