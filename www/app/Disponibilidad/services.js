/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya
        .factory('disponibilidadService', function ($q, $http, $localstorage) {

            var disponibilidad = {
                model: {
                    data: [],
                    lastUpdate: null
                },
                init: function () {
                    if ($localstorage.exist('disponibilidad')) {
                        var tmp = $localstorage.getObject('disponibilidad');
                        this.model.data = tmp.data;
                        this.model.lastUpdate = tmp.lastUpdate;
                    }else{
                        this.model.data = [];
                        this.model.lastUpdate = null;
                    }
                },
                getList: function () {
                    return this.model;
                },
                saveStorage: function () {
                    $localstorage.setObject('disponibilidad', this.model);
                },
                listByJugador: function (idJugador) {
                    return $http.get(api + 'disponibilidad/list/' + idJugador,{cache: true}).then(function (response) {
                        return response.data.list;
                    }, function () {
                    });
                },
                load: function () {
                    var self = this;
                    return $http.get(api + 'disponibilidad/list/' + $localstorage.getObject('user').id, {params: {lastUpdate : self.model.lastUpdate}}).then(function (response) {
                        self.model.data.union(response.data.list,function(model){//function condicion para eliminar item
                            return model.activo === null;
                        });
                        self.model.lastUpdate = response.data.lastUpdate;
                        self.saveStorage();
                    }, function () {
                    });
                },
                newDisponibilidad: function (model) {
                    var deferred = $q.defer();
                    var newDisp = angular.copy(model);
                    newDisp.fechaI = moment(model.fecha).format('YYYY-MM-DD') + ' ' + moment(model.fechai).format('H:mm:ss');
                    newDisp.fechaF = moment(model.fecha).format('YYYY-MM-DD') + ' ' + moment(model.fechaf).format('H:mm:ss');
                    $http.post(api + 'disponibilidad/new/' + $localstorage.getObject('user').id, newDisp).then(function (response) {
                        var lista = $localstorage.getObject('disponibilidad');
                        lista.data.push(response.data);
                        $localstorage.setObject('disponibilidad', lista);
                        deferred.resolve(response.data);
                    });
                    return deferred.promise;
                },
                updateDisponibilidad: function (model) {
                    var self = this;
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
            disponibilidad.init();
            return disponibilidad;
        })
        ;
