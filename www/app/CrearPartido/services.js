/**
 * Created by Riter on 25/08/15.
 */
/*
 */
appTennisya
        .factory('partidoService', function ($q, $http, $cordovaDialogs, $ionicLoading) {

            return {
                select: null,
                model: {
                    paginate: {
                        limit: 20,
                        todos: {
                            grupos: {page: 1, next: true, lastUpdate: null, idEnd: null},
                            jugadores: {page: 1, next: true, lastUpdate: null, idEnd: null},
                            jugador: {},
                            grupo: {}
                        },
                        personales: {
                            grupos: {page: 1, next: true, lastUpdate: null, idEnd: null},
                            jugadores: {page: 1, next: true, lastUpdate: null, idEnd: null},
                            jugador: {},
                            grupo: {}
                        },
                        confirmados: {
                            grupos: {page: 1, next: true, lastUpdate: null, idEnd: null},
                            jugadores: {page: 1, next: true, lastUpdate: null, idEnd: null},
                            jugador: {},
                            grupo: {}
                        },
                        jugados: {
                            grupos: {page: 1, next: true, lastUpdate: null, idEnd: null},
                            jugadores: {page: 1, next: true, lastUpdate: null, idEnd: null},
                            jugador: {},
                            grupo: {}
                        }
                    },
                    data: [],
                    dataJugados: [],
                },
                setModel: function (partido) {
                    this.select = partido;
                },
                getModel: function () {
                    return this.select;
                },
                getList: function () {
                    return this.model;
                },
                getPartidoId : function(idPartido){
                    var self = this;
                    $http.get(api + 'partidos/obtener_partido/' + idPartido, {}).then(function(response){
                        self.model.data.union([response.data], null, true);
                    });
                },
                updateListPartidos: function (tab, idJugador, type, idType) {
                    var self = this;
                    var paginate = null;
                    var succesCallbackTPC = function (response) {
                        self.model.data.union(response.data.list, null, true);
                        paginate.lastUpdate = response.data.lastUpdate;
                    };
                    switch (tab) {
                        case 'Todos':
                            paginate = idType === null ? self.model.paginate.todos[type] : self.model.paginate.todos[type][idType];
                            if (paginate.lastUpdate !== null) {
                                $http.get(api + 'partidos/list_todos', {params: {type: 'refresh', filter: type, idFilter: idType, jugador: idJugador, lastUpdate: paginate.lastUpdate, idEnd: paginate.idEnd}}).then(succesCallbackTPC);

                                if (paginate.next !== undefined && !paginate.next) {
                                    $http.get(api + 'partidos/list_todos', {params: {type: 'news', filter: type, idFilter: idType, jugador: idJugador, lastUpdate: paginate.lastUpdate, idEnd: paginate.idEnd}}).then(succesCallbackTPC);
                                }
                            }
                            break;
                        case 'Personales':
                            paginate = idType === null ? self.model.paginate.personales[type] : self.model.paginate.personales[type][idType];
                            if (paginate.lastUpdate !== null) {
                                $http.get(api + 'partidos/list_personales', {params: {type: 'refresh', filter: type, idFilter: idType, jugador: idJugador, lastUpdate: paginate.lastUpdate, idEnd: paginate.idEnd}}).then(succesCallbackTPC);

                                if (paginate.next !== undefined && !paginate.next) {
                                    $http.get(api + 'partidos/list_personales', {params: {type: 'news', filter: type, idFilter: idType, jugador: idJugador, lastUpdate: paginate.lastUpdate, idEnd: paginate.idEnd}}).then(succesCallbackTPC);
                                }
                            }
                            break;
                        case 'Confirmados':
                            paginate = idType === null ? self.model.paginate.confirmados[type] : self.model.paginate.confirmados[type][idType];
                            if (paginate.lastUpdate !== null) {
                                $http.get(api + 'partidos/list_confirmados', {params: {type: 'refresh', filter: type, idFilter: idType, jugador: idJugador, lastUpdate: paginate.lastUpdate, idEnd: paginate.idEnd}}).then(succesCallbackTPC);

                                if (paginate.next !== undefined && !paginate.next) {
                                    $http.get(api + 'partidos/list_confirmados', {params: {type: 'news', filter: type, idFilter: idType, jugador: idJugador, lastUpdate: paginate.lastUpdate, idEnd: paginate.idEnd}}).then(succesCallbackTPC);
                                }
                            }
                            break;
                        case 'Jugados':
                            paginate = idType === null ? self.model.paginate.confirmados[type] : self.model.paginate.jugados[type][idType];
                            if (paginate.lastUpdate !== null) {
                                $http.get(api + 'partidos/list_jugados', {params: {type: 'refresh', filter: type, idFilter: idType, jugador: idJugador, lastUpdate: paginate.lastUpdate, idEnd: paginate.idEnd}}).then(function (response) {
                                    self.model.dataJugados.union(response.data.list);
                                    paginate.lastUpdate = response.data.lastUpdate;
                                });

                                if (paginate.next !== undefined && !paginate.next) {
                                    $http.get(api + 'partidos/list_jugados', {params: {type: 'news', filter: type, idFilter: idType, jugador: idJugador, lastUpdate: paginate.lastUpdate, idEnd: paginate.idEnd}}).then(function (response) {
                                        self.model.dataJugados.union(response.data.list);
                                        paginate.lastUpdate = response.data.lastUpdate;
                                    });
                                }
                            }
                            break;
                    }
                },
                cancelHttpT: $q.defer(),
                cancelHttpP: $q.defer(),
                cancelHttpC: $q.defer(),
                cancelHttpJ: $q.defer(),
                getPartidosT: function (idJugador, type, idType) {
                    var self = this;
                    this.cancelHttpT.resolve([]);
                    this.cancelHttpT = $q.defer();

                    var paginate = idType === null ? self.model.paginate.todos[type] : self.model.paginate.todos[type][idType];
                    return $http.get(api + 'partidos/list_todos', {timeout: this.cancelHttpT.promise, params: {jugador: idJugador, filter: type, idFilter: idType, page: paginate.page, limit: self.model.paginate.limit}}).then(function (response) {
                        self.model.data.union(response.data.list);

                        if (paginate.lastUpdate === null) {
                            paginate.lastUpdate = response.data.lastUpdate;
                        }
                        paginate.idEnd = response.data.idEnd;
                        paginate.page++;
                        paginate.next = response.data.next;

                        return {next: paginate.next};

                    });
                },
                getPartidosP: function (idJugador, type, idType) {
                    var self = this;
                    this.cancelHttpP.resolve([]);
                    this.cancelHttpP = $q.defer();

                    var paginate = idType === null ? self.model.paginate.personales[type] : self.model.paginate.personales[type][idType];
                    return $http.get(api + 'partidos/list_personales', {timeout: this.cancelHttpP.promise, params: {jugador: idJugador, filter: type, idFilter: idType, page: paginate.page, limit: self.model.paginate.limit}}).then(function (response) {
                        self.model.data.union(response.data.list);

                        if (paginate.lastUpdate === null) {
                            paginate.lastUpdate = response.data.lastUpdate;
                        }
                        paginate.idEnd = response.data.idEnd;
                        paginate.page++;
                        paginate.next = response.data.next;

                        return {next: paginate.next};
                    });
                },
                getPartidosC: function (idJugador, type, idType) {
                    var self = this;
                    this.cancelHttpC.resolve([]);
                    this.cancelHttpC = $q.defer();

                    var paginate = idType === null ? self.model.paginate.confirmados[type] : self.model.paginate.confirmados[type][idType];
                    return $http.get(api + 'partidos/list_confirmados', {timeout: this.cancelHttpC.promise, params: {jugador: idJugador, filter: type, idFilter: idType, page: paginate.page, limit: self.model.paginate.limit}}).then(function (response) {
                        self.model.data.union(response.data.list);

                        if (paginate.lastUpdate === null) {
                            paginate.lastUpdate = response.data.lastUpdate;
                        }
                        paginate.idEnd = response.data.idEnd;
                        paginate.page++;
                        paginate.next = response.data.next;

                        return {next: paginate.next};
                    });
                },
                getPartidosJ: function (idJugador, type, idType) {
                    var self = this;
                    this.cancelHttpJ.resolve([]);
                    this.cancelHttpJ = $q.defer();

                    var paginate = idType === null ? self.model.paginate.jugados[type] : self.model.paginate.jugados[type][idType];
                    return $http.get(api + 'partidos/list_jugados', {timeout: this.cancelHttpJ.promise, params: {jugador: idJugador, filter: type, idFilter: idType, page: paginate.page, limit: self.model.paginate.limit}}).then(function (response) {
                        self.model.dataJugados.union(response.data.list);

                        if (paginate.lastUpdate === null) {
                            paginate.lastUpdate = response.data.lastUpdate;
                        }
                        paginate.idEnd = response.data.idEnd;
                        paginate.page++;
                        paginate.next = response.data.next;

                        return {next: paginate.next};
                    });
                },
                confirmPartido: function (idPartido, idJugador, action) {
                    $ionicLoading.show();
                    return $http.get(api + 'partidos/confirm_partido/' + idPartido + '/' + idJugador, {params: {action: action}}).then(function (response) {
                        $ionicLoading.hide();
                        
                        return response.data;
                    });
                },
                entrarPartido: function (idPartido, idJugador, jugadores) {
                    $ionicLoading.show();
                    return $http.get(api + 'partidos/entrar_partido/' + idPartido + '/' + idJugador, {params: {'jugadores[]': jugadores}}).then(function (response) {
                        $ionicLoading.hide();
                        
                        return response.data;
                    });
                },
                añadirPartido: function (idPartido, idJugador, idInvitador) {
                    $ionicLoading.show();
                    return $http.get(api + 'partidos/anadir_partido/' + idPartido + '/' + idInvitador + '/' + idJugador, {params: {}}).then(function (response) {
                        $ionicLoading.hide();
                        
                        return response.data;
                    });
                },
                newPartido: function (model) {
                    var self = this;
                    var newModel = {
                        grupo: model.grupo,
                        club: model.club.id,
                        tipo: model.tipo,
                        fechaI: moment(model.fecha).format('YYYY-MM-DD') + ' ' + moment(model.horaI).format('H:mm:ss'),
                        fechaF: moment(model.fecha).format('YYYY-MM-DD') + ' ' + moment(model.horaF).format('H:mm:ss'),
                        reservada: model.reservada,
                        jugadores: []
                    };
                    if (model.jugador1)
                        newModel.jugadores.push(model.jugador1.id);
                    if (model.jugador2)
                        newModel.jugadores.push(model.jugador2.id);
                    if (model.jugador3)
                        newModel.jugadores.push(model.jugador3.id);
                    if (model.jugador4)
                        newModel.jugadores.push(model.jugador4.id);

                    $ionicLoading.show();
                    return $http.post(api + 'partidos/new', newModel).then(function (response) {
                        self.model.data.unshift(response.data);
                        $ionicLoading.hide();

                        return response.data;
                    }, function () {
                        $ionicLoading.hide();

                        $cordovaDialogs.alert('Error al crear partido', 'Informacion', 'Aceptar');
                        return null;
                    });
                }
            };
        });
