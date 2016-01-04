/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya
        .controller('JugadoresSearchCtrl', function ($scope, $state, $ionicHistory, $localstorage, grupoService, searchJugador, cameraAction) {
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
                grupoService.save(idYo,$scope.new_group).then(function (response) {
                    if (response.id)
                        $scope.data.grupos.unshift(response);
                });
                
                $scope.closeNewGrupo();
            };
        })

        .controller('groupsCtrl', function ($scope, $state, $stateParams, $rootScope, $ionicModal, $localstorage, grupoService) {

            $scope.$on('$ionicView.enter', function () {
                $rootScope.grupoPartido = {id: parseInt($stateParams.id), title: $scope.grupo.title};
            });

            $scope.grupo = grupoService.getModel();

            $scope.grupo.id = $stateParams.id;

            grupoService.getJugadores($stateParams.id).then(function (data) {
                $scope.grupo = data;
            });
            $scope.isAdmin = function () {
                if ($scope.grupo.jugadorgrupo.length > 0)
                    return $localstorage.getObject('user').id === $scope.grupo.jugadorgrupo[0].jugador.id;
                return false;
            };
            $scope.isYo = function (jugador) {
                return $localstorage.getObject('user').id === jugador.id;
            };
            $scope.nextGrupo = function (grupo) {
                grupoService.setModel(grupo);
                $state.go('tabs.info-groups', {id: grupo.id});
            };
        })
        .controller('infoGroupCtrl', function ($scope, $stateParams, $ionicHistory, $ionicModal, $localstorage, grupoService, searchJugador, cameraAction) {
            var idYo = $localstorage.getObject('user').id;
            $scope.data = {
                showDelete: false,
                changeTitle: false,
                search: []
            };

            $scope.grupo = grupoService.getModel();

            $scope.onDelete = function (item) {
                grupoService.deleteJugador(item.id);
                $scope.grupo.jugadorgrupo.splice($scope.grupo.jugadorgrupo.indexOf(item), 1);
                grupoService.setJugadores($scope.grupo.jugadorgrupo);
            };
            $scope.onUpdateTitle = function () {
                if ($scope.data.changeTitle) {
                    grupoService.updateTitle($scope.grupo.id).then(function (response) {
                        $scope.$emit('updategroup', {grupo: response.data, action: 'update'});
                    }, function (err) {
                    });
                    $scope.data.changeTitle = false;
                }
            };
            $scope.onSalirEliminar = function () {
                if ($scope.isAdmin()) {
                    grupoService.delete($scope.grupo.id).then(function () {
                        $scope.$emit('updategroup', {grupo: $scope.grupo, action: 'remove'});
                        $ionicHistory.goBack(-2);
                    }, function (err) {
                    });
                } else {
                    var idUser = $localstorage.getObject('user').id;
                    angular.forEach($scope.grupo.jugadorgrupo, function (value, key) {
                        if (value.jugador.id == idUser) {
                            grupoService.deleteJugador(value.id).then(function () {
                                $scope.$emit('updategroup', {grupo: $scope.grupo, action: 'remove'});
                                $ionicHistory.goBack(-2);
                            }, function (err) {
                            });
                        }
                    });
                }
            };

            $ionicModal.fromTemplateUrl('templates/grupo/add-jugador.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modalAddJugador = modal;
            });

            $scope.searchJugador = function (query) {
                var ids = [];
                angular.forEach($scope.grupo.jugadorgrupo, function (value, key) {
                    ids.push(value.jugador.id);
                });
                return searchJugador.searchJugador(query, ids);
            };

            $scope.addJugador = function (item) {
                if (!$scope.isYo(item) && $scope.grupo.jugadorgrupo.indexOf(item) < 0) {
                    grupoService.updateJugador($scope.grupo.id, item).then(function (response) {
                        $scope.grupo.jugadorgrupo.push(response.data);
                        grupoService.setJugadores($scope.grupo.jugadorgrupo);
                        $scope.data.search.splice($scope.data.search.indexOf(item), 1);
                    }, function (err) {
                        //alert(JSON.stringify(err));
                    });
                    $scope.modalAddJugador.hide();
                }
            };

            $scope.isAdmin = function () {
                if ($scope.grupo.jugadorgrupo.length > 0)
                    return $localstorage.getObject('user').id === $scope.grupo.jugadorgrupo[0].jugador.id;
                return false;
            };
            $scope.isYo = function (jugador) {
                return  idYo === jugador.id;
            };
            $scope.openCamera = function () {
                cameraAction.showAction(function (imageURI) {
                    $scope.grupo.image = imageURI;
                    grupoService.updateImage($scope.grupo.id).then(function (response) {
                        $scope.grupo.image = response.image;
                        $scope.$emit('updategroup', {grupo: response, action: 'update'});
                    });

                });
            };

        })
        ;