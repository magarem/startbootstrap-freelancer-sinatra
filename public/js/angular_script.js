var mod = angular.module("myapp", ['ng.deviceDetector', 'frapontillo.bootstrap-switch', 'ngSanitize',  'ngFileUpload', 'ngCroppie', 'ngImgCrop', 'ng-sortable', 'ngAnimate', 'ui.bootstrap']);

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

mod.directive("masonry", function () {
   var NGREPEAT_SOURCE_RE = '<!-- ngRepeat: ((.*) in ((.*?)( track by (.*))?)) -->';
    return {
        compile: function(element, attrs) {
            // auto add animation to brick element
            var animation = attrs.ngAnimate || "'masonry'";
            var $brick = element.children();
            $brick.attr("ng-animate", animation);

            // generate item selector (exclude leaving items)
            var type = $brick.prop('tagName');
            var itemSelector = type+":not([class$='-leave-active'])";

            return function (scope, element, attrs) {
                var options = angular.extend({
                    itemSelector: itemSelector
                }, scope.$eval(attrs.masonry));

                // try to infer model from ngRepeat
                if (!options.model) {
                    var ngRepeatMatch = element.html().match(NGREPEAT_SOURCE_RE);
                    if (ngRepeatMatch) {
                        options.model = ngRepeatMatch[4];
                    }
                }

                // initial animation
                element.addClass('masonry');

                var nImages=0;
                var nImagesLoaded=0;
                scope.$on('imageIn', function(){
                  nImages++;
                });
                scope.$on('imageLoaded', function(){
                  if(++nImagesLoaded===nImages)
                    element.masonry("reload");
                });



                // Wait inside directives to render
                setTimeout(function () {
                    element.masonry(options);

                    element.on("$destroy", function () {
                        element.masonry('destroy')
                    });

                    if (options.model) {
                        scope.$apply(function() {
                            scope.$watchCollection(options.model, function (_new, _old) {
                                if(_new == _old) return;

                                // Wait inside directives to render
                                setTimeout(function () {
                                    element.masonry("reload");
                                });
                            });
                        });
                    }
                });
            };
        }
    };
})
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
            html2 = html.replace(/<div>/g, '').replace(/<br>/g, '').replace(/<\/div>/g, '')
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
            sel = window.getSelection()
            range.setStartBefore(target)
            range.setEndAfter(target)
            sel.removeAllRanges()
            sel.addRange(range)
          }
        })
      }
    }
  }}])

mod.factory('SiteData', ['$http', '$location', function($http, $location){

    // var url = document.URL;
    // var urlArray = url.split("/");
    // var siteNome = urlArray[urlArray.length-1];
    // var siteData = {}

    var url = document.domain;
    var urlArray = url.split(".");
    var siteNome = urlArray[0];
    var siteData = {}

    console.log("url:", siteNome);

    var _logged2 = function(){
      return logged;
    }

    var _logged = function(){

      logged = $http.get('/'+siteNome+'/logged');
      console.log("logged",logged)
      return logged;
    }

    var _loadSiteData = function(){
      console.log("!!")
      siteData = $http.get('/'+siteNome+'/dataLoad');
      return siteData;
    }

    var _getSiteData = function(){
      return siteData;
    }

    var _savePortfolioOrder = function(data){
      return $http.post('/'+siteNome+'/portfolio/ordena', data);
    }

    var _saveDiv = function(obj, val, item_n){
      if (val != undefined) {val = val.trim();}
      console.log(obj, val, item_n);
      // val = val.replace(/&nbsp;/g, "");
      // val = val.replace(/, /g, ",");
      // val = val.replace(/ ,/g, ",");
      // val = val.replace(/'/g, "");
      console.log(obj, val, item_n);
      return $http.post("/"+siteNome+"/objSave", {obj: obj, val: val, item_n: item_n});
    }

    var _portAdd = function(){
      // console.log(obj);
      return $http.post("/"+siteNome+"/portfolio/add");
    }

    return {
      logged2: _logged2,
      logged: _logged,
      loadSiteData: _loadSiteData,
      getSiteData: _getSiteData,
      savePortfolioOrder: _savePortfolioOrder,
      saveDiv: _saveDiv,
      portAdd: _portAdd
    }

  }]);

