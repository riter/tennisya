/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya.config(function($stateProvider) {

        $stateProvider
            .state('tabs.groups', {
                url: '/groups/:id',
                views:{
                    'player-tab':{
                        templateUrl: "templates/grupo/groups.html",
                        controller: 'groupsCtrl'
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
//           modal inicion que esta dentro vel view player
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
