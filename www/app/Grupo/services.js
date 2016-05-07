/**
 * Created by Riter on 25/08/15.
 */
/*
 */
appTennisya
        .factory('grupoService', function ($q, $localstorage, $http, $cordovaFileTransfer, $cordovaDialogs) {
            var gruposSer = {
                cancelHttp: $q.defer(),
                select: null,
                model: {
                    data: [],
                    lastUpdate: null
                },
                reset: function () {
                    this.model.data = [];
                    this.model.lastUpdate = null;
                },
                getListData: function () {
                    var deferred = $q.defer();
                    deferred.resolve(this.model.data);
                    return deferred.promise;
                },
                getList: function () {
                    return this.model;
                },
                list: function () {
                    var self = this;
                    return $http.get(api + 'group/jugadores/' + $localstorage.getObject('user').id, {params: {lastUpdate: self.model.lastUpdate}}).then(function (response) {
                        self.model.data.union(response.data.list, function (model) {//function condicion para eliminar item
                            return model.remove === true;
                        });
                        self.model.lastUpdate = response.data.lastUpdate;
                        $localstorage.setObject('grupos', self.model);
                    }, function () {
                        if ($localstorage.exist('grupos')) {
                            var tmpGrupo = $localstorage.getObject('grupos');
                            self.model.data = tmpGrupo.data;
                            self.model.lastUpdate = tmpGrupo.lastUpdate;
                        }
                    });
                },
                setModel: function (grupo) {
                    if (typeof (grupo.jugadorgrupo) === 'undefined')
                        grupo.jugadorgrupo = [];

                    if (typeof (grupo.lastUpdate) === 'undefined')
                        grupo.lastUpdate = '';

                    this.select = grupo;
                },
                getModel: function () {
                    return this.select;
                },
                getJugadores: function () {
                    var self = this;
                    self.cancelHttp.resolve([]);
                    self.cancelHttp = $q.defer();
                    return $http.get(api + 'group/list_jugadores/' + self.getModel().id, {timeout: self.cancelHttp.promise, params: {lastUpdate: self.getModel().lastUpdate}}).then(function (response) {
                        self.getModel().jugadorgrupo.union(response.data.list, function (model) {
                            return model.remove === true; //function condicion para eliminar item
                        });
                        self.getModel().lastUpdate = response.data.lastUpdate;
                    });
                },
                updateTitle: function (id, title) {
                    return $http.post(api + 'group/update/' + id, {campo: 'title', title: title});
                },
                updateImage: function (id, imageURI) {
                    var deferred = $q.defer();

                    var option = {
                        fileKey: 'files',
                        fileName: 'image.jpg',
                        mimeType: "image/png",
                        chunkedMode: false,
                        params: {campo: 'image'}
                    };
                    $cordovaFileTransfer.upload(api + 'group/update/' + id, imageURI, option)
                            .then(function (result) {
                                deferred.resolve(JSON.parse(result.response));
                            }, function (err) {
                                deferred.reject(err);
                            });

                    return deferred.promise;
                },
                updateJugador: function (id, jugador) {
                    return $http.post(api + 'group/update/' + id, {campo: 'jugador', jugador: jugador.id});
                },
                deleteJugador: function (grupo_jugador) {
                    var self = this;

                    var index = self.getModel().jugadorgrupo.indexOf(grupo_jugador);
                    self.getModel().jugadorgrupo.splice(index, 1);

                    return $http.get(api + 'group/delete_jugador/' + grupo_jugador.id).then(function (response) {

                    }, function () {
                        self.getModel().jugadorgrupo.splice(index, 0, grupo_jugador);
                        $cordovaDialogs.alert('Error al eliminar jugador', 'Informacion', 'Hecho');
                    });
                },
                delete: function (id) {
                    var self = this;

                    var index = self.getList().data.indexOf(self.getModel());
                    self.getList().data.splice(index, 1);

                    return $http.get(api + 'group/delete/' + id + '/' + $localstorage.getObject('user').id).then(function (response) {

                    }, function () {
                        self.getList().data.splice(index, 0, self.getModel());
                        $cordovaDialogs.alert('Error al salir del grupo', 'Informacion', 'Hecho');
                    });
                },
                save: function (idAdmin, grupo) {
                    var self = this;
                    var deferred = $q.defer();
                    var param = {
                        title: grupo.title,
                        pais: grupo.pais, ciudad: grupo.ciudad,
                        jugadorgrupo: []
                    };
                    angular.forEach(grupo.jugadores, function (value, key) {
                        param.jugadorgrupo.push({id: value.id});
                    });

                    if (grupo.image === null) {
                        $http.post(api + 'group/save/' + idAdmin, param).then(function (response) {
                            self.getList().data.push(response.data);
                        }, function (err) {
                            $cordovaDialogs.alert('Error al crear grupo', 'Informacion', 'Hecho');
                        });
                    } else {
                        var option = {
                            fileKey: 'files',
                            fileName: 'image.jpg',
                            mimeType: "image/png",
                            chunkedMode: false,
                            params: param
                        };
                        $cordovaFileTransfer.upload(api + 'group/save/' + idAdmin, grupo.image, option)
                                .then(function (result) {
                                    self.getList().data.push(JSON.parse(result.response));
                                }, function (err) {
                                    $cordovaDialogs.alert('Error al crear grupo', 'Informacion', 'Hecho');
                                }, function (progress) {
                                    // constant progress updates
                                });
                    }

                    return deferred.promise;
                }
            };
            return gruposSer;
        });