mod.controller('topCtrl', function ($scope, $http, SiteData) {

  $scope.site = {};
  $scope.isLogged = 0;

  SiteData.logged().then(function(response) {
    $scope.isLogged = parseInt(response.data);
    console.log(">>[$scope.isLogged]>>",response.data);
  })

   SiteData.loadSiteData().then(function(response) {
    $scope.site = response.data;
    console.log("SiteData[top]:", response.data);
  })

  $scope.saveDiv = function(obj){
    console.log(obj);
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
       // console.log(response.data);
    })
  }
})

mod.controller('navCtrl',['$scope', '$rootScope', 'SiteData', function ($scope, $rootScope, SiteData) {

  $scope.site = {};
  $scope.isLogged = 0;

  SiteData.logged2().then(function(response) {
    $scope.isLogged = (response.data === 'true');
    $rootScope.isLogged = $scope.isLogged
    console.log(">>[ttt]>>",response.data);
  })

  SiteData.getSiteData().then(function(response) {
    $scope.site = response.data;
    console.log("SiteData[1]:", response.data);
  })

  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
  })
  }
}])

//
//
// headerCtrl
//

mod.controller('headerCtrl',['$scope', 'Upload', '$timeout', '$http', 'SiteData', '$uibModal', function ($scope, Upload, $timeout, $http, SiteData, $uibModal) {

  $scope.site = {};
  $scope.isLogged = 0;
  $scope.crop_box = false

  SiteData.logged2().then(function(response) {
    $scope.isLogged = (response.data === 'true');
    console.log(">>[$scope.isLogged]>>",response.data);
  })

  SiteData.getSiteData().then(function(response) {
    $scope.site = response.data;
    $scope.picFile = $scope.site.pages.home.img;
  })

  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
       // console.log(response.data);
    })
  }

  $scope.imgSelectTriger = function() {

    $timeout(function() {
        var el = document.getElementById('imgSelect');
        angular.element(el).triggerHandler('click');
    }, 0);
  };

  //
  //
  // Modal
  //
  //
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

}])

