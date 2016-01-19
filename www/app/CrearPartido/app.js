/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya.config(function($stateProvider) {

        $stateProvider
            .state('tabs.crear-partidos', {
                url: "/crearPartidos",
                views: {
                    'newPartido-tab': {
                        template:'templates/crearPartido/createPartido.html',
                        controller: 'crearPartidoCtrl'
                    },
                    'navable-partido@': {
                        templateUrl: 'templates/crearPartido/newPartido.html'
                    }
                }
            })
            .state('tabs.crear-partidos.search', {
                url: '/crearPartidos/search',
                views: {
                    'navable-partido@': {
                        templateUrl: 'templates/crearPartido/search.html'
                    }
                }
            })
        ;
    });
