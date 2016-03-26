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
        selected: null,
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
                    return (type === 'grupo' && item.grupo !== id) || (type === 'jugador' && item.grupo === null && item.noleidos[id] !== undefined);
                });
                $localstorage.setObject('notificacion', self.data);
                return self.data;
            }, function () {

            });
        },
        register: function () {
            var self = this;
            try {
                $cordovaPush.register(this.configNotifications).then(function (regid) {
                    if (ionic.Platform.isIOS()) {
                        self.setTokenID(regid);
                    }
                });
            } catch (e) {}
        },
        setTokenID: function (token) {
            this.tokenID = token;
            $http.get(api + 'notificacion/save/' + $cordovaDevice.getDevice().uuid + '/' + this.tokenID + '/' + ionic.Platform.platform());
        },
        unregister: function () {
            try {
                $cordovaPush.unregister(configNotifications);
            } catch (e) {}
        },
        receive: function () {
            var self = this;
            $rootScope.$on('$cordovaPush:notificationReceived', function (event, notification) {
                if (ionic.Platform.isAndroid() && notification.event === 'registered') {
                    self.setTokenID(notification.regid);
                }
                if (typeof (self.callbackReceive) === 'function')
                    self.callbackReceive();

                /*if (ionic.Platform.isAndroid()) {
                 switch (notification.event) {
                 case 'message':
                 // this is the actual push notification. its format depends on the data model from the push server
                 alert('message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
                 break;
                 case 'error':
                 alert('GCM error = ' + notification.msg);
                 break;
                 }
                 } else if (ionic.Platform.isIOS()) {
                 if (notification.alert) {
                 alert(notification.alert);
                 }
                 
                 if (notification.sound) {
                 var snd = new Media(event.sound);
                 snd.play();
                 }
                 
                 if (notification.badge) {
                 $cordovaPush.setBadgeNumber(notification.badge).then(function (result) {
                 // Success!
                 }, function (err) {
                 // An error occurred. Show a message to the user
                 });
                 }
                 }*/
            });
        }
    };
    
    return notificationClass;
});