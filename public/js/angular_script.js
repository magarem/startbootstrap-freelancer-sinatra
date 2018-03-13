var mod = angular.module("myapp", ['cloudinary',
                                   'videosharing-embed',
                                   'ngImageCompress',
                                   'ngYoutubeEmbed',
                                   'color.picker',
                                   'siyfion.sfTypeahead',
                                   'jsTag',
                                   'ng.deviceDetector',
                                   'ngSanitize',
                                   'ngFileUpload',
                                   'angularCroppie',
                                   'ng-sortable',
                                   'ngAnimate',
                                   'ui.bootstrap',
                                   'fdApp']);
mod.run(['$http','$rootScope',
  function ($http, $rootScope) {
    $rootScope.aa = 10;
    console.log("aa:", $rootScope.aa);
     $http.get('/dataLoad').then(function(response) {
       $rootScope.siteData = response.data;
       $rootScope.isLogged = true;
       var siteNome = $rootScope.siteData.info.name
       console.log("$rootScope.isLogged:", $rootScope.isLogged);
       $rootScope.$broadcast('dataLoad_WasUpdated');
     })

}])
mod.constant('jdFontselectConfig', {
              googleApiKey: 'AIzaSyDTZJrLVoNqsFhMRT2qtrbRbmjEAkmgb0A'
            })