//
//
// headerModalInstanceCtrl
//
//
mod.controller('headerModalInstanceCtrl', ['$scope',  '$rootScope', '$uibModalInstance', 'Upload', '$timeout', '$http', 'SiteData', function ($scope,  $rootScope, $uibModalInstance, Upload, $timeout, $http, SiteData) {

  // $scope.item = item;

  $scope.isLogged = false;

  SiteData.logged2().then(function(response) {
    $scope.isLogged = (response.data === 'true');
    console.log(">>[$scope.isLogged]>>",response.data);
  })

   SiteData.getSiteData().then(function(response) {
    $scope.site = response.data;
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
       // console.log(response.data);
    })
  }

  //
  // >> Envio da imagem
  //

  //Prepara o URL de destino do upload
  var url = document.domain;
  var urlArray = url.split(".");
  var siteNome = urlArray[0]
  var updestino = '/'+siteNome+'/avatar/upload'
    //Prepara o URL de destino do upload

    $scope.upload = function (dataUrl, name) {

      console.log("!!name>", Upload.dataUrltoBlob(dataUrl, name))
      //name = "avatar"

      Upload.upload({
        url: updestino,
        data: {
            file: Upload.dataUrltoBlob(dataUrl, name)
        },
      }).then(function (response) {
        $timeout(function () {
          $scope.result = response.data;
          $scope.crop_box = false
          $scope.site.pages.home.img = dataUrl
          $scope.flgUploadOk = true;
          console.log("Sucesso!>", dataUrl)
          //$rootScope.$emit("ImgChange", new_name, $scope.i, siteNome);
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
       $scope.res = $scope.site.pages.home.img
       $scope.site.pages.home.img = ""
       $scope.crop_box = true
     }

      $scope.uploadCancel = function(){
         $scope.site.pages.home.img = $scope.res
         $scope.crop_box = false
     }

}]);


mod.controller('imgGridCtrl',['$scope', '$http','$timeout', '$rootScope', '$uibModal', '$log', 'SiteData', 'deviceDetector', function ($scope, $http, $timeout, $rootScope, $uibModal, $log, SiteData, deviceDetector) {

  //Busca informações do device que está utilizando o site
  var vm = this;
  vm.data = deviceDetector;
  vm.allData = JSON.stringify(vm.data, null, 2);

  // switch button
  $scope.isSelected = 'nope';
  $scope.onText = 'Arrastar';
  $scope.offText = 'Fixo';
  $scope.isActive = true;
  $scope.size = 'normal';
  $scope.animate = true;
  $scope.radioOff = true;
  $scope.handleWidth = "auto";
  $scope.labelWidth = "auto";
  $scope.inverse = true;

  SiteData.getSiteData().then(function(response) {
    $scope.site = response.data;
    $scope.imgs = response.data.pages.portfolio.items;
    console.log("SiteData[imgGridCtrl]:", $scope.imgs);
    categoriasUpdate();
  })

  SiteData.logged2().then(function(response) {
    console.log("SiteData[imgGridCtrl]:", response.data === 'true');
    $scope.isLogged = (response.data === 'true');

    //confere se está logado para bloquear o img drag
    $scope.isSelected = $scope.isLogged

  })

  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {})
  }

  $rootScope.$on("CallDelImg", function(event, item_index){
    delImg(item_index);
  });

  $rootScope.$on("ImgChange", function(event, src, index, siteNome){
    ImgChange(src, index, siteNome)
  });

  $rootScope.$on("categoriasUpdate", function(event){
    console.log("categoriasUpdate:", event)
    categoriasUpdate()
  });

  function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
  }

  var categoriasUpdate = function (){

    regex = /(<([^>]+)>)/ig
    b = []
    // $scope.imageCategories = $scope.imgs.map(function(val){return val.cat.replace(regex, "").split(",")})[0]
    $scope.imgs.forEach(function(x){
      if (x.cat != null){
        v = x.cat.replace(regex, "")

        if (v.split(",").length > 1){
            v.split(",").forEach(function(t){

              console.log("t (origin) >>", "["+t+"]")
              t = t.replace(/&nbsp;/g, "");
              t = t.replace(/'/g, "");
              t = t.replace(/^\s+|\s+$/gm,''); // trim left and right
              console.log("t (limpo) >>", "["+t+"]")

              b.push(t)
            })
        }else{
          b.push(v)
        }
      }
    })

    //Altera a primeira letra para caixa alta
    for( i = 0 ; i < b.length ; i++){
        b[i] = b[i].charAt(0).toUpperCase() + b[i].substr(1);
    }

    //limpa html das categorias
    $scope.imageCategories = b.filter( onlyUnique )
    $scope.imageCategories = $scope.imageCategories.filter(function(ele){
        return ele !== '';
    });

    console.log("$scope.imgs:",$scope.imgs)
  }

  var ImgChange = function (src, index, conta){
    console.log("$scope.imgs[index].img:", $scope.imgs[index].img)
    src = "/contas/"+conta+"/img/portfolio/"+src

    $scope.imgs[index].img = src
  }

  var delImg = function(item_index){
    console.log("item_index:",item_index)
    $scope.imgs.splice(item_index, 1)
  };

  $scope.valueSelected = function (value) {
    if (value === null) $scope.catselect = undefined;
  };

  $scope.filtraZero = function () {
        $scope.catselect = undefined;
  };

  $scope.portfolio_add = function () {
    console.log("+")
    img_new =  {
      "id"     : 0,
      "titulo" : "",
      "img"    : "http://placehold.it/360x260/e67e22/fff/imagem",
      "txt"    : "",
      "nome"   : "",
      "site"   : "",
      "data"   : "",
      "servico": "",
      "cat"    : ""
    }
    //Salva no disco o novo registro
    SiteData.portAdd().then(function(response) {})
    $scope.imgs.push(img_new)
    console.log($scope.imgs.length)
    $scope.open(img_new, $scope.imgs.length-1)
  };

  //
  //
  // Modal
  //
  //
  $scope.animationsEnabled = true;
  $scope.open = function (item, i) {
    console.log("i:",i)
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      windowTopClass: "portfolio-modal modal",
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: 'lg',
      resolve: {
        item: function () {
          return item;
        },
        i: function () {
          return i;
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
    //if ($scope.isSelected=="yep") $log.info($scope.isSelected)
  };

  $scope.setUndefined = function() {
    $scope.isSelected = undefined;
  };

  $scope.toggleActivation = function() {
    $scope.isActive = !$scope.isActive;

  }

}]);


mod.controller('ModalInstanceCtrl', function ($scope, $rootScope, $uibModalInstance, $timeout, SiteData, item, i) {

  $scope.item = item;
  $scope.a = 10;
  $scope.i = i;

  console.log("item.titulo>", item)

  $scope.isLogged = false;

  SiteData.logged2().then(function(response) {
    $scope.isLogged = (response.data === 'true');
    console.log(">>[$scope.isLogged]>>",response.data);
  })

  $rootScope.$on("ModalClose", function(){
      $scope.cancel();
  });

  $scope.cancel = function (status) {
    if (status){
      deleteUser = confirm('Tem certeza que quer cancelar o envio da imagem?');
      if(deleteUser){
       //Your action will goes here
       $uibModalInstance.dismiss('cancel');
      }
    }else{
      $uibModalInstance.dismiss('cancel');
    }
  };

  $scope.saveDiv = function(obj, i){
    SiteData.saveDiv(obj, $scope.$eval(obj), i).then(function(response) {
       // console.log(response.data);
       $rootScope.$emit("categoriasUpdate");
    })
  }
});

//
//
//    MyFormCtrl
//
//
//

mod.controller('MyFormCtrl', ['$scope',  '$rootScope', 'Upload', '$timeout', '$http', 'SiteData', function ($scope,  $rootScope, Upload, $timeout, $http, SiteData) {

  $scope.flgImg=true;
  $scope.flgCropBox=false
  $scope.imgUploadBtn = true;

  $scope.imgJaSubiu = false;

  var url = document.domain;
  var urlArray = url.split(".");
  var siteNome = urlArray[0]
  var updestino = '/'+siteNome+'/portfolio/uploadPic/'+$scope.i

//   $scope.upload = function (dataUrl, name, picFile) {

//     console.log(picFile)
//     //Pegando a extenção do arquivo
//     var dotIndex = name.lastIndexOf('.');
//     var ext = name.substring(dotIndex);
//     var new_name = Date.now().toString()+ext;
//     var new_name2 = Date.now().toString()+"_2"+ext;

//     Upload.upload({
//       url: updestino,
//       data: {
//         file: Upload.dataUrltoBlob(dataUrl, new_name)
//       },
//     }).then(function (response) {
//       $timeout(function () {
//         $scope.result = response.data;
//         //console.log("Sucesso!>", dataUrl)
//         $rootScope.$emit("ImgChange", new_name, $scope.i, siteNome);

//         $scope.flgImg=true;
//         $scope.flgCropBox=false
//       });
//     }, function (response) {
//       if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
//     }, function (evt) {
//       $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
//     });
// }


$scope.uploadPic = function(file) {




    //Pegando a extenção do arquivo
    var dotIndex = file.name.lastIndexOf('.');
    var ext = file.name.substring(dotIndex);
    var new_name = Date.now().toString()+ext;

    file.upload = Upload.upload({
      url: updestino,
      data: {new_name: new_name, file: file},
    });

    file.upload.then(function (response) {
      $timeout(function () {
        file.result = response.data;
        $rootScope.$emit("ImgChange", new_name, $scope.i, siteNome);
        $scope.imgJaSubiu = true;
        $scope.imgNewSelected = false;
        $scope.picFile = false;
        aa = false
        console.log("aa, $scope.picFile>>",aa,$scope.picFile);
      });
    }, function (response) {
      if (response.status > 0)
        $scope.errorMsg = response.status + ': ' + response.data;
    }, function (evt) {
      // Math.min is to fix IE which reports 200% sometimes
      file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });
}


  $scope.isLogged = false;

  SiteData.logged2().then(function(response) {
    $scope.isLogged = (response.data === 'true');
    console.log(">>[$scope.isLogged]>>",response.data);
  })

  $scope.up = function(){
    angular.element('#file').trigger('click');
  };

  $scope.excluir = function(item_index){
    var url = document.domain;
    var urlArray = url.split(".");
    var siteNome = urlArray[0];

    console.log("Excluir:",item_index);

    if(confirm('Confirma exclusão?')){
     $http.post('/'+siteNome+'/portfolio/delete/'+item_index);
     $rootScope.$emit("CallDelImg", item_index);
     $rootScope.$emit("ModalClose", item_index);
    }
  };

  $scope.saveDiv = function(obj, i){

    SiteData.saveDiv(obj, $scope.$eval(obj), i).then(function(response) {

       $rootScope.$emit("categoriasUpdate");
    })
  }

  $scope.openImgSelect = function() {
    console.log("openImgSelect")
    $timeout(function() {
        var el = document.getElementById('imgSelect');
        el.click();
    }, 0);
  };



}]);


mod.controller('aboutCtrl', function ($scope, $http, SiteData) {

  $scope.isLogged = false;

  SiteData.logged2().then(function(response) {
    $scope.isLogged = (response.data === 'true');
    console.log(">>[$scope.isLogged]>>",response.data);
  })

  $scope.about = {};
  SiteData.getSiteData().then(function(response) {
    str = response.data.pages.about
    $scope.about = str
    $scope.about_body1 = str.body1
    console.log("SiteData[aboutCtrl]:", str);
  })
  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
       // console.log(response.data);
    })
  }

})

