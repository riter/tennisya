/**
 * Created by Riter on 25/08/15.
 */
/*
 */

appTennisya.directive('divContent', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var twoElements = element[0].children;
            element[0].style.position = 'relative';
            element[0].style.height = '100%';
            var hT = twoElements[0].clientHeight - 2;
            twoElements[1].style.height = 'calc(100% - ' + hT + 'px)';

        }
    };
});

//appTennisya.directive('autoFocus', function($timeout) {
//    return {
//        link: function(scope, element, attrs) {
//            $timeout(function() {
//                element[0].focus();
//            }, 400);
//        }
//    };
//});

appTennisya
        .directive('ionSearch', function ($timeout) {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    getData: '&source',
                    model: '=?',
                    search: '=?filter',
                    changeFocus: '&focus'
                },
                link: function (scope, element, attrs) {
                    attrs.minLength = attrs.minLength || 0;
                    scope.placeholder = attrs.placeholder || '';
                    scope.search = {value: ''};
                    var inputElement = element.find('input')[0];

                    if (attrs.class)
                        element.addClass(attrs.class);

                    if (attrs.source) {
                        scope.$watch('search.value', function (newValue, oldValue) {
                            scope.search.value = newValue;
                            if (newValue.length > attrs.minLength) {
                                scope.getData({str: newValue}).then(function (results) {
                                    scope.model = results;
                                });
                            } else {
                                //scope.model = [];
                            }
                        });
                    }

                    if (typeof(attrs.focus)) {
                        $timeout(function () {
                            inputElement.focus();
                        }, 700);
                    }

                    scope.clearSearch = function () {
                        // Manually trigger blur
                        inputElement.blur();
                        scope.search.value = '';
                    };

                    angular.element(inputElement).bind('focus', function () {
                        scope.changeFocus({value: true});
                        // We need to call `$digest()` because we manually changed the model
                        scope.$digest();
                    });
                    // When the user leaves the search bar
                    angular.element(inputElement).bind('blur', function () {
                        scope.changeFocus({value: false});
                        scope.$digest();
                    });
                },
                template: '<div class="item-input-wrapper">' +
                        '<i class="icon ion-search placeholder-icon"></i>' +
                        '<input type="search" placeholder="{{placeholder}}" ng-model="search.value">' +
                        '<i ng-if="search.value.length > 0" ng-click="clearSearch()" class="icon ion-close"></i>' +
                        '</div>'
            };
        });

//appTennisya
//        .directive('searchBar', [function () {
//                return {
//                    scope: {
//                        ngModel: '='
//                    },
//                    require: ['^ionNavBar', '?ngModel'],
//                    restrict: 'E',
//                    replace: true,
//                    template: '<ion-nav-buttons side="right">' +
//                            '<div class="searchBar numicons2">' +
//                            '<div class="searchTxt" ng-show="true">' +
//                            '<div class="bgdiv"></div>' +
//                            '<div class="bgtxt">' +
//                            '<input type="text" placeholder="Procurar..." ng-model="ngModel.txt">' +
//                            '</div>' +
//                            '</div>' +
//                            '<i class="icon placeholder-icon" ng-click="ngModel.txt=\'\';ngModel.show=!ngModel.show"></i>' +
//                            '</div>' +
//                            '</ion-nav-buttons>',
//                    compile: function (element, attrs) {
//                        var icon = (ionic.Platform.isAndroid() && 'ion-android-search')
//                                || (ionic.Platform.isIOS() && 'ion-ios7-search')
//                                || 'ion-search';
//                        angular.element(element[0].querySelector('.icon')).addClass(icon);
//
//                        return function ($scope, $element, $attrs, ctrls) {
//                            var navBarCtrl = ctrls[0];
//                            $scope.navElement = $attrs.side === 'right' ? navBarCtrl.rightButtonsElement : navBarCtrl.leftButtonsElement;
//
//                        };
//                    },
//                    controller: ['$scope', '$ionicNavBarDelegate', function ($scope, $ionicNavBarDelegate) {
//                            var title, definedClass;
//
//                            $scope.$watch('ngModel.show', function (showing, oldVal, scope) {
//                                if (showing !== oldVal) {
//                                    if (showing) {
//                                        if (!definedClass) {
//                                            var numicons = $scope.navElement.children().length;
//                                            angular.element($scope.navElement[0].querySelector('.searchBar')).addClass('numicons' + numicons);
//                                        }
//
//                                        title = $ionicNavBarDelegate.getTitle();
//                                        $ionicNavBarDelegate.setTitle('');
//                                    } else {
//                                        $ionicNavBarDelegate.setTitle(title);
//                                    }
//                                } else if (!title) {
//                                    title = $ionicNavBarDelegate.getTitle();
//                                }
//                            });
//                        }]
//                };
//            }]);