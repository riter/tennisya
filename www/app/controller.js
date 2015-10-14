/**
 * Created by Riter on 25/08/15.
 */

appTennisya
    .controller('TabsCtrl', function($scope, $ionicModal, $localstorage, partidoService, userService, extrasService) {
        $scope.openPatido = function() {
            $scope.partido = {reservada:true, jugador1:$localstorage.getObject('user')};
            $scope.modal.show();
        };
        $scope.confirmarPartido = function() {
            $scope.partido = {reservada:true, jugador1:$localstorage.getObject('user')};
            $scope.modalConfirm.show();
        };

        extrasService.getClub().then(function(response){
            $scope.clubs = response.data;
        });

        $ionicModal.fromTemplateUrl('templates/partidos/newPartido.html', {
            animation: 'slide-in-up',
            scope: $scope
        }).then(function (modal) {
                $scope.modal = modal;
            });

        $ionicModal.fromTemplateUrl('templates/partidos/_confirmarPartido.html', {
            animation: 'slide-in-up',
            scope: $scope
        }).then(function (modal) {
                $scope.modalConfirm = modal;
            });



        $scope.formatLYMD = function(date){
            return moment(date).format('YYYY/MM/DD');
        };
        $scope.formatHHMM = function(time){
            return moment(time).format('h:mm a');
        };

        $scope.onCreate = function(model){
            partidoService.newPartido(model).then(function(response){
                $scope.modal.hide();
            });
        };

        $scope.onInvitar = function(invitar){
            userService.listJugador(function(response){
                $scope.invitados = response;
            });

            $scope.tmp = invitar;
            $ionicModal.fromTemplateUrl('templates/search/invite.html', {
                animation: 'slide-in-up',
                scope: $scope
            }).then(function (modal) {
                    $scope.inviteModal = modal;
                    $scope.inviteModal.show();
                });
        }

        $scope.onJugador = function(jugador){
            $scope.partido[$scope.tmp] = jugador;
            $scope.inviteModal.hide();
        }
    })
    .controller('AjustesCtrl', function($scope, $state, $localstorage) {
        $scope.id = $localstorage.getObject('user').id;

        $scope.onCerrarSesion=function(){
            $localstorage.clear();
            $state.go('signin');
        }
    })
    .controller('DisponibilidadCtrl', function($scope, $stateParams, $ionicModal, disponibilidadService, extrasService) {
        $scope.data = {
            showDelete: false
        };

        $scope.items ={};
        disponibilidadService.getDisponibilidad($stateParams.id).then(function(response){
            $scope.items = response.data;
        });

        extrasService.getClub().then(function(response){
            $scope.clubs = response.data;
        });

        $scope.onDelete = function(item) {
            disponibilidadService.deleteDisponibilidad(item.id).then(function(response){
                $scope.items.splice($scope.items.indexOf(item), 1);
            });
        };

        /* new Disponibilidad*/
        $ionicModal.fromTemplateUrl('templates/ajustes/new_disponibilidad.html', {
            animation: 'slide-in-up',
            scope: $scope
        }).then(function (modal) {
                $scope.modal = modal;
            });

        $scope.formatYMD = function(date){
            return moment(date).format('YYYY/MM/DD');
        };
        $scope.formatHHMM = function(date){
            return moment(date).format('h:mm a');
        };

        $scope.onGuardar = function(){
            disponibilidadService.newDisponibilidad($stateParams.id, $scope.disponibilidad).then(function(response){
                $scope.items.push(response.data);
                $scope.closeModal();
            });
        };

        $scope.openModal = function() {
            $scope.disponibilidad = {autoConfirm:true};
            $scope.modal.show();
        };
        $scope.closeModal = function() {
            $scope.modal.hide();
        };


    })
    .controller('ShareCtrl', function($scope, $cordovaSocialSharing) {
        var message = '';
        var image = '';
        var link = '';

        var subject='';
        var toArr='';

        $scope.onShare = function(red){
            switch (red){
                case 'message':
                    $cordovaSocialSharing
                        .shareViaSMS(message, number)
                        .then(function(result) {
                            // Success!
                        }, function(err) {
                            // An error occurred. Show a message to the user
                        });
                    break;
                case 'mail':
                    $cordovaSocialSharing
                        .shareViaEmail(message, subject, toArr, null, null, null)
                        .then(function(result) {
                            // Success!
                        }, function(err) {
                            // An error occurred. Show a message to the user
                        });
                    break;
                case 'twitter':
                    $cordovaSocialSharing
                        .shareViaTwitter(message, image, link)
                        .then(function(result) {
                            // Success!
                        }, function(err) {
                            // An error occurred. Show a message to the user
                        });
                    break;
                case 'facebook':
                    $cordovaSocialSharing
                        .shareViaFacebook(message, image, link)
                        .then(function(result) {
                            // Success!
                        }, function(err) {
                            // An error occurred. Show a message to the user
                        });
                    break;
            }
            console.log(red);
        };

    })
    .controller('ProfileCtrl', function($scope, $state, $ionicHistory, $localstorage) {

        $scope.profile = $localstorage.getObject('user');
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

            userService.loginJugador(user,function(){
                $state.go('tabs.player');
            },function(error){
                alert(error.error);
            });
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

    })
    .controller('SignUpCtrl', function($scope, $state, userService, extrasService) {
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

        extrasService.getClub().then(function(response){
            $scope.clubs = response.data;
        });
    })
    .controller('ListJugadoresCtrl', function($scope, $state, userService) {

        $scope.jugadores = [];
        userService.listJugador(function(response){
            $scope.jugadores = response;
        },function(error){
            //alert(error.error);
        });

        setInterval(function(){
            userService.listJugador(function(response){
                $scope.jugadores = response;
            },function(error){
                //alert(error.error);
            });
        },15000);
    })
    .controller('ListPartidosCtrl', function($scope, partidoService) {

        var load = function(){
            partidoService.getPartidosT().then(function(response){
                $scope.doubles = response.data.doubles;
                $scope.singles = response.data.singles;
            });
        };

        $scope.formatPartidos = function(date){
            return moment(date).format('dddd DD/MM, HH')+' hs';
        };
        $scope.formatFromNow = function(date){
            return moment(date).fromNow();
        };

        load();
        //setInterval(load,15000);

        $scope.numberDobles = 20;
        $scope.numberSingles = 15;
        $scope.getNumber = function(num) {
            return new Array(num);
        };
        $scope.gamers = [
            {name: 'Novak Djokovic', country: 'Montevideo, Uruguay', club: 'Lawn Tenis, Nautilus', avatar: 'assets/img/gamers/1.jpg'},
            {name: 'Juan Pérez', country: 'Uruguay', club: '', avatar: 'assets/img/gamers/2.jpg'},
            {name: 'Pedro Aguirre', country: 'Buenos Aires, Argentina', club: 'San Isidro Club', avatar: 'assets/img/gamers/3.jpg'},
            {name: 'Serenita', country: 'Lorem ipsum, lorem ipsum', club: '', avatar: 'assets/img/gamers/4.jpg'},
            {name: 'Jim carrey', country: 'Lorem ipsum, lorem ipsum', club: '', avatar: 'assets/img/gamers/4.jpg'}
        ]
    })
    .controller('GamersCtrl', function($scope) {
        $scope.gamers = [
            {name: 'Novak Djokovic', country: 'Montevideo, Uruguay', club: 'Lawn Tenis, Nautilus', avatar: 'assets/img/gamers/1.jpg'},
            {name: 'Juan Pérez', country: 'Uruguay', club: '', avatar: 'assets/img/gamers/2.jpg'},
            {name: 'Pedro Aguirre', country: 'Buenos Aires, Argentina', club: 'San Isidro Club', avatar: 'assets/img/gamers/3.jpg'},
            {name: 'Serenita', country: 'Lorem ipsum, lorem ipsum', club: '', avatar: 'assets/img/gamers/4.jpg'},
            {name: 'Jim carrey', country: 'Lorem ipsum, lorem ipsum', club: '', avatar: 'assets/img/gamers/4.jpg'},
            {name: 'Mari Shara', country: 'Lorem ipsum, lorem ipsum', club: '', avatar: 'assets/img/gamers/4.jpg'},
            {name: 'Carito Woz', country: 'Lorem ipsum, lorem ipsum', club: '', avatar: 'assets/img/gamers/4.jpg'}
        ]
    })
//    .controller('MatchesCtrl', function($scope) {
//        $scope.numberDobles = 20;
//        $scope.numberSingles = 15;
//        $scope.getNumber = function(num) {
//            return new Array(num);
//        }
//        $scope.gamers = [
//            {name: 'Novak Djokovic', country: 'Montevideo, Uruguay', club: 'Lawn Tenis, Nautilus', avatar: 'assets/img/gamers/1.jpg'},
//            {name: 'Juan Pérez', country: 'Uruguay', club: '', avatar: 'assets/img/gamers/2.jpg'},
//            {name: 'Pedro Aguirre', country: 'Buenos Aires, Argentina', club: 'San Isidro Club', avatar: 'assets/img/gamers/3.jpg'},
//            {name: 'Serenita', country: 'Lorem ipsum, lorem ipsum', club: '', avatar: 'assets/img/gamers/4.jpg'},
//            {name: 'Jim carrey', country: 'Lorem ipsum, lorem ipsum', club: '', avatar: 'assets/img/gamers/4.jpg'},
//        ]
//    })
   