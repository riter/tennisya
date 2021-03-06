/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya
        .controller('AjustesCtrl', function ($cordovaSplashscreen, $ActionSheetGral, $scope, $state, $localstorage, $cordovaFacebook, $localstorage, notoficacionService, grupoService, disponibilidadService) {

            $scope.onCerrarSesion = function () {

                $ActionSheetGral.show('¿Seguro que quieres cerrar la sesión?', [], 'Cerrar sesión').then(function (response) {
                    if (response === 'Cerrar sesión') {
                        $cordovaSplashscreen.show();

                        $localstorage.clear();
                        grupoService.reset();
                        disponibilidadService.init();
                        notoficacionService.unregister();
                        logoutFacebook();
                        $state.go('signin');
                    }
                });
            };
            var logoutFacebook = function () {
                try {
                    $cordovaFacebook.getLoginStatus()
                            .then(function (success) {
                                if (success.status == 'connected')
                                    $cordovaFacebook.logout();
                            }, function (error) {
                            });
                } catch (e) {
                }
            };
        })
        .controller('ProfileCtrl', function ($scope, $ionicHistory, $cordovaDialogs, $localstorage, userService, extrasService, cameraAction) {
            $scope.profile = $localstorage.getObject('user');
            $scope.clubs = extrasService.getClubs();

            $scope.onGuardar = function (user) {
                userService.updateJugador(user).then(function (response) {
                    $scope.profile = response;
                }, function (error) {
                    $cordovaDialogs.alert('Ha ocurrido un error al guardar. Por favor intetelo más tarde.', 'Perfil', 'Aceptar');
                });
            };

            $scope.openCamera = function () {
                cameraAction.showAction(function (imageURI) {
                    $scope.profile.photo = imageURI;
                });
            };
        })
        .controller('ShareCtrl', function ($scope, $cordovaSocialSharing) {
            var message = '';
            var image = '';
            var link = '';

            var subject = '';
            var toArr = '';

            $scope.onShare = function (red) {
                switch (red) {
                    case 'wassap':
                        $cordovaSocialSharing
                                .shareViaWhatsApp(message, image, link)
                                .then(function (result) {
                                    // Success!
                                }, function (err) {
                                    //alert(JSON.stringify(err));
                                });
                        break;
                    case 'mail':
                        $cordovaSocialSharing
                                .shareViaEmail(message, subject, toArr, null, null, null)
                                .then(function (result) {
                                    // Success!
                                }, function (err) {
                                    //alert(JSON.stringify(err));
                                });
                        break;
                    case 'facebook':
                        $cordovaSocialSharing
                                .shareViaFacebook(message, image, link)
                                .then(function (result) {
                                    // Success!
                                }, function (err) {
                                    //alert(JSON.stringify(err));
                                });
                        break;
                }
            };

        })
        ;