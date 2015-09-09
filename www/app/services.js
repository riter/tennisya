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
appTennisya.factory('userService', function($http) {
        var user = null;

        return {
            loginJugador: function(data,callback,error){

                $http.post(api+'jugadors/login',data).then(function(response){
                    user = response.data;
                    return callback(user);
                },function(e){
                    return error(e.data);
                });

            },
            saveJugador: function(data,callback,error){

                $http.post(api+'jugadors/save',data).then(function(response){
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
                return [0,1,2,3,4,5];

                /*$http.post(api+'ajustes/disponibilidad',{id:id}).then(function(response){
                    return response.data;
                });*/
            }
        };
    });