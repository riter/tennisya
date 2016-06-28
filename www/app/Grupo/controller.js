/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya
        .controller('JugadoresSearchCtrl', function ($scope, grupoService, searchJugador, cameraAction) {
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

            $scope.isAdd = function (jugador) {
                return $scope.new_group.jugadores.indexOf(jugador) > -1;
            };
            $scope.searchJugador = function (query) {
                var ids = [$scope.userLogin.id];
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
                grupoService.save($scope.userLogin.id, $scope.new_group);
                $scope.closeNewGrupo();
            };
        })
        .controller('groupCtrl', function ($scope, $state, $stateParams, $rootScope, grupoService) {

            $scope.$on('$ionicView.enter', function () {
                $rootScope.filterPartidos = {type: 'grupo', idType: parseInt($stateParams.id), title: $scope.grupo.title};
                $scope.removeNotificacion('newgrupo');
            });

            var loadGrupo = function () {
                grupoService.setModel(parseInt($stateParams.id));
                $scope.grupo = grupoService.getModel();

                if (angular.isUndefined($scope.grupo)) {
                    grupoService.getGrupoId(parseInt($stateParams.id)).then(loadGrupo);
                }else{
                    grupoService.getJugadores();
                }
            };
            loadGrupo();

//            grupoService.setModel(parseInt($stateParams.id));
//            $scope.grupo = grupoService.getModel();
//            grupoService.getJugadores();

            $scope.nextGrupo = function () {
                $state.go('tabs.info-groups', {id: $scope.grupo.id});
            };
        })
        .controller('infoGroupCtrl', function ($scope, $cordovaDialogs, $ionicHistory, $ionicModal, $localstorage, grupoService, searchJugador, cameraAction) {
            $scope.grupo = grupoService.getModel();

            $scope.fullScreen = function () {
                $scope.images = [{
                        src: $scope.grupo.image !== null ? $scope.grupo.image : 'assets/img/group.png',
                        safeSrc: $scope.grupo.image !== null ? $scope.grupo.image : 'assets/img/group.png',
                        thumb: $scope.grupo.image !== null ? $scope.grupo.image : 'assets/img/group.png',
                        size: '0x0',
                        type: 'image',
                        srcError: 'assets/img/group.png'
                    }];
            };
            $scope.fullScreen();

            $scope.isAdmin = function () {
                return $scope.grupo.jugadorgrupo.length > 0 && $localstorage.getObject('user').id === $scope.grupo.jugadorgrupo[0].jugador.id;
            };
            $scope.data = {
                showDelete: false,
                changeTitle: $scope.grupo.title,
                search: []
            };

            $scope.saveTmp = function () {
                $scope.data.showDelete = !$scope.data.showDelete;

                if ($scope.grupo.title !== $scope.data.changeTitle) {
                    grupoService.updateTitle($scope.grupo.id, $scope.data.changeTitle).then(function () {
                        $scope.grupo.title = $scope.data.changeTitle;
                    }, function (err) {
                        $cordovaDialogs.alert('Error al cambiar titulo del grupo.', 'Informacion', 'Aceptar');
                    });
                }
            };

            $scope.openCamera = function () {
                cameraAction.showAction(function (imageURI) {
                    var tmpImage = $scope.grupo.image;
                    $scope.grupo.image = imageURI;

                    grupoService.updateImage($scope.grupo.id, imageURI).then(function (response) {
                        $scope.grupo.image = response.image;
                        $scope.fullScreen();
                    }, function () {
                        $cordovaDialogs.alert('Error al subir foto del grupo.', 'Informacion', 'Aceptar');
                        $scope.grupo.image = tmpImage;
                    });

                });
            };

            $scope.onDelete = function (item) {
                grupoService.deleteJugador(item);
            };

            $scope.onSalirEliminar = function () {
                $ionicHistory.goBack(-2);
                grupoService.delete($scope.grupo.id);
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
            $scope.isAnadido = function (jugador) {
                return $scope.grupo.jugadorgrupo.filter(function (jugadorgrupo) {
                    return jugadorgrupo.jugador.id === jugador.id;
                }).length > 0;
            };
            $scope.selectJugador = function (item) {
                grupoService.updateJugador($scope.grupo.id, item).then(function (response) {
                    $scope.grupo.jugadorgrupo.push(response.data);
                }, function (err) {
                    $cordovaDialogs.alert('Error al adicionar un jugador', 'Informacion', 'Aceptar');
                });
                $scope.modalAddJugador.remove();
            };
        })
        ;