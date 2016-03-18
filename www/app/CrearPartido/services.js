/**
 * Created by Riter on 25/08/15.
 */
/*
 */
appTennisya
        .factory('partidoService', function ($http) {

            return {
                getPartidosT: function (idJugador, type, idType) {
                    return $http.get(api + 'partidos/list_todos', {params: {idJugador: idJugador, type:type, idType: idType}}).then(function (response) {
                        return response.data;
                    });
                },
                getPartidosP: function (idJugador, type, idType) {
                    return $http.get(api + 'partidos/list_personales', {params: {idJugador: idJugador, type:type, idType: idType}}).then(function (response) {
                        return response.data;
                    });
                },
                getPartidosC: function (idJugador, type, idType) {
                    return $http.get(api + 'partidos/list_confirmados', {params: {idJugador: idJugador, type:type, idType: idType}}).then(function (response) {
                        return response.data;
                    });
                },
                getPartidosJ: function (idJugador, type, idType) {
                    return $http.get(api + 'partidos/list_jugados', {params: {idJugador: idJugador, type:type, idType: idType}}).then(function (response) {
                        return response.data;
                    });
                },
                confirmPartido: function (jugador_partido, action, jugadores) {
                    return $http.get(api + 'partidos/confirm_partido/' + jugador_partido, {params: {action: action, 'jugadores[]':jugadores}}).then(function (response) {
                        return response.data;
                    });
                },
                entrarPartido: function (idPartido, idJugador, action, jugadores) {
                    return $http.get(api + 'partidos/entrar_partido/' + idPartido + '/' + idJugador, {params: {action: action, 'jugadores[]':jugadores}}).then(function (response) {
                        return response.data;
                    });
                },
                newPartido: function (model) {
                    var newModel = {
                        grupo: model.grupo,
                        club: model.club.id,
                        tipo: model.tipo,
                        fechaI: moment(model.fecha).format('YYYY-MM-DD') + ' ' + moment(model.horaI).format('H:mm:ss'),
                        fechaF: moment(model.fecha).format('YYYY-MM-DD') + ' ' + moment(model.horaF).format('H:mm:ss'),
                        reservada: model.reservada,
                        jugadores: []
                    };
                    if (model.jugador1)
                        newModel.jugadores.push(model.jugador1.id);
                    if (model.jugador2)
                        newModel.jugadores.push(model.jugador2.id);
                    if (model.jugador3)
                        newModel.jugadores.push(model.jugador3.id);
                    if (model.jugador4)
                        newModel.jugadores.push(model.jugador4.id);

                    return $http.post(api + 'partidos/new', newModel);
                }
            };
        });
