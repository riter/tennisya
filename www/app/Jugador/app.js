/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya.config(function($stateProvider) {

        $stateProvider
            .state('tabs.player', {
                url: "/players",
                views: {
                    'player-tab': {
                        templateUrl: "templates/jugadores/players.html",
                        controller: 'ListJugadoresCtrl'
                    },
                    'navable-grupo@': {
                        templateUrl: 'templates/grupo/create-group.html',
                        controller: 'JugadoresSearchCtrl'
                    }
                }
            })
            .state('tabs.player-info', {
                url: "/players-info/:id",
                views: {
                    'player-tab': {
                        templateUrl: "templates/jugadores/player-info.html",
                        controller: 'infoJugadorCtrl'
                    }
                }
            })
        ;
    });
