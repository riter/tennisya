/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya
        .controller('crearPartidoCtrl', function ($rootScope, $state, $scope, $ionicHistory, $ionicModal, $localstorage, partidoService, userService, extrasService, searchJugador) {

            $ionicModal.fromTemplateUrl('templates/crearPartido/navable-partido.html', {
                animation: 'slide-in-up',
                scope: $scope
            }).then(function (modal) {
                $scope.modalNewPartido = modal;

            });
            $scope.openPatido = function () {
                if (!$scope.modalNewPartido._isShown) {
                    $scope.invitar = null;
                    $scope.partido = {reservada: true, tipo: 'Singles', jugador1: $localstorage.getObject('user'), grupo: $rootScope.grupoPartido.id};

                    if ($rootScope.disponibilidadPartido != null) {
                        console.log($rootScope.disponibilidadPartido);
                        $scope.partido.fecha = moment($rootScope.disponibilidadPartido.fecha).toDate();
                        $scope.partido.horaI = moment($rootScope.disponibilidadPartido.fechaI).toDate();
                        $scope.partido.horaF = moment($rootScope.disponibilidadPartido.fechaF).toDate();
                        $scope.partido.jugador2 = $rootScope.disponibilidadPartido.jugador;
                    }
                    $scope.modalNewPartido.show();
                }
            };
            $scope.onCreate = function (model) {
                console.log(model);
                partidoService.newPartido(model).then(function (response) {
                    $scope.modalNewPartido.hide();
                    $ionicHistory.goBack();
                });
            };

            extrasService.getClub().then(function (response) {
                $scope.clubs = response;
            });

            $scope.formatLYMD = function (date) {
                return moment(date).format('YYYY/MM/DD');
            };
            $scope.formatHHMM = function (time) {
                return moment(time).format('h:mm a');
            };
            $scope.changeTipo = function (value) {
                if (value == 'Singles') {
                    $scope.partido.jugador3 = null;
                    $scope.partido.jugador4 = null;
                }
            };
            $scope.$on('$ionicView.enter', function () {
                $scope.modalNewPartido._isShown = false;
                $scope.openPatido();

                if ($scope.invitar != null && searchJugador.getSelected() != null) {
                    $scope.partido[$scope.invitar] = searchJugador.getSelected();
                    $scope.invitar = null;
                    searchJugador.setSelected(null);
                }
            });

            $scope.onCancelar = function () {
                $ionicHistory.goBack();
                $scope.modalNewPartido.hide();
            };

            $scope.search = function (jugador) {
                $scope.invitar = jugador;
                $state.go('tabs.crear-partidos.search');
            };
        })
        .controller('searchJugadorCtrl', function ($scope, $ionicHistory, searchJugador) {
            $scope.data = {
                search: searchJugador.getJugadores()
            };

            $scope.searchJugador = function (query) {
                var ids = [];
                angular.forEach($scope.data.search, function (value, key) {
                    ids.push(value.id);
                });
                return searchJugador.searchJugador(query, ids);
            };

            $scope.selected = function (jugador) {
                searchJugador.setSelected(jugador);
            }
        })
        ;