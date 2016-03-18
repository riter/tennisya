/**
 * Created by Riter on 25/08/15.
 */
/*
 */

appTennisya.factory('notoficacionService', function ($q, $http, $localstorage) {
    var notificationClass = {
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
                return self.data;
            });

        }
    };

    return notificationClass;
});