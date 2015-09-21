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
    .factory('ajustesService', function($http) {

        return {
            getDisponibilidad: function(id){
                return $http.get(api+'disponibilidad/list/'+id);
            }
        };
    });