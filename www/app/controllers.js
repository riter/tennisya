/**
 * Created by Riter on 25/08/15.
 */

angular.module('tennisyaApp.controllers',[])

    .controller('SignInCtrl', function($scope, $state, userService) {

        $scope.signIn = function(user) {
            userService.loginJugador(user,function(response){
                $state.go('tabs.player');
            },function(error){
                alert(error.error);
            });
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