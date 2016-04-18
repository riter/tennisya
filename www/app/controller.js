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
        .controller('searchPartidosCtrl', function () {
            
        })
        .controller('TabsCtrl', function ($rootScope, $scope, $state, $localstorage, notoficacionService, extrasService, userService) {
            notoficacionService.register();
            extrasService.loadClubs();

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
                    if ($scope.userLogin.id !== value.id && (value.name.toLowerCase().indexOf(query.toLowerCase()) > -1 || value.estado.toLowerCase().indexOf(query.toLowerCase()) > -1 ||
                            value.clubCancha.nombre.toLowerCase().indexOf(query.toLowerCase()) > -1)) {
                        result.push(value);
                    }
                });
                return result;
            };

            $scope.userLogin = $localstorage.getObject('user');

            $scope.isNotifGrupo = function (idGrupo) {
                var res = false;
                angular.forEach($scope.notificaciones, function (value, key) {
                    if (value.grupo === idGrupo)
                        res = true;
                });
                return res;
            };
            $scope.isNotifJugador = function (idJugador) {
                var res = false;
                angular.forEach($scope.notificaciones, function (value, key) {
                    if (value.partido !== null && value.grupo === null && value.noleidos[$scope.userLogin.id] !== undefined && value.noleidos[$scope.userLogin.id].indexOf(idJugador) > -1)
                        res = true;
                });
                return res;
            };

            $scope.isNotifPartido = function () {
                var res = false;
                if ($rootScope.filterPartidos && $rootScope.filterPartidos.type === 'jugador') {
                    return $scope.isNotifJugador($rootScope.filterPartidos.idType);
                } else if ($rootScope.filterPartidos && $rootScope.filterPartidos.type === 'grupo') {
                    angular.forEach($scope.notificaciones, function (value, key) {
                        if (value.partido !== null && value.grupo === $rootScope.filterPartidos.idType)
                            res = true;
                    });
                }
                return res;
            };
            $scope.removeNotificacion = function (type) {
                var filterType = type || $rootScope.filterPartidos.type;
                if ($rootScope.filterPartidos) {
                    if ((filterType === 'newgrupo' && $scope.isNotifGrupo($rootScope.filterPartidos.idType)) || ($scope.isNotifPartido() && (filterType === 'jugador' || filterType === 'grupo'))) {
                        notoficacionService.leido($rootScope.filterPartidos.idType, $scope.userLogin.id, filterType).then(function () {
                            $scope.notificaciones = notoficacionService.data;
                        });
                    }
                }
            };

            $rootScope.loadNotificaciones = function () {
                notoficacionService.loadList($scope.userLogin.id).then(function () {
                    $scope.notificaciones = notoficacionService.data;
                });
            };
//            $scope.loadNotificaciones();
            
        })
        ;
   