mod.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist(['**']);
});
mod.directive('customOnChange', function () {
return {
    restrict: 'A',
    link: function (scope, element, attrs) {
        var onChangeHandler = scope.$eval(attrs.customOnChange);
        element.bind('change', onChangeHandler);
    }
  };
})
mod.filter( 'safeUrl', [   '$sce',
  function( $sce ){
    return function(url){
      console.log("url::>",url);
      if (url) {
        return $sce.trustAsResourceUrl(url)
      }
    }
  }
]);
mod.filter( 'safeUrlVideo', [   '$sce',
  function( $sce ){
    return function(url){
      console.log("url::>",url);
      if (url) {
        url = url.toString()
        url = url.split("/")[url.split("/").length-2]+"/"+url.split("/")[url.split("/").length-1]
        //return $sce.trustAsResourceUrl("http://res.cloudinary.com/radiando/video/upload/c_crop,h_260,w_360/v"+parseInt(Math.random()*1000000)+"/"+url+".jpg")
        return "http://res.cloudinary.com/radiando/video/upload/c_crop,h_260,w_360/v"+parseInt(Math.random()*1000000)+"/"+url+".jpg"
      }
    }
  }
]);
mod.directive('materialPicker', [
    '$parse',
    function ($parse) {
        var swatches = [{
            name: 'Red',
            camel: 'red',
            colors: [
            { name: '50', hex: 'FFEBEE' },
            { name: '100', hex: 'FFCDD2' },
            { name: '200', hex: 'EF9A9A' },
            { name: '300', hex: 'E57373' },
            { name: '400', hex: 'EF5350' },
            { name: '500', hex: 'F44336' },
            { name: '600', hex: 'E53935' },
            { name: '700', hex: 'D32F2F' },
            { name: '800', hex: 'C62828' },
            { name: '900', hex: 'B71C1C' },
            { name: 'A100', hex: 'FF8A80' },
            { name: 'A200', hex: 'FF5252' },
            { name: 'A400', hex: 'FF1744' },
            { name: 'A700', hex: 'D50000' }
            ]
        }, {
            name: 'Pink',
            camel: 'pink',
            colors: [
            { name: '50', hex: 'FCE4EC' },
            { name: '100', hex: 'F8BBD0' },
            { name: '200', hex: 'F48FB1' },
            { name: '300', hex: 'F06292' },
            { name: '400', hex: 'EC407A' },
            { name: '500', hex: 'E91E63' },
            { name: '600', hex: 'D81B60' },
            { name: '700', hex: 'C2185B' },
            { name: '800', hex: 'AD1457' },
            { name: '900', hex: '880E4F' },
            { name: 'A100', hex: 'FF80AB' },
            { name: 'A200', hex: 'FF4081' },
            { name: 'A400', hex: 'F50057' },
            { name: 'A700', hex: 'C51162' }
            ]
        }, {
            name: 'Purple',
            camel: 'purple',
            colors: [
            { name: '50', hex: 'F3E5F5' },
            { name: '100', hex: 'E1BEE7' },
            { name: '200', hex: 'CE93D8' },
            { name: '300', hex: 'BA68C8' },
            { name: '400', hex: 'AB47BC' },
            { name: '500', hex: '9C27B0' },
            { name: '600', hex: '8E24AA' },
            { name: '700', hex: '7B1FA2' },
            { name: '800', hex: '6A1B9A' },
            { name: '900', hex: '4A148C' },
            { name: 'A100', hex: 'EA80FC' },
            { name: 'A200', hex: 'E040FB' },
            { name: 'A400', hex: 'D500F9' },
            { name: 'A700', hex: 'AA00FF' }
            ]
        }, {
            name: 'Deep Purple',
            camel: 'deepPurple',
            colors: [
            { name: '50', hex: 'EDE7F6' },
            { name: '100', hex: 'D1C4E9' },
            { name: '200', hex: 'B39DDB' },
            { name: '300', hex: '9575CD' },
            { name: '400', hex: '7E57C2' },
            { name: '500', hex: '673AB7' },
            { name: '600', hex: '5E35B1' },
            { name: '700', hex: '512DA8' },
            { name: '800', hex: '4527A0' },
            { name: '900', hex: '311B92' },
            { name: 'A100', hex: 'B388FF' },
            { name: 'A200', hex: '7C4DFF' },
            { name: 'A400', hex: '651FFF' },
            { name: 'A700', hex: '6200EA' }
            ]
        }, {
            name: 'Indigo',
            camel: 'indigo',
            colors: [
            { name: '50', hex: 'E8EAF6' },
            { name: '100', hex: 'C5CAE9' },
            { name: '200', hex: '9FA8DA' },
            { name: '300', hex: '7986CB' },
            { name: '400', hex: '5C6BC0' },
            { name: '500', hex: '3F51B5' },
            { name: '600', hex: '3949AB' },
            { name: '700', hex: '303F9F' },
            { name: '800', hex: '283593' },
            { name: '900', hex: '1A237E' },
            { name: 'A100', hex: '8C9EFF' },
            { name: 'A200', hex: '536DFE' },
            { name: 'A400', hex: '3D5AFE' },
            { name: 'A700', hex: '304FFE' }
            ]
        }, {
            name: 'Blue',
            camel: 'blue',
            colors: [
            { name: '50', hex: 'E3F2FD' },
            { name: '100', hex: 'BBDEFB' },
            { name: '200', hex: '90CAF9' },
            { name: '300', hex: '64B5F6' },
            { name: '400', hex: '42A5F5' },
            { name: '500', hex: '2196F3' },
            { name: '600', hex: '1E88E5' },
            { name: '700', hex: '1976D2' },
            { name: '800', hex: '1565C0' },
            { name: '900', hex: '0D47A1' },
            { name: 'A100', hex: '82B1FF' },
            { name: 'A200', hex: '448AFF' },
            { name: 'A400', hex: '2979FF' },
            { name: 'A700', hex: '2962FF' }
            ]
        }, {
            name: 'Light Blue',
            camel: 'lightBlue',
            colors: [
            { name: '50', hex: 'E1F5FE' },
            { name: '100', hex: 'B3E5FC' },
            { name: '200', hex: '81D4FA' },
            { name: '300', hex: '4FC3F7' },
            { name: '400', hex: '29B6F6' },
            { name: '500', hex: '03A9F4' },
            { name: '600', hex: '039BE5' },
            { name: '700', hex: '0288D1' },
            { name: '800', hex: '0277BD' },
            { name: '900', hex: '01579B' },
            { name: 'A100', hex: '80D8FF' },
            { name: 'A200', hex: '40C4FF' },
            { name: 'A400', hex: '00B0FF' },
            { name: 'A700', hex: '0091EA' }
            ]
        }, {
            name: 'Cyan',
            camel: 'cyan',
            colors: [
            { name: '50', hex: 'E0F7FA' },
            { name: '100', hex: 'B2EBF2' },
            { name: '200', hex: '80DEEA' },
            { name: '300', hex: '4DD0E1' },
            { name: '400', hex: '26C6DA' },
            { name: '500', hex: '00BCD4' },
            { name: '600', hex: '00ACC1' },
            { name: '700', hex: '0097A7' },
            { name: '800', hex: '00838F' },
            { name: '900', hex: '006064' },
            { name: 'A100', hex: '84FFFF' },
            { name: 'A200', hex: '18FFFF' },
            { name: 'A400', hex: '00E5FF' },
            { name: 'A700', hex: '00B8D4' }
            ]
        }, {
            name: 'Teal',
            camel: 'teal',
            colors: [
            { name: '50', hex: 'E0F2F1' },
            { name: '100', hex: 'B2DFDB' },
            { name: '200', hex: '80CBC4' },
            { name: '300', hex: '4DB6AC' },
            { name: '400', hex: '26A69A' },
            { name: '500', hex: '009688' },
            { name: '600', hex: '00897B' },
            { name: '700', hex: '00796B' },
            { name: '800', hex: '00695C' },
            { name: '900', hex: '004D40' },
            { name: 'A100', hex: 'A7FFEB' },
            { name: 'A200', hex: '64FFDA' },
            { name: 'A400', hex: '1DE9B6' },
            { name: 'A700', hex: '00BFA5' }
            ]
        }, {
            name: 'Green',
            camel: 'green',
            colors: [
            { name: '50', hex: 'E8F5E9' },
            { name: '100', hex: 'C8E6C9' },
            { name: '200', hex: 'A5D6A7' },
            { name: '300', hex: '81C784' },
            { name: '400', hex: '66BB6A' },
            { name: '500', hex: '4CAF50' },
            { name: '600', hex: '43A047' },
            { name: '700', hex: '388E3C' },
            { name: '800', hex: '2E7D32' },
            { name: '900', hex: '1B5E20' },
            { name: 'A100', hex: 'B9F6CA' },
            { name: 'A200', hex: '69F0AE' },
            { name: 'A400', hex: '00E676' },
            { name: 'A700', hex: '00C853' }
            ]
        }, {
            name: 'Light Green',
            camel: 'lightGreen',
            colors: [
            { name: '50', hex: 'F1F8E9' },
            { name: '100', hex: 'DCEDC8' },
            { name: '200', hex: 'C5E1A5' },
            { name: '300', hex: 'AED581' },
            { name: '400', hex: '9CCC65' },
            { name: '500', hex: '8BC34A' },
            { name: '600', hex: '7CB342' },
            { name: '700', hex: '689F38' },
            { name: '800', hex: '558B2F' },
            { name: '900', hex: '33691E' },
            { name: 'A100', hex: 'CCFF90' },
            { name: 'A200', hex: 'B2FF59' },
            { name: 'A400', hex: '76FF03' },
            { name: 'A700', hex: '64DD17' }
            ]
        }, {
            name: 'Lime',
            camel: 'lime',
            colors: [
            { name: '50', hex: 'F9FBE7' },
            { name: '100', hex: 'F0F4C3' },
            { name: '200', hex: 'E6EE9C' },
            { name: '300', hex: 'DCE775' },
            { name: '400', hex: 'D4E157' },
            { name: '500', hex: 'CDDC39' },
            { name: '600', hex: 'C0CA33' },
            { name: '700', hex: 'AFB42B' },
            { name: '800', hex: '9E9D24' },
            { name: '900', hex: '827717' },
            { name: 'A100', hex: 'F4FF81' },
            { name: 'A200', hex: 'EEFF41' },
            { name: 'A400', hex: 'C6FF00' },
            { name: 'A700', hex: 'AEEA00' }
            ]
        }, {
            name: 'Yellow',
            camel: 'yellow',
            colors: [
            { name: '50', hex: 'FFFDE7' },
            { name: '100', hex: 'FFF9C4' },
            { name: '200', hex: 'FFF59D' },
            { name: '300', hex: 'FFF176' },
            { name: '400', hex: 'FFEE58' },
            { name: '500', hex: 'FFEB3B' },
            { name: '600', hex: 'FDD835' },
            { name: '700', hex: 'FBC02D' },
            { name: '800', hex: 'F9A825' },
            { name: '900', hex: 'F57F17' },
            { name: 'A100', hex: 'FFFF8D' },
            { name: 'A200', hex: 'FFFF00' },
            { name: 'A400', hex: 'FFEA00' },
            { name: 'A700', hex: 'FFD600' }
            ]
        }, {
            name: 'Amber',
            camel: 'amber',
            colors: [
            { name: '50', hex: 'FFF8E1' },
            { name: '100', hex: 'FFECB3' },
            { name: '200', hex: 'FFE082' },
            { name: '300', hex: 'FFD54F' },
            { name: '400', hex: 'FFCA28' },
            { name: '500', hex: 'FFC107' },
            { name: '600', hex: 'FFB300' },
            { name: '700', hex: 'FFA000' },
            { name: '800', hex: 'FF8F00' },
            { name: '900', hex: 'FF6F00' },
            { name: 'A100', hex: 'FFE57F' },
            { name: 'A200', hex: 'FFD740' },
            { name: 'A400', hex: 'FFC400' },
            { name: 'A700', hex: 'FFAB00' }
            ]
        }, {
            name: 'Orange',
            camel: 'orange',
            colors: [
            { name: '50', hex: 'FFF3E0' },
            { name: '100', hex: 'FFE0B2' },
            { name: '200', hex: 'FFCC80' },
            { name: '300', hex: 'FFB74D' },
            { name: '400', hex: 'FFA726' },
            { name: '500', hex: 'FF9800' },
            { name: '600', hex: 'FB8C00' },
            { name: '700', hex: 'F57C00' },
            { name: '800', hex: 'EF6C00' },
            { name: '900', hex: 'E65100' },
            { name: 'A100', hex: 'FFD180' },
            { name: 'A200', hex: 'FFAB40' },
            { name: 'A400', hex: 'FF9100' },
            { name: 'A700', hex: 'FF6D00' }
            ]
        }, {
            name: 'Deep Orange',
            camel: 'deepOrange',
            colors: [
            { name: '50', hex: 'FBE9E7' },
            { name: '100', hex: 'FFCCBC' },
            { name: '200', hex: 'FFAB91' },
            { name: '300', hex: 'FF8A65' },
            { name: '400', hex: 'FF7043' },
            { name: '500', hex: 'FF5722' },
            { name: '600', hex: 'F4511E' },
            { name: '700', hex: 'E64A19' },
            { name: '800', hex: 'D84315' },
            { name: '900', hex: 'BF360C' },
            { name: 'A100', hex: 'FF9E80' },
            { name: 'A200', hex: 'FF6E40' },
            { name: 'A400', hex: 'FF3D00' },
            { name: 'A700', hex: 'DD2C00' }
            ]
        }, {
            name: 'Brown',
            camel: 'brown',
            colors: [
            { name: '50', hex: 'EFEBE9' },
            { name: '100', hex: 'D7CCC8' },
            { name: '200', hex: 'BCAAA4' },
            { name: '300', hex: 'A1887F' },
            { name: '400', hex: '8D6E63' },
            { name: '500', hex: '795548' },
            { name: '600', hex: '6D4C41' },
            { name: '700', hex: '5D4037' },
            { name: '800', hex: '4E342E' },
            { name: '900', hex: '3E2723' }
            ]
        }, {
            name: 'Grey',
            camel: 'grey',
            colors: [
            { name: '50', hex: 'FAFAFA' },
            { name: '100', hex: 'F5F5F5' },
            { name: '200', hex: 'EEEEEE' },
            { name: '300', hex: 'E0E0E0' },
            { name: '400', hex: 'BDBDBD' },
            { name: '500', hex: '9E9E9E' },
            { name: '600', hex: '757575' },
            { name: '700', hex: '616161' },
            { name: '800', hex: '424242' },
            { name: '900', hex: '212121' }
            ]
        }, {
            name: 'Blue Grey',
            camel: 'blueGrey',
            colors: [
            { name: '50', hex: 'ECEFF1' },
            { name: '100', hex: 'CFD8DC' },
            { name: '200', hex: 'B0BEC5' },
            { name: '300', hex: '90A4AE' },
            { name: '400', hex: '78909C' },
            { name: '500', hex: '607D8B' },
            { name: '600', hex: '546E7A' },
            { name: '700', hex: '455A64' },
            { name: '800', hex: '37474F' },
            { name: '900', hex: '263238' }
            ]
        }, {
            name: 'Misc',
            camel: '',
            colors: [
            { name: 'white', hex: 'FFFFFF', x: 19, y: 0 },
            { name: 'black', hex: '000000', x: 19, y: 1 }
            ]
        }];
        var hexToRgb = function (hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };
        var cToHex = function (c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        };
        var rgbToHex = function (r, g, b) {
            return "#" + cToHex(r) + cToHex(g) + cToHex(b);
        };
        var h = function (c) {
            if (c == '') { return 0; }
            var t = parseInt(c);
            return t >= 0 && t <= 255 ? t : 0;
        };
        var getName = function (hex) {
            if (!(hex)) { return ''; }
            for (var i = 0; i < 19; i++) {
                for (var j = 0; j < swatches[i].colors.length; j++) {
                    if (swatches[i].colors[j].hex == hex.replace('#', '')) {
                        return swatches[i].camel + swatches[i].colors[j].name;
                    }
                }
            }
            return '';
        };
        return {
            restrict: "E",
            require: 'ngModel',
            link: function ($scope, element, attrs, ngModel) {
                angular.element(element).addClass('materialpicker');
                var selection = [];
                for (var x = 0; x <= 20; x++) {
                    selection.push([]);
                }
                var size = 15;
                var state = {
                    mousedown: false,
                    ignore: false,
                    selected: { color: null, x: 0, y: 0 }
                };
                var container = angular.element('<div>');
                container.addClass('materialpicker-colors');
                container.on('mouseout', function () {
                    if (attrs.hoverModel) {
                        var model = $parse(attrs.hoverModel);
                        model.assign($scope, null);
                        $scope.$apply();
                    }
                });
                container.on('mousedown', function () {
                    state.mousedown = true;
                });
                container.on('mouseup', function () {
                    state.mousedown = false;
                });
                function mouseup() {
                    state.mousedown = false;
                    angular.element(window.document).off('mouseup', mouseup);
                }
                container.on('mouseleave', function () {
                    angular.element(window.document).on('mouseup', mouseup);
                });
                container.on('mouseenter', function () {
                    angular.element(window.document).off('mouseup', mouseup);
                });
                var action = function (color, apply) {
                    selection[state.selected.x][state.selected.y].ele.removeClass('selected');
                    state.selected.color = color.hex;
                    state.selected.x = color.x;
                    state.selected.y = color.y;
                    var camel = swatches[color.x].camel;
                    var format = $parse(attrs.format);
                    if (format() === 'hex') {
                        ngModel.$setViewValue('#' + color.hex);
                    } else {
                        var rgb = hexToRgb(color.hex);
                        ngModel.$setViewValue({
                            hex: '#' + color.hex,
                            name: camel + color.name,
                            r: rgb.r, g: rgb.g, b: rgb.b
                        });
                    }
                    state.ignore = true;
                    selection[color.x][color.y].ele.addClass('selected');
                };
                var isHex = function (hex) {
                    if (typeof hex == 'undefined') { return null; }
                    return hex.match(/^#([0-9A-F]{6})$/i);
                }
                var selectColor = function (hex) {
                    var m = null;
                    if (m = isHex(hex)) {
                        selection[state.selected.x][state.selected.y].ele.removeClass('selected');
                        outer:
                            for (var i = 0; i < swatches.length; i++) {
                                inner:
                                    for (var j = 0; j < swatches[i].colors.length; j++) {
                                        if (swatches[i].colors[j].hex == m[1]) {
                                            selection[i][j].ele.addClass('selected');
                                            state.selected.x = i;
                                            state.selected.y = j;
                                            break outer;
                                        }
                                    }
                            }
                    }
                };
                for (var i = 0; i < 19; i++) {
                    var column = angular.element('<div>');
                    column.css({
                        display: 'inline-block',
                        verticalAlign: 'top'
                    });
                    for (var j = 0; j < swatches[i].colors.length; j++) {
                        var row = angular.element('<div>');
                        selection[i][j] = { ele: row };
                        swatches[i].colors[j].x = i;
                        swatches[i].colors[j].y = j;
                        row.css({
                            background: '#' + swatches[i].colors[j].hex,
                            height: size + 'px'
                        });
                        row.on('mouseover', (function (swatch, color) {
                            return function () {
                                if (attrs.hoverModel) {
                                    var model = $parse(attrs.hoverModel);
                                    var rgb = hexToRgb(color.hex);
                                    model.assign($scope, {
                                        hex: '#' + color.hex,
                                        name: swatch.camel + color.name,
                                        r: rgb.r, g: rgb.g, b: rgb.b
                                    });
                                    $scope.$apply();
                                }
                            };
                        })(swatches[i], swatches[i].colors[j]));
                        row.on('click', (function (color) {
                            return function () {
                                action(color);
                            };
                        })(swatches[i].colors[j]));
                        row.on('mouseover', (function (color) {
                            return function () {
                                if (!state.mousedown
                                    || (color.x === state.selected.x
                                    && color.y === state.selected.y)) { return; }
                                action(color);
                            };
                        })(swatches[i].colors[j]));
                        column.append(row);
                    }
                    container.append(column);
                }
                var white = angular.element('<div>');
                white.css({
                    background: '#FFF',
                    display: 'inline-block',
                    width: (size * 3) + 'px',
                    height: (size * 2) + 'px',
                    position: 'absolute',
                    left: (size * 16) + 'px',
                    top: (size * 10) + 'px'
                });
                selection[19][0] = { ele: white };
                white.on('click', (function (color) {
                    return function () {
                        action(color);
                    };
                })(swatches[19].colors[0]));
                white.on('mouseover', (function (swatch, color) {
                    return function () {
                        if (attrs.hoverModel) {
                            var model = $parse(attrs.hoverModel)
                            model.assign($scope, {
                                hex: '#' + color.hex,
                                name: swatch.camel + color.name,
                                r: 255, g: 255, b: 255
                            });
                            $scope.$apply();
                        }
                        if (!state.mousedown
                            || (color.x === state.selected.x
                                && color.y === state.selected.y)) { return; }
                        action(color);
                    };
                })(swatches[19], swatches[19].colors[0]));
                white.addClass('materialpicker-white');
                container.append(white);
                var black = angular.element('<div>');
                black.css({
                    background: '#000',
                    display: 'inline-block',
                    width: (size * 3) + 'px',
                    height: (size * 2) + 'px',
                    position: 'absolute',
                    left: (size * 16) + 'px',
                    top: (size * 12) + 'px'
                });
                selection[19][1] = { ele: black };
                black.on('click', (function (color) {
                    return function () {
                        action(color);
                    };
                })(swatches[19].colors[1]));
                black.on('mouseover', (function (swatch, color) {
                    return function () {
                        if (attrs.hoverModel) {
                            var model = $parse(attrs.hoverModel)
                            model.assign($scope, {
                                hex: '#' + color.hex,
                                name: swatch.camel + color.name,
                                r: 0, g: 0, b: 0
                            });
                            $scope.$apply();
                        }
                        if (!state.mousedown
                            || (color.x === state.selected.x
                                && color.y === state.selected.y)) { return; }
                        action(color);
                    };
                })(swatches[19], swatches[19].colors[1]));
                container.append(black);
                element.append(container);
                var format = $parse(attrs.format);
                var watch = format() === 'hex' ? '$watch' : '$watchCollection';
                $scope[watch](attrs.ngModel, function (value, oldValue) {
                    if (typeof value == 'undefined') { return; }
                    if (format() !== 'hex') {
                        if (value.hex.match(/^[^#]/)) {
                            value.hex = '#' + value.hex;
                        }
                        var color = hexToRgb(value.hex);
                        if (color) {
                            if ((value.r == color.r || typeof value.r == 'undefined')
                                && (value.g == color.g || typeof value.g == 'undefined')
                                && (value.b == color.b || typeof value.b == 'undefined')) {
                                if (value.r != '') { value.r = color.r; }
                                if (value.g != '') { value.g = color.g; }
                                if (value.b != '') { value.b = color.b; }
                            } else {
                                if (value.hex != oldValue.hex) {
                                    value.r = color.r;
                                    value.g = color.g;
                                    value.b = color.b;
                                } else {
                                    value.hex = rgbToHex(
                                    h(value.r) || 0,
                                    h(value.g) || 0,
                                    h(value.b) || 0
                                    );
                                }
                            }
                        } else {
                            var revertColor = hexToRgb(oldValue.hex);
                            if (revertColor) {
                                value.r = h(revertColor.r) || 0;
                                value.g = h(revertColor.g) || 0;
                                value.b = h(revertColor.b) || 0;
                            }
                        }
                    }
                    value.name = getName(value.hex || oldValue.hex);
                    if (isHex(value.hex || value)) {
                        ngModel.$setValidity('required', true);
                    } else {
                        ngModel.$setValidity('required', false);
                    }
                    var v = format() === 'hex' ? value : value.hex;
                    selectColor(v);
                });
                if (attrs.size) {
                    $scope.$watch(attrs.size, function (nSize) {
                        for (var i = 0; i < selection.length; i++) {
                            for (var j = 0; j < selection[i].length; j++) {
                                selection[i][j].ele.css({
                                    width: nSize + 'px',
                                    height: nSize + 'px'
                                });
                            }
                        }
                        white.css({
                            width: (nSize * 3) + 'px',
                            height: (nSize * 2) + 'px',
                            left: (nSize * 16) + 'px',
                            top: (nSize * 10) + 'px'
                        });
                        black.css({
                            width: (nSize * 3) + 'px',
                            height: (nSize * 2) + 'px',
                            left: (nSize * 16) + 'px',
                            top: (nSize * 12) + 'px'
                        });
                    });
                }
            }
        };
    }
]);
mod.factory('mediaService', function($http, $q) {
 function youtube_id_from_url(url) {
   var id = '';
   url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
   if(url[2] !== undefined) {
     id = url[2].split(/[^0-9a-z_]/i);
     id = id[0];
   } else {
     id = url;
   }
   return id;
 }

 function vimeo_id_from_url(url) {

   var regExp = /(http:\/\/|https:\/\/)?(www\.)?vimeo.com\/(\d+)(\/)?(#.*)?/

   var match = url.match(regExp)

   if (match)
       return match[3]

 }

 function getPropByString(obj, propString) {
   if (!propString)
       return obj;

   var prop, props = propString.split('.');

   for (var i = 0, iLen = props.length - 1; i < iLen; i++) {
       prop = props[i];

       var candidate = obj[prop];
       if (candidate !== undefined) {
           obj = candidate;
       } else {
           break;
       }
   }
   return obj[props[i]];
 }

 var apiNames = ['youtube','vimeo'];

 var apis = {
   youtube : {
     url : 'http://gdata.youtube.com/feeds/api/videos/%s%?v=2&alt=jsonc',
     title : 'data.title',
     description : 'data.description',
     preview_thumb : 'data.thumbnail.sqDefault',
     parse: youtube_id_from_url

   },
   vimeo : {
     url : 'http://vimeo.com/api/oembed.json?url=http%3A//vimeo.com/%s%',
     title : 'title',
     description : 'description',
     preview_thumb : 'thumbnail_url',
     parse : vimeo_id_from_url
   },
   image : {
     title : '%s%',
     description : '',
     preview_thumb : '%s%',
     parse : function(url) { return url; }
   }
 }

 var obj = {
   getHash : function(url) {
     var hash = {
       preview_thumb: '',
       meta: {
         title : '',
         description : '',
       }
     };
     var api = 'image';
     var id = '';

     apiNames.map(function(el, ix, arr) {
       if(url.indexOf(el) > -1) {
         api = el;
       }
     });

     var deferred = $q.defer();

     if(apis[api].url) {
       var apiUrl = apis[api].url.replace('%s%', apis[api].parse(url));
       $http({method: 'GET', url : apiUrl}).
         success(function(data, status, headers, config) {
           hash.preview_thumb = getPropByString(data,apis[api].preview_thumb);
           hash.meta.title = getPropByString(data, apis[api].title);
           hash.meta.description = getPropByString(data,apis[api].description);
           //The rest from the api, if you want it.
           hash.meta.data = data;
           deferred.resolve(hash);
         }).
          error(function(data, status, headers, config) {
           deferred.reject(data);
         });
     } else {
       if(url.length && url.length > 4) {
         hash.preview_thumb = url;
         hash.meta.title = url;
         hash.meta.description = '';
         //The rest from the api, if you want it.
         deferred.resolve(hash);
       } else {
         deferred.reject({'error' : 'invalid url'});
       }
     }

     return deferred.promise;
   }
 };
 return obj;
});
mod.directive("anguvideo", ['$sce', function ($sce) {
       return {
           restrict: 'EA',
           scope: {
               source: '=ngModel',
               width: '@',
               height: '@'
           },
           replace: true,
           template: '<div class="embed-responsive embed-responsive-4by3">' +
           '<iframe  type="text/html"  ng-src="{{url}}" allowfullscreen ></iframe>' +
           '</div>',
           link: function (scope, element, attrs) {
               var embedFriendlyUrl = "",
                   urlSections,
                   index;

               var youtubeParams = (attrs.hideControls ? '?autoplay=0&showinfo=0&controls=0' : '');

               scope.$watch('source', function (newVal) {
                   if (newVal) {
                       /*
                        * Need to convert the urls into a friendly url that can be embedded and be used in the available online players the services have provided
                        * for youtube: src="//www.youtube.com/embed/{{video_id}}"
                        * for vimeo: src="http://player.vimeo.com/video/{{video_id}}
                        */

                       if (newVal.indexOf("vimeo") >= 0) { // Displaying a vimeo video
                           if (newVal.indexOf("player.vimeo") >= 0) {
                               embedFriendlyUrl = newVal;
                           } else {
                               embedFriendlyUrl = newVal.replace("http:", "https:");
                               urlSections = embedFriendlyUrl.split(".com/");
                               embedFriendlyUrl = embedFriendlyUrl.replace("vimeo", "player.vimeo");
                               embedFriendlyUrl = embedFriendlyUrl.replace("/" + urlSections[urlSections.length - 1], "/video/" + urlSections[urlSections.length - 1] + "");
                           }
                       } else if (newVal.indexOf("youtu.be") >= 0) {

                           index = newVal.indexOf(".be/");

                           embedFriendlyUrl = newVal.slice(index + 4, newVal.length);
                           embedFriendlyUrl = "https://www.youtube.com/embed/" + embedFriendlyUrl + youtubeParams;
                       } else if (newVal.indexOf("youtube.com") >= 0) { // displaying a youtube video
                           if (newVal.indexOf("embed") >= 0) {
                               embedFriendlyUrl = newVal + youtubeParams;
                           } else {
                               embedFriendlyUrl = newVal.replace("/watch?v=", "/embed/") + youtubeParams;
                               if (embedFriendlyUrl.indexOf('m.youtube.com') != -1) {
                                   embedFriendlyUrl = embedFriendlyUrl.replace("m.youtube.com", "youtube.com");
                               }
                           }
                       }

                       scope.url = $sce.trustAsResourceUrl(embedFriendlyUrl);
                   }
               });
           }
       };
   }]);
mod.directive('showtab',
       function () {
           return {
               link: function (scope, element, attrs) {
                   element.click(function(e) {
                       e.preventDefault();
                       $(element).tab('show');
                   });
               }
           };
       });
mod.directive('eventFocus', function(focus) {
   return function(scope, elem, attr) {
     elem.on(attr.eventFocus, function() {
       focus(attr.eventFocusId);
       $(attr.eventFocusId).focus();
     });

     // Removes bound events in the element itself
     // when the scope is destroyed
     scope.$on('$destroy', function() {
       elem.off(attr.eventFocus);
     });
   };
 });
mod.factory('focus', function($timeout, $window) {
    return function(id) {
      // timeout makes sure that it is invoked after any other event has been triggered.
      // e.g. click events that need to run before the focus or
      // inputs elements that are in a disabled state but are enabled when those events
      // are triggered.
      $timeout(function() {
        var element = $window.document.getElementById(id);
        if(element)
          element.focus();
      });
    };
  });
mod.directive('bootstrapSwitch', [
        function() {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function(scope, element, attrs, ngModel) {
                    element.bootstrapSwitch();

                    element.on('switchChange.bootstrapSwitch', function(event, state) {
                        if (ngModel) {
                            scope.$apply(function() {
                                ngModel.$setViewValue(state);
                            });
                        }
                    });

                    scope.$watch(attrs.ngModel, function(newValue, oldValue) {
                        if (newValue) {
                            element.bootstrapSwitch('state', true, true);
                        } else {
                            element.bootstrapSwitch('state', false, true);
                        }
                    });
                }
            };
        }
    ]);
mod.filter('filterByTags', function () {
  return function (items, tag) {
    // console.log("tag:", tag)
    var filtered = [];
    (items || []).forEach(function (item) {
      // Para o caso de ser uma array de tags de filtro
      // var matches = tags.some(function (tag) {
      //   return (item.tags.indexOf(tag) > -1);
      // });
      if (tag === undefined){
        matches = true
      }else{
        //Cria cópia em caracteres minusculos para comparação
        // tags_toLowerCase = item.tags.map(function(str){return (str || "").toLowerCase()})
        matches = ((item.tags || []).indexOf(tag) > -1);
      }
      if (matches) {
        filtered.push(item);
      }
    });
    return filtered;
  };
});
mod.directive('customOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.customOnChange);
      element.bind('change', onChangeHandler);
    }
  };
});
mod.directive('backImg', function(){
    return function(scope, element, attrs){
        attrs.$observe('backImg', function(value) {
            element.css({
                'background-image': 'url(' + value +')',
                'background-size' : 'cover'
            });
        });
    };
});
mod.directive('onErrorSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.onErrorSrc) {
          attrs.$set('src', attrs.onErrorSrc);
        }
      });
    }
  }
});
mod.filter('htmlToPlaintext', function() {
    return function(text) {
      return angular.element(text).text();
    }
  }
);
mod.directive('imageonload', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.$emit('imageIn');
            element.bind('load', function() {
              scope.$emit('imageLoaded');
            });
        }
    };
});
mod.directive('contenteditable', ['$timeout', '$sce', function($timeout, $sce) { return {
    restrict: 'A',
    require: '?ngModel',
    link: function(scope, element, attrs, ngModel) {
      // don't do anything unless this is actually bound to a model
      if (!ngModel) {
        return
      }

      // options
      var opts = {}
      angular.forEach([
        'stripBr',
        'noLineBreaks',
        'selectNonEditable',
        'moveCaretToEndOnChange',
      ], function(opt) {
        var o = attrs[opt]
        opts[opt] = o && o !== 'false'
      })

      // view -> model
      element.bind('input', function(e) {
        scope.$apply(function() {
          var html, html2, rerender
          html = element.html()
          rerender = false
          if (opts.stripBr) {
            html = html.replace(/<br>$/, '')
          }
          if (opts.noLineBreaks) {
            html2 = html.replace(/<div>/g, '').replace(/<br>/g, '').reevalplace(/<\/div>/g, '')
            if (html2 !== html) {
              rerender = true
              html = html2
            }
          }
          ngModel.$setViewValue(html)
          if (rerender) {
            ngModel.$render()
          }
          if (html === '') {
            // the cursor disappears if the contents is empty
            // so we need to refocus
            $timeout(function(){
              element[0].blur()
              element[0].focus()
            })
          }
        })
      })
      // model -> view
      var oldRender = ngModel.$render
      ngModel.$render = function() {
        var el, el2, range, sel
        if (!!oldRender) {
          oldRender()
        }
        element.html($sce.getTrustedHtml(ngModel.$viewValue || ''))
        if (opts.moveCaretToEndOnChange) {
          el = element[0]
          range = document.createRange()
          sel = window.getSelection()
          if (el.childNodes.length > 0) {
            el2 = el.childNodes[el.childNodes.length - 1]
            range.setStartAfter(el2)
          } else {
            range.setStartAfter(el)
          }
          range.collapse(true)
          sel.removeAllRanges()
          sel.addRange(range)
        }
      }
      if (opts.selectNonEditable) {
        element.bind('click', function(e) {
          var range, sel, target
          target = e.toElement
          if (target !== this && angular.element(target).attr('contenteditable') === 'false') {
            range = document.createRange()
            range.setEndAfter(target)
            sel.removeAllRanges()
            sel.addRange(range)
          }
        })
      }
    }
  }}])
