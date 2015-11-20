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
        //$scope.id = $localstorage.getObject('user').id;

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

        disponibilidadService.getDisponibilidad().then(function(response){
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
                disponibilidadService.newDisponibilidad($scope.disponibilidad).then(function(response){
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
    .controller('groupsCtrl', function($scope, $state, $stateParams,$rootScope, $ionicModal, $localstorage, grupoService ) {

        $scope.grupo = grupoService.getModel();
        //$scope.grupo.jugadorgrupo.splice(0, $scope.grupo.jugadorgrupo.length);

        //$scope.grupo.title = $stateParams.title;
        $scope.grupo.id = $stateParams.id;

        grupoService.list($stateParams.id).then(function(data){
            $scope.grupo = data;
        });
        $scope.isAdmin = function(){
            if($scope.grupo.jugadorgrupo.length > 0)
                return $localstorage.getObject('user').id === $scope.grupo.jugadorgrupo[0].jugador.id;
            return false;
        };
        $scope.isYo = function(jugador){
            return $localstorage.getObject('user').id === jugador.id;
        };
        $scope.nextGrupo = function(grupo){
            grupoService.setModel(grupo);
            $state.go('tabs.info-groups',{id:grupo.id});
        };
    })
    .controller('infoGroupCtrl', function($scope, $stateParams, $ionicHistory, $ionicModal, $localstorage, grupoService, searchService, cameraAction ) {
        var idYo = $localstorage.getObject('user').id;
        $scope.data = {
            showDelete: false,
            changeTitle:false,
            search:[]
        };

        $scope.grupo = grupoService.getModel();

        $scope.onDelete = function(item) {
            grupoService.deleteJugador(item.id);
            $scope.grupo.jugadorgrupo.splice($scope.grupo.jugadorgrupo.indexOf(item), 1);
            grupoService.setJugadores($scope.grupo.jugadorgrupo);
        };
        $scope.onUpdateTitle = function() {
            if($scope.data.changeTitle){
                grupoService.updateTitle($scope.grupo.id).then(function(response) {
                    $scope.$emit('updategroup', {grupo:response.data,action:'update'});
                }, function(err) {
                });
                $scope.data.changeTitle=false;
            }
        };
        $scope.onSalirEliminar = function() {
            if($scope.isAdmin()){
                grupoService.delete($scope.grupo.id).then(function() {
                    $scope.$emit('updategroup', {grupo:$scope.grupo,action:'remove'});
                    $ionicHistory.goBack(-2);
                }, function(err) {
                });
            }else{
                var idUser = $localstorage.getObject('user').id;
                angular.forEach($scope.grupo.jugadorgrupo, function(value, key) {
                     if(value.jugador.id == idUser){
                         grupoService.deleteJugador(value.id).then(function() {
                             $scope.$emit('updategroup', {grupo:$scope.grupo,action:'remove'});
                             $ionicHistory.goBack(-2);
                         }, function(err) {
                         });
                     }
                });
            }
        };

        $ionicModal.fromTemplateUrl('templates/grupo/add-jugador.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
                $scope.modalAddJugador = modal;
            });

        $scope.searchJugador = function(query){
            var ids = [];
            angular.forEach($scope.grupo.jugadorgrupo, function(value, key) {
                ids.push(value.jugador.id);
            });
            return searchService.searchJugador(query,ids);
        };

        $scope.addJugador = function(item){
            if(!$scope.isYo(item) && $scope.grupo.jugadorgrupo.indexOf(item)<0){
                grupoService.updateJugador($scope.grupo.id,item).then(function(response) {
                    $scope.grupo.jugadorgrupo.push(response.data);
                    grupoService.setJugadores($scope.grupo.jugadorgrupo);
                    $scope.data.search.splice($scope.data.search.indexOf(item), 1);
                }, function(err) {
                    //alert(JSON.stringify(err));
                });
                $scope.modalAddJugador.hide();
            }
        };

        $scope.isAdmin = function(){
            if($scope.grupo.jugadorgrupo.length > 0)
                return $localstorage.getObject('user').id === $scope.grupo.jugadorgrupo[0].jugador.id;
            return false;
        };
        $scope.isYo = function(jugador){
            return  idYo === jugador.id;
        };
        $scope.openCamera = function(){
            cameraAction.showAction(function(imageURI){
                $scope.grupo.image = imageURI;
                grupoService.updateImage($scope.grupo.id).then(function(response) {
                    $scope.grupo.image = response.image;
                    $scope.$emit('updategroup', {grupo:response,action:'update'});
                });

            });
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
            $cordovaFacebook.login(["email"])
                .then(function(success) {
                    $cordovaFacebook.api("me?fields=id,name,email", ["email"])
                        .then(function(success) {
                            alert(JSON.stringify(success));

                            userService.facebookJugador({email:success.email},function(){
                                $state.go('tabs.player');
                            },function(error){
                                alert(error.error);
                            });

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
    .controller('JugadoresSearchCtrl', function($scope, $state, $ionicHistory, $localstorage, grupoService, searchService, cameraAction) {
        var idYo = $localstorage.getObject('user').id;

        $scope.onSig = function (state) {
            grupoService.setTitle($scope.data.title);
            grupoService.setThumb($scope.data.image);
            $state.go(state);
        };

        $scope.changeFocus = function(value){
            $scope.data.focus = value;
            $scope.$apply();
        };
        $scope.isYo = function(jugador){
            return idYo === jugador.id;
        };

        $scope.searchJugador = function(query){
            var ids = [idYo];
            angular.forEach($scope.data.jugadores, function(value, key) {
                ids.push(value.id);
            });
            return searchService.searchJugador(query,ids);
        };
        $scope.addJugador = function(item){
            if(!$scope.isYo(item) && $scope.data.jugadores.indexOf(item)<0){
                $scope.data.jugadores.push(item);
                grupoService.setJugadores($scope.data.jugadores);
                $scope.data.search.splice($scope.data.search.indexOf(item), 1);
            }
        };
        $scope.onDelete = function(item) {
            $scope.data.jugadores.splice($scope.data.jugadores.indexOf(item), 1);
            grupoService.setJugadores($scope.data.jugadores);
        };
        $scope.onCrearGrupo = function() {
            var parent = $scope.$parent.$parent;
            grupoService.save(idYo).then(function(response){
                if(response.id)
                    parent.data.grupos.unshift(response);
            });
            parent.modal.hide();
            $ionicHistory.goBack();
        };

        $scope.openCamera = function(){
            cameraAction.showAction(function(imageURI){
                $scope.data.image = imageURI;
            });
        };

        $scope.resetData = function(){
            $scope.data = {
                focus:true,
                title:'',
                image:null,
                jugadores:[],

                search:[]
            };
        };
        $scope.$on('resetModalGroup', $scope.resetData);
        $scope.resetData();
    })
    .controller('ListJugadoresCtrl', function($scope, $state, $ionicModal, $rootScope, userService, grupoService) {

        $scope.data = {
            showGrupos:false,
            jugadores:[],
            grupos:[]
        };

        userService.listJugador(function(response){
            $scope.data.jugadores = response.jugadores;
            $scope.data.grupos = response.grupos;
        },function(error){
            //alert(error.error);
        });

        $ionicModal.fromTemplateUrl('templates/grupo/navable-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
                $scope.modal = modal;
            });

        $scope.openCreateGrupo = function (){
            $rootScope.$broadcast('resetModalGroup', {});
            grupoService.resetModel();
            $scope.modal.show();
        };

        $rootScope.$on('updategroup', function(event, args){
            var index = -1;
            angular.forEach($scope.data.grupos, function(value, key) {
                if(args.grupo.id == value.id){
                    index = key;
                    //$scope.data.grupos.splice($scope.data.grupos.indexOf(value), 1);
                }
            });

            switch (args.action){
                case 'new': $scope.data.grupos.unshift(args.grupo); break;
                case 'update': if(index >- 1)  angular.merge($scope.data.grupos[index],args.grupo); break;
                case 'remove': if(index >- 1) $scope.data.grupos.splice(index, 1); break;
            }

        });

        $scope.nextGrupo = function(grupo){
            grupoService.setModel(grupo);
            //console.log(grupo);
            $state.go('tabs.groups',{id:grupo.id});
        };
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
   