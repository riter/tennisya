/**
 * Created by Riter on 25/08/15.
 */
/*
 */
appTennisya
        .factory('$localstorage', ['$window', '$cacheFactory', function ($window, $cacheFactory) {
                return {
                    keys: [],
                    cache: $cacheFactory('cacheTennis'),
                    setCacheObject: function (key, value) {
                        if (angular.isUndefined(this.cache.get(key))) {
                            this.keys.push(key);
                        }
                        this.cache.put(key, angular.isUndefined(value) ? null : JSON.stringify(value));
                    },
                    getCacheObject: function (key) {
                        return JSON.parse(this.cache.get(key) || '{}');
                    },
                    caehExist: function (key) {
                        return !angular.isUndefined(this.cache.get(key));
                    },
                    set: function (key, value) {
                        $window.localStorage[key] = value;
                    },
                    get: function (key, defaultValue) {
                        return $window.localStorage[key] || defaultValue;
                    },
                    setObject: function (key, value) {
                        $window.localStorage[key] = JSON.stringify(value);
                    },
                    getObject: function (key) {
                        return JSON.parse($window.localStorage[key] || '{}');
                    },
                    clear: function () {
                        var clubs = this.getObject('clubs');
                        $window.localStorage.clear();
                        this.setObject('clubs', clubs);
                    },
                    exist: function (key) {
                        return $window.localStorage[key] ? true : false;
                    },
                    remove: function (key) {
                        $window.localStorage.removeItem(key);
                    }
                };
            }])
        .factory('userService', function ($q, $http, $localstorage, $cordovaFileTransfer, $ionicLoading) {
            var user = null;

            return {
                model: {
                    data: [],
                    page: 1,
                    limit: 15,
                    lastUpdate: null,
                    idEnd: null
                },
                getList: function () {
                    return this.model;
                },
                lostPassword: function (data) {
                    $ionicLoading.show();

                    var deferred = $q.defer();
                    $http.get(api + 'jugador/lostpassword', {params: data}).then(function (response) {
                        $ionicLoading.hide();

                        deferred.resolve(response.data);
                    }, function (e) {
                        $ionicLoading.hide();

                        deferred.reject(e.data);
                    });
                    return deferred.promise;

                },
                loginJugador: function (data) {
                    $ionicLoading.show();

                    var deferred = $q.defer();
                    $http.post(api + 'jugador/login', data).then(function (response) {
                        $ionicLoading.hide();
                        $localstorage.setObject('user', response.data);
                        deferred.resolve();
                    }, function (e) {
                        $ionicLoading.hide();
                        deferred.reject(e.data);
                    });
                    return deferred.promise;

                },
                facebookJugador: function (data) {
                    $ionicLoading.show();

                    var deferred = $q.defer();
                    $http.post(api + 'jugador/login_social', data).then(function (response) {
                        $ionicLoading.hide();

                        $localstorage.setObject('user', response.data);
                        deferred.resolve();
                    }, function (e) {
                        $ionicLoading.hide();

                        deferred.reject(e);
                    });
                    return deferred.promise;
                },
                saveJugador: function (model) {
                    var data = angular.copy(model);
                    var deferred = $q.defer();

                    if (typeof (data.clubCancha) === 'object')
                        data.clubCancha = data.clubCancha.id;

                    $ionicLoading.show();
                    if (data.photo) {
                        var option = {
                            fileKey: 'files',
                            fileName: 'image.jpg',
                            mimeType: "image/png",
                            chunkedMode: false,
                            params: data
                        };
                        $cordovaFileTransfer.upload(api + 'jugador/save', data.photo, option)
                                .then(function (result) {
                                    $ionicLoading.hide();

                                    user = JSON.parse(result.response);
                                    $localstorage.setObject('user', user);

                                    deferred.resolve(user);
                                }, function (err) {
                                    $ionicLoading.hide();

                                    deferred.reject(err);
                                });
                    } else {
                        $http.post(api + 'jugador/save', data).then(function (response) {
                            $ionicLoading.hide();

                            user = response.data;
                            $localstorage.setObject('user', user);
                            deferred.resolve(user);
                        }, function (err) {
                            $ionicLoading.hide();

                            deferred.reject(err);
                        });
                    }
                    return deferred.promise;
                },
                updateJugador: function (model) {
                    var data = angular.copy(model);
                    var deferred = $q.defer();

                    if (typeof (data.clubCancha) === 'object')
                        data.clubCancha = data.clubCancha.id;

                    $ionicLoading.show();
                    if (data.photo && data.photo.indexOf('http') < 0) {
                        var option = {
                            fileKey: 'files',
                            fileName: 'image.jpg',
                            mimeType: "image/png",
                            chunkedMode: false,
                            params: data
                        };
                        $cordovaFileTransfer.upload(api + 'jugador/update/' + data.id, data.photo, option)
                                .then(function (result) {
                                    $ionicLoading.hide();

                                    user = JSON.parse(result.response);
                                    $localstorage.setObject('user', user);

                                    deferred.resolve(user);
                                }, function (err) {
                                    $ionicLoading.hide();

                                    deferred.reject(err);
                                });
                    } else {
                        $http.post(api + 'jugador/update/' + data.id, data).then(function (response) {
                            $ionicLoading.hide();

                            user = response.data;
                            $localstorage.setObject('user', user);
                            deferred.resolve(user);
                        }, function (err) {
                            $ionicLoading.hide();

                            deferred.reject(err);
                        });
                    }
                    return deferred.promise;
                },
                updateListJugador: function () {
                    var user = $localstorage.getObject('user');
                    var self = this;
                    $http.get(api + 'jugador/list', {params: {type: 'refresh', jugador: user.id, lastUpdate: self.model.lastUpdate, idEnd: self.model.idEnd}}).then(function (response) {
                        self.model.data.union(response.data.list);
                        self.model.lastUpdate = response.data.lastUpdate;
                    });
                    if (self.model.next !== undefined && !self.model.next) {
                        $http.get(api + 'jugador/list', {params: {type: 'news', jugador: user.id, lastUpdate: self.model.lastUpdate, idEnd: self.model.idEnd}}).then(function (response) {
                            self.model.data.union(response.data.list, null, true);
                            self.model.lastUpdate = response.data.lastUpdate;
                        });
                    }
                },
                listJugador: function () {
                    var user = $localstorage.getObject('user');
                    var self = this;
                    return $http.get(api + 'jugador/list', {params: {jugador: user.id, page: self.model.page, limit: self.model.limit}}).then(function (response) {
                        self.model.data.union(response.data.list);

                        if (self.model.page === 1) {
                            $localstorage.setObject('jugadores', self.model);
                            self.model.lastUpdate = response.data.lastUpdate;
                        }
                        self.model.idEnd = response.data.idEnd;
                        self.model.page++;
                        self.model.next = response.data.next;
                        return {next: self.model.next};
                    }, function (e) {
                        if (self.model.page === 1 && $localstorage.exist('jugadores')) {
                            var tmpPlayers = $localstorage.getObject('jugadores');
                            self.model.data = tmpPlayers.data;
                            self.model.page = tmpPlayers.page;
                            self.model.limit = tmpPlayers.limit;
                            self.model.lastUpdate = tmpPlayers.lastUpdate;
                            self.model.idEnd = tmpPlayers.idEnd;
                        }
                        return {next: true};
                    });
                },
                setJugador: function (jugador) {
                    user = jugador;
                },
                getJugador: function () {
                    return user;
                }
            };
        })
        .factory('searchJugador', function ($http, $q) {
            var SearchClass = {
                data: {},
                cancelHttp: $q.defer(),
                selected: null,
                setSelected: function (item) {
                    this.selected = angular.copy(item);
                },
                getSelected: function () {
                    return this.selected;
                },
                getJugadores: function () {
                    return this.data;
                },
                setJugadores: function (list) {
                    var self = this;
                    angular.forEach(list, function (value, key) {
                        self.data[value.id] = value;
                    });
                },
                searchJugador: function (query, ids) {
                    var self = this;
                    self.cancelHttp.resolve(self.data);
                    self.cancelHttp = $q.defer();
                    return $http.get(api + 'jugador/search', {timeout: self.cancelHttp.promise, cache: true, params: {query: query, 'ids[]': ids}}).then(function (response) {
                        self.setJugadores(response.data);
                        return angular.copy(self.data);
                    }, function () {
                        return angular.copy(self.data);
                    });
                }
            };
            return SearchClass;
        })
        ;

