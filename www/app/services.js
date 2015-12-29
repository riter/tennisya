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
                resetPage: function(){
                  this.page = 1;
                },
                loginJugador: function (data, callback, error) {
                    $http.post(api + 'jugador/login', data).then(function (response) {
                        $localstorage.setObject('user', response.data);
                        return callback();
                    }, function (e) {
                        return error(e.data);
                    });

                },
                facebookJugador: function (data, callback, error) {
                    $http.post(api + 'jugador/login_social', data).then(function (response) {
                        $localstorage.setObject('user', response.data);
                        return callback();
                    }, function (e) {
                        return error(e.data);
                    });

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
            }
        })
        .factory('partidoService', function ($http) {

            return {
                getPartidosT: function (idJugador, idGrupo) {
                    return $http.get(api + 'partidos/list_todos', {params: {idJugador: idJugador, idGrupo: idGrupo}}).then(function (response) {
                        return response.data;
                    });
                },
                getPartidosP: function (idJugador, idGrupo) {
                    return $http.get(api + 'partidos/list_personales', {params: {idJugador: idJugador, idGrupo: idGrupo}}).then(function (response) {
                        return response.data;
                    });
                },
                getPartidosC: function (idJugador, idGrupo) {
                    return $http.get(api + 'partidos/list_confirmados', {params: {idJugador: idJugador, idGrupo: idGrupo}}).then(function (response) {
                        return response.data;
                    });
                },
                getPartidosJ: function (idJugador, idGrupo) {
                    return $http.get(api + 'partidos/list_jugados', {params: {idJugador: idJugador, idGrupo: idGrupo}}).then(function (response) {
                        return response.data;
                    });
                },
                confirmPartido: function (jugador_partido, action) {
                    return $http.get(api + 'partidos/confirm_partido/' + jugador_partido, {params: {action: action}}).then(function (response) {
                        return response.data;
                    });
                },
                entrarPartido: function (idPartido, idJugador, action) {
                    return $http.get(api + 'partidos/entrar_partido/' + idPartido + '/' + idJugador, {params: {action: action}}).then(function (response) {
                        return response.data;
                    });
                },
                newPartido: function (model) {
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

                    return $http.post(api + 'partidos/new', newModel);
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
        .factory('grupoService', function ($q, $localstorage, $http, $cordovaFileTransfer) {
            var data = {
                id: null,
                title: '',
                image: null,
                pais: '',
                ciudad: '',
                jugadorgrupo: []

            };
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
                        return response.data;
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
                save: function (idAdmin) {
                    var deferred = $q.defer();
                    var param = {
                        title: data.title,
                        jugadorgrupo: []
                    };
                    angular.forEach(data.jugadorgrupo, function (value, key) {
                        param.jugadorgrupo.push({id: value.id});
                    });

                    if (data.image === null) {
                        $http.post(api + 'group/save/' + idAdmin, param).then(function (response) {
//                        data = response.data;
//                        data.jugadorgrupo = [];
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
                        $cordovaFileTransfer.upload(api + 'group/save/' + idAdmin, data.image, option)
                                .then(function (result) {
//                            data = JSON.parse(result.response);
//                            data.jugadorgrupo = [];
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
                updateTitle: function (id) {
                    return $http.post(api + 'group/update/' + id, {campo: 'title', title: data.title});
                },
                updateImage: function (id) {
                    var deferred = $q.defer();

                    var option = {
                        fileKey: 'files',
                        fileName: 'image.jpg',
                        mimeType: "image/png",
                        chunkedMode: false,
                        params: {campo: 'image'}
                    };
                    $cordovaFileTransfer.upload(api + 'group/update/' + id, data.image, option)
                            .then(function (result) {
                                deferred.resolve(JSON.parse(result.response));
                                //return callback({data: JSON.parse(result.response)});
                            }, function (err) {
                                deferred.reject(err);
                                //return error(err);
                            }, function (progress) {
                                // constant progress updates
                            });

                    return deferred.promise;
                },
                getJugadores: function (id) {
                    return $http.get(api + 'group/list_jugadores/' + id).then(function (response) {
                        data = response.data;
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
                alert(JSON.stringify(err));
            });
        }
    };
    return cameraAction;
});

appTennisya.directive('divContent', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var twoElements = element[0].children;
            element[0].style.position = 'relative';
            element[0].style.height = '100%';
            var hT = twoElements[0].clientHeight - 2;
            twoElements[1].style.height = 'calc(100% - ' + hT + 'px)';

        }
    };
});

//appTennisya.directive('autoFocus', function($timeout) {
//    return {
//        link: function(scope, element, attrs) {
//            $timeout(function() {
//                element[0].focus();
//            }, 150);
//        }
//    };
//});
appTennisya
        .directive('ionSearch', function ($timeout) {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    getData: '&source',
                    model: '=?',
                    search: '=?filter',
                    changeFocus: '&focus'
                },
                link: function (scope, element, attrs) {
                    attrs.minLength = attrs.minLength || 0;
                    scope.placeholder = attrs.placeholder || '';
                    scope.search = {value: ''};
                    var inputElement = element.find('input')[0];

                    if (attrs.class)
                        element.addClass(attrs.class);

                    if (attrs.source) {
                        scope.$watch('search.value', function (newValue, oldValue) {
                            scope.search.value = newValue;
                            if (newValue.length > attrs.minLength) {
                                scope.getData({str: newValue}).then(function (results) {
                                    scope.model = results;
                                });
                            } else {
                                //scope.model = [];
                            }
                        });
                    }

                    if (attrs.focus) {
                        $timeout(function () {
                            inputElement.focus();
                        }, 300);
                    }

                    scope.clearSearch = function () {
                        // Manually trigger blur
                        inputElement.blur();
                        scope.search.value = '';
                    };

                    angular.element(inputElement).bind('focus', function () {
                        scope.changeFocus({value: true});
                        // We need to call `$digest()` because we manually changed the model
                        scope.$digest();
                    });
                    // When the user leaves the search bar
                    angular.element(inputElement).bind('blur', function () {
                        scope.changeFocus({value: false});
                        scope.$digest();
                    });
                },
                template: '<div class="item-input-wrapper">' +
                        '<i class="icon ion-search placeholder-icon"></i>' +
                        '<input type="search" placeholder="{{placeholder}}" ng-model="search.value">' +
                        '<i ng-if="search.value.length > 0" ng-click="clearSearch()" class="icon ion-close"></i>' +
                        '</div>'
            };
        });

appTennisya
        .directive('searchBar', [function () {
                return {
                    scope: {
                        ngModel: '='
                    },
                    require: ['^ionNavBar', '?ngModel'],
                    restrict: 'E',
                    replace: true,
                    template: '<ion-nav-buttons side="right">' +
                            '<div class="searchBar numicons2">' +
                            '<div class="searchTxt" ng-show="true">' +
                            '<div class="bgdiv"></div>' +
                            '<div class="bgtxt">' +
                            '<input type="text" placeholder="Procurar..." ng-model="ngModel.txt">' +
                            '</div>' +
                            '</div>' +
                            '<i class="icon placeholder-icon" ng-click="ngModel.txt=\'\';ngModel.show=!ngModel.show"></i>' +
                            '</div>' +
                            '</ion-nav-buttons>',
                    compile: function (element, attrs) {
                        var icon = (ionic.Platform.isAndroid() && 'ion-android-search')
                                || (ionic.Platform.isIOS() && 'ion-ios7-search')
                                || 'ion-search';
                        angular.element(element[0].querySelector('.icon')).addClass(icon);

                        return function ($scope, $element, $attrs, ctrls) {
                            var navBarCtrl = ctrls[0];
                            $scope.navElement = $attrs.side === 'right' ? navBarCtrl.rightButtonsElement : navBarCtrl.leftButtonsElement;

                        };
                    },
                    controller: ['$scope', '$ionicNavBarDelegate', function ($scope, $ionicNavBarDelegate) {
                            var title, definedClass;

                            $scope.$watch('ngModel.show', function (showing, oldVal, scope) {
                                if (showing !== oldVal) {
                                    if (showing) {
                                        if (!definedClass) {
                                            var numicons = $scope.navElement.children().length;
                                            angular.element($scope.navElement[0].querySelector('.searchBar')).addClass('numicons' + numicons);
                                        }

                                        title = $ionicNavBarDelegate.getTitle();
                                        $ionicNavBarDelegate.setTitle('');
                                    } else {
                                        $ionicNavBarDelegate.setTitle(title);
                                    }
                                } else if (!title) {
                                    title = $ionicNavBarDelegate.getTitle();
                                }
                            });
                        }]
                };
            }]);