mod.controller('ContactCtrl', function ($scope, $http, SiteData) {

  // $scope.site = {};

  $scope.isLogged = false;

  SiteData.logged2().then(function(response) {
    $scope.isLogged = (response.data === 'true');
    console.log(">>[$scope.isLogged]>>",response.data);
  })

  SiteData.getSiteData().then(function(response) {
    str = response.data.pages.contact
    $scope.contact = str
    console.log("SiteData[aboutCtrl]:", str);
    $scope.site = response.data
  })

  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
       console.log("contact>>>", response.data);
    })
  }

})

mod.controller('footerCtrl', function ($scope, $http, SiteData) {

  $scope.site = {};
   SiteData.getSiteData().then(function(response) {
    $scope.site = response.data;
    console.log("SiteData[footerCtrl]:", response.data);
  })

  $scope.saveDiv = function(obj){
    console.log(obj);
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
       // console.log(response.data);
    })
  }

 $scope.isLogged = false;

  SiteData.logged2().then(function(response) {
    $scope.isLogged = (response.data === 'true');
    console.log(">>[$scope.isLogged]>>",response.data);
  })
})

mod.controller('loginCtrl', function ($scope, $http, SiteData) {

  $scope.site = {};
   SiteData.getSiteData().then(function(response) {
    $scope.site = response.data;
    console.log("SiteData[login]:", response.data);
  })

  $scope.saveDiv = function(obj){
    console.log(obj);
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
       // console.log(response.data);
    })
  }
})
