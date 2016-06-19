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
                    return grupoService.getListData();
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
                $state.go('tabs.group', {id: grupo.id});
            };

        })
        .controller('searchPartidosCtrl', function () {

        })
        .controller('TabsCtrl', function ($cordovaSplashscreen, $ionicPlatform, $ionicHistory, $rootScope, $scope, $state, $localstorage, notoficacionService, extrasService, userService, grupoService) {

            setTimeout(function () {
                $cordovaSplashscreen.hide();
            }, 1000);

            $scope.formatFromNow = function (date) {
                return moment(date).fromNow();
            };

            $scope.formatFecha = function (date, format) {
                return date === null ? '' : date !== '' ? moment(date).format(format) : moment().format(format);
            };

            $scope.nextInfoJugador = function (jugador) {
                userService.setJugador(jugador);
                $state.go('tabs.player-info', {id: jugador.id});
            };
            $scope.filterQuery = function (items, query) {
                var result = [];
                angular.forEach(items, function (value, key) {
                    if ($scope.userLogin.id !== value.id && (
                            (value.name && value.name.toLowerCase().indexOf(query.toLowerCase()) > -1) ||
                            (value.estado && value.estado.toLowerCase().indexOf(query.toLowerCase()) > -1) ||
                            (value.clubCancha && value.clubCancha.nombre.toLowerCase().indexOf(query.toLowerCase()) > -1)
                            )) {
                        result.push(value);
                    }
                });
                return result;
            };

            $scope.userLogin = $localstorage.getObject('user');
            $scope.isYo = function (jugador) {
                return $scope.userLogin.id == jugador.id;
            };

            $scope.isNotifPartido = function (partido) {
                return $scope.notificaciones.data.filter(function (notif) {
                    return notif.partido === partido.id;
                }).length > 0;
            };

            $scope.isNotifGrupo = function (grupo) {
                return $scope.notificaciones.data.filter(function (notif) {
                    return notif.grupo === grupo.id;
                }).length > 0;
            };

            $scope.isNotifPartidos = function () {
                if ($rootScope.filterPartidos) {
                    switch ($rootScope.filterPartidos.type) {
                        case 'jugador' :
                            break;
                        case 'grupo' :
                            return $scope.notificaciones.data.filter(function (notif) {
                                return notif.partido !== null && notif.grupo === $rootScope.filterPartidos.idType;
                            }).length > 0;
                            break;
                        case 'jugadores' :
                            return $scope.notificaciones.data.filter(function (notif) {
                                return notif.partido !== null;
                            }).length > 0;
                            break;
                        case 'grupos' :
                            var idsG = grupoService.getListIds();
                            return $scope.notificaciones.data.filter(function (notif) {
                                return notif.partido !== null && idsG.indexOf(notif.grupo) > -1;
                            }).length > 0;
                            break;
                    }
                }
                return false;
            };

            $scope.removeNotificacion = function (type) {
                if ($rootScope.filterPartidos) {
                    var filterType = type || $rootScope.filterPartidos.type;
                    var filterIdType = $rootScope.filterPartidos.idType;
                    switch (filterType) {
                        case 'newgrupo' :
                            if ($scope.notificaciones.data.filter(function (notif) {
                                return notif.partido === null && notif.grupo === filterIdType;
                            }).length > 0) {
                                notoficacionService.leido(filterIdType, $scope.userLogin.id, filterType);
                            }
                            break;
                        case 'jugador' :
                            break;
                        case 'grupo' :
                        case 'grupos' :
                            if ($scope.isNotifPartidos()) {
                                notoficacionService.leido(filterIdType, $scope.userLogin.id, filterType);
                            }
                            break;
                        case 'jugadores' :
                            break;
                    }
                }
            };

            $scope.notificaciones = notoficacionService.getList();
            $rootScope.loadNotificaciones = function () {
                notoficacionService.loadList($scope.userLogin.id);
            };

            $scope.loadNotificaciones();
            extrasService.getClubs();

            $ionicPlatform.on('resume', function () {
                $rootScope.loadNotificaciones();
                $rootScope.$broadcast($ionicHistory.currentStateName(), {type: 'resume'});
            });

            document.addEventListener("deviceready", function () {
                notoficacionService.register();
            }, false);
        })
        ;
   