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
        .controller('TabsCtrl', function ($scope, $state, $ionicHistory, $localstorage, notoficacionService, extrasService, disponibilidadService, userService) {
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
            
            $scope.badge = 0;
            notoficacionService.loadList($scope.userLogin.id).then(function () {
                $scope.badge = notoficacionService.data.length;
            });
            
            $scope.$on('$cordovaPush:notificationReceived', function (event, notification) {

                if (ionic.Platform.isAndroid()) {
                    switch (notification.event) {
                        case 'message':
                            // this is the actual push notification. its format depends on the data model from the push server
                            alert('message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
                            break;
                        case 'error':
                            alert('GCM error = ' + notification.msg);
                            break;
                    }
                } else if (ionic.Platform.isIOS()) {
                    if (notification.alert) {
                        alert(notification.alert);
                    }

                    if (notification.sound) {
                        var snd = new Media(event.sound);
                        snd.play();
                    }

                    if (notification.badge) {
                        $cordovaPush.setBadgeNumber(notification.badge).then(function (result) {
                            // Success!
                        }, function (err) {
                            // An error occurred. Show a message to the user
                        });
                    }
                }
            });
        })
        ;
   