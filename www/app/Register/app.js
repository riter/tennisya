/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya.config(function($stateProvider) {

        $stateProvider
            .state('signin', {
                url: "/sign-in",
                templateUrl: "templates/register/sign-in.html",
                controller: 'SignInCtrl'
            })
            .state('signup', {
                url: "/sign-up",
                templateUrl: "templates/register/sign-up.html",
                controller: 'SignUpCtrl'
            })
        ;
    });
