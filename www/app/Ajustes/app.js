/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya.config(function($stateProvider) {

        $stateProvider
            .state('tabs.setting', {
                url: "/settings",
                views: {
                    'setting-tab': {
                        templateUrl: "templates/ajustes/setting.html",
                        controller: 'AjustesCtrl'
                    }
                }
            })
            .state('tabs.profile', {
                url: "/profile",
                views: {
                    'setting-tab': {
                        templateUrl: "templates/ajustes/profile.html",
                        controller: 'ProfileCtrl'
                    }
                }
            })
            .state('tabs.share', {
                url: "/share",
                views: {
                    'setting-tab': {
                        templateUrl: "templates/ajustes/share.html",
                        controller: 'ShareCtrl'
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
    });
