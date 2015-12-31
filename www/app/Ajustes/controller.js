/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya
        .controller('AjustesCtrl', function ($scope, $state, $localstorage, $ionicHistory, $cordovaActionSheet) {

            $scope.onCerrarSesion = function () {
                var options = {
                    addCancelButtonWithLabel: 'Cancelar',
                    addDestructiveButtonWithLabel: 'Cerrar sesión',
                    androidEnableCancelButton: true
                };
                $cordovaActionSheet.show(options)
                        .then(function (btnIndex) {
                            if (btnIndex == 1) {
                                $localstorage.clear();
                                setTimeout(function () {
                                    $state.go('signin');
                                }, 300);
                            }
                        });
            };
        })
        .controller('ProfileCtrl', function ($scope, $state, $ionicHistory, $cordovaDialogs, $localstorage, userService, extrasService, cameraAction) {
            $scope.profile = $localstorage.getObject('user');
    
            extrasService.getClub().then(function (response) {
                $scope.clubs = response;
            });

            $scope.onGuardar = function (user) {
                userService.updateJugador(user).then(function (response){
                    $scope.profile = response;
                },function (error){
                    $cordovaDialogs.alert('Ha ocurrido un error al guardar. Por favor intetelo más tarde.', 'Perfil', 'Hecho');
                });
                $ionicHistory.goBack();
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
                                    alert(JSON.stringify(err));
                                });
                        break;
                    case 'mail':
                        $cordovaSocialSharing
                                .shareViaEmail(message, subject, toArr, null, null, null)
                                .then(function (result) {
                                    // Success!
                                }, function (err) {
                                    alert(JSON.stringify(err));
                                });
                        break;
                    case 'facebook':
                        $cordovaSocialSharing
                                .shareViaFacebook(message, image, link)
                                .then(function (result) {
                                    // Success!
                                }, function (err) {
                                    alert(JSON.stringify(err));
                                });
                        break;
                }
            };

        })
        ;