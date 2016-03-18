/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya
        .controller('SignInCtrl', function ($scope, $state, $ionicHistory, $cordovaDialogs, $cordovaFacebook, $cordovaPush, $cordovaDevice, $cordovaOauth, userService, $localstorage) {

            $scope.$on('$ionicView.beforeEnter', function (scopes, states) {
                $scope.user = {email: '', password: ''};
            });
            $scope.$on('$ionicView.afterEnter', function (scopes, states) {
                $ionicHistory.clearHistory();
                $ionicHistory.clearCache();
            });

            $scope.signIn = function (user) {
                user.tokenNotification = $localstorage.get('tokenNotification');
                user.platform = ionic.Platform.platform();
                user.udid = $cordovaDevice.getDevice().uuid;

                userService.loginJugador(user).then(function () {
                    $state.go('tabs.player');
                }, function (error) {
                    var msg = typeof (error.error) !== 'undefined' ? error.error : 'Ha ocurrido un error. Vuelva a intentarlo mas tarde.';
                    $cordovaDialogs.alert(msg, 'Inicio de sesion', 'Hecho');
                });
            };

            $scope.signInFacebook = function () {
                var msg = 'Ha ocurrido un error. Vuelva a intentarlo mas tarde.';
                $cordovaFacebook.login(["email"])
                        .then(function (success) {
                            $cordovaFacebook.api("me?fields=id,name,email", ["email"])
                                    .then(function (success) {
                                        var data = {
                                            platform: ionic.Platform.platform(),
                                            tokenNotification: $localstorage.get('tokenNotification'),
                                            udid: $cordovaDevice.getDevice().uuid,
                                            email: success.email,
                                            name: success.name
                                        };

                                        userService.facebookJugador(data).then(function () {
                                            $state.go('tabs.player');
                                        }, function (error) {
                                            $cordovaDialogs.alert(msg, 'Inicio de sesion', 'Hecho');
                                        });

                                    }, function (error) {
                                        $cordovaDialogs.alert(msg, 'Inicio de sesion', 'Hecho');
                                    });
                        }, function (error) {
                            $cordovaDialogs.alert(msg, 'Inicio de sesion', 'Hecho');
                        });
            };

            $scope.signInLinkedin = function () {
                console.log('signInGoogle');
                $cordovaOauth.linkedin("77pysieyuk50ks", "y1Rzh4FLej8mJko0", ["r_basicprofile", "r_emailaddress"], "riter123angel").then(function (result) {
                    //success
                    alert(JSON.stringify(result));
                }, function (error) {
                    //error
                    alert(JSON.stringify(error));
                });
            };

        })
        .controller('SignUpCtrl', function ($scope, $state, $ionicHistory, $cordovaDialogs, userService, extrasService, cameraAction) {
            $scope.user = {celular: ''};
            extrasService.getClub().then(function (response) {
                $scope.clubs = response;
            });

            $scope.openCamera = function () {
                cameraAction.showAction(function (imageURI) {
                    $scope.user.photo = imageURI;
                });
            };
            $scope.signUp = function (user) {
                user.type = 'normal';
                userService.saveJugador(user).then(function (response) {
                    $state.go('tabs.player');
                }, function (error) {
                    var msg = typeof (error.data.error) !== 'undefined' ? error.data.error : 'Ha ocurrido un error. Vuelva a intentarlo mas tarde.';
                    $cordovaDialogs.alert(msg, 'Registro', 'Hecho');
                });
            };
        })
        ;