/**
 * Created by Riter on 25/08/15.
 */
/*
 */
appTennisya
        .factory('grupoService', function ($q, $localstorage, $http, $cordovaFileTransfer) {
            var data = {
                id: null,
                title: '',
                image: null,
                pais: '',
                ciudad: '',
                jugadorgrupo: []

            };
            var gcancelHttp = $q.defer();
            var listGrupos = [];
            return {
                getList: function () {
                    var deferred = $q.defer();
                    deferred.resolve(listGrupos);
                    return deferred.promise;
                },
                list: function () {
                    var user = $localstorage.getObject('user');
                    return $http.get(api + 'group/jugadores/' + user.id).then(function (response) {
                        listGrupos = response.data;
                        $localstorage.setObject('grupos', response.data);
                        return response.data;
                    },function(){
                        return $localstorage.getObject('grupos');
                    });
                },
                setModel: function (model) {
                    if (typeof (model.jugadorgrupo) === 'undefined')
                        model.jugadorgrupo = [];
                    data = model;
                },
                getModel: function () {
                    return data;
                },
                resetModel: function () {
                    this.setModel({
                        id: null,
                        title: '',
                        image: null,
                        pais: '',
                        ciudad: '',
                        jugadorgrupo: []

                    });
                },
                setTitle: function (title) {
                    data.title = title;
                },
                setThumb: function (url) {
                    data.image = url;
                },
                setJugadores: function (listJugadores) {
                    data.jugadorgrupo = listJugadores;
                },
                save: function (idAdmin, grupo) {
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
                            deferred.resolve(response.data);
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
                                    deferred.resolve(JSON.parse(result.response));
                                }, function (err) {
                                    deferred.reject(err);
                                }, function (progress) {
                                    // constant progress updates
                                });
                    }

                    return deferred.promise;
                },
                updateJugador: function (id, jugador) {
                    return $http.post(api + 'group/update/' + id, {campo: 'jugador', jugador: jugador.id});
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
                getJugadores: function (id) {
                    gcancelHttp.resolve([]);
                    gcancelHttp = $q.defer();
                    return $http.get(api + 'group/list_jugadores/' + id, {timeout: gcancelHttp.promise}).then(function (response) {
                        angular.merge(data, response.data);
                        return data;
                    });
                },
                deleteJugador: function (id_grupo_jugador) {
                    return $http.get(api + 'group/delete_jugador/' + id_grupo_jugador);
                },
                delete: function (id) {
                    return $http.get(api + 'group/delete/' + id);
                }
            };
        });