/**
 * Created by Riter on 25/08/15.
 */
/*
 */

String.prototype.hashCode = function () {
    var hash = 0, i, chr, len;
    if (this.length === 0)
        return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

Array.prototype.union = function (newArray, conditionRemove) {

    var obj = {};

    var i = 0;
    while (i < newArray.length) {
        obj[newArray[i].id] = newArray[i];
        if (typeof (conditionRemove) === 'function' && conditionRemove(newArray[i])) {
            delete obj[newArray[i].id];
        }
        i++;
    }

    i = 0;
    while (i < this.length) {
        if (obj[this[i].id] !== undefined) {

            if (this[i]['$$hashKey'] !== undefined)
                obj[this[i].id]['$$hashKey'] = this[i].$$hashKey;

            this[i] = obj[this[i].id];
            delete obj[this[i].id];
        }
        if (typeof (conditionRemove) === 'function' && conditionRemove(this[i])) {
            this.splice(i, 1);
        } else {
            i++;
        }
    }
    for (var k in obj) {
        this.push(obj[k]);
    }
};

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

                    if (typeof (attrs.focus)) {
                        $timeout(function () {
                            inputElement.focus();
                        }, 800);
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
                        try{
                            scope.changeFocus({value: false});
                            scope.$digest();
                        }catch(e){}
                    });
                },
                template: '<div class="item-input-wrapper">' +
                        '<i class="icon ion-search placeholder-icon"></i>' +
                        '<input type="search" placeholder="{{placeholder}}" ng-model="search.value">' +
                        '<i ng-if="search.value.length > 0" ng-click="clearSearch()" class="icon ion-close"></i>' +
                        '</div>'
            };
        });

appTennisya.directive('downloadTask', function (filesystemService) {
    return {
        restrict: 'A',
        scope: {
            downloadTask: '=?'
        },
        link: function (scope, element, attrs) {
//            if (scope.downloadTask !== null && scope.downloadTask.indexOf('http') === 0) {
//                filesystemService.download(scope.downloadTask).then(function (uri) {
//                    scope.downloadTask = uri;
//                });
//                scope.downloadTask = null;
//            }
        }
    };
});

// insertar en tabs.html el atributo keyboard-handler
//appTennisya.directive('keyboardHandler', function ($window) {
//    return {
//        restrict: 'A',
//        link: function postLink(scope, element, attrs) {
//            angular.element($window).bind('native.keyboardshow', function () {
//                element.addClass('hidden');
//            });
//
//            angular.element($window).bind('native.keyboardhide', function () {
//                element.addClass('visible');
//            });
//        }
//    }
//});