mod.factory('SiteData', ['$http', '$location', function($http, $location){

    var siteData = $http.get('/dataLoad');
    var styleBackgrounds = $http.get('/styleBackgrounds');

    //Prepara o URL de destino do upload
    var url = document.domain;
    var urlArray = url.split(".");
    var siteNome = urlArray[0]

    var _logged = function(){
      return logged;
    }

    var _loadSiteData = function(){
      return siteData;
    }

    var _loadSiteDataLogged = function(){
      return siteData["logged"];
    }

    var _loadStyleBackgrounds = function(){
      return styleBackgrounds;
    }

    var _getSiteNome = function(){
      return siteNome;
    }

    var _getPortfolioVideoThumb = function(siteNome, id){
      img = $http.get('/dataLoadPortfolioImg/'+siteNome+"/"+id);
      console.log("img --> ",img)
      return img
    }

    var _savePortfolioOrder = function(data){
      return $http.post('/portfolio/ordena', data);
    }

    var _saveDiv = function(obj, val){
      // if (val != undefined) {val = val.trim();}
      if (val){
        // val = val.replace(/<(?:.|\n)*?>/gm, '')
        val = val.replace(/&lt;(?:.|\n)*?&gt;/gim, '')
        val = val.replace(/&nbsp;/gim, '')

      }
      return $http.post("/objSave", {obj: obj, val: val});
    }

    var _portfolioSave = function(obj, val, item_n){
      // if (val != undefined) {val = val.trim();}
      return $http.post("/portfolioSave", {obj: obj, val: val, item_n: item_n});
    }

    var _portAdd = function(id){
      return $http.post("/portfolio/add/"+id);
    }

    return {
      logged: _logged,
      loadSiteData: _loadSiteData,
      loadSiteDataLogged: _loadSiteDataLogged,
      getSiteNome: _getSiteNome,
      getPortfolioVideoThumb: _getPortfolioVideoThumb,
      savePortfolioOrder: _savePortfolioOrder,
      saveDiv: _saveDiv,
      portfolioSave: _portfolioSave,
      portAdd: _portAdd,
      loadStyleBackgrounds: _loadStyleBackgrounds
    }

  }]);
