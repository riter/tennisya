/**
 * Created by Riter on 25/08/15.
 */
/*
 jugadors/login POST
 email: riter.cordova@gmail.com
 password: 123456

 /jugadors/save POST
 name:
 estado:
 email:
 password:
 celular:
 cancha:
 rating:
 type: normal/externo

* */
//angular.module('tennisyaApp.services',[])
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
            }
        };
    }])
    .factory('userService', function($http, $localstorage) {
        var user = null;

        return {
            loginJugador: function(data,callback,error){
                $http.post(api+'jugador/login',data).then(function(response){
                    $localstorage.setObject('user',response.data);
                    return callback();
                },function(e){
                    return error(e.data);
                });

            },
            saveJugador: function(data,callback,error){

                $http.post(api+'jugador/save',data).then(function(response){
                    user = response.data;
                    return callback(user);
                },function(e){
                    return error(e.data);
                });
            },
            listJugador: function(callback,error){

                $http.get(api+'group/jugadores').then(function(response){
                    user = response.data;
                    return callback(user);
                },function(e){
                    return error(e.data);
                });

            },
            getJugador: function(index){
                return user;
            }
        }
    })
    .factory('partidoService', function($http) {

        return {
            getPartidosT: function(){
                return $http.get(api+'partidos/list_abiertos');
            },
            getPartidosP: function(id){
                return $http.get(api+'partidos/list_creados/'+id);
            },
            newPartido: function(model){
                var newModel = {
                    club : model.club.id,
                    tipo : model.tipo.name,
                    fechaI : moment(model.fecha).format('YYYY-MM-DD')+ ' ' +moment(model.horaI).format('H:mm:ss'),
                    fechaF : moment(model.fecha).format('YYYY-MM-DD')+ ' ' +moment(model.horaF).format('H:mm:ss'),
                    reservada:model.reservada,
                    jugadores:[]
                };
                if(model.jugador1)newModel.jugadores.push(model.jugador1.id);
                if(model.jugador2)newModel.jugadores.push(model.jugador2.id);
                if(model.jugador3)newModel.jugadores.push(model.jugador3.id);
                if(model.jugador4)newModel.jugadores.push(model.jugador4.id);

                return $http.post(api+'partidos/new',newModel);
            }
        };
    })
    .factory('disponibilidadService', function($http) {

        return {
            getDisponibilidad: function(id){
                return $http.get(api+'disponibilidad/list/'+id);
            },
            newDisponibilidad: function(id, model){
                return $http.post(api+'disponibilidad/new/'+id,model);
            },
            deleteDisponibilidad: function(id){
                return $http.get(api+'disponibilidad/delete/'+id);
            }
        };
    })
    .factory('extrasService', function($http) {
        return {
            getClub: function(){
                return $http.get(api+'club/list',{cache:true});
            }
        };
    });

appTennisya.directive('divContent', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var twoElements = element[0].children;
            element[0].style.position = 'relative';
            element[0].style.height = '100%';
            var hT = twoElements[0].clientHeight - 2;
            twoElements[1].style.height = 'calc(100% - '+hT+'px)' ;

        }
    };
});