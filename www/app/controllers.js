/**
 * Created by Riter on 25/08/15.
 */

//angular.module('tennisyaApp.controllers',[])

appTennisya
    .controller('DisponibilidadCtrl', function($scope, $state, $ionicHistory, ajustesService) {
        $scope.data = {
            showDelete: false
        };

        $scope.items= ajustesService.getDisponibilidad('id');

        $scope.onDelete = function(item) {
            $scope.items.splice($scope.items.indexOf(item), 1);
        };

        $scope.onCancelar = function(){
            $ionicHistory.goBack();
        };

        $scope.onGuardar = function(model){
            //servicio de guardar
            $ionicHistory.goBack();
        };
    })
    .controller('ProfileCtrl', function($scope, $state, $ionicHistory, ajustesService) {

        $scope.onCancelar = function(){
            $ionicHistory.goBack();
        };

        $scope.onGuardar = function(model){
            //servicio de guardar
            $ionicHistory.goBack();
        };
    })
    .controller('SignInCtrl', function($scope, $state, userService) {

        $scope.signIn = function(user) {
            //userService.loginJugador(user,function(response){
            $state.go('tabs.player');
            /*},function(error){
             alert(error.error);
             });*/
        };
        $scope.signInFacebook = function() {
            console.log('signInFacebook');
        };
        $scope.signInTwitter = function(user) {
            console.log('signInTwitter');
        };
        $scope.signInGoogle = function(user) {
            console.log('signInGoogle');
        };
        $scope.register = function(user) {
            $state.go('signup');
        };

    })
    .controller('SignUpCtrl', function($scope, $state, userService) {
        $scope.openCamera = function() {

            /*var options = {
             destinationType: Camera.DestinationType.FILE_URI,
             sourceType: Camera.PictureSourceType.CAMERA
             };

             $cordovaCamera.getPicture(options).then(function(imageURI) {
             var image = document.getElementById('photoSignUp');
             image.src = imageURI;
             }, function(err) {
             // error
             });

             $cordovaCamera.cleanup().then(function(){
             alert('cleanup: OK')
             },function(){
             alert('cleanup: ERROR')
             }); // only for FILE_URI*/
        };

        $scope.signUp = function(user) {
            console.log(user);
            /*var url = "http://cdn.wall-pix.net/albums/art-space/00030109.jpg";
             var targetPath = document.getElementById('photoSignUp').getAttribute('src');
             var trustHosts = true;
             var options = {};

             $cordovaFileTransfer.upload(api+'/jugadors/save', targetPath, options)
             .then(function(result) {
             // Success!
             }, function(err) {
             // Error
             }, function (progress) {
             // constant progress updates
             });*/
            user.type = 'normal';
            userService.saveJugador(user,function(response){
                $state.go('tabs.player');
            },function(error){
                alert(error.error);
            });
        };
    })
    .controller('ListJugadoresCtrl', function($scope, $state, userService) {

        $scope.jugadores = [];
        userService.listJugador(function(response){
            $scope.jugadores = response;
        },function(error){
            alert(error.error);
        });
        /*setInterval(function(){
            userService.listJugador(function(response){
                $scope.jugadores = response;
            },function(error){
                alert(error.error);
            });
        },15000);*/
    })
    .controller('GamersCtrl', function($scope) {

        $scope.gamers = [
            {name: 'Novak Djokovic', country: 'Montevideo, Uruguay', club: 'Lawn Tenis, Nautilus', avatar: 'assets/img/gamers/1.jpg'},
            {name: 'Juan Pérez', country: 'Uruguay', club: '', avatar: 'assets/img/gamers/2.jpg'},
            {name: 'Pedro Aguirre', country: 'Buenos Aires, Argentina', club: 'San Isidro Club', avatar: 'assets/img/gamers/3.jpg'},
            {name: 'Serenita', country: 'Lorem ipsum, lorem ipsum', club: '', avatar: 'assets/img/gamers/4.jpg'},
            {name: 'Jim carrey', country: 'Lorem ipsum, lorem ipsum', club: '', avatar: 'assets/img/gamers/4.jpg'},
            {name: 'Mari Shara', country: 'Lorem ipsum, lorem ipsum', club: '', avatar: 'assets/img/gamers/4.jpg'},
            {name: 'Carito Woz', country: 'Lorem ipsum, lorem ipsum', club: '', avatar: 'assets/img/gamers/4.jpg'},
        ]
        
    });