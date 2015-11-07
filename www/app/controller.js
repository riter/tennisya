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
    .controller('AjustesCtrl', function($scope, $state, $localstorage, $ionicHistory, $cordovaActionSheet) {
        $scope.id = $localstorage.getObject('user').id;

        $scope.onCerrarSesion=function(){
            var options = {
                addCancelButtonWithLabel: 'Cancelar',
                addDestructiveButtonWithLabel : 'Cerrar sesión',
                androidEnableCancelButton : true
            };
            $cordovaActionSheet.show(options)
                .then(function(btnIndex) {
                    if(btnIndex == 1){
                        $localstorage.clear();
                        $ionicHistory.clearHistory();
                        $ionicHistory.clearCache();
                        setTimeout(function(){
                            $state.go('signin');
                        },300);
                    }
                });
        }
    })
    .controller('DisponibilidadCtrl', function($scope, $stateParams, $ionicModal, $ionicActionSheet, disponibilidadService, extrasService ) {
        extrasService.getClub().then(function(response){
            $scope.clubs = response.data;
        });

        $scope.data = {
            showDelete: false
        };
        $scope.chageActivo =function(item){
            disponibilidadService.updateDisponibilidad(item);
        };
        $scope.onDelete = function(item) {
            disponibilidadService.deleteDisponibilidad(item.id);
            $scope.items.splice($scope.items.indexOf(item), 1);
        };

        disponibilidadService.getDisponibilidad($stateParams.id).then(function(response){
            $scope.items = response.data;
        });

        /* new Disponibilidad*/
        $ionicModal.fromTemplateUrl('templates/ajustes/new_disponibilidad.html', {
            animation: 'slide-in-up',
            scope: $scope
        }).then(function (modal) {
                $scope.modal = modal;
            });

        $scope.formatFecha = function(date,format){
            return moment(date).format(format);
        };
        $scope.formatYMD = function(date){
            return moment(date).format('YYYY/MM/DD');
        };
        $scope.formatHHMM = function(date){
            return moment(date).format('h:mm a');
        };

        $scope.onGuardar = function(){
            if(typeof ($scope.disponibilidad.id) !== 'undefined'){
                disponibilidadService.updateDisponibilidad($scope.disponibilidad).then(function(response){
                    $scope.items.forEach(function(disp){
                       if(disp.id == response.data.id)
                           disp = response.data;
                    });
                });
            }else{
                disponibilidadService.newDisponibilidad($stateParams.id, $scope.disponibilidad).then(function(response){
                    $scope.items.push(response.data);
                });
            }
            $scope.closeModal();
        };

        $scope.dias = [];
        $scope.openModal = function(item) {
            $scope.dias = [
                {id:'Lu',txt:'Los lunes',checked:false},
                {id:'Ma',txt:'Los martes',checked:false},
                {id:'Mi',txt:'Los miércoles',checked:false},
                {id:'Ju',txt:'Los jueves',checked:false},
                {id:'Vi',txt:'Los viernes',checked:false},
                {id:'Sa',txt:'Los sábados',checked:false},
                {id:'Do',txt:'Los domingos',checked:false}
            ];

            if(item){
                $scope.disponibilidad = item;
                $scope.parseDias(item.repetir);
            }else
                $scope.disponibilidad = {autoConfirm:true,fechaI: new Date(),fechaF: new Date()};

            $scope.modal.show();
        };
        $scope.closeModal = function() {
            $scope.modal.hide();
        };

        $ionicModal.fromTemplateUrl('templates/ajustes/repetir.html', {
            animation: 'slide-in-up',
            scope: $scope
        }).then(function (modal) {
                $scope.modalRepetir = modal;
            });

        $scope.parseDias = function(json){
            $scope.disponibilidad.repetir = '';
            $scope.dias.forEach(function(item){
                if(json && json.indexOf(item.id) > -1)
                    item.checked = true;

                if(item.checked)
                    $scope.disponibilidad.repetir += item.id +'.';
            });
        };

        $scope.actionSheet = function(){
            $scope.modalRepetir.show();
        };

        $scope.$on('modal.hidden', function(ev) {
            $scope.parseDias();
        });
    })
    .controller('ShareCtrl', function($scope, $cordovaSocialSharing) {
        var message = '';
        var image = '';
        var link = '';

        var subject='';
        var toArr='';

        $scope.onShare = function(red){
            switch (red){
                case 'wassap':
                    $cordovaSocialSharing
                        .shareViaWhatsApp(message, image, link)
                        .then(function(result) {
                            // Success!
                        }, function(err) {
                           alert(JSON.stringify(err));
                        });
                    break;
                case 'mail':
                    $cordovaSocialSharing
                        .shareViaEmail(message, subject, toArr, null, null, null)
                        .then(function(result) {
                            // Success!
                        }, function(err) {
                            alert(JSON.stringify(err));
                        });
                    break;
                case 'facebook':
                    $cordovaSocialSharing
                        .shareViaFacebook(message, image, link)
                        .then(function(result) {
                            // Success!
                        }, function(err) {
                            alert(JSON.stringify(err));
                        });
                    break;
            }
            console.log(red);
        };

    })
    .controller('ProfileCtrl', function($scope, $state, $ionicHistory, $localstorage, $cordovaCamera, $cordovaFileTransfer, $cordovaActionSheet, userService, extrasService) {
        $scope.profile = $localstorage.getObject('user');
        $scope.onCancelar = function(){
            $ionicHistory.goBack();
        };

        $scope.onGuardar = function(user){
            userService.updateJugador(user,function(response){
                $ionicHistory.goBack();
            },function(error){
                //alert(error.error);
                alert('Ha ocurrido un error. Faltan datos por completar.')
            });
        };

        $scope.loadPhoto = function() {
            var options = {
                buttonLabels: ['Hacer foto', 'Seleccionar foto'],
                addCancelButtonWithLabel: 'Cancelar',
                androidEnableCancelButton : true
            };
            $cordovaActionSheet.show(options)
                .then(function(btnIndex) {
                    if(btnIndex == 1)
                        $scope.getPhoto();
                    else if(btnIndex == 2)
                        $scope.selectPhoto();
                });
        };
        $scope.getPhoto = function(){
            var options = {
                quality: 50,
                allowEdit: true,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA
            };
            $scope.openCamera(options);
            $cordovaCamera.cleanup();
        };

        $scope.selectPhoto = function(){
            var options = {
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG
            };
            $scope.openCamera(options);

        };
        $scope.openCamera = function(options){
            $cordovaCamera.getPicture(options).then(function(imageURI) {
                $scope.profile.photo = imageURI;
            }, function(err) {
                //alert(JSON.stringify(err));
            });
        };

        extrasService.getClub().then(function(response){
            $scope.clubs = response.data;
        });

    })
    .controller('SignInCtrl', function($scope, $state, $cordovaFacebook, $cordovaOauth, userService) {

        $scope.signIn = function(user) {

            userService.loginJugador(user,function(){
                $state.go('tabs.player');
            },function(error){
                alert(error.error);
            });
        };
        $scope.signInFacebook = function() {
            console.log('signInFacebook');
            $cordovaFacebook.login(["email"])
                .then(function(success) {
                    $cordovaFacebook.api("me?fields=id,name,email", ["email"])
                        .then(function(success) {
                            alert(JSON.stringify(success));
                        }, function (error) {
                            alert(JSON.stringify(error));
                        });
                }, function (error) {
                    alert(JSON.stringify(error));
                });
        };
        $scope.signInTwitter = function(user) {
            console.log('signInTwitter');
//            $cordovaOauth.linkedin('77pysieyuk50ks', 'y1Rzh4FLej8mJko0', ['r_basicprofile'], 'mistate123456')
//                .then(function(result) {
//                    alert(JSON.stringify(result));
//                }, function(error) {
//                    alert(JSON.stringify(error));
//                });
        };
        $scope.signInGoogle = function(user) {
            console.log('signInGoogle');
        };

    })
    .controller('SignUpCtrl', function($scope, $state, userService, extrasService, $cordovaCamera, $cordovaActionSheet, $localstorage) {
        $scope.user = {};
        $scope.loadPhoto = function() {
            var options = {
                buttonLabels: ['Hacer foto', 'Seleccionar foto'],
                addCancelButtonWithLabel: 'Cancelar',
                androidEnableCancelButton : true
            };
            $cordovaActionSheet.show(options)
                .then(function(btnIndex) {
                    if(btnIndex == 1)
                        $scope.getPhoto();
                    else if(btnIndex == 2)
                        $scope.selectPhoto();
                });
        };
        $scope.getPhoto = function(){
            var options = {
                quality: 50,
                allowEdit: true,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA
            };
            $scope.openCamera(options);
            $cordovaCamera.cleanup();
        };

        $scope.selectPhoto = function(){
            var options = {
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG
            };
            $scope.openCamera(options);

        };
        $scope.openCamera = function(options){
            $cordovaCamera.getPicture(options).then(function(imageURI) {
                $scope.user.photo = imageURI;
            }, function(err) {
                alert(JSON.stringify(err));
            });
        };
        $scope.signUp = function(user) {
            user.type = 'normal';
            userService.saveJugador(user,function(response){
                $state.go('tabs.player');
            },function(error){
                //alert(error.error);
                alert('Ha ocurrido un error. Faltan datos por completar.')
            });
        };

        extrasService.getClub().then(function(response){
            $scope.clubs = response.data;
        });
    })
    .controller('JugadoresSearchCtrl', function($scope, $state, $ionicModal, userService) {
        $scope.data = {
            focus:true
        };

        $scope.changeFocus = function(value){
            $scope.data.focus = value;
            $scope.$apply();
        }
    })
    .controller('ListJugadoresCtrl', function($scope, $state, $ionicModal, userService) {

        $scope.data = {
            showGrupos:false,
            jugadores:[],
            grupos:[],
            grupo:{
                title:'prueba'
            }
        };

        userService.listJugador(function(response){
            $scope.data.jugadores = response.jugadores;
            $scope.data.grupos = response.grupos;
        },function(error){
            //alert(error.error);
        });

//        setInterval(function(){
//            userService.listJugador(function(response){
//                $scope.jugadores = response;
//            },function(error){
//                //alert(error.error);
//            });
//        },15000);

        $ionicModal.fromTemplateUrl('templates/grupo/navable-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
                $scope.modal = modal;
            });

        $scope.onSig = function (state) {
            $state.go(state);
        }
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
   