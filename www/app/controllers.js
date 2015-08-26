/**
 * Created by Riter on 25/08/15.
 */

//angular.module('tennisyaApp.controllers',[])

appTennisya.controller('SignInCtrl', function($scope, $state, userService) {

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
    .controller('SignUpCtrl', function($scope, /*$state,*/ $timeout, $cordovaFileTransfer, $cordovaCamera) {
        $scope.openCamera = function() {

            var options = {
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA
            };

            $cordovaCamera.getPicture(options).then(function(imageURI) {
                var image = document.getElementById('photoSignUp');
                image.src = imageURI;
            }, function(err) {
                // error
            });

            $cordovaCamera.cleanup().then(function(){
                alert('cleanup: OK')
            },function(){
                alert('cleanup: ERROR')
            }); // only for FILE_URI
        };

        $scope.signUp = function(user) {

            var url = "http://cdn.wall-pix.net/albums/art-space/00030109.jpg";
            var targetPath = document.getElementById('photoSignUp').getAttribute('src');
            var trustHosts = true;
            var options = {};

            $cordovaFileTransfer.upload(api+'/jugadors/save', targetPath, options)
                .then(function(result) {
                    // Success!
                }, function(err) {
                    // Error
                }, function (progress) {
                    // constant progress updates
                });

            //$state.go('tabs.player');
        };
    })
    .controller('HomeTabCtrl', function($scope) {
        console.log('HomeTabCtrl');
    });