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
                filter: {},
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
        .controller('infoJugadorCtrl', function ($rootScope, $scope, $state, $stateParams, $ionicSlideBoxDelegate, userService, disponibilidadService) {
            $scope.getHours = function () {
                var startHour = 6, endHour = 23, tmp = [];
                for (var i = startHour - 1; i <= endHour - 1; i++)
                    tmp.push(((i % 12) + 1) + (i < 12 ? ' AM' : ' PM'));
                return tmp;
            };

            $scope.$on('$ionicView.beforeEnter', function () {
                $scope.jugador = userService.getJugador();
                $rootScope.disponibilidadPartido = null;
            });

            $scope.onDisponibilidad = function (item, fecha) {
                $rootScope.disponibilidadPartido = {fecha: fecha, fechaI: item.fechaI, fechaF: item.fechaF, jugador: $scope.jugador};
                $state.go('tabs.crear-partidos');
            };

            disponibilidadService.listByJugador(parseInt($stateParams.id)).then(function (response) {
                console.log(response);
                angular.forEach(response, function (value, key) {
                    if (value.repetir != null && value.repetir.indexOf('.') > -1) {
                        var dias = value.repetir.split('.');
                        for (var i = 0; i < dias.length - 1; i++) {
                            $scope.data.repetir[dias[i]].push({
                                fecha: moment(value.fechai).format('YYYY-MM-DD'),
                                fechaI: value.fechai, //.format('H'),
                                fechaF: value.fechaf
                            });
                        }
                    } else {
                        if (moment(value.fechai.split(' ')[0]).diff(moment(moment().format('YYYY-MM-DD')), 'days') >= 0) {
                            $scope.data.unico.push({
                                fecha: moment(value.fechai).format('YYYY-MM-DD'),
                                fechaI: value.fechai, //.format('H'),
                                fechaF: value.fechaf
                            });
                        }
                    }
                });
                console.log($scope.data.repetir);
                console.log($scope.data.unico);
            });
            $scope.getDispByFecha = function (fecha) {
                var disponibilidad = [];

                angular.forEach($scope.data.unico, function (value, key) {
                    if (moment(fecha).format('YYYY-MM-DD') == value.fecha)
                        disponibilidad.push(value);
                });
                if ($scope.data.repetir[ moment(fecha).format('dd')].length > 0)
                    disponibilidad = disponibilidad.concat($scope.data.repetir[ moment(fecha).format('dd')]);

                return disponibilidad;
            };
            $scope.data = {
                slides: [{
                        fecha1: [moment().add(0, 'days').format('dd D'), moment().add(0, 'days').toDate()],
                        fecha2: [moment().add(1, 'days').format('dd D'), moment().add(1, 'days').toDate()],
                        fecha3: [moment().add(2, 'days').format('dd D'), moment().add(2, 'days').toDate()]
                    },
                    {
                        fecha1: [moment().add(3, 'days').format('dd D'), moment().add(3, 'days').toDate()],
                        fecha2: [moment().add(4, 'days').format('dd D'), moment().add(4, 'days').toDate()],
                        fecha3: [moment().add(5, 'days').format('dd D'), moment().add(5, 'days').toDate()]
                    },
                    {
                        fecha1: [moment().add(6, 'days').format('dd D'), moment().add(6, 'days').toDate()],
                        fecha2: [moment().add(7, 'days').format('dd D'), moment().add(7, 'days').toDate()],
                        fecha3: [moment().add(8, 'days').format('dd D'), moment().add(8, 'days').toDate()]
                    }],
                fecha: moment().add(8, 'days').toDate(),
                repetir: {'Lu': [], 'Ma': [], 'Mi': [], 'Ju': [], 'Vi': [], 'Sá': [], 'Do': []},
                unico: [],
                horas: $scope.getHours()
            };
            $ionicSlideBoxDelegate.update();

            $scope.nextSlide = function (index) {
                if (index + 2 == $scope.data.slides.length) {
                    $scope.data.slides.push({
                        fecha1: [moment($scope.data.fecha).add(1, 'days').format('dd D'), moment().add(1, 'days').toDate()],
                        fecha2: [moment($scope.data.fecha).add(2, 'days').format('dd D'), moment().add(2, 'days').toDate()],
                        fecha3: [moment($scope.data.fecha).add(3, 'days').format('dd D'), moment().add(3, 'days').toDate()]
                    });
                    $scope.data.fecha = moment($scope.data.fecha).add(3, 'days').toDate();
                    $ionicSlideBoxDelegate.update();
                }
            };
        })
        .controller('TabsCtrl', function ($scope, $state, $ionicHistory, $localstorage, extrasService, disponibilidadService, userService) {
            extrasService.loadClubs();
            disponibilidadService.load();

            $scope.formatFecha = function (date, format) {
                return moment(date).format(format);
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
        .controller('JugadoresSearchCtrl', function ($scope, $state, $ionicHistory, $localstorage, grupoService, searchJugador, cameraAction) {
            var idYo = $localstorage.getObject('user').id;

            $scope.onSig = function (state) {
                grupoService.setTitle($scope.data.title);
                grupoService.setThumb($scope.data.image);
                $state.go(state);
            };

            $scope.changeFocus = function (value) {
                $scope.data.focus = value;
                $scope.$apply();
            };
            $scope.isYo = function (jugador) {
                return idYo === jugador.id;
            };

            $scope.searchJugador = function (query) {
                var ids = [idYo];
                angular.forEach($scope.data.jugadores, function (value, key) {
                    ids.push(value.id);
                });
                return searchJugador.searchJugador(query, ids);
            };
            $scope.addJugador = function (item) {
                if (!$scope.isYo(item) && $scope.data.jugadores.indexOf(item) < 0) {
                    $scope.data.jugadores.push(item);
                    grupoService.setJugadores($scope.data.jugadores);
//                $scope.data.search.splice($scope.data.search.indexOf(item), 1);
                }
            };
            $scope.onDelete = function (item) {
                $scope.data.jugadores.splice($scope.data.jugadores.indexOf(item), 1);
                grupoService.setJugadores($scope.data.jugadores);
            };
            $scope.onCrearGrupo = function () {
                var parent = $scope.$parent.$parent;
                grupoService.save(idYo).then(function (response) {
                    if (response.id)
                        parent.data.grupos.unshift(response);
                });
                parent.modal.hide();
                $ionicHistory.goBack();
            };

            $scope.openCamera = function () {
                cameraAction.showAction(function (imageURI) {
                    $scope.data.image = imageURI;
                });
            };

            $scope.resetData = function () {
                $scope.data = {
                    focus: true,
                    title: '',
                    image: null,
                    jugadores: [],
                    search: []
                };
            };
            $scope.$on('resetModalGroup', $scope.resetData);
            $scope.resetData();
        })
        .controller('ListJugadoresCtrl', function ($ionicScrollDelegate, $scope, $state, $ionicModal, $rootScope, userService, grupoService) {
            userService.resetPage();
            $scope.showGrupos = function () {
                $scope.data.showGrupos = !$scope.data.showGrupos;
                $ionicScrollDelegate.resize();
            };

            $scope.loadMoreData = function () {
                userService.listJugador().then(function (response) {
                    angular.forEach(response.jugadores, function (value, key) {
                        $scope.data.jugadores.push(value);
                    });
                    $scope.data.scrolling = response.next;
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            };

            $scope.$on('$ionicView.enter', function () {
                $rootScope.grupoPartido = {id: null};
            });

            $scope.data = {
                showGrupos: false,
                jugadores: [],
                scrolling: true,
                grupos: []
            };

            grupoService.list().then(function (response) {
                $scope.data.grupos = response;
            });

            $ionicModal.fromTemplateUrl('templates/grupo/navable-grupo.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
            });

            $scope.openCreateGrupo = function () {
                $rootScope.$broadcast('resetModalGroup', {});
                grupoService.resetModel();
                $scope.modal.show();
            };

            $rootScope.$on('updategroup', function (event, args) {
                var index = -1;
                angular.forEach($scope.data.grupos, function (value, key) {
                    if (args.grupo.id == value.id) {
                        index = key;
                        //$scope.data.grupos.splice($scope.data.grupos.indexOf(value), 1);
                    }
                });

                switch (args.action) {
                    case 'new':
                        $scope.data.grupos.unshift(args.grupo);
                        break;
                    case 'update':
                        if (index > -1)
                            angular.merge($scope.data.grupos[index], args.grupo);
                        break;
                    case 'remove':
                        if (index > -1)
                            $scope.data.grupos.splice(index, 1);
                        break;
                }
            });

            $scope.nextGrupo = function (grupo) {
                grupoService.setModel(grupo);
                $state.go('tabs.groups', {id: grupo.id});
            };

        })
        .controller('ListPartidosCtrl', function ($rootScope, $scope, $cordovaActionSheet, partidoService) {

            $scope.$on('$ionicView.enter', function () {
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
   