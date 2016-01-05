/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya
        .controller('DisponibilidadCtrl', function ($scope, $ionicModal,  disponibilidadService, extrasService) {
            $scope.$on('$ionicView.beforeEnter', function (scopes, states) {
                if (states.direction === 'back')
                    $scope.disponibilidad.repetir = $scope.parseDias();
            });

            extrasService.getClub().then(function (response) {
                $scope.clubs = response;
            });

            $scope.data = {
                showDelete: false
            };

            $scope.chageActivo = function (item) {
                disponibilidadService.updateDisponibilidad(item).then(function(){
                    disponibilidadService.saveStorage($scope.items);
                });
            };
            $scope.onDelete = function (item) {
                disponibilidadService.deleteDisponibilidad(item.id).then(function (data) {
                    disponibilidadService.saveStorage($scope.items);
                });
                $scope.items.splice($scope.items.indexOf(item), 1);
            };

            disponibilidadService.list().then(function (data) {
                $scope.items = data;
            });

            /* new Disponibilidad*/
            $scope.dias = [
                {id: 'Lu', txt: 'Los lunes', checked: false},
                {id: 'Ma', txt: 'Los martes', checked: false},
                {id: 'Mi', txt: 'Los miércoles', checked: false},
                {id: 'Ju', txt: 'Los jueves', checked: false},
                {id: 'Vi', txt: 'Los viernes', checked: false},
                {id: 'Sá', txt: 'Los sábados', checked: false},
                {id: 'Do', txt: 'Los domingos', checked: false}
            ];

            $scope.newDisponibilidad = function (item) {
                $ionicModal.fromTemplateUrl('templates/disponibilidad/navable-disponibilidad.html', {
                    animation: 'slide-in-up',
                    scope: $scope
                }).then(function (modal) {
                    $scope.modalNewDisp = modal;
                    if (item) {
                        $scope.disponibilidad = angular.copy(item);
                        $scope.disponibilidad.repetir = $scope.parseDias(item.repetir);
                        
                        $scope.disponibilidad.fecha = moment(item.fechai).toDate();
                        $scope.disponibilidad.fechai = moment(item.fechai).toDate();
                        $scope.disponibilidad.fechaf = moment(item.fechaf).toDate();
                    } else
                        $scope.disponibilidad = {autoConfirm: false, fecha: null, fechai: null, fechaf: null, repetir: ''};
                    $scope.modalNewDisp.show();

                });
            };
            $scope.closeNewDisponibilidad = function () {
                $scope.modalNewDisp.remove();
            };
            $scope.parseDias = function (json) {
                var res = '';
                $scope.dias.forEach(function (item) {
                    if (json && json.indexOf(item.id) > -1)
                        item.checked = true;

                    if (item.checked)
                        res += item.id + '.';
                });
                return res;
            };

            $scope.onGuardar = function () {
                if (typeof ($scope.disponibilidad.id) !== 'undefined') {
                    disponibilidadService.updateDisponibilidad($scope.disponibilidad).then(function (response) {
                        $scope.items.forEach(function (disp, index) {
                            if (disp.id === response.data.id){
                                response.data.$$hashKey = $scope.items[index].$$hashKey;
                                $scope.items[index] = response.data;
                            }
                        });
                        disponibilidadService.saveStorage($scope.items);
                    });
                } else {
                    disponibilidadService.newDisponibilidad($scope.disponibilidad).then(function (response) {
                        $scope.items.push(response);
                        disponibilidadService.saveStorage($scope.items);
                    });
                }
                $scope.closeNewDisponibilidad();
            };
        });