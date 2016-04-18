/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya
        .controller('ListJugadoresCtrl', function ($ionicScrollDelegate, $ionicHistory, $scope, $state, $timeout, $ionicModal, $rootScope, userService, grupoService) {
            userService.resetPage();
            $scope.showGrupos = function () {
                $scope.data.showGrupos = !$scope.data.showGrupos;
                $ionicScrollDelegate.resize();

                if ($scope.data.showGrupos === true) {
                    $rootScope.filterPartidos = {type: 'grupos', idType: null, title: 'Grupos'};
                } else {
                    $rootScope.filterPartidos = {type: 'jugadores', idType: null, title: null};
                }
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

            $scope.data = {
                showGrupos: false,
                jugadores: [],
                scrolling: true,
                grupos: []
            };

            var loadGrupos = function () {
                grupoService.list().then(function (response) {
                    $scope.data.grupos = response;
                    $scope.intervalReload = $timeout(loadGrupos, 30000);
                });
            };
            $scope.$on('$ionicView.afterEnter', function () {
                if ($scope.data.showGrupos === true) {
                    $rootScope.filterPartidos = {type: 'grupos', idType: null, title: 'Grupos'};
                } else {
                    $rootScope.filterPartidos = {type: 'jugadores', idType: null, title: null};
                }

                loadGrupos();
            });
            $scope.$on('$ionicView.beforeLeave', function () {
                $timeout.cancel($scope.intervalReload);
            });

            // create Grupos
            $scope.closeNewGrupo = function () {
                $ionicHistory.nextViewOptions({disableAnimate: true});
                $state.go('tabs.player');
                $scope.modalNewGroup.remove();
            };
            $scope.openNewGrupo = function () {
                $ionicModal.fromTemplateUrl('templates/grupo/navable-grupo.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                    focusFirstInput: true
                }).then(function (modal) {
                    $scope.modalNewGroup = modal;
                    $scope.new_group = {focus: true, title: '', image: null, pais: '', ciudad: '', jugadores: [], search: []};
                    $scope.modalNewGroup.show();
                });
            };

            $rootScope.$on('updategroup', function (event, args) {
                var index = -1;
                angular.forEach($scope.data.grupos, function (value, key) {
                    if (args.grupo.id == value.id)
                        index = key;
                });

                switch (args.action) {
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
                $state.go('tabs.group', {id: grupo.id});
            };

        })
        .controller('infoJugadorCtrl', function ($rootScope, $scope, $state, $stateParams, $ionicSlideBoxDelegate, $window, userService, disponibilidadService) {
            $scope.startHour = 6;
            $scope.endHour = 23, $scope.alto = 40;//alto en px 
            $scope.getHours = function () {
                var tmp = [];
                for (var i = $scope.startHour - 1; i <= $scope.endHour - 1; i++)
                    tmp.push(((i % 12) + 1) + (i < 12 ? ' AM' : ' PM'));
                return tmp;
            };

            $scope.$on('$ionicView.beforeEnter', function () {
                $scope.jugador = userService.getJugador();
                $rootScope.filterPartidos = {type: 'jugador', idType: $scope.jugador.id, title: $scope.jugador.name};
                $rootScope.disponibilidadPartido = {jugador: $scope.jugador};
                
                $scope.images = [{
                    src: $scope.jugador.photo !== null ? $scope.jugador.photo : 'assets/img/profile.png',
                    safeSrc: $scope.jugador.photo !== null ? $scope.jugador.photo : 'assets/img/profile.png',
                    thumb: $scope.jugador.photo !== null ? $scope.jugador.photo : 'assets/img/profile.png',
                    size: '0x0',
                    type: 'image'
                }];
            });

            $scope.onDisponibilidad = function (item, fecha) {
                $rootScope.disponibilidadPartido = {fecha: fecha, fechaI: item.fechaI, fechaF: item.fechaF, jugador: $scope.jugador};
                $state.go('tabs.crear-partidos');
            };

            disponibilidadService.listByJugador(parseInt($stateParams.id)).then(function (response) {
                var hoy = moment(moment().format('YYYY-MM-DD'));

                angular.forEach(response, function (value, key) {
                    if (value.repetir != null && value.repetir.indexOf('.') > -1) {
                        var dias = value.repetir.split('.');
                        for (var i = 0; i < dias.length - 1; i++) {
                            $scope.data.repetir[dias[i]].push({
                                fecha: moment(value.fechai).format('YYYY-MM-DD'),
                                fechaI: value.fechai,
                                fechaF: value.fechaf
                            });
                        }
                    } else {
                        if (moment(value.fechai.split(' ')[0]).diff(hoy, 'days') >= 0) {
                            $scope.data.unico.push({
                                fecha: moment(value.fechai).format('YYYY-MM-DD'),
                                fechaI: value.fechai,
                                fechaF: value.fechaf
                            });
                        }
                    }
                });
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

            $scope.getTopHeigth = function (fechaI, fechaF) {
                var minTop = ((parseInt(moment(fechaI).format('H')) - $scope.startHour) * 60) + parseInt(moment(fechaI).format('m'));
                var top = (minTop * $scope.alto) / 60;

                var minHeight = ((parseInt(moment(fechaF).format('H')) - $scope.startHour) * 60) + parseInt(moment(fechaF).format('m'));
                var height = ((minHeight * $scope.alto) / 60) - top;

                return {top: top + 'px', height: height + 'px'};
            };
        })
        ;