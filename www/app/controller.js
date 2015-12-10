/**
 * Created by Riter on 25/08/15.
 */

appTennisya
    .controller('infoJugadorCtrl', function($rootScope, $scope, $state, $stateParams, $ionicSlideBoxDelegate, userService, disponibilidadService) {
        $scope.$on('$ionicView.beforeEnter', function() {
            $scope.jugador = userService.getJugador();
            $rootScope.disponibilidadPartido = null;
        });
        $scope.$on('$ionicView.enter', function() {

        });

        $scope.onDisponibilidad = function(item){
            $rootScope.disponibilidadPartido = {fecha:item.fecha,fechaI:item.fechaI, fechaF:item.fechaF,jugador:$scope.jugador,tipo:'Dobles'};

            $state.go('tabs.crear-partidos');
        };

        disponibilidadService.listByJugador(parseInt($stateParams.id)).then(function(response){
           console.log(response);
            angular.forEach(response, function(value, key) {
                if(value.repetir != null && value.repetir.indexOf('.') > -1){
                    var dias = value.repetir.split('.');
                    for(var i=0; i < dias.length-1; i++){
                        $scope.data.repetir[dias[i]].push({
                            fecha: moment(value.fechai).format('YYYY-MM-DD'),
                            fechaI: value.fechai,//.format('H'),
                            fechaF: value.fechaf
                        });
                    }
                }else{
                    if(moment(value.fechai.split(' ')[0]).diff(moment(moment().format('YYYY-MM-DD')),'days') >= 0){
                        $scope.data.unico.push({
                            fecha: moment(value.fechai).format('YYYY-MM-DD'),
                            fechaI: value.fechai,//.format('H'),
                            fechaF: value.fechaf
                        });
                    }
                }
            });
            console.log($scope.data.repetir);
            console.log($scope.data.unico);
        });

        $scope.data = {
            slides:[{
                    fecha1: moment().add(0,'days').format('dd D'),
                    fecha2: moment().add(1,'days').format('dd D'),
                    fecha3: moment().add(2,'days').format('dd D')
                },
                {
                    fecha1: moment().add(3,'days').format('dd D'),
                    fecha2: moment().add(4,'days').format('dd D'),
                    fecha3: moment().add(5,'days').format('dd D')
                },
                {
                    fecha1: moment().add(6,'days').format('dd D'),
                    fecha2: moment().add(7,'days').format('dd D'),
                    fecha3: moment().add(8,'days').format('dd D')
                }],
            fecha: moment().add(8,'days').toDate(),
            repetir:{'Lu':[],'Ma':[],'Mi':[],'Ju':[],'Vi':[],'Sá':[],'Do':[]},
            unico:[]
        };

        $ionicSlideBoxDelegate.update();

        $scope.nextSlide = function(index){
            if(index + 2 == $scope.data.slides.length){
                $scope.data.slides.push( {
                    fecha1: moment($scope.data.fecha).add(1,'days').format('dd D'),
                    fecha2: moment($scope.data.fecha).add(2,'days').format('dd D'),
                    fecha3: moment($scope.data.fecha).add(3,'days').format('dd D')
                });
                $scope.data.fecha = moment($scope.data.fecha).add(3,'days').toDate();
                $ionicSlideBoxDelegate.update();
            }
        };

        $scope.getHours = function (){
            var startHour=7, endHour = 20, tmp = [];
            for (var i = startHour-1; i <= endHour-1; i++)
                tmp.push(((i % 12)+1) + (i < 12?' AM':' PM'));
            return tmp;
        }
    })
    .controller('TabsCtrl', function($scope, $state, $localstorage, extrasService, disponibilidadService, userService) {
        extrasService.loadClubs();
        disponibilidadService.load();

        $scope.formatFecha = function(date,format){
            return moment(date).format(format);
        };

        $scope.nextInfoJugador = function(jugador){
            userService.setJugador(jugador);
            $state.go('tabs.player-info',{id:jugador.id});
        };

        $scope.userLogin = $localstorage.getObject('user');
    })
    .controller('searchJugadorCtrl', function($scope, $ionicHistory, searchJugador) {
        $scope.data={
            search: searchJugador.getJugadores()
        };

        $scope.searchJugador = function(query){
            var ids = [];
            angular.forEach($scope.data.search, function(value, key) {
                ids.push(value.id);
            });
            return searchJugador.searchJugador(query,ids);
        };

        $scope.selected = function(jugador){
            searchJugador.setSelected(jugador);
        }
    })
    .controller('crearPartidoCtrl', function($rootScope, $state, $scope, $ionicHistory, $ionicModal, $localstorage, partidoService, userService, extrasService, searchJugador) {

        $ionicModal.fromTemplateUrl('templates/crearPartido/navable-partido.html', {
            animation: 'slide-in-up',
            scope: $scope
        }).then(function (modal) {
                $scope.modalNewPartido = modal;

            });
        $scope.openPatido = function() {
            if(!$scope.modalNewPartido._isShown){
                $scope.invitar = null;
                $scope.partido = {reservada:true, tipo:'Singles', jugador1:$localstorage.getObject('user'), grupo: $rootScope.grupoPartido.id};

                if($rootScope.disponibilidadPartido != null){
                    console.log($rootScope.disponibilidadPartido);
                    $scope.partido.tipo = $rootScope.disponibilidadPartido.tipo;
                    $scope.partido.fecha = moment($rootScope.disponibilidadPartido.fecha).toDate();
                    $scope.partido.horaI = moment($rootScope.disponibilidadPartido.fechaI).toDate();
                    $scope.partido.horaF = moment($rootScope.disponibilidadPartido.fechaF).toDate();
                    $scope.partido.jugador2 = $rootScope.disponibilidadPartido.jugador;
                }
                $scope.modalNewPartido.show();
            }
        };
        $scope.onCreate = function(model){
            console.log(model);
            partidoService.newPartido(model).then(function(response){
                $scope.modalNewPartido.hide();
                $ionicHistory.goBack();
            });
        };

        extrasService.getClub().then(function(response){
            $scope.clubs = response;
        });

        $scope.formatLYMD = function(date){
            return moment(date).format('YYYY/MM/DD');
        };
        $scope.formatHHMM = function(time){
            return moment(time).format('h:mm a');
        };
        $scope.changeTipo = function(value){
            if(value=='Singles'){
                $scope.partido.jugador3 = null;
                $scope.partido.jugador4 = null;
            }
        };
        $scope.$on('$ionicView.enter', function() {
            $scope.openPatido();

            if($scope.invitar != null && searchJugador.getSelected() != null){
                $scope.partido[$scope.invitar] = searchJugador.getSelected();
                $scope.invitar = null;
                searchJugador.setSelected(null);
            }
        });

        $scope.onCancelar = function(){
            $ionicHistory.goBack();
            $scope.modalNewPartido.hide();
        };

        $scope.search = function(jugador){
            $scope.invitar = jugador;
            $state.go('tabs.crear-partidos.search');
        };
    })
    .controller('AjustesCtrl', function($scope, $state, $localstorage, $ionicHistory, $cordovaActionSheet) {

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
    .controller('DisponibilidadCtrl', function($scope,  $ionicModal, disponibilidadService, extrasService ) {

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

        disponibilidadService.list().then(function(data){
            $scope.items  = data;
        });

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
                {id:'Sá',txt:'Los sábados',checked:false},
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
    .controller('groupsCtrl', function($scope, $state, $stateParams, $rootScope, $ionicModal, $localstorage, grupoService ) {

        $scope.$on('$ionicView.enter', function() {
            $rootScope.grupoPartido = {id: parseInt($stateParams.id), title:$scope.grupo.title};
        });

        $scope.grupo = grupoService.getModel();

        $scope.grupo.id = $stateParams.id;

        grupoService.getJugadores($stateParams.id).then(function(data){
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
                $localstorage.setObject('user',response);
                $scope.profile = response;
            },function(error){
                alert('Ha ocurrido un error al guardar. Por favor intetelo más tarde.')
            });
            $ionicHistory.goBack();
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
    .controller('SignUpCtrl', function($scope, $state, userService, extrasService, $cordovaCamera, $cordovaActionSheet) {
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
    .controller('ListJugadoresCtrl', function($ionicScrollDelegate, $scope, $state, $ionicModal, $rootScope, userService, grupoService) {

        $scope.showGrupos = function(){
            $scope.data.showGrupos = !$scope.data.showGrupos;
            $ionicScrollDelegate.resize();
        };

        $scope.loadMoreData = function(){
            userService.listJugador().then(function(response){
                angular.forEach(response.jugadores, function(value, key) {
                    $scope.data.jugadores.push(value);
                });
                $scope.data.scrolling = response.next;
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        };

        $scope.$on('$ionicView.enter', function() {
            $rootScope.grupoPartido = {id:null};
        });

        $scope.data = {
            showGrupos:false,
            jugadores:[],
            scrolling:true,
            grupos:[]
        };

        grupoService.list().then(function(response){
            $scope.data.grupos = response;
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
            $state.go('tabs.groups',{id:grupo.id});
        };

    })
    .controller('ListPartidosCtrl', function($rootScope, $scope, $cordovaActionSheet, partidoService) {

        $scope.$on('$ionicView.enter', function() {
            partidoService.getPartidosT($scope.userLogin.id,$rootScope.grupoPartido.id).then(function(response){
                $scope.todos = response;
            });
            partidoService.getPartidosP($scope.userLogin.id,$rootScope.grupoPartido.id).then(function(response){
                $scope.personales = response;
            });
            partidoService.getPartidosC($scope.userLogin.id,$rootScope.grupoPartido.id).then(function(response){
                $scope.confirmados = response;
            });
            partidoService.getPartidosJ($scope.userLogin.id,$rootScope.grupoPartido.id).then(function(response){
                $scope.jugados = response;
            });
        });
        $scope.confirmInvitacion = function(partido, jugadorpartido){
            if($scope.userLogin.id == jugadorpartido.jugador.id){
                var options = {
                    addCancelButtonWithLabel: 'Cancelar',
                    androidEnableCancelButton : true
                };

                if(jugadorpartido.estado == 'invitado'){
                    options.title = 'Confirmacion de partido';
                    options.buttonLabels = ['Aceptar', 'Rechazar'];
                    $cordovaActionSheet.show(options)
                        .then(function(btnIndex) {
                           $scope.actionOptions(options.buttonLabels[btnIndex-1],jugadorpartido, partido);
                        });
                }else if(jugadorpartido.estado == 'aceptado'){
                    options.title = 'Desea abandonar el partido?';
                    options.buttonLabels = ['Salir'];
                    $cordovaActionSheet.show(options)
                        .then(function(btnIndex) {
                            $scope.actionOptions(options.buttonLabels[btnIndex-1],jugadorpartido, partido);
                        });
                }
            }
        };
        $scope.entrarPartido = function(partido){
            var options = {
                addCancelButtonWithLabel: 'Cancelar',
                androidEnableCancelButton : true
            };

            options.title = 'Desea ingresar a formar parte del partido?';
            options.buttonLabels = ['Ingresar'];

            $cordovaActionSheet.show(options)
                .then(function(btnIndex) {
                    $scope.actionOptions(options.buttonLabels[btnIndex-1],null, partido);
                });
        };

        $scope.actionOptions = function(action,jugadorPartido, partido){
            switch (action){
                case 'Aceptar': partidoService.confirmPartido(jugadorPartido.id,'aceptado').then(function(response){
                    partido.jugadorpartido[partido.jugadorpartido.indexOf(jugadorPartido)] = response;
                    $rootScope.$broadcast('$ionicView.enter', {});
                });break;
                case 'Rechazar': partidoService.confirmPartido(jugadorPartido.id,'cancelado').then(function(response){
                    partido.jugadorpartido.splice(partido.jugadorpartido.indexOf(jugadorPartido), 1);
                    $rootScope.$broadcast('$ionicView.enter', {});
                });break;
                case 'Salir': partidoService.confirmPartido(jugadorPartido.id,'salir').then(function(response){
                    partido.jugadorpartido.splice(partido.jugadorpartido.indexOf(jugadorPartido), 1);
                    $rootScope.$broadcast('$ionicView.enter', {});
                });break;
                case 'Ingresar': partidoService.entrarPartido(partido.id,$scope.userLogin.id,'entrar').then(function(response){
                    //partido.jugadorpartido.push(response);
                    $rootScope.$broadcast('$ionicView.enter', {});
                });break;
            }
        };

        $scope.formatPartidos = function(date){
            return moment(date).format('dddd DD/MM, HH')+' hs';
        };
        $scope.formatFromNow = function(date){
            return moment(date).fromNow();
        };
        $scope.getVacios = function(partido){
            var res = [], cant = partido.tipo == 'Dobles' ? 4:2;
            for(var c=0; c < (cant - partido.jugadorpartido.length); c++){
                res.push(cant+c);
            }
            return res;
        };
        $scope.isCompleto = function(partido){
            if(typeof (partido.jugadorpartido) !== 'undefined'){
                if((partido.tipo=='Singles' && partido.jugadorpartido.length == 2) || (partido.tipo=='Dobles' && partido.jugadorpartido.length == 4)){
                    return true;
                }
            }
            return false;
        };
        $scope.hasIvitado = function(partido){
            if(typeof (partido.jugadorpartido) !== 'undefined'){
                var res = false;
                angular.forEach(partido.jugadorpartido, function(value, key) {
                    if(value.estado == 'invitado')
                      res = true;
                });
            }
            return res;
        }
    });
//    .controller('GamersCtrl', function($scope) {
//        $scope.gamers = [
//            {name: 'Novak Djokovic', country: 'Montevideo, Uruguay', club: 'Lawn Tenis, Nautilus', avatar: 'assets/img/gamers/1.jpg'},
//            {name: 'Juan Pérez', country: 'Uruguay', club: '', avatar: 'assets/img/gamers/2.jpg'},
//            {name: 'Pedro Aguirre', country: 'Buenos Aires, Argentina', club: 'San Isidro Club', avatar: 'assets/img/gamers/3.jpg'},
//            {name: 'Serenita', country: 'Lorem ipsum, lorem ipsum', club: '', avatar: 'assets/img/gamers/4.jpg'},
//            {name: 'Jim carrey', country: 'Lorem ipsum, lorem ipsum', club: '', avatar: 'assets/img/gamers/4.jpg'},
//            {name: 'Mari Shara', country: 'Lorem ipsum, lorem ipsum', club: '', avatar: 'assets/img/gamers/4.jpg'},
//            {name: 'Carito Woz', country: 'Lorem ipsum, lorem ipsum', club: '', avatar: 'assets/img/gamers/4.jpg'}
//        ]
//    });
   