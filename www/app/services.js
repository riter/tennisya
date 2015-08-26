/**
 * Created by Riter on 25/08/15.
 */
//var api = "http://tennisya.apploadapps.com/web/app_dev.php/api/";
var api = "http://localhost/tennisya/admin/web/app_dev.php/api/";
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
angular.module('tennisyaApp.services',[])
    .factory('userService', function($http) {
        var user = [];

        return {
            loginJugador: function(data,callback,error){

                $http.post(api+'jugadors/login',data).then(function(response){
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
    });