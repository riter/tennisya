/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya.config(function($stateProvider) {

        $stateProvider
            .state('tabs.partidos', {
                url: "/partidos",
                views: {
                    'partidos-tab': {
                        templateUrl: "templates/partidos/listPartidos.html",
                        controller: 'ListPartidosCtrl'
                    }
                }
            })
            .state('tabs.info-partido', {
                url: "/infos",
                views: {
                    'partidos-tab': {
                        templateUrl: "templates/partidos/info.html",
                        controller: 'InfoPartidosCtrl'
                    }
                }
            })
        ;
    });
