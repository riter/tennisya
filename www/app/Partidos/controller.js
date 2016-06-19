/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya
        .controller('ListPartidosCtrl', function ($ionicScrollDelegate, $ActionSheetGral, $state, $ionicHistory, $rootScope, $scope, $ionicPopover, partidoService, grupoService) {
            // dropdown mostrar
            $ionicPopover.fromTemplateUrl('templates/partidos/mostrar.html', {
                scope: $scope
            }).then(function (popover) {
                $scope.popover = popover;
            });

            $scope.filterTodos = 'todos';
            $scope.filterPersonales = 'todos';

            $scope.openMostrar = function (event, tabMostrar) {
                $scope.tabMostrar = tabMostrar;
                $scope.popover.show(event);
            };
            $scope.filterMostrar = function (filter_mostrar) {
                if ($scope.tabMostrar === 'todos') {
                    $scope.filterTodos = filter_mostrar;
                } else if ($scope.tabMostrar === 'personales') {
                    $scope.filterPersonales = filter_mostrar;
                }
            };

            // filtros por tabs, grupos y jugadores
            $scope.partidosTodos = function (partido) {
                return !$scope.isParticipando(partido, $scope.userLogin.id) && $scope.filterType(partido, $rootScope.filterPartidos.type, $rootScope.filterPartidos.idType);
            };
            $scope.partidosPersConf = function (partido) {
                return $scope.isParticipando(partido, $scope.userLogin.id) && $scope.filterType(partido, $rootScope.filterPartidos.type, $rootScope.filterPartidos.idType);
            };
            $scope.filterType = function (partido, type, idType) {
                switch (type) {
                    case 'grupos':
                        return partido.grupo && grupoService.getListIds().indexOf(partido.grupo.id) > -1;
                        break;
                    case 'jugadores':
                        return true;
                        break;
                    case 'grupo':
                        return partido.grupo && idType === partido.grupo.id;
                        break;
                    case 'jugador':
                        return partido.jugadorpartido.filter(function (jugadorpartido) {
                            return jugadorpartido.jugador.id === idType;
                        }).length > 0;
                        break;
                    default :
                        return false;
                }
            };

            //partidos
            $scope.list = partidoService.getList();
            $scope.getPartidosT = function () {
                partidoService.getPartidosT($scope.userLogin.id, $rootScope.filterPartidos.type, $rootScope.filterPartidos.idType).then(function (response) {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            };
            $scope.getPartidosP = function () {
                partidoService.getPartidosP($scope.userLogin.id, $rootScope.filterPartidos.type, $rootScope.filterPartidos.idType).then(function (response) {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            };
            $scope.getPartidosC = function () {
                partidoService.getPartidosC($scope.userLogin.id, $rootScope.filterPartidos.type, $rootScope.filterPartidos.idType).then(function (response) {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            };
            $scope.getPartidosJ = function () {
                partidoService.getPartidosJ($scope.userLogin.id, $rootScope.filterPartidos.type, $rootScope.filterPartidos.idType).then(function (response) {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            };

            $scope.getVacios = function (partido) {
                var res = [], cant = partido.tipo == 'Dobles' ? 4 : 2;
                for (var c = 0; c < (cant - partido.jugadorpartido.length); c++) {
                    res.push(cant + c);
                }
                return res;
            };
            $scope.isCompleto = function (partido) {
                return !angular.isUndefined(partido.jugadorpartido) && partido.jugadorpartido.length > 0 && partido.jugadorpartido.length % 2 === 0;
            };
            $scope.hasIvitado = function (partido) {
                return partido.jugadorpartido.filter(function (jugadorpartido) {
                    return jugadorpartido.estado === 'invitado';
                }).length > 0;
            };
            $scope.isParticipando = function (partido, idJugador) {
                return partido.jugadorpartido.filter(function (jugadorpartido) {
                    return jugadorpartido.jugador.id === idJugador;
                }).length > 0;
            };

            $scope.infoPartidos = function (partido) {
                var jugador_partido = null;
                angular.forEach(partido.jugadorpartido, function (value, key) {
                    if (value.jugador.id === $scope.userLogin.id) {
                        jugador_partido = value;
                    }
                });
//                $scope.actionOptions('Aceptar', jugador_partido, partido);
                if (jugador_partido === null) {
                    $ActionSheetGral.show('', ['Ver info.', 'Ingresar'], '').then(function (response) {
                        $scope.actionOptions(response, jugador_partido, partido);
                    });
                } else {
                    if (jugador_partido.estado === 'invitado') {
                        $ActionSheetGral.show('', ['Aceptar', 'Ver info.'], 'Rechazar').then(function (response) {
                            $scope.actionOptions(response, jugador_partido, partido);
                        });
                    }
                    if (jugador_partido.estado === 'aceptado') {
                        $ActionSheetGral.show('', ['Ver info.'], 'Abandonar').then(function (response) {
                            $scope.actionOptions(response, jugador_partido, partido);
                        });
                    }
                }
            };

            $scope.actionOptions = function (action, jugadorPartido, partido) {
                switch (action) {
                    case 'Ver info.':
                        partidoService.setModel(partido);
                        $state.go('tabs.info-partido');
                        break;
                    case 'Aceptar':
                        partidoService.confirmPartido(partido.id, jugadorPartido.jugador.id, 'aceptado').then(function (response) {
                            partido.jugadorpartido[partido.jugadorpartido.indexOf(jugadorPartido)] = response;
                        });
                        break;
                    case 'Rechazar':
                    case 'Abandonar':
                        partidoService.confirmPartido(partido.id, jugadorPartido.jugador.id, action.toLocaleLowerCase()).then(function (response) {
                            partido.jugadorpartido.splice(partido.jugadorpartido.indexOf(jugadorPartido), 1);
                        });
                        break;
                    case 'Ingresar':
                        partidoService.entrarPartido(partido.id, $scope.userLogin.id).then(function (response) {
                            partido.jugadorpartido.push(response);
                        });
                        break;
                }
            };

            $scope.$on('$ionicView.afterEnter', function () {
                $scope.title = $rootScope.filterPartidos.title !== null ? 'Partidos: ' + $rootScope.filterPartidos.title : 'Partidos';

                var type = $rootScope.filterPartidos.type;
                var idType = $rootScope.filterPartidos.idType;
                if (idType !== null) {
                    if (angular.isUndefined($scope.list.paginate.todos[type][idType]))
                        $scope.list.paginate.todos[type][idType] = {page: 1, next: true, lastUpdate: null, idEnd: null};

                    if (angular.isUndefined($scope.list.paginate.personales[type][idType]))
                        $scope.list.paginate.personales[type][idType] = {page: 1, next: true, lastUpdate: null, idEnd: null};

                    if (angular.isUndefined($scope.list.paginate.confirmados[type][idType]))
                        $scope.list.paginate.confirmados[type][idType] = {page: 1, next: true, lastUpdate: null, idEnd: null};

                    if (angular.isUndefined($scope.list.paginate.jugados[type][idType]))
                        $scope.list.paginate.jugados[type][idType] = {page: 1, next: true, lastUpdate: null, idEnd: null};
                }
                
                $ionicScrollDelegate.resize();
            });
            $scope.$on('$ionicView.beforeLeave', function () {
                $scope.removeNotificacion();                
            });
            $scope.$on($ionicHistory.currentStateName(), function (event, response) {
                switch (response.type) {
                    case 'resume':
                        partidoService.updateListPartidos($scope.tabSelect, $scope.userLogin.id, $rootScope.filterPartidos.type, $rootScope.filterPartidos.idType);
                        break;
                    case 'partido':
                        partidoService.getPartidoId(response.partido);
                        break;
                }
            });
            
            $scope.tabSelect = null;
            $scope.onTabSelected = function (tab) {
                $scope.tabSelect = tab;
                partidoService.updateListPartidos(tab, $scope.userLogin.id, $rootScope.filterPartidos.type, $rootScope.filterPartidos.idType);
            };
        })
        .controller('InfoPartidosCtrl', function ($scope, $ionicModal, partidoService, searchJugador) {
            $scope.partido = partidoService.getModel();
            $scope.partido.fechai = moment($scope.partido.fechai).toDate();
            $scope.partido.fechaf = moment($scope.partido.fechaf).toDate();

            $scope.hasAnadir = function () {
                var jp = $scope.partido.jugadorpartido.filter(function (jugadorpartido) {
                    return jugadorpartido.jugador.id === $scope.userLogin.id;
                });
                return $scope.partido.jugadorpartido.length % 2 !== 0 && jp.length > 0 && jp[0].estado == 'aceptado';
            }

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
                angular.forEach($scope.partido.jugadorpartido, function (value, key) {
                    ids.push(value.jugador.id);
                });
                return searchJugador.searchJugador(query, ids);
            };

            $scope.selectJugador = function (jugador) {
                partidoService.añadirPartido($scope.partido.id, jugador.id, $scope.userLogin.id).then(function (response) {
                    $scope.partido.jugadorpartido.push(response);
                });
                $scope.modalAddJugador.remove();
            };
        })
        ;