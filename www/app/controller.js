/**
 * Created by Riter on 25/08/15.
 */

appTennisya
        .controller('searchJugadorGrupoCtrl', function ($scope, $state, $stateParams, searchJugador, grupoService) {
            $scope.$on('$ionicView.beforeEnter', function (scopes, states) {
                if (states.direction == 'forward')
                    $scope.data.filter.value = '';
            });
            $scope.data = {
                search: searchJugador.getJugadores(),
                filter: {value: ''},
                tipo: $stateParams.tipo
            };

            $scope.searchJugador = function (query) {
                if ($scope.data.tipo == 'Grupo') {
                    return grupoService.getList();
                } else {
                    var ids = [];
                    angular.forEach($scope.data.search, function (value, key) {
                        ids.push(value.id);
                    });
                    return searchJugador.searchJugador(query, ids);
                }
            };

            $scope.filterGrupo = function (items, query) {
                var result = [];
                angular.forEach(items, function (value, key) {
                    if (value.title.toLowerCase().indexOf(query.toLowerCase()) > -1 || value.ciudad.toLowerCase().indexOf(query.toLowerCase()) > -1 ||
                            value.pais.toLowerCase().indexOf(query.toLowerCase()) > -1) {
                        result.push(value);
                    }
                });
                return result;
            };

            $scope.nextGrupo = function (grupo) {
                grupoService.setModel(grupo);
                $state.go('tabs.groups', {id: grupo.id});
            };

        })
        .controller('searchPartidosCtrl', function ($scope, $state, $stateParams, searchJugador, grupoService) {
//        $scope.$on('$ionicView.beforeEnter', function(scopes, states ) {
//            if(states.direction == 'forward')
//                $scope.data.filter.value = '';
//        });
//        $scope.data ={
//            search: searchJugador.getJugadores(),
//            filter: {},
//            tipo: $stateParams.tipo
//        };
//
//        $scope.searchJugador = function(query){
//            var ids = [];
//            angular.forEach($scope.data.search, function(value, key) {
//                ids.push(value.id);
//            });
//            return searchJugador.searchJugador(query,ids);
//        };
//
//        $scope.filterGrupo = function(items,query) {
//            var result = [];
//            angular.forEach(items, function(value, key) {
//                if (value.title.toLowerCase().indexOf(query) > -1 || value.ciudad.toLowerCase().indexOf(query) > -1 ||
//                    value.pais.toLowerCase().indexOf(query) > -1) {
//                    result.push(value);
//                }
//            });
//            return result;
//        };

        })
        .controller('TabsCtrl', function ($scope, $state, $ionicHistory, $localstorage, extrasService, disponibilidadService, userService) {
            extrasService.loadClubs();
            disponibilidadService.load();

            $scope.formatFecha = function (date, format) {
                return date === null ? '' : moment(date).format(format);
            };

            $scope.nextInfoJugador = function (jugador) {
                userService.setJugador(jugador);
                $state.go('tabs.player-info', {id: jugador.id});
            };
            $scope.filterQuery = function (items, query) {
                var result = [];
                angular.forEach(items, function (value, key) {
                    if (value.name.toLowerCase().indexOf(query.toLowerCase()) > -1 || value.estado.toLowerCase().indexOf(query.toLowerCase()) > -1 ||
                            value.clubCancha.nombre.toLowerCase().indexOf(query.toLowerCase()) > -1) {
                        result.push(value);
                    }
                });
                return result;
            };

            $scope.userLogin = $localstorage.getObject('user');
        })
        .controller('ListPartidosCtrl', function ($rootScope, $scope, $interval, $cordovaActionSheet, partidoService) {
            $scope.loadPartidos = function () {
                partidoService.getPartidosT($scope.userLogin.id, $rootScope.grupoPartido.id).then(function (response) {
                    $scope.todos = response;
                });
                partidoService.getPartidosP($scope.userLogin.id, $rootScope.grupoPartido.id).then(function (response) {
                    $scope.personales = response;
                });
                partidoService.getPartidosC($scope.userLogin.id, $rootScope.grupoPartido.id).then(function (response) {
                    $scope.confirmados = response;
                });
                partidoService.getPartidosJ($scope.userLogin.id, $rootScope.grupoPartido.id).then(function (response) {
                    $scope.jugados = response;
                });
            };
            $scope.$on('$ionicView.enter', $scope.loadPartidos);
            $scope.$on('$ionicView.beforeLeave', function(){
                 $interval.cancel($scope.intervalReload);
            });
            $scope.intervalReload = $interval($scope.loadPartidos, 30000);

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
            }
        });
//    .controller('GamersCtrl', function($scope) {
//        $scope.gamers = [
//            {name: 'Novak Djokovic', country: 'Montevideo, Uruguay', club: 'Lawn Tenis, Nautilus', avatar: 'assets/img/gamers/1.jpg'},
//            {name: 'Juan Pérez', country: 'Uruguay', club: '', avatar: 'assets/img/gamers/2.jpg'},
//            {name: 'Pedro Aguirre', country: 'Buenos Aires, Argentina', club: 'San Isidro Club', avatar: 'assets/img/gamers/3.jpg'},
//            {name: 'Serenita', country: 'Lorem ipsum, lorem ipsum', club: '', avatar: 'assets/img/gamers/4.jpg'},
//            {name: 'Jim carrey', country: 'Lorem ipsum, lorem ipsum', club: '', avatar: 'assets/img/gamers/4.jpg'},
//            {name: 'Mari Shara', country: 'Lorem ipsum, lorem ipsum', club: '', avatar: 'assets/img/gamers/4.jpg'},
//            {name: 'Carito Woz', country: 'Lorem ipsum, lorem ipsum', club: '', avatar: 'assets/img/gamers/4.jpg'}
//        ]
//    });
   