/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya
        .controller('crearPartidoCtrl', function ($rootScope, $state, $scope, $ionicHistory, $ionicModal, $localstorage, partidoService, grupoService, extrasService, searchJugador) {
            $scope.clubs = extrasService.getClubs();
            
            $scope.$on('$ionicView.afterEnter', function (scopes, states) {
                if ($scope.modalNewPartido === null)
                    $scope.openPatido();
            });

            //view 1 Crear Partido llenar datos de formulario
            $scope.modalNewPartido = null;
            $scope.openPatido = function () {
                $scope.title = $rootScope.filterPartidos.title;
                var idGrupo = $rootScope.filterPartidos.type === 'grupo' ? $rootScope.filterPartidos.idType : null;
                $scope.partido = {fecha: moment().toDate(), horaI: moment('00:00:00', 'HH:mm:ss').toDate(), horaF: moment('00:00:00', 'HH:mm:ss').toDate(), reservada: true, tipo: 'Singles', jugador1: $localstorage.getObject('user'), grupo: idGrupo};
                $scope.invitar = null;
                $scope.withDisponibilidad();

                $ionicModal.fromTemplateUrl('templates/crearPartido/navable-partido.html', {
                    animation: 'slide-in-up',
                    scope: $scope,
                    hardwareBackButtonClose: false
                }).then(function (modal) {
                    $scope.modalNewPartido = modal;
                    $scope.modalNewPartido.show();
                });

            };
            $scope.onCancelar = function () {
                $scope.modalNewPartido.remove().then(function () {
                    $scope.modalNewPartido = null;
                    $ionicHistory.goBack();
                });
            };

            $scope.onCreate = function (model) {
                partidoService.newPartido(model).then(function (response) {
                    $scope.onCancelar();
                });
            };

            $scope.withDisponibilidad = function () {
                if ($rootScope.filterPartidos.type === 'jugador') {
                    if (typeof ($rootScope.disponibilidadPartido.fecha) !== 'undefined') {
                        $scope.partido.fecha = moment($rootScope.disponibilidadPartido.fecha).toDate();
                        $scope.partido.horaI = moment($rootScope.disponibilidadPartido.fechaI).toDate();
                        $scope.partido.horaF = moment($rootScope.disponibilidadPartido.fechaF).toDate();
                    }
                    $scope.partido.jugador2 = $rootScope.disponibilidadPartido.jugador;
                }
            };

            $scope.changeTipo = function (value) {
                if (value === 'Singles') {
                    $scope.partido.jugador3 = null;
                    $scope.partido.jugador4 = null;
                }
            };

            $scope.search = function (jugador) {
                $scope.invitar = jugador;
                $state.go('tabs.crear-partidos.search');
            };

            //view 2 Añadir Jugador
            $scope.isAdd = function (jugador) {
                return $scope.partido.jugador1 === jugador || $scope.partido.jugador2 === jugador || $scope.partido.jugador3 === jugador || $scope.partido.jugador4 === jugador;
            };
            $scope.selected = function (jugador) {
                $scope.partido[$scope.invitar] = jugador;
                $scope.invitar = null;
            };
            $scope.data = {
                search: searchJugador.getJugadores()
            };
            $scope.searchJugador = function (query) {
                if ($scope.partido.grupo) {
                    return grupoService.getModelData();
                } else {
                    var ids = [];
                    angular.forEach($scope.data.search, function (value, key) {
                        ids.push(value.id);
                    });
                    return searchJugador.searchJugador(query, ids);
                }
            };
            $scope.filterJugadorGrupo = function (items, query) {
                var result = [];
                angular.forEach(items, function (value, key) {
                    if ($scope.userLogin.id !== value.jugador.id && (
                            (value.jugador.name && value.jugador.name.toLowerCase().indexOf(query.toLowerCase()) > -1) || 
                            (value.jugador.estado && value.jugador.estado.toLowerCase().indexOf(query.toLowerCase()) > -1) ||
                            (value.jugador.clubCancha && value.jugador.clubCancha.nombre.toLowerCase().indexOf(query.toLowerCase()) > -1)
                            )) {
                        result.push(value.jugador);
                    }
                });
                return result;
            };
        })
        ;