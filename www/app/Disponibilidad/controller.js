/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

appTennisya
        .controller('DisponibilidadCtrl', function ($scope, $ionicModal, disponibilidadService, extrasService) {
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
                disponibilidadService.updateDisponibilidad(item);
            };
            $scope.onDelete = function (item) {
                disponibilidadService.deleteDisponibilidad(item.id);
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
                        $scope.disponibilidad = item;
                        $scope.disponibilidad.repetir = $scope.parseDias(item.repetir);
                    } else
                        $scope.disponibilidad = {autoConfirm: true, fecha: new Date(), fechaI: new Date(), fechaF: new Date(), repetir:''};
                    $scope.modalNewDisp.show();

                });
            };
            $scope.closeNewDisponibilidad = function () {
                $scope.modalNewDisp.hide();
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
                        $scope.items.forEach(function (disp) {
                            if (disp.id == response.data.id)
                                disp = response.data;
                        });
                    });
                } else {
                    disponibilidadService.newDisponibilidad($scope.disponibilidad).then(function (response) {
                        $scope.items.push(response);
                    });
                }
                $scope.closeNewDisponibilidad();
            };
        });