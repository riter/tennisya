/**
 * Created by Riter on 25/08/15.
 */
/*
 */

appTennisya.factory('notoficacionService', function ($rootScope, $q, $http, $localstorage, $cordovaPush, $cordovaDevice) {
    var notificationClass = {
        configNotifications: {
            badge: true,
            sound: true,
            alert: true,
            senderID: "648422481399"
        },
        tokenID: "",
        callbackReceive: null,
        data: [],
        cancelHttp: $q.defer(),
        loadList: function (jugador) {
            var self = this;
            self.cancelHttp.resolve(self.data);
            self.cancelHttp = $q.defer();
            return $http.get(api + 'notificacion/list/' + jugador, {timeout: self.cancelHttp.promise}).then(function (response) {
                $localstorage.setObject('notificacion', response.data);
                self.data = response.data;
                return self.data;
            }, function () {
                return $localstorage.getObject('notificacion');
            });
        },
        leido: function (id, jugador, type) {
            var self = this;
            self.cancelHttp.resolve(self.data);
            self.cancelHttp = $q.defer();
            return $http.get(api + 'notificacion/leido/' + id + '/' + jugador + '/' + type).then(function (response) {
                self.data = self.data.filter(function (item) {
                    return (type === 'newgrupo' && !(item.grupo === id && item.partido === null)) || (type === 'grupo' && !(item.grupo === id && item.partido !== null)) || (type === 'jugador' && !(item.grupo === null && item.partido !== null && item.noleidos[id] !== undefined));
                });
                $localstorage.setObject('notificacion', self.data);
                return self.data;
            }, function () {

            });
        },
        register: function () {
            var self = this;
            try {
                this.receive();
                $cordovaPush.register(this.configNotifications).then(function (regid) {
                    if (ionic.Platform.isIOS()) {
                        self.setTokenID(regid);
                    }
                });
            } catch (e) {
            }
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
                    $rootScope.loadNotificaciones();
                    //notification.foreground -> si la app esta activa o minimizada
                    if (typeof (self.callbackReceive) === 'function')
                        self.callbackReceive();
                }
            });
        }
    };

    return notificationClass;
});