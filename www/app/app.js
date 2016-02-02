/**
 * Created by Riter on 24/08/15.
 */
//var api = 'http://test.tennisya.apploadapps.com/app_dev.php/api/';
// var api = 'http://localhost/tennisya_admin/web/app_dev.php/api/';
//var api = 'http://localhost/tennisya/tennisya_admin/web/app_dev.php/api/';
var api = 'http://tennisya.apploadapps.com/web/api/';

var appTennisya = angular.module('tennisyaApp', ['ionic', 'ngCordova']);
var configNotifications = {
    badge: true,
    sound: true,
    alert: true,
    senderID: "648422481399"
};

appTennisya.run(function ($ionicPlatform, $ionicHistory, $cordovaPush, $localstorage, $rootScope) {
    $ionicPlatform.ready(function () {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        $ionicPlatform.registerBackButtonAction(function (event) {
            if ($ionicHistory.currentStateName().indexOf("tabs") >= 0 || $ionicHistory.currentStateName().indexOf("signin") >= 0) {
                ionic.Platform.exitApp();
            } else {
                $ionicHistory.goBack();
            }
        }, 100);


//        if (!$localstorage.exist('tokenNotification')) {
//            $cordovaPush.register(configNotifications).then(function (regid) {
//                if (ionic.Platform.isIOS()) {
//                    $localstorage.set('tokenNotification', regid);
//                }
//            });
//        }
        $rootScope.$on('$cordovaPush:notificationReceived', function (event, notification) {
            if (ionic.Platform.isAndroid() && notification.event === 'registered' && notification.regid.length > 0) {
                $localstorage.set('tokenNotification', notification.regid);
            }
        });

//        $scope.$on('$cordovaPush:notificationReceived', function (event, notification) {
//
//                if (ionic.Platform.isAndroid()) {
//                    switch (notification.event) {
//                        case 'message':
//                            // this is the actual push notification. its format depends on the data model from the push server
//                            alert('message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
//                            break;
//                        case 'error':
//                            alert('GCM error = ' + notification.msg);
//                            break;
//                    }
//                } else if (ionic.Platform.isIOS()) {
//                    if (notification.alert) {
//                        alert(notification.alert);
//                    }
//
//                    if (notification.sound) {
//                        var snd = new Media(event.sound);
//                        snd.play();
//                    }
//
//                    if (notification.badge) {
//                        $cordovaPush.setBadgeNumber(notification.badge).then(function (result) {
//                            // Success!
//                        }, function (err) {
//                            // An error occurred. Show a message to the user
//                        });
//                    }
//                }
//            });

    });
});
appTennisya.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.platform.ios.tabs.style('standard');
    $ionicConfigProvider.platform.ios.tabs.position('bottom');
    $ionicConfigProvider.platform.android.tabs.style('standard');
    $ionicConfigProvider.platform.android.tabs.position('standard');
    $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
    $ionicConfigProvider.platform.android.navBar.alignTitle('center');
//    $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-back');
//    $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-ios-arrow-back');

//    $ionicConfigProvider.platform.ios.views.transition('ios');
//    $ionicConfigProvider.platform.android.views.transition('android');

//    $ionicConfigProvider.views.transition('ios');
    $ionicConfigProvider.backButton.previousTitleText("");
    $ionicConfigProvider.backButton.text("").previousTitleText(false);
    $stateProvider
            .state('tabs', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html",
                controller: 'TabsCtrl'
            })
            .state('tabs.search-jugador-grupo', {
                url: "/search-jugador-grupo/:tipo",
                views: {
                    'player-tab': {
                        templateUrl: "templates/search/search-jugador-grupo.html",
                        controller: 'searchJugadorGrupoCtrl'
                    }
                }
            })
            .state('tabs.search-partidos', {
                url: "/search-partidos",
                views: {
                    'partidos-tab': {
                        templateUrl: "templates/search/search-partidos.html",
                        controller: 'searchPartidosCtrl'
                    }
                }
            })
            ;
    if (window.localStorage['user']) {
        $urlRouterProvider.otherwise("tab/players");
    } else {
        $urlRouterProvider.otherwise("/sign-in");
    }

});