appTennisya.factory('extrasService', function ($q, $http, $localstorage) {
    var configuracion = {
        getPais: function () {
            return ['Uruguay', 'Argentina', 'Brazil'];
        },
        getCiudad: function () {
            return ['Montevideo', 'Maldonado', 'Rivera', 'Minas'];
        },
        getLocalidad: function () {
            return ['Carrasco', 'Canelones', 'Cerros Azules', 'Arenas de José Ignacio'];
        },
        getClubs: function () {
            var res = {list: []};
            if ($localstorage.exist('clubs')) {
                res.list = $localstorage.getObject('clubs').list;
            }
            $http.get(api + 'club/list', {cache: true}).then(function (response) {
                res.list = response.data;
                $localstorage.setObject('clubs', res);
            });
            return res;
        }
    };
    return configuracion;
});

appTennisya.factory('filesystemService', function ($q, $cordovaFileTransfer, $cordovaFile) {
    var downloaded = {
        removeFile: function (url) {
            var deferred = $q.defer();

            var filename = url.hashCode() + '.' + url.split('.').pop();
            $cordovaFile.removeFile(cordova.file.externalDataDirectory, filename)
                    .then(function (success) {
                        deferred.resolve(success.name);
                    }, function (e) {
                        deferred.reject(e);
                    });
            return deferred.promise;
        },
        download: function (url) {
            var deferred = $q.defer();
            try {
                var directory = (ionic.Platform.isIOS() ? cordova.file.dataDirectory : cordova.file.externalDataDirectory) + 'tennisya/profiles/';
                var filename = url.hashCode() + '.' + url.split('.').pop();

                var trustHosts = true;
                var options = {};

                $cordovaFile.checkFile(directory, filename)
                        .then(function (fileSystem) {
                            deferred.resolve(fileSystem.nativeURL);
                        }, function () {
                            var targetPath = directory + filename;
                            $cordovaFileTransfer.download(decodeURI(url), targetPath, options, trustHosts).then(function (fileSystem) {
                                deferred.resolve(fileSystem.nativeURL);
                            }, function (e) {
                                deferred.resolve(null);
                            });
                        });
            } catch (e) {
                deferred.resolve(null);
            }
            return deferred.promise;
        }
    };
    return downloaded;
});