mod.controller('topCtrl', function ($scope, $http, SiteData) {
  $scope.site = {};

  SiteData.loadSiteData().then(function(response) {
    $scope.siteData = response.data;
    $scope.isLogged = response.data["logged"] == false
  })

  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
    })
  }
})
mod.controller('styleSelectCtrl', function ($scope, $http, SiteData) {
  $scope.items = [];
  SiteData.logged().then(function(response) {
    $scope.isLogged = (response.data === 'true');
  })

  SiteData.loadStyleBackgrounds().then(function(response) {
    $scope.items = response.data;
  })
})
mod.controller('navCtrl',['$scope', 'Upload', '$timeout', '$http', '$rootScope', 'SiteData', function ($scope, Upload, $timeout, $http, $rootScope, SiteData) {

  $scope.site = {};
  $scope.searchButtonText = 'Enviar'

  //Get site data
  SiteData.loadSiteData().then(function(response) {
    $scope.siteData = response.data;
    $scope.isLogged = response.data["logged"] == true
  })

  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
    })
  }

  $scope.options = {
    id: 'fundo',
    swatchOnly: true
  };

  $scope.options2 = {
    id: 'fonte',
    swatchOnly: true
  };

  // api event handlers
  $scope.eventApi_navbar_logo_color = {
      onChange: function(api, color, $event) {
        $scope.saveDiv('siteData.navbar.logo.color')
      },
      onBlur: function(api, color, $event) {
        $scope.saveDiv('siteData.navbar.logo.color')
      }
  };
  // api event handlers
  $scope.eventApi = {
      onChange: function(api, color, $event) {
        $scope.backgroundUrl_clear();
        $scope.saveDiv('siteData.navbar.backgroundColor')
      },
      onBlur: function(api, color, $event) {
        $scope.saveDiv('siteData.navbar.backgroundColor')
      }
  };
  // api event handlers
  $scope.eventApi_navbar_backgroundColor = {
      onChange: function(api, color, $event) {
        $scope.saveDiv('siteData.navbar.backgroundColor')
      },
      onBlur: function(api, color, $event) {
        $scope.saveDiv('siteData.navbar.backgroundColor')
      }
  };
  // api event handlers
  $scope.eventApi2 = {
      onChange: function(api, color, $event) {
        $scope.saveDiv('siteData.head.fontColor')
      }
  };

  $scope.backgroundUrl_clear = function(){
    $scope.siteData.head.backgroundUrl = " "
    $scope.saveDiv('siteData.head.backgroundUrl')
  }

  SiteData.loadStyleBackgrounds().then(function(response) {
    $scope.backGroundItems = response.data;
  })

  $scope.customOptions = {
    size: 30,
    roundCorners: true
  };

  $scope.optionsRandom = {
    randomColors: 10
  };

  $scope.optionsGradient = {
    start: '#BA693E',
    count: 10,
    step: 1
  };

  $scope.optionsVertical = {
    horizontal: false,
    total: 5
  };

  $scope.optionsColumn = {
    size: 30,
    columns: 10,
    roundCorners: true,
    total: 52
  };

  $scope.backgroundUrl_set = function(backgroundUrl){
    $scope.siteData.head.backgroundUrl = "http://res.cloudinary.com/radiando/image/upload/headerBackground/"+backgroundUrl
    $scope.saveDiv('siteData.head.backgroundUrl')
  }

  $scope.uploadPic = function(file) {
    $scope.UpMsg = true;
    $scope.searchButtonText = 'Enviando'
    console.log("file:", file)

    if (file) {
      $scope.searchButtonText = 'Enviando'
      file.upload = Upload.upload({
        url: "/backGroundImgUpload",
        data: {file: file}
      });

      file.upload.then(
        function (response) {
          $timeout(
            function () {
              var siteNome = SiteData.getSiteNome();
              file.result = response.data;
              console.log("siteNome:", siteNome)
              $scope.siteData.head.backgroundUrl = "http://res.cloudinary.com/radiando/image/upload/v"+parseInt(Math.random()*1000000)+"/"+siteNome+"/headerBackground/backGround.jpg"
              $scope.imgJaSubiu = true;
              $scope.imgNewSelected = false;
              $scope.picFile = undefined;
              $scope.searchButtonText = "Enviar";
              $scope.isDisabled = false;
              $scope.UpMsg=false;
           }
         );
        },
        function (response) {
          if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
        },
        function (evt) {
            // Math.min is to fix IE which reports 200% sometimes
            file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        }
      );
   }
  }



}])
mod.controller('headerCtrl',['$scope', '$rootScope', 'Upload', '$timeout', '$http', 'SiteData', '$uibModal', function ($scope, $rootScope, Upload, $timeout, $http, SiteData, $uibModal) {

  $scope.site = {};
   $scope.crop_box = false

   SiteData.loadSiteData().then(function(response) {
     $scope.siteData = response.data;
     $scope.siteData.head.avatar = "/contas/"+$scope.siteData.site_nome+"/img/"+$scope.siteData.head.avatar;
     $scope.picFile = $scope.siteData.head.avatar
     $scope.isLogged = response.data["logged"] == true
   })

   $scope.saveDiv = function(obj){
     console.log("obj:", obj)
     SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
     })
   }

   //  avatar img window Modal
   $scope.animationsEnabled = true;
   $scope.openHeaderModal = function () {
     $scope.imgSelectTriger();
     var modalInstance = $uibModal.open({
       animation: $scope.animationsEnabled,
       windowTopClass: "portfolio-modal modal",
       templateUrl: 'headerModal.html',
       controller: 'headerModalInstanceCtrl',
       windowClass: 'app-modal-window',
       size: 'lg',
       resolve: {
         item: function () {
           return 0;
         }
       }
     });
   };

   $scope.imgSelectTriger = function() {
     $timeout(function() {
       var el = document.getElementById('imgSelect');
       angular.element(el).triggerHandler('click');
     }, 0);
    };


}])
mod.directive('upload', function($rootScope) {
  return {
      restrict: 'EA',
      link: function(scope, elem, attrs) {
          elem.on("change" ,function(evt) {
              var file = evt.currentTarget.files[0];
              var reader = new FileReader();
              reader.onload = function(evt) {
                  scope.$apply(function($scope) {
                      $rootScope.myImage = evt.target.result;
                      console.log($rootScope.myImage);
                  });
              };
              reader.readAsDataURL(file);
          });
      }
    };
  });
