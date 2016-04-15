/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya
        .controller('JugadoresSearchCtrl', function ($scope, $localstorage, grupoService, searchJugador, cameraAction) {
            var idYo = $localstorage.getObject('user').id;

            //view 1 Create Group (add Title e Image)
            $scope.openCamera = function () {
                cameraAction.showAction(function (imageURI) {
                    $scope.new_group.image = imageURI;
                });
            };

            //view 2 Create Group (add Jugadores)
            $scope.changeFocus = function (value) {
                $scope.new_group.focus = value;
                $scope.$apply();
            };
            $scope.isYo = function (jugador) {
                return idYo === jugador.id;
            };
            $scope.isAdd = function (jugador) {
                return $scope.new_group.jugadores.indexOf(jugador) > -1;
            };
            $scope.searchJugador = function (query) {
                var ids = [idYo];
                angular.forEach($scope.new_group.jugadores, function (value, key) {
                    ids.push(value.id);
                });
                return searchJugador.searchJugador(query, ids);
            };
            $scope.addJugador = function (item) {
                if (!$scope.isYo(item) && $scope.new_group.jugadores.indexOf(item) < 0) {
                    $scope.new_group.jugadores.push(item);
                }
            };
            $scope.onDelete = function (item) {
                $scope.new_group.jugadores.splice($scope.new_group.jugadores.indexOf(item), 1);
            };
            $scope.onCrearGrupo = function () {
                grupoService.save(idYo, $scope.new_group).then(function (response) {
                    if (response.id)
                        $scope.data.grupos.unshift(response);
                });

                $scope.closeNewGrupo();
            };
        })
        .controller('groupCtrl', function ($scope, $state, $stateParams, $rootScope, $localstorage, grupoService) {

            $scope.$on('$ionicView.enter', function () {
//                $rootScope.grupoPartido = {id: parseInt($stateParams.id), title: $scope.grupo.title};
                $rootScope.filterPartidos = {type: 'grupo', idType: parseInt($stateParams.id), title: $scope.grupo.title};
                
                $scope.removeNotificacion('newgrupo');
            });
            $scope.isYo = function (jugador) {
                return $localstorage.getObject('user').id === jugador.id;
            };

            $scope.grupo = grupoService.getModel();

            grupoService.getJugadores($stateParams.id).then(function (data) {
                $scope.grupo = data;
            });

            $scope.nextGrupo = function () {
                $state.go('tabs.info-groups', {id: $scope.grupo.id});
            };
        })
        .controller('infoGroupCtrl', function ($scope, $cordovaDialogs, $ionicHistory, $ionicModal, $localstorage, grupoService, searchJugador, cameraAction) {

            $scope.isAdmin = function () {
                return $scope.grupo.jugadorgrupo.length > 0 && $localstorage.getObject('user').id === $scope.grupo.jugadorgrupo[0].jugador.id;
            };
            $scope.isYo = function (jugador) {
                return  idYo === jugador.id;
            };

            var idYo = $localstorage.getObject('user').id;
            $scope.data = {
                showDelete: false,
                changeTitle: false,
                search: [],
                tmp: {}
            };
            $scope.grupo = grupoService.getModel();

            $scope.saveTmp = function () {
                if (!$scope.data.showDelete)
                    $scope.data.tmp = angular.copy($scope.grupo);
                $scope.data.showDelete = !$scope.data.showDelete;
            };

            $scope.openCamera = function () {
                cameraAction.showAction(function (imageURI) {
                    var tmpImage = $scope.grupo.image;
                    $scope.grupo.image = imageURI;

                    grupoService.updateImage($scope.grupo.id, imageURI).then(function (response) {
                        $scope.grupo.image = response.image;
                        $scope.fullScreen();
                    }, function () {
                        $cordovaDialogs.alert('Error al subir foto del grupo.', 'Informacion', 'Hecho');
                        $scope.grupo.image = tmpImage;
                    });

                });
            };

            $scope.onUpdateTitle = function () {

                if ($scope.data.changeTitle) {
                    grupoService.updateTitle($scope.grupo.id, $scope.grupo.title).then(function (response) {
                        $scope.grupo.title = response.data.title;
                    }, function (err) {
                        $cordovaDialogs.alert('Error al cambiar titulo del grupo.', 'Informacion', 'Hecho');
                        $scope.grupo.title = $scope.data.tmp.title;
                    });
                    $scope.data.changeTitle = false;
                }
            };
            $scope.onDelete = function (item) {
                var index = $scope.grupo.jugadorgrupo.indexOf(item);
                $scope.grupo.jugadorgrupo.splice(index, 1);

                grupoService.deleteJugador(item.id).then(function (response) {
                    $scope.data.tmp.jugadorgrupo.splice(index, 1);
                }, function () {
                    $cordovaDialogs.alert('Error al eliminar jugador', 'Informacion', 'Hecho');
                    $scope.grupo.jugadorgrupo.splice(index, 0, item);
                });
            };

            $scope.onSalirEliminar = function () {
                $ionicHistory.goBack(-2);

                if ($scope.isAdmin()) {
                    grupoService.delete($scope.grupo.id).then(function () {
                        $scope.$emit('updategroup', {grupo: $scope.grupo, action: 'remove'});
                    }, function (err) {
                        $cordovaDialogs.alert('Error al salir y eliminar grupo', 'Informacion', 'Hecho');
                    });
                } else {
                    var idUser = $localstorage.getObject('user').id;
                    angular.forEach($scope.grupo.jugadorgrupo, function (value, key) {
                        if (value.jugador.id == idUser) {
                            grupoService.deleteJugador(value.id).then(function () {
                                $scope.$emit('updategroup', {grupo: $scope.grupo, action: 'remove'});
                            }, function (err) {
                                $cordovaDialogs.alert('Error al salir del grupo', 'Informacion', 'Hecho');
                            });
                        }
                    });
                }
            };

            $scope.openAddJugador = function () {
                $ionicModal.fromTemplateUrl('templates/grupo/add-jugador.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.modalAddJugador = modal;
                    $scope.modalAddJugador.show();
                });
            };

            $scope.searchJugador = function (query) {
                var ids = [];
                angular.forEach($scope.grupo.jugadorgrupo, function (value, key) {
                    ids.push(value.jugador.id);
                });
                return searchJugador.searchJugador(query, ids);
            };

            $scope.isAdd = function (jugador) {
                return $scope.grupo.jugadorgrupo.indexOf(jugador) > -1;
            };

            $scope.selectJugador = function (item) {
                grupoService.updateJugador($scope.grupo.id, item).then(function (response) {
//                    $scope.data.tmp.jugadorgrupo.push(response.data);
                    $scope.grupo.jugadorgrupo.push(response.data);
                }, function (err) {
                    $cordovaDialogs.alert('Error al adicionar un jugador', 'Informacion', 'Hecho');
                });
                $scope.modalAddJugador.remove();
            };


            $scope.fullScreen = function () {
                $scope.images = [{
                        src: $scope.grupo.image !== null ? $scope.grupo.image : 'assets/img/group.png',
                        safeSrc: $scope.grupo.image !== null ? $scope.grupo.image : 'assets/img/group.png',
                        thumb: $scope.grupo.image !== null ? $scope.grupo.image : 'assets/img/group.png',
                        size: '0x0',
                        type: 'image'
                    }];
            };
            $scope.fullScreen();
        })
        ;