var mod = angular.module("myapp", ['ngYoutubeEmbed',
                                   'color.picker',
                                   'siyfion.sfTypeahead',
                                   'jsTag',
                                   'ng.deviceDetector',
                                   'ngSanitize',
                                   'ngFileUpload',
                                   'ngImgCrop',
                                   'ng-sortable',
                                   'ngAnimate',
                                   'ui.bootstrap']);
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
           template: '<div class="anguvideo">' +
           '<iframe class="videoClass" type="text/html" width="{{width}}" height="{{height}}" ng-src="{{url}}" allowfullscreen frameborder="0"></iframe>' +
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
        matches = (item.tags.indexOf(tag) > -1);
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
    $scope.site = response.data;
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
mod.controller('navCtrl',['$scope', '$rootScope', 'SiteData', function ($scope, $rootScope, SiteData) {
  $scope.site = {};
  SiteData.loadSiteData().then(function(response) {
    $scope.navbar = response.data.navbar;
    $scope.isLogged = response.data["logged"] == true
  })

  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
  })
  }
}])
mod.controller('headerCtrl',['$scope', 'Upload', '$timeout', '$http', 'SiteData', '$uibModal', function ($scope, Upload, $timeout, $http, SiteData, $uibModal) {

  $scope.site = {};
  $scope.crop_box = false

  $scope.options = {
    id: 'fundo',
  };

  $scope.options2 = {
    id: 'fonte',
  };

  // api event handlers
  $scope.eventApi = {
      onChange: function(api, color, $event) {
        $scope.backgroundUrl_clear();
        $scope.saveDiv('head.backgroundColor')
      },
      onBlur: function(api, color, $event) {
        $scope.saveDiv('head.backgroundColor')
      }
  };
  // api event handlers
  $scope.eventApi2 = {
      onChange: function(api, color, $event) {
        $scope.saveDiv('head.fontColor')
      }
  };

  $scope.backgroundUrl_clear = function(){
    $scope.head.backgroundUrl = ""
    $scope.saveDiv('head.backgroundUrl')
  }

  $scope.backGroundItems = [];

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
    $scope.head.backgroundUrl = backgroundUrl
    $scope.saveDiv('head.backgroundUrl')
  }

  SiteData.loadSiteData().then(function(response) {
    $scope.head = response.data.head;
    $scope.picFile = $scope.head.avatar;
    $scope.isLogged = response.data["logged"] == true
  })

  $scope.saveDiv = function(obj){
    console.log("!!obj:", obj)
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
    })
  }

  $scope.imgSelectTriger = function() {
    $timeout(function() {
      var el = document.getElementById('imgSelect');
      angular.element(el).triggerHandler('click');
    }, 0);
  };

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

  $scope.uploadPic = function(file) {
    var siteNome = SiteData.getSiteNome();
    //Pegando a extenção do arquivo
    var dotIndex = file.name.lastIndexOf('.');
    var fileExt = file.name.substring(dotIndex);

     file.upload = Upload.upload({
       url: '/backGroundImgUpload',
       data: {file: file},
     });

     file.upload.then(function (response) {
       $timeout(function () {
         file.result = response.data;
         console.log("file.result:", file);
         $scope.head.backgroundUrl = "/contas/"+siteNome+"/img/backGround/backGround.jpg?decache=" + Math.random()

       });
     }, function (response) {
       if (response.status > 0)
         $scope.errorMsg = response.status + ': ' + response.data;
     }, function (evt) {
       // Math.min is to fix IE which reports 200% sometimes
       file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
       //$scope.site.head.backgroundUrl = "/contas/"+siteNome+"/img/backGround/backGround"+fileExt+"?decache=" + Math.random()
     });
     }
}])
mod.controller('headerModalInstanceCtrl', ['$scope',  '$rootScope', '$uibModalInstance', 'Upload', '$timeout', '$http', 'SiteData', function ($scope,  $rootScope, $uibModalInstance, Upload, $timeout, $http, SiteData) {

  $scope.searchButtonText = "Enviar";
  $scope.test = "false";
  $scope.isDisabled = false;

  $scope.search = function () {
    $scope.isDisabled = true;
    $scope.test = "true";
    $scope.searchButtonText = "Enviando";
  }

  SiteData.loadSiteData().then(function(response) {
    var siteNome = SiteData.getSiteNome()
    $scope.head = response.data.head;
    $scope.picFile = null;
    $scope.croppedDataUrl = null;
    $scope.isLogged = response.data["logged"] == true
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
  $scope.upload = function (dataUrl, name) {
    var uploadURL = '/avatarUpload'
    Upload.upload({
      url: uploadURL,
      data: {
          file: Upload.dataUrltoBlob(dataUrl, name)
      },
    }).then(function (response) {
      $timeout(function () {
        $scope.result = response.data;
        $scope.crop_box = false
        $scope.head.avatar = dataUrl
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
    $scope.res = $scope.head.avatar
    $scope.head.avatar = ""
    $scope.crop_box = true
  }
  $scope.uploadCancel = function(){
    $scope.head.avatar = $scope.res
    $scope.crop_box = false
  }
}]);
mod.controller('imgGridCtrl',['$scope', '$http','$timeout', '$rootScope', '$uibModal', '$log', '$location', 'SiteData', 'deviceDetector', function ($scope, $http, $timeout, $rootScope, $uibModal, $log, $location, SiteData, deviceDetector) {

  //Busca informações do device que está utilizando o site
  var vm = this;
  vm.data = deviceDetector;
  vm.allData = JSON.stringify(vm.data, null, 2);

  SiteData.loadSiteData().then(function(response) {
    var siteNome = response.data.info.name
    $scope.portfolio = response.data.portfolio;
    $scope.isLogged = response.data["logged"] == true
    $scope.isSelected = false;
  })

  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {})
  }

  $rootScope.$on("CallDelImg", function(event, id){
    delImg(id);
  });

  $rootScope.$on("ImgChange", function(event, src, id, siteNome, flgSetAllPath){
    flgSetAllPath = flgSetAllPath || false;
    console.log("src -->", src)

    // ImgChange(src, id, siteNome, flgSetAllPath)
  });


  $rootScope.$on("portfolioItemsTags_update", function(event){
    portfolioItemsTags_update()
  });

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
    $scope.portfolio.itemsTags = []
    $scope.portfolio.items.forEach(function(item){
      if (item.tags){
        item.tags.forEach(function(tag){
          if (tag){
            console.log(">>>>tag:", tag)
            tag = tag.replace(HTMLsanitizeRegex, "")
            tag = tag.replace(/&nbsp;/g, "");
            tag = tag.replace(/'/g, "");
            tag = tag.replace(/^\s+|\s+$/gm,''); // trim left and right
            // tag = tag.charAt(0).toUpperCase() + tag.substr(1);
            $scope.portfolio.itemsTags.push(tag)
          }
        })
        $scope.portfolio.itemsTags = cleanArray($scope.portfolio.itemsTags)
        $scope.portfolio.itemsTags = $scope.portfolio.itemsTags.filter(onlyUnique)
      }
    })
    $scope.saveDiv("portfolio.itemsTags")
  }

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
    }).img = src; // Get result and access the foo property
    console.log("portfolio.items[0].img --> ", $scope.portfolio.items[0].img)
  }

  var videoThumbChange = function (src, id, conta){
    //Seleciona o item pelo ID
    $scope.portfolio.items.filter(function(v) {
      return v.id === id; // Filter out the appropriate one
    }).img = src; // Get result and access the foo property
  }

  var delImg = function(id){
    console.log("id>"+id)
    itemRemoved = $scope.portfolio.items.filter(function(v) {
      console.log(v)
      return v.id.toString() !== id; // Filter out the appropriate one
    })
    $scope.portfolio.items = itemRemoved
  };

  $scope.valueSelected = function (value) {
    if (value === null) $scope.tagSelect = undefined;
    if (value == "") $scope.filtraZero();
  };

  $scope.filtraZero = function () {
        $scope.tagSelect = undefined;
  };

  $scope.portfolio_add = function () {
    var siteNome = SiteData.getSiteNome()
    var newId = siteNome+"-"+Date.now().toString();
    itemNew = {
      "id"     : newId,
      "titulo" : "",
      "img"    : "http://placehold.it/360x260/e67e22/fff/imagem",
      "txt"    : "",
      "nome"   : "",
      "site"   : "",
      "data"   : "",
      "servico": "",
      "tags"    : ""
    }
    //Salva no disco o novo registro
    SiteData.portAdd(newId).then(function(response) {})
    $scope.portfolio.items.push(itemNew)
    $scope.preOpen(itemNew, $scope.portfolio.items.length-1)
  };
  //
  //  Modal
  //
  $scope.animationsEnabled = true;
  $scope.preOpen = function (portfolioItem){
    if ($scope.isLogged && (vm.data.device == "iphone" || vm.data.device == "android")) {
      //$scope.openDeviceOnEditModeStyle(item, i)
      $scope.openBaseStyle(portfolioItem)
    }
    else{
      $scope.openBaseStyle(portfolioItem)
      //$scope.openDeviceOnEditModeStyle(item, i)
    }
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
mod.controller('ModalInstanceCtrl', function ($scope, $rootScope, $uibModalInstance, $timeout, SiteData, siteNome, item, JSTagsCollection) {

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
    $scope.portfolio = response.data.portfolio;
    $scope.isLogged = response.data["logged"] == true
    console.log($scope.isLogged === true)
    // Build JSTagsCollection
    console.log($scope.tags);
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

    var suggestions = $scope.portfolio.itemsTags || []
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
      deleteUser = confirm('Tem certeza que quer cancelar o envio da imagem?');
      if(deleteUser){
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
mod.controller('MyFormCtrl', ['$scope',  '$rootScope', 'Upload', '$timeout', '$http', 'SiteData', function ($scope,  $rootScope, Upload, $timeout, $http, SiteData) {

  $scope.imgUploadBtn = true;
  $scope.imgJaSubiu = false;

  var upDestino = '/portfolio/uploadPic/'+$scope.item.id
  console.log($scope.item.id)

  $scope.searchButtonText = "Enviar";
  $scope.test = "false";
  $scope.isDisabled = false;

  $scope.search = function () {
    $scope.isDisabled = true;
    $scope.test = "true";
    $scope.searchButtonText = "Enviando";
  }

  $scope.uploadPic = function(file) {
    //Pegando a extenção do arquivo
    var dotIndex = file.name.lastIndexOf('.');
    var ext = file.name.substring(dotIndex);
    //var new_name = Date.now().toString()+ext;
    var new_name = $scope.item.id+ext;

    file.upload = Upload.upload({
      url: upDestino,
      data: {new_name: new_name, file: file},
    });

    file.upload.then(
      function (response) {
        $timeout(
          function () {
            $scope.portfolio
            file.result = response.data;
            console.log("siteNome:", siteNome)
            $rootScope.$emit("ImgChange", new_name, $scope.item.id, siteNome);
            src = "contas/"+siteNome+"/img/portfolio/"+new_name+"?decache=" + Math.random();
            $scope.item.img = src
            $scope.imgJaSubiu = true;
            $scope.imgNewSelected = false;
            $scope.picFile = false;
            aa = false
            $scope.searchButtonText = "Enviar";
            $scope.isDisabled = false;
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
mod.controller('aboutCtrl', function ($scope, $http, SiteData) {
  $scope.about = {};
  SiteData.loadSiteData().then(function(response) {
    $scope.about = response.data.about
    $scope.isLogged = response.data["logged"] == true
  })
  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
    })
  }
})
mod.controller('ContactCtrl', function ($scope, $http, SiteData) {
  SiteData.loadSiteData().then(function(response) {
    $scope.siteNome = response.data.info.name
    $scope.contact = response.data.contact
    $scope.isLogged = response.data["logged"] == true
  })

  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
    })
  }
})
mod.controller('footerCtrl', function ($scope, $http, SiteData) {

  $scope.footer = {};

  SiteData.loadSiteData().then(function(response) {
    $scope.footer = response.data.footer;
    $scope.isLogged = response.data["logged"] == true
  })

  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
    })
  }

})
mod.controller('loginCtrl', function ($scope, $http, SiteData) {

  $scope.site = {};

  SiteData.loadSiteData().then(function(response) {
    $scope.site = response.data;
  })

  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
    })
  }
})
