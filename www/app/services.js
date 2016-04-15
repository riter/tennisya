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
        .factory('userService', function ($q, $http, $localstorage, $cordovaFileTransfer) {
            var user = null;

            return {
                page: 1,
                limit: 15,
                resetPage: function () {
                    this.page = 1;
                },
                lostPassword: function (data) {
                    var deferred = $q.defer();
                    $http.get(api + 'jugador/lostpassword', {params: data}).then(function (response) {
                        deferred.resolve(response.data);
                    }, function (e) {
                        deferred.reject(e.data);
                    });
                    return deferred.promise;

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
                facebookJugador: function (data) {
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
                    var user = $localstorage.getObject('user');
                    var self = this;
                    return $http.get(api + 'jugador/list', {params: {jugador: user.id, page: self.page, limit: self.limit}}).then(function (response) {
                        if(self.page === 1)
                            $localstorage.setObject('jugadores', response.data);
                        
                        self.page++;    
                        return response.data;
                    }, function (e) {
                        if(self.page === 1 && $localstorage.getObject('jugadores'))
                            return $localstorage.getObject('jugadores');
                        
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
                targetWidth: 640, //300,
                targetHeight: 640, //300,
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