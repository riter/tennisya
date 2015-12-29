/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya.config(function($stateProvider) {

        $stateProvider
            .state('tabs.disponibilidad', {
                url: "/disponibilidad",
                views: {
                    'setting-tab': {
                        templateUrl: "templates/disponibilidad/disponibilidades.html",
                        controller: 'DisponibilidadCtrl'
                    },
                    'navable-disponibilidad@': {
                        templateUrl: 'templates/disponibilidad/new_disponibilidad.html'
                    }
                }
            })
            .state('tabs.disponibilidad.repetir', {
                url: '/disponibilidad/repetir',
                views: {
                    'navable-disponibilidad@': {
                        templateUrl: 'templates/disponibilidad/repetir.html'
                    }
                }
            })
        ;
    });
