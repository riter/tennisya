/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya.config(function($stateProvider) {

        $stateProvider
            .state('tabs.group', {
                url: '/group/:id',
                views:{
                    'player-tab':{
                        templateUrl: "templates/grupo/group.html",
                        controller: 'groupCtrl'
                    }
                }
            })
            .state('tabs.info-groups', {
                url: '/infoGroups/:id',
                views:{
                    'player-tab':{
                        templateUrl: "templates/grupo/info-groups.html",
                        controller: 'infoGroupCtrl'
                    }
                }
            })
//           view inicio create grupo que esta dentro vel view player
//             'navable-grupo@': {
//                        templateUrl: 'templates/grupo/create-group.html',
//                        controller: 'JugadoresSearchCtrl'
//                    }
            .state('tabs.player.add_jugador', {
                url: '/players/modal/group',
                views: {
                    'navable-grupo@': {
                        templateUrl: 'templates/grupo/add-list-jugador.html',
                        controller: 'JugadoresSearchCtrl'
                    }
                }
            })
        ;
    });