mod.controller('headerModalInstanceCtrl', ['$scope',  '$rootScope', '$uibModalInstance', 'Upload', '$timeout', '$http', 'SiteData', function ($scope,  $rootScope, $uibModalInstance, Upload, $timeout, $http, SiteData) {

  var file, data;

  $scope.searchButtonText = "Enviar";
  $scope.isDisabled = false;

  $scope.search = function () {
    $scope.isDisabled = true;
    $scope.searchButtonText = "Enviando";
  }

  //Get site data
  SiteData.loadSiteData().then(function(response) {
    $scope.siteData = response.data;
    $scope.isLogged = response.data["logged"] == true
    var siteNome    = $scope.siteData.site_nome
    $scope.picFile = null;
    $scope.croppedDataUrl = null;
  })


  $rootScope.$on("ModalClose", function(){
      $scope.cancel();
  });

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.saveDiv = function(obj, i){
    SiteData.saveDiv(obj, $scope.$eval(obj), i).then(function(response) {
    })
  }

  // Image upload
  $scope.upload = function (dataUrl) {
    name = "avatar"
    console.log("Upload.dataUrltoBlob: ", Upload.dataUrltoBlob(dataUrl, name))
    console.log("name:", name)
    var uploadURL = '/avatarUpload'
    Upload.upload({
      //url: "https://api.cloudinary.com/v1_1/radiando/upload",
      url: uploadURL,
      // data: {
      //   upload_preset: 'iby0ddnx',
      //   tags: 'myphotoalbum',
      //   disableImageResize: false,
      //   imageMaxHeight: 600,                          // 600 is an example value
      //   maxFileSize: 20000000,                        // 20MB is an example value
      //   loadImageMaxFileSize: 20000000,               // default is 10MB
      //   acceptFileTypes: /(\.|\/)(gif|jpe?g|png|bmp|ico)$/i,
      //   imageCrop: true, // Force cropped images
      //   context: 'photo=teste22',
      //
      //   //file: dataUrl
      //   file: Upload.dataUrltoBlob(dataUrl, name),
      // }
      data: {file: Upload.dataUrltoBlob(dataUrl, name)},
    }).then(function (response) {
      $timeout(function () {
        $scope.result = response.data;
        $scope.crop_box = false
        $scope.siteData.head.avatar = dataUrl
        $scope.flgUploadOk = true;
        $scope.cancel()
      });
    }, function (response) {
      if (response.status > 0) $scope.errorMsg = response.status
            + ': ' + response.data;
    }, function (evt) {
      $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
    });
  }
  $scope.CropBoxOpen = function(){
    $scope.flgUploadOk = false;
    $scope.res = $scope.siteData.head.avatar
    $scope.siteData.head.avatar = ""
    $scope.crop_box = true
  }
  $scope.uploadCancel = function(){
    $scope.siteData.head.avatar = $scope.res
    $scope.crop_box = false
  }
//
//
//
// Assign blob to component when selecting a image
$scope.cropped = {
    source: 'https://raw.githubusercontent.com/Foliotek/Croppie/master/demo/demo-1.jpg'
  };
 $scope.handleFileSelect = function (evt) {
   console.log("---j---")

   var file = evt.currentTarget.files[0];
   var input = this;




   if (file) {

     if (navigator.userAgent.match(/iP(hone|od|ad)/i)) {
         var canvas = document.createElement('canvas'),
             mpImg = new MegaPixImage(file);

         canvas.width = mpImg.srcImage.width;
         canvas.height = mpImg.srcImage.height;

         EXIF.getData(file, function () {
             var orientation = EXIF.getTag(this, 'Orientation');

             mpImg.render(canvas, {
                 maxHeight: 256,
                 orientation: orientation
             });
             setTimeout(function () {
                 var tt = canvas.toDataURL("image/jpeg", 1);
                 $scope.$apply(function ($scope) {
                     $scope.cropped.source = tt;
                 });
             }, 100);
         });
     } else {


     var reader = new FileReader();

     reader.onload = function (e) {
       // bind new Image to Component
       $scope.$apply(function () {
         $scope.cropped.source = e.target.result;
       });
     }

     reader.readAsDataURL(file);
   }

 }


 };

//
//
//

    //
    //
    //
    console.log("!!!!!!!!!!")

    $scope.blockingObject = {block: true};
    $scope.callTestFuntion = function () {
        $scope.blockingObject.render(function (dataURL) {
            console.log('via render');
            console.log(dataURL.length);
            //Faz o upload
            $scope.upload(dataURL,"avatar.png")
        });
    };
    $scope.blockingObject.callback = function (dataURL) {
        console.log('via function');
        console.log(dataURL.length);
    };
    $scope.size = 'small';
    $scope.type = 'circle';
    $scope.imageDataURI = '';
    $scope.resImageDataURI = '';
    $scope.resBlob = {};
    $scope.urlBlob = {};
    $scope.resImgFormat = 'image/png';
    $scope.resImgQuality = 100;
    $scope.selMinSize = 20;
    $scope.selInitSize = [{w: 256, h: 256}];
    $scope.resImgSize = [{w: 256, h: 256}, {w: 256, h: 256}];
    //$scope.aspectRatio=1.2;
    $scope.onChange = function ($dataURI) {
        console.log('onChange fired');
    };
    $scope.onLoadBegin = function () {
        console.log('onLoadBegin fired');
    };
    $scope.onLoadDone = function () {
        console.log('onLoadDone fired');
    };
    $scope.onLoadError = function () {
        console.log('onLoadError fired');
    };
    $scope.getBlob = function () {
        console.log($scope.resBlob);
    };
    $scope.handleFileSelect_ = function (evt) {
        console.log("!!22!!22")
        var file = evt.currentTarget.files[0];
        reader = new FileReader();
        if (navigator.userAgent.match(/iP(hone|od|ad)/i)) {
            var canvas = document.createElement('canvas'),
                mpImg = new MegaPixImage(file);

            canvas.width = mpImg.srcImage.width;
            canvas.height = mpImg.srcImage.height;

            EXIF.getData(file, function () {
                var orientation = EXIF.getTag(this, 'Orientation');

                mpImg.render(canvas, {
                    maxHeight: $scope.resImgSize,
                    orientation: orientation
                });
                setTimeout(function () {
                    var tt = canvas.toDataURL("image/jpeg", 1);
                    $scope.$apply(function ($scope) {
                        $scope.imageDataURI = tt;
                    });
                }, 100);
            });
        } else {
            console.log("else");
            reader.onload = function (evt) {
                $scope.$apply(function ($scope) {
                    //console.log(evt.target.result);
                    $scope.imageDataURI = evt.target.result;
                });
            };
            reader.readAsDataURL(file);
        }
    };
    // angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect);
      $scope.$watch('resImageDataURI', function () {
          //console.log('Res image', $scope.resImageDataURI);
      });
}]);
mod.controller('imgGridCtrl',['$scope', '$http','$timeout', '$rootScope', '$uibModal', '$log', '$location', 'SiteData', 'deviceDetector', function ($scope, $http, $timeout, $rootScope, $uibModal, $log, $location, SiteData, deviceDetector) {

  //$scope.aa = 22
  //Busca informações do device que está utilizando o site
  var vm = this;
  vm.data = deviceDetector;
  vm.allData = JSON.stringify(vm.data, null, 2);

  $scope.getRandomSpan = function(){
    return parseInt(Math.random()*1000000);
  }

  //Get site data
  SiteData.loadSiteData().then(function(response) {
    var siteNome = response.data.info.name
    $scope.siteData = response.data;

    //Force images reload cache
    for (index = 0; index < $scope.siteData.portfolio.items.length; index++) {
      $scope.siteData.portfolio.items[index].img +='?decache=' + (Math.random()*1000);
    }

    $scope.isLogged = response.data["logged"] == true
    $scope.isSelected = false;
    portfolioItemsTags_update()
  })

  $scope.saveDiv = function(obj){
    console.log(obj, $scope.$eval(obj));
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {})
  }

  $rootScope.$on("CallDelImg", function(event, id){
    delImg(id);
  });

  $rootScope.$on("ImgChange", function(event, id, src){
    console.log("id, src: ", id, src)
    ImgChange(id, src)
  });


  $rootScope.$on("portfolioItemsTags_update", function(event){
    portfolioItemsTags_update()
  });

  $scope.stripFileType = function (filename) {
    return parts.replace(/\..+$/, '');
  }

  function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
  }

  function cleanArray(actual) {
    var newArray = new Array();
    for (var i = 0; i < actual.length; i++) {
      if (actual[i]) {
        newArray.push(actual[i]);
      }
    }
    return newArray;
  }

  // Atualizar as lista de #18BC9Ctags no campo itemTags
  var portfolioItemsTags_update = function (){
    HTMLsanitizeRegex = /(<([^>]+)>)/ig
    $scope.siteData.portfolio.itemsTags = []
    $scope.siteData.portfolio.items.forEach(function(item){
      if (item.tags){
        item.tags.forEach(function(tag){
          if (tag){
            console.log(">>>>tag:", tag)
            tag = tag.replace(HTMLsanitizeRegex, "")
            tag = tag.replace(/&nbsp;/g, "");
            tag = tag.replace(/'/g, "");
            tag = tag.replace(/^\s+|\s+$/gm,''); // trim left and right
            // tag = tag.charAt(0).toUpperCase() + tag.substr(1);
            $scope.siteData.portfolio.itemsTags.push(tag)
          }
        })
        $scope.siteData.portfolio.itemsTags = cleanArray($scope.siteData.portfolio.itemsTags)
        $scope.siteData.portfolio.itemsTags = $scope.siteData.portfolio.itemsTags.filter(onlyUnique)
      }
    })
    $scope.saveDiv("portfolio.itemsTags")
  }

 /*
  var ImgChange = function (src, id, conta, flgSetAllPath){
    if (flgSetAllPath){
      src = "/contas/"+conta+"/img/portfolio/"+src
    }
    //Seleciona o item pelo ID
    id = "192-1483898166846"
    alert(id)
    console.log("id:", id)
    $scope.portfolio.items.filter(function(v, index, arr) {
      console.log("index:>", index)
      console.log("arr:>", arr)
      return v.id === id; // Filter out the appropriate one
    }).img = $sce.trustAsResourceUrl(src); // Get result and access the foo property
    console.log("portfolio.items[0].img --> ", $scope.portfolio.items[0].img)
  }
 */

  var ImgChange = function (id, src){
    console.log("id:", id)
    $scope.siteData.portfolio.items.filter(function(el) {
      console.log("el:>", el)
      return el.id === id; // Filter out the appropriate one
    }).img = src; // Get result and access the foo property
    //console.log("portfolio.items[0].img --> ", $scope.portfolio.items[0].img)
  }

  var videoThumbChange = function (src, id, conta){
    //Seleciona o item pelo ID
    $scope.siteData.portfolio.items.filter(function(v) {
      return v.id === id; // Filter out the appropriate one
    }).img = src; // Get result and access the foo property
  }

  var delImg = function(id){
    console.log("del img id:"+id)
    itemRemoved = $scope.siteData.portfolio.items.filter(function(v) {
      console.log(v)
      return v.id.toString() !== id; // Filter out the appropriate one
    })
    $scope.siteData.portfolio.items = itemRemoved
  };

  $scope.valueSelected = function (value) {
    if (value === null) $scope.tagSelect = undefined;
    if (value == "") $scope.filtraZero();
  };

  $scope.filtraZero = function () {
    $scope.tagSelect = undefined;
  };

  $scope.portfolio_add = function () {
    //var siteNome = SiteData.getSiteNome()
    var newId = Date.now().toString();
    itemNew = {
      "id"     : newId,
      "titulo" : "",
      "mediaType" : "image",
      "img"    : "",
      "img_"   : "",
      "txt"    : "",
      "nome"   : "",
      "site"   : "",
      "data"   : "",
      "servico": "",
      "tags"    : ""
    }
    //Salva no disco o novo registro
    SiteData.portAdd(newId).then(function(response) {})
    $scope.siteData.portfolio.items = $scope.siteData.portfolio.items || []
    $scope.siteData.portfolio.items.push(itemNew)
    $scope.preOpen(itemNew, $scope.siteData.portfolio.items.length-1)
  };
  //
  //  Modal
  //
  $scope.animationsEnabled = true;
  $scope.preOpen = function (portfolioItem){
  $scope.openBaseStyle(portfolioItem)
    /*
    if ($scope.isLogged && (vm.data.device == "iphone" || vm.data.device == "android")) {
      //$scope.openDeviceOnEditModeStyle(item, i)
      $scope.openBaseStyle(portfolioItem)
    }
    else{
      $scope.openBaseStyle(portfolioItem)
      //$scope.openDeviceOnEditModeStyle(item, i)
    }
    */
  }

  $scope.openDeviceOnEditModeStyle = function (item, i){
    window.location.href = "cardPanel?"+i
  }

  $scope.openBaseStyle = function (portfolioItem) {
    siteNome = SiteData.getSiteNome()
    console.log("+siteNome>>", siteNome);
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      windowTopClass: "portfolio-modal modal",
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      backdrop: 'static',
      size: 'lg',
      resolve: {
        siteNome: function () {
          return siteNome;
        },
        item: function () {
          return portfolioItem;
        }
      }
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };

  $scope.$watch('isSelected', function() {
    $log.info('Selection changed.');

     if (vm.data.device == "iphone") {
        $scope.barConfig = {
          disabled: !$scope.isSelected,
          handle: ".tile",
          onSort: function (evt){
            console.log("$scope.isLogged:",$scope.isLogged)
            if ($scope.isLogged) {
              SiteData.savePortfolioOrder(evt.models).success(function () {})
            }
          }
        };
     }else{
        $scope.barConfig = {
          disabled: !$scope.isSelected,
          onSort: function (evt){
            console.log("$scope.isLogged:",$scope.isLogged)
            if ($scope.isLogged) {
              SiteData.savePortfolioOrder(evt.models).success(function () {})
            }
          }
        };
     }
  });

  $scope.toggle = function() {
    $scope.isSelected = $scope.isSelected === true ? false : true;
  };

  $scope.setUndefined = function() {
    $scope.isSelected = undefined;
  };

  $scope.toggleActivation = function() {
    $scope.isActive = !$scope.isActive;
  }

}]);
mod.controller('ModalInstanceCtrl', function ($scope, $sce, $rootScope, $uibModalInstance, $timeout, SiteData, siteNome, item, JSTagsCollection) {

  $scope.item = item;
  $scope.tags = item.tags

  function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
  }

  function cleanArray(actual) {
    var newArray = new Array();
    for (var i = 0; i < actual.length; i++) {
      if (actual[i]) {
        newArray.push(actual[i]);
      }
    }
    return newArray;
  }

  SiteData.loadSiteData().then(function(response) {
    $scope.siteData = response.data;
    $scope.isLogged = response.data["logged"] == true
    // Build JSTagsCollection
    //console.log($scope.tags);
    $scope.tagsJoin = ""
    if ($scope.tags) $scope.tagsJoin = $scope.tags.join(", ");
    $scope.tags = new JSTagsCollection($scope.tags);
    // Export jsTags options, inlcuding our own tags object
    $scope.jsTagOptions = {
      'edit': $scope.isLogged === true,
      'tags': $scope.tags
    };
    // **** Typeahead code **** //
    // Build suggestions array
    // $scope.portfolio.itemsTags = $scope.portfolio.itemsTags.map(function(x){ return x.toLowerCase() })

    var suggestions = $scope.siteData.portfolio.itemsTags || []
    suggestions = suggestions.map(function(item) { return { "suggestion": item } });

    // Instantiate the bloodhound suggestion engine
    var suggestions = new Bloodhound({
      datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.suggestion); },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: suggestions
    });

    // Initialize the bloodhound suggestion engine
    suggestions.initialize();

    // Single dataset example
    $scope.exampleData = {
      displayKey: 'suggestion',
      source: suggestions.ttAdapter()
    };

    // Typeahead options object
    $scope.exampleOptions = {
      hint: false,
      highlight: true
    };

    // mediaService.getHash('https://www.youtube.com/watch?v=uPU9cEK5YsM')
    //  .then(function(data) {
    //    $scope.video_thumb = data.preview_thumb;
    //  });


  })

  $rootScope.$on("ModalClose", function(){
      $scope.cancel();
  });

  $scope.cancel = function (status) {
    if (status){
      flgCancelConfirm = confirm('Tem certeza que quer cancelar o envio da imagem?');
      if(flgCancelConfirm){
       $uibModalInstance.dismiss('cancel');
      }
    }else{
       $uibModalInstance.dismiss('cancel');
    }
  };

  $scope.saveDiv = function(obj){
    id = $scope.item.id
    SiteData.portfolioSave(obj, $scope.$eval(obj), id).then(function(response) {
       $rootScope.$emit("portfolioItemsTags_update");
    })
  }

  $scope.saveTags = function(tags){
    $scope.item.tags = []
    var id = $scope.item.id
    for(var index in tags.tags) {
        $scope.item.tags[index] = tags.tags[index].value
    }
    //Limpa itens nulos ou vazios
    item.tags = item.tags.filter(function(n){ return n != undefined });

    console.log("item.tags>", item.tags,id)
    $scope.saveDiv("item.tags")
    $rootScope.$emit("portfolioItemsTags_update");
  }
});
mod.controller('MyFormCtrl', ['$scope',  '$rootScope', 'Upload', '$timeout', '$http', 'SiteData', '$sce', function ($scope,  $rootScope, Upload, $timeout, $http, SiteData, $sce) {

  $scope.imgUploadBtn = true;
  $scope.imgJaSubiu = false;

  var upDestino = '/portfolio/uploadPic/'+$scope.item.id
  var upDestino2 = '/portfolio/uploadVideo/'+$scope.item.id
  console.log($scope.item.id)

  $scope.searchButtonText = "Enviar";
  $scope.test = "false";
  $scope.isDisabled = false;

  $scope.isImage = function (filename) {
    var parts = filename.split('.');
    return parts[parts.length - 1] == 'jpg';
  }

  $scope.search = function () {
    $scope.isDisabled = true;
    $scope.test = "true";
    $scope.searchButtonText = "Enviando";
  }

  $scope.searchButtonText = "Enviar imagem"
  $scope.searchButtonText2 = "Enviar vídeo"

  //$scope.item.img = $sce.trustAsResourceUrl($scope.item.img.toString());
  $scope.item.img_ = "";

  $scope.uploadPic = function(file) {
    $scope.UpMsg = true;
    $scope.searchButtonText = 'Enviando'
    //Pegando a extenção do arquivo
    fileExt = file.name.split('.').pop();
    //var dotIndex = file.name.lastIndexOf('.');
    //var ext = file.name.substring(dotIndex);
    //var new_name = Date.now().toString()+ext;
    //var new_name = $scope.item.id+ext;
    var new_name = $scope.item.id+"."+fileExt;
    console.log("file:", file)

    if (file) {
      file.upload = Upload.upload({
        url: upDestino,
        data: {new_name: new_name, file: file},
      });

      file.upload.then(
        function (response) {
          $timeout(
            function () {
              file.result = response.data;
              console.log("siteNome:", siteNome)
              //$rootScope.$emit("ImgChange", new_name, $scope.item.id, siteNome);
              //src = "contas/"+siteNome+"/img/portfolio/"+new_name+"?decache=" + Math.random();
              src = new_name+"?decache=" + Math.random();
              //src = "http://res.cloudinary.com/radiando/image/upload/v"+parseInt(Math.random()*1000000)+"/"+siteNome+"/"+new_name;
              //src = siteNome+"/"+new_name+"?"+parseInt(Math.random()*1000000)
              //$scope.item.img = $sce.trustAsResourceUrl(src)

              $scope.item.img = src
              console.log("$scope.item.img:", $scope.item.img);
              //$rootScope.$emit("ImgChange", $scope.item.id, src);
              $scope.item.mediaType = "image"
              $scope.imgJaSubiu = true;
              $scope.imgNewSelected = false;
              $scope.picFile = undefined;
              aa = false
              $scope.searchButtonText = "Enviar";
              $scope.isDisabled = false;
              $scope.UpMsg=false;
           }
         );
        },
        function (response) {
          if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
        },
        function (evt) {
            // Math.min is to fix IE which reports 200% sometimes
            file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        }
      );
   }
  }

  $scope.uploadVideo = function(file) {
    $scope.UpMsg=true;
    $scope.searchButtonText2 = 'Enviando'
    //Pegando a extenção do arquivo
    //var dotIndex = file.name.lastIndexOf('.');
    //var ext = file.name.substring(dotIndex);
    //var new_name = Date.now().toString()+ext;
    //var new_name = $scope.item.id+ext;
    var new_name = $scope.item.id;
    console.log("file:", file)
    console.log("new_name:", new_name)
    if (file) {
      file.upload = Upload.upload({
        url: upDestino2,
        data: {new_name: new_name, file: file},
      });

      file.upload.then(
        function (response) {
          $timeout(
            function () {
              $scope.portfolio
              file.result = response.data;
              console.log("siteNome:", siteNome)
              //$rootScope.$emit("ImgChange", new_name, $scope.item.id, siteNome);
              src = "contas/"+siteNome+"/img/portfolio/"+new_name+"?decache=" + Math.random();
              console.log("src:", src)
              //src = "http://res.cloudinary.com/radiando/video/upload/v"+parseInt(Math.random()*1000000)+"/"+siteNome+"/"+new_name;
              //src = siteNome+"/"+new_name
              // $scope.item.img = $sce.trustAsResourceUrl(src.toString())
              // $scope.item.img_ = $sce.trustAsResourceUrl(src.toString())
              $scope.item.img = src.toString()
              $scope.item.img_ = src.toString()
              $scope.item.mediaType = "video"
              $scope.imgJaSubiu = true;
              $scope.imgNewSelected = false;
              $scope.picFile = undefined;
              aa = false
              $scope.searchButtonText2 = "Enviar vídeo";
              $scope.isDisabled = false;
              $scope.UpMsg=false;
           }
         );
        },
        function (response) {
          if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
        },
        function (evt) {
          // Math.min is to fix IE which reports 200% sometimes
          file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        }
      );
    }
  }

  $scope.up = function(){
    angular.element('#file').trigger('click');
  };

  $scope.videoAlt = function(src){
    $scope.item.img = src
  }

  $scope.excluir = function(){
    item_id = $scope.item.id
    if(confirm('Confirma exclusão?')){
     $http.post('/portfolio/delete/'+item_id);
     $rootScope.$emit("CallDelImg", item_id);
     $rootScope.$emit("ModalClose", item_id);
     $rootScope.$emit("portfolioItemsTags_update");
    }
  };

  $scope.saveDiv = function(obj){
    id = $scope.item.id
    SiteData.portfolioSave(obj, $scope.$eval(obj), id).then(function(response) {
       $rootScope.$emit("portfolioItemsTags_update");
       //Testa se é um video para atualizar a imagem do grid
       console.log("obj", obj);
       if (obj == "item.video"){
         console.log("$scope.$eval(obj) --> ",$scope.$eval(obj));
         console.log("$scope.videoThumb($scope.$eval(obj)) --> ", $scope.videoThumb($scope.$eval(obj)))
         getVideoPreviewImg($scope.$eval(obj), function(responseText) {
            console.log("$scope.item.id>>>",$scope.item.id)
            $scope.item.img = responseText
            // $rootScope.$emit("ImgChange", responseText, $scope.item.id, siteNome, false);
         });

       }
    })
  }

  $scope.openImgSelect = function() {
    $timeout(function() {
        var el = document.getElementById('imgSelect');
        el.click();
    }, 0);
  };

  //
  //  Video preview image
  //
  function parseURL (url) {
      url.match(/(http:|https:|)\/\/(player.|www.|m.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);
      if (RegExp.$3.indexOf('youtu') > -1) {
          var type = 'youtube';
      } else if (RegExp.$3.indexOf('vimeo') > -1) {
          var type = 'vimeo';
      }
      return {
          type: type,
          id: RegExp.$6
      };
  }
  var getVideoPreviewImg = (function(e, cb) {
    var videoDetails = parseURL(e);
    var videoType = videoDetails.type;
    var videoID = videoDetails.id;

    if (videoType == 'youtube') {
      var thumbSRC = 'https://img.youtube.com/vi/' + videoID + '/0.jpg';
      cb(thumbSRC)
    }
    else if (videoType == 'vimeo') {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "https://vimeo.com/api/v2/video/"+ videoID +".json", true);
      xhr.onload = function (e) {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            var data = xhr.responseText;
            var parsedData = JSON.parse(data);
            thumbSRClarge = parsedData[0].thumbnail_large;
            // split url of large thumbnail at 640
            thumbSplit = thumbSRClarge.split(/\d{3}(?=.jpg)/);
            // add 1280x720 to parts and get bigger thumbnail
            thumbSRC = thumbSplit[0] + '1280x720' + thumbSplit[1];
            cb(thumbSRC)
          } else {
            console.error(xhr.statusText);
          }
        }
      };
      xhr.onerror = function (e) {
        console.error(xhr.statusText);
      };
      xhr.send(null);
    }
  });

  $scope.videoThumb = function(videoUrl) {
    getVideoPreviewImg(videoUrl, function(responseText) {
       console.log(">",responseText)
       return responseText
    });
  }



}]);
mod.controller('aboutCtrl', function ($scope, $rootScope, $timeout, $http, SiteData) {
  $scope.about = {};

  SiteData.loadSiteData().then(function(response) {
    $scope.siteData = response.data;
    $scope.isLogged = response.data["logged"] == true

    //Verifica se apenas a primeira caixa de texto está preechida
    //para centraliza-la
    $scope.about_body1_offset = 2;

    if (!$scope.isLogged &&
       ($scope.siteData.about.body2 == null ||
       !$scope.siteData.about.body2.length > 0)) {
       $scope.about_body1_offset = 4;
    }

  })

  $scope.saveDiv = function(obj){
    console.log("obj:>", obj);
    console.log($scope.$eval(obj));
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
    })
  }
})
mod.controller('ContactCtrl', function ($scope, $rootScope, $timeout, $http, SiteData) {

  //Get site data
  SiteData.loadSiteData().then(function(response) {
    $scope.siteData = response.data;
    $scope.isLogged = response.data["logged"] == true
    $scope.siteNome  = $rootScope.siteData.info.name
  })

  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
    })
  }
})
mod.controller('footerCtrl', function ($scope, $rootScope, $timeout, $http, SiteData) {

  $scope.footer = {};

  //Get site data
  SiteData.loadSiteData().then(function(response) {
    $scope.siteData = response.data;
    $scope.isLogged = response.data["logged"] == true
    $scope.siteNome  = $rootScope.siteData.info.name
  })

  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
    })
  }

})
mod.controller('loginCtrl', function ($scope, $http, SiteData) {

  $scope.site = {};

  //Get site data
  SiteData.loadSiteData().then(function(response) {
    $scope.siteData = response.data;
    $scope.isLogged = response.data["logged"] == false
    $scope.siteNome  = $scope.siteData.info.name
  })

  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
    })
  }
})
