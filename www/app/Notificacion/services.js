/**
 * Created by Riter on 25/08/15.
 */
/*
 */

appTennisya.factory('notoficacionService', function ($ionicHistory, $rootScope, $q, $http, $localstorage, $cordovaPush, $cordovaDevice) {
    var notificationClass = {
        configNotifications: {
            badge: true,
            sound: true,
            alert: true,
            senderID: "648422481399"
        },
        tokenID: "",
        callbackReceive: null,
        cancelHttp: $q.defer(),
        model: {
            data: [],
            lastUpdate: null
        },
        getList: function () {
            return this.model;
        },
        loadList: function (jugador) {
            var self = this;
            self.cancelHttp.resolve(self.data);
            self.cancelHttp = $q.defer();
            $http.get(api + 'notificacion/list/' + jugador, {timeout: self.cancelHttp.promise, params: {lastUpdate: self.model.lastUpdate}}).then(function (response) {
                self.model.data.union(response.data.list, function (model) {//function condicion para eliminar item
                    return model.leido === true;
                }, true);
                self.model.lastUpdate = response.data.lastUpdate;
                self.saveStorage();

            }, function () {
                if ($localstorage.exist('notificacion')) {
                    var tmpNotif = $localstorage.getObject('notificacion');
                    self.model.data = tmpNotif.data;
                    self.model.lastUpdate = tmpNotif.lastUpdate;
                }
            });
        },
        leido: function (id, jugador, type) {
            var self = this;
            $http.get(api + 'notificacion/leido/' + id + '/' + jugador + '/' + type).then(function (response) {
                self.model.data.union(response.data, function (model) {//function condicion para eliminar item
                    return model.leido === true;
                }, true);
                self.saveStorage();
            });
        },
        saveStorage: function () {
            $localstorage.setObject('notificacion', this.model);
        },
        register: function () {
            var self = this;
            try {
                $cordovaPush.register(this.configNotifications).then(function (regid) {
                    if (ionic.Platform.isIOS()) {
                        self.setTokenID(regid);
                    }
                });
                this.receive();
            } catch (e) {}
        },
        setTokenID: function (token) {
            if ($localstorage.exist('tokenNotificacion') && $localstorage.get('tokenNotificacion') === token)
                return;

            this.tokenID = token;
            $http.get(api + 'notificacion/save/' + $cordovaDevice.getDevice().uuid + '/' + this.tokenID + '/' + ionic.Platform.platform()).then(function () {
                $localstorage.set('tokenNotificacion', token);
            });
        },
        unregister: function () {
            try {
                $cordovaPush.unregister(configNotifications);
            } catch (e) {
            }
        },
        receive: function () {
            var self = this;
            $rootScope.$on('$cordovaPush:notificationReceived', function (event, notification) {
                if (ionic.Platform.isAndroid() && notification.event === 'registered') {
                    self.setTokenID(notification.regid);
                } else {
//                    alert(JSON.stringify(notification));
                    $rootScope.loadNotificaciones();
                    if (notification.foreground || notification.foreground === '1') { // 0 si la app esta minimizada y  1 si esta activa
//                        alert(notification.foreground);
                        notification = ionic.Platform.isAndroid() ? notification.payload :  notification;
                        
                        if(!angular.isUndefined(notification.newG) || !angular.isUndefined(notification.updG))
                            $rootScope.$broadcast($ionicHistory.currentStateName(), {type: 'grupos'});
                        if(!angular.isUndefined(notification.updP))
                            $rootScope.$broadcast($ionicHistory.currentStateName(), {type: 'partido', partido:notification.updP});
                    }
                    if (typeof (self.callbackReceive) === 'function')
                        self.callbackReceive();
                }
            });
        }
    };

    return notificationClass;
});