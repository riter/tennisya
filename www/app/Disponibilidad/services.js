/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya
        .factory('disponibilidadService', function ($q, $http, $localstorage) {
            var data = [];
            return {
                list: function () {
                    var deferred = $q.defer();
                    if ($localstorage.exist('disponibilidad')) {
                        deferred.resolve($localstorage.getObject('disponibilidad'));
                        return deferred.promise;
                    } else
                        return this.load();
                },
                saveStorage: function (data) {
                    $localstorage.setObject('disponibilidad', data);
                },
                listByJugador: function (idJugador) {
                    var self = this;
                    return $http.get(api + 'disponibilidad/list/' + idJugador).then(function (response) {
                        return response.data;
                    }, function () {
                    });
                },
                load: function () {
                    var self = this;
                    return $http.get(api + 'disponibilidad/list/' + $localstorage.getObject('user').id).then(function (response) {
                        data = response.data;
                        self.saveStorage(data);
                        return data;
                    }, function () {
                        if ($localstorage.exist('disponibilidad'))
                            data = $localstorage.getObject('disponibilidad');
                        return data;
                    });
                },
                newDisponibilidad: function (model) {
                    var deferred = $q.defer();
                    var newDisp = angular.copy(model);
                    newDisp.fechaI = moment(model.fecha).format('YYYY-MM-DD') + ' ' + moment(model.fechai).format('H:mm:ss');
                    newDisp.fechaF = moment(model.fecha).format('YYYY-MM-DD') + ' ' + moment(model.fechaf).format('H:mm:ss');
                    $http.post(api + 'disponibilidad/new/' + $localstorage.getObject('user').id, newDisp).then(function (response) {
                        var lista = $localstorage.getObject('disponibilidad');
                        lista.push(response.data);
                        $localstorage.setObject('disponibilidad', lista);
                        deferred.resolve(response.data);
                    });
                    return deferred.promise;
                },
                updateDisponibilidad: function (model) {
                    var newDisp = angular.copy(model);
                    newDisp.fechaI = moment(model.fecha).format('YYYY-MM-DD') + ' ' + moment(model.fechai).format('H:mm:ss');
                    newDisp.fechaF = moment(model.fecha).format('YYYY-MM-DD') + ' ' + moment(model.fechaf).format('H:mm:ss');
                    if (typeof (model.clubCancha) === 'object')
                        newDisp.clubCancha = model.clubCancha.id;
                    return $http.post(api + 'disponibilidad/update/' + newDisp.id, newDisp);
                },
                deleteDisponibilidad: function (id) {
                    var deferred = $q.defer();
                    $http.get(api + 'disponibilidad/delete/' + id).then(function (response) {
                        deferred.resolve(response.data);
                    });
                    return deferred.promise;
                }
            };
        })
        .factory('extrasService', function ($q, $http, $localstorage) {
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
        })
        ;
