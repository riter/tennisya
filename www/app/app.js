/**
 * Created by Riter on 24/08/15.
 */


//var api = 'http://localhost/tennisyaApp/tennisya_admin/web/app_dev.php/api/';
var api = 'http://tennisya.apploadapps.com/web/api/';
//var api = "192.168.1.6:99/web/api/";

var appTennisya = angular.module('tennisyaApp', ['ionic', 'ngCordova', 'ngPhotoSwipe']);
var configNotifications = {
    badge: true,
    sound: true,
    alert: true,
    senderID: "648422481399"
};

appTennisya.constant('$ionicLoadingConfig', {
    hideOnStateChange: true,
    noBackdrop: true,
    template: '<ion-spinner class="spinner-tennis"/>'
});

appTennisya.run(function ($ionicPlatform, $ionicHistory) {
    $ionicPlatform.ready(function () {
        try {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        } catch (e) {
        }

        $ionicPlatform.registerBackButtonAction(function (event) {
            if ($ionicHistory.currentStateName().indexOf("tabs") >= 0 && ($ionicHistory.backTitle() === 'Iniciar sesión' || $ionicHistory.backTitle() === 'Registro')) {
                ionic.Platform.exitApp();
            } else {
                $ionicHistory.goBack();
            }
        }, 100);

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