//        .factory('grupoService', function ($q, $localstorage, $http, $cordovaFileTransfer) {
//            var data = {
//                id: null,
//                title: '',
//                image: null,
//                pais: '',
//                ciudad: '',
//                jugadorgrupo: []
//
//            };
//            var gcancelHttp = $q.defer();
//            var listGrupos = [];
//            return {
//                getList: function () {
//                    var deferred = $q.defer();
//                    deferred.resolve(listGrupos);
//                    return deferred.promise;
//                },
//                list: function () {
//                    var user = $localstorage.getObject('user');
//                    return $http.get(api + 'group/jugadores/' + user.id).then(function (response) {
//                        listGrupos = response.data;
//                        $localstorage.setObject('grupos', response.data);
//                        return response.data;
//                    }, function () {
//                        return $localstorage.getObject('grupos');
//                    });
//                },
//                setModel: function (model) {
//                    if (typeof (model.jugadorgrupo) === 'undefined')
//                        model.jugadorgrupo = [];
//                    if (typeof (model.lastUpdate) === 'undefined')
//                        model.lastUpdate = '';
//                    
//                    data = model;
//                },
//                getModel: function () {
//                    return data;
//                },
//                setTitle: function (title) {
//                    data.title = title;
//                },
//                setThumb: function (url) {
//                    data.image = url;
//                },
//                setJugadores: function (listJugadores) {
//                    data.jugadorgrupo = listJugadores;
//                },
//                save: function (idAdmin, grupo) {
//                    var deferred = $q.defer();
//                    var param = {
//                        title: grupo.title,
//                        pais: grupo.pais, ciudad: grupo.ciudad,
//                        jugadorgrupo: []
//                    };
//                    angular.forEach(grupo.jugadores, function (value, key) {
//                        param.jugadorgrupo.push({id: value.id});
//                    });
//
//                    if (grupo.image === null) {
//                        $http.post(api + 'group/save/' + idAdmin, param).then(function (response) {
//                            deferred.resolve(response.data);
//                        });
//                    } else {
//                        var option = {
//                            fileKey: 'files',
//                            fileName: 'image.jpg',
//                            mimeType: "image/png",
//                            chunkedMode: false,
//                            params: param
//                        };
//                        $cordovaFileTransfer.upload(api + 'group/save/' + idAdmin, grupo.image, option)
//                                .then(function (result) {
//                                    deferred.resolve(JSON.parse(result.response));
//                                }, function (err) {
//                                    deferred.reject(err);
//                                }, function (progress) {
//                                    // constant progress updates
//                                });
//                    }
//
//                    return deferred.promise;
//                },
//                updateJugador: function (id, jugador) {
//                    return $http.post(api + 'group/update/' + id, {campo: 'jugador', jugador: jugador.id});
//                },
//                updateTitle: function (id, title) {
//                    return $http.post(api + 'group/update/' + id, {campo: 'title', title: title});
//                },
//                updateImage: function (id, imageURI) {
//                    var deferred = $q.defer();
//
//                    var option = {
//                        fileKey: 'files',
//                        fileName: 'image.jpg',
//                        mimeType: "image/png",
//                        chunkedMode: false,
//                        params: {campo: 'image'}
//                    };
//                    $cordovaFileTransfer.upload(api + 'group/update/' + id, imageURI, option)
//                            .then(function (result) {
//                                deferred.resolve(JSON.parse(result.response));
//                            }, function (err) {
//                                deferred.reject(err);
//                            });
//
//                    return deferred.promise;
//                },
//                getJugadores: function (id) {
//                    gcancelHttp.resolve([]);
//                    gcancelHttp = $q.defer();
//                    return $http.get(api + 'group/list_jugadores/' + id, {timeout: gcancelHttp.promise,params: {lastUpdate : data.lastUpdate}}).then(function (response) {
//                        data.jugadorgrupo.union(response.data.list, function (model) {//function condicion para eliminar item
//                            return model.remove === true;
//                        });
//                        data.lastUpdate = response.data.lastUpdate;
//                        return data;
//                    });
//                },
//                deleteJugador: function (id_grupo_jugador) {
//                    return $http.get(api + 'group/delete_jugador/' + id_grupo_jugador);
//                },
//                delete: function (id) {
//                    return $http.get(api + 'group/delete/' + id);
//                }
//            };
//        });