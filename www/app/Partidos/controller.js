/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya
        .controller('ListPartidosCtrl', function ($rootScope, $scope, $timeout, $cordovaActionSheet, partidoService) {
            var getPartidosT = function () {
                partidoService.getPartidosT($scope.userLogin.id, $rootScope.grupoPartido.id).then(function (response) {
                    $scope.todos = response;
                    $scope.intervalPartidosT = $timeout(getPartidosT, 30000);
                });
            };
            var getPartidosP = function () {
                partidoService.getPartidosP($scope.userLogin.id, $rootScope.grupoPartido.id).then(function (response) {
                    $scope.personales = response;
                    $scope.intervalPartidosP = $timeout(getPartidosP, 30000);
                });
            };
            var getPartidosC = function () {
                partidoService.getPartidosC($scope.userLogin.id, $rootScope.grupoPartido.id).then(function (response) {
                    $scope.confirmados = response;
                    $scope.intervalPartidosC = $timeout(getPartidosC, 30000);
                });
            };
            var getPartidosJ = function () {
                partidoService.getPartidosJ($scope.userLogin.id, $rootScope.grupoPartido.id).then(function (response) {
                    $scope.jugados = response;
                    $scope.intervalPartidosJ = $timeout(getPartidosJ, 30000);
                });
            };

            $scope.loadPartidos = function () {
                getPartidosT();
                getPartidosP();
                getPartidosC();
                getPartidosJ();
            };
            $scope.$on('$ionicView.afterEnter', function () {
                $scope.loadPartidos();
            });
            $scope.$on('$ionicView.beforeLeave', function () {
                $timeout.cancel($scope.intervalPartidosT);
                $timeout.cancel($scope.intervalPartidosP);
                $timeout.cancel($scope.intervalPartidosC);
                $timeout.cancel($scope.intervalPartidosJ);
            });

            $scope.confirmInvitacion = function (partido, jugadorpartido) {
                if ($scope.userLogin.id == jugadorpartido.jugador.id) {
                    var options = {
                        addCancelButtonWithLabel: 'Cancelar',
                        androidEnableCancelButton: true
                    };

                    if (jugadorpartido.estado == 'invitado') {
                        options.title = 'Confirmacion de partido';
                        options.buttonLabels = ['Aceptar', 'Rechazar'];
                        $cordovaActionSheet.show(options)
                                .then(function (btnIndex) {
                                    $scope.actionOptions(options.buttonLabels[btnIndex - 1], jugadorpartido, partido);
                                });
                    } else if (jugadorpartido.estado == 'aceptado') {
                        options.title = 'Desea abandonar el partido?';
                        options.buttonLabels = ['Salir'];
                        $cordovaActionSheet.show(options)
                                .then(function (btnIndex) {
                                    $scope.actionOptions(options.buttonLabels[btnIndex - 1], jugadorpartido, partido);
                                });
                    }
                }
            };
            $scope.entrarPartido = function (partido) {
                var options = {
                    addCancelButtonWithLabel: 'Cancelar',
                    androidEnableCancelButton: true
                };

                options.title = 'Desea ingresar a formar parte del partido?';
                options.buttonLabels = ['Ingresar'];

                $cordovaActionSheet.show(options)
                        .then(function (btnIndex) {
                            $scope.actionOptions(options.buttonLabels[btnIndex - 1], null, partido);
                        });
            };

            $scope.actionOptions = function (action, jugadorPartido, partido) {
                switch (action) {
                    case 'Aceptar':
                        partidoService.confirmPartido(jugadorPartido.id, 'aceptado').then(function (response) {
                            partido.jugadorpartido[partido.jugadorpartido.indexOf(jugadorPartido)] = response;
                            $rootScope.$broadcast('$ionicView.enter', {});
                        });
                        break;
                    case 'Rechazar':
                        partidoService.confirmPartido(jugadorPartido.id, 'cancelado').then(function (response) {
                            partido.jugadorpartido.splice(partido.jugadorpartido.indexOf(jugadorPartido), 1);
                            $rootScope.$broadcast('$ionicView.enter', {});
                        });
                        break;
                    case 'Salir':
                        partidoService.confirmPartido(jugadorPartido.id, 'salir').then(function (response) {
                            partido.jugadorpartido.splice(partido.jugadorpartido.indexOf(jugadorPartido), 1);
                            $rootScope.$broadcast('$ionicView.enter', {});
                        });
                        break;
                    case 'Ingresar':
                        partidoService.entrarPartido(partido.id, $scope.userLogin.id, 'entrar').then(function (response) {
                            //partido.jugadorpartido.push(response);
                            $rootScope.$broadcast('$ionicView.enter', {});
                        });
                        break;
                }
            };

            $scope.formatPartidos = function (date) {
                return moment(date).format('dddd DD/MM, HH') + ' hs';
            };
            $scope.formatFromNow = function (date) {
                return moment(date).fromNow();
            };
            $scope.getVacios = function (partido) {
                var res = [], cant = partido.tipo == 'Dobles' ? 4 : 2;
                for (var c = 0; c < (cant - partido.jugadorpartido.length); c++) {
                    res.push(cant + c);
                }
                return res;
            };
            $scope.isCompleto = function (partido) {
                if (typeof (partido.jugadorpartido) !== 'undefined') {
                    if ((partido.tipo == 'Singles' && partido.jugadorpartido.length == 2) || (partido.tipo == 'Dobles' && partido.jugadorpartido.length == 4)) {
                        return true;
                    }
                }
                return false;
            };
            $scope.hasIvitado = function (partido) {
                if (typeof (partido.jugadorpartido) !== 'undefined') {
                    var res = false;
                    angular.forEach(partido.jugadorpartido, function (value, key) {
                        if (value.estado == 'invitado')
                            res = true;
                    });
                }
                return res;
            };
        })
        ;