/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya
        .controller('SignInCtrl', function ($cordovaSplashscreen, $http, $scope, $state, $ionicHistory, $cordovaDialogs, $cordovaFacebook, $cordovaDevice, $cordovaOauth, userService) {
 
            $scope.$on('$ionicView.beforeEnter', function (scopes, states) {
                $scope.user = {email: '', password: ''};
            });
            $scope.$on('$ionicView.afterEnter', function (scopes, states) {
                $ionicHistory.clearHistory();
                $ionicHistory.clearCache();

                setTimeout(function () {
                    $cordovaSplashscreen.hide();
                }, 1000);
            });
            $scope.lostPassword = function (user) {
                userService.lostPassword(user).then(function (response) {
                    $cordovaDialogs.alert(response.msg, '¿Olvidó contraseña?', 'Aceptar');
                }, function (error) {
                    var msg = typeof (error.error) !== 'undefined' ? error.error : 'Ha ocurrido un error. Vuelva a intentarlo mas tarde.';
                    $cordovaDialogs.alert(msg, '¿Olvidó contraseña?', 'Aceptar');
                });
            };
            $scope.signIn = function (user) {
                user.platform = ionic.Platform.platform();
                user.udid = $cordovaDevice.getDevice().uuid;

                userService.loginJugador(user).then(function () {
                    $state.go('tabs.player');
                }, function (error) {
                    var msg = error ? error.error : 'Ha ocurrido un error. Vuelva a intentarlo mas tarde.';
                    $cordovaDialogs.alert(msg, 'Inicio de sesion', 'Aceptar');
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
                                            udid: $cordovaDevice.getDevice().uuid,
                                            email: success.email,
                                            name: success.name
                                        };

                                        userService.facebookJugador(data).then(function () {
                                            $state.go('tabs.player');
                                        }, function (error) {
                                            $cordovaDialogs.alert(msg, 'Inicio de sesion', 'Aceptar');
                                        });

                                    }, function (error) {
                                        $cordovaDialogs.alert(msg, 'Inicio de sesion', 'Aceptar');
                                    });
                        }, function (error) {
                            $cordovaDialogs.alert(msg, 'Inicio de sesion', 'Aceptar');
                        });
            };

            $scope.signInLinkedin = function () {
                var msg = 'Ha ocurrido un error. Vuelva a intentarlo mas tarde.';

                $cordovaOauth.linkedin("77pysieyuk50ks", "y1Rzh4FLej8mJko0", ["r_basicprofile", "r_emailaddress"], "riter123angel").then(function (result) {
                    $http.get('https://api.linkedin.com/v1/people/~:(id,email-address,formatted-name)', {params: {format: 'json', oauth2_access_token: result.access_token}}).then(function (response) {
                        var data = {
                            platform: ionic.Platform.platform(),
                            udid: $cordovaDevice.getDevice().uuid,
                            email: response.data.emailAddress,
                            name: response.data.formattedName
                        };

                        userService.facebookJugador(data).then(function () {
                            $state.go('tabs.player');
                        }, function (error) {
                            $cordovaDialogs.alert(msg, 'Inicio de sesion', 'Aceptar');
                        });

                    }, function (error) {
                        $cordovaDialogs.alert(msg, 'Inicio de sesion', 'Aceptar');
                    });
//
                }, function (error) {
                });
            };

        })
        .controller('SignUpCtrl', function ($scope, $state, $cordovaDialogs, userService, extrasService, cameraAction) {
            $scope.user = {celular: ''};
            $scope.clubs = extrasService.getClubs();

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
                    $cordovaDialogs.alert(msg, 'Registro', 'Aceptar');
                });
            };
        })
        ;