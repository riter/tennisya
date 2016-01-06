/**
 * Created by Riter on 25/08/15.
 */
/*
 */
appTennisya
        .factory('$localstorage', ['$window', function ($window) {
                return {
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
                        $window.localStorage.clear();
                    },
                    exist: function (key) {
                        return $window.localStorage[key] ? true : false;
                    }
                };
            }])
        .factory('userService', function ($q, $http, $localstorage, $cordovaFileTransfer) {
            var user = null;

            return {
                page: 1,
                limit: 30,
                resetPage: function () {
                    this.page = 1;
                },
                loginJugador: function (data) {
                    var deferred = $q.defer();
                    $http.post(api + 'jugador/login', data).then(function (response) {
                        $localstorage.setObject('user', response.data);
                        deferred.resolve();
                    }, function (e) {
                        deferred.reject(e.data);
                    });
                    return deferred.promise;

                },
                facebookJugador: function (data, callback, error) {
                    var deferred = $q.defer();
                    $http.post(api + 'jugador/login_social', data).then(function (response) {
                        $localstorage.setObject('user', response.data);
                        deferred.resolve();
                    }, function (e) {
                        deferred.reject(e);
                    });
                    return deferred.promise;
                },
                saveJugador: function (model) {
                    var data = angular.copy(model);
                    var deferred = $q.defer();

                    if (typeof (data.clubCancha) === 'object')
                        data.clubCancha = data.clubCancha.id;

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
                                    user = JSON.parse(result.response);
                                    $localstorage.setObject('user', user);

                                    deferred.resolve(user);
                                }, function (err) {
                                    deferred.reject(err);
                                }, function (progress) {
                                    // constant progress updates
                                });
                    } else {
                        $http.post(api + 'jugador/save', data).then(function (response) {
                            user = response.data;
                            $localstorage.setObject('user', user);
                            deferred.resolve(user);
                        }, function (err) {
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
                                    user = JSON.parse(result.response);
                                    $localstorage.setObject('user', user);

                                    deferred.resolve(user);
                                }, function (err) {
                                    deferred.reject(err);
                                }, function (progress) {
                                    // constant progress updates
                                });
                    } else {
                        $http.post(api + 'jugador/update/' + data.id, data).then(function (response) {
                            user = response.data;
                            $localstorage.setObject('user', user);
                            deferred.resolve(user);
                        }, function (err) {
                            deferred.reject(err);
                        });
                    }
                    return deferred.promise;
                },
                listJugador: function () {
                    var self = this;
                    return $http.get(api + 'jugador/list', {params: {page: self.page, limit: self.limit}}).then(function (response) {
                        self.page++;
                        return response.data;
                    }, function (e) {
                        return [];
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
    return {
        getClub: function () {
            var deferred = $q.defer();
            if ($localstorage.exist('clubs')) {
                deferred.resolve($localstorage.getObject('clubs'));
                return deferred.promise;
            } else
                return this.loadClubs();
        },
        loadClubs: function () {
            return $http.get(api + 'club/list').then(function (response) {
                $localstorage.setObject('clubs', response.data);
                return response.data;
            });
        }
    };
});
appTennisya.factory('cameraAction', function ($cordovaActionSheet, $cordovaCamera) {

    var cameraAction = {
        callback: null,
        options: {
            buttonLabels: ['Hacer foto', 'Seleccionar foto'],
            //addDestructiveButtonWithLabel : 'Eliminar foto',
            addCancelButtonWithLabel: 'Cancelar',
            androidEnableCancelButton: true
        },
        showAction: function (callback) {
            this.callback = callback;

            var self = this;
            $cordovaActionSheet.show(this.options)
                    .then(function (btnIndex) {
                        switch (btnIndex) {
                            case 1:
                                self.getPhoto();
                                break;
                            case 2:
                                self.selectPhoto();
                                break;
                            case 3:
                                break;
                        }
                    });
        },
        getPhoto: function () {
            var options = {
                quality: 50,
                allowEdit: true,
                targetWidth: 300,
                targetHeight: 300,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA
            };
            this.openCamera(options);
            $cordovaCamera.cleanup();
        },
        selectPhoto: function () {
            var options = {
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                allowEdit: true,
                targetWidth: 300,
                targetHeight: 300,
                encodingType: Camera.EncodingType.JPEG
            };
            this.openCamera(options);
        },
        openCamera: function (options) {
            var self = this;
            $cordovaCamera.getPicture(options).then(function (imageURI) {
                if (typeof (self.callback) === 'function')
                    self.callback(imageURI);
            }, function (err) {
                //alert(JSON.stringify(err));
            });
        }
    };
    return cameraAction;
});