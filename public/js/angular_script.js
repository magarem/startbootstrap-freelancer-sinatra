var mod = angular.module("myapp", ['siyfion.sfTypeahead', 'jsTag', 'ng.deviceDetector', 'frapontillo.bootstrap-switch', 'ngSanitize', 'ngFileUpload', 'ngImgCrop', 'ng-sortable', 'ngAnimate', 'ui.bootstrap']);

mod.filter('filterByTags', function () {
  return function (items, tag) {
    console.log("tag:", tag)
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

    var logged = $http.get('/logged');
    var siteData = $http.get('/dataLoad');

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

    var _getSiteNome = function(){
      return siteNome;
    }

    var _savePortfolioOrder = function(data){
      return $http.post('/portfolio/ordena', data);
    }

    var _saveDiv = function(obj, val, item_n){
      // if (val != undefined) {val = val.trim();}
      return $http.post("/objSave", {obj: obj, val: val, item_n: item_n});
   }

    var _portAdd = function(id){
      return $http.post("/portfolio/add/"+id);
    }

    return {
      logged: _logged,
      loadSiteData: _loadSiteData,
      getSiteNome: _getSiteNome,
      savePortfolioOrder: _savePortfolioOrder,
      saveDiv: _saveDiv,
      portAdd: _portAdd
    }

  }]);

mod.controller('topCtrl', function ($scope, $http, SiteData) {

  $scope.site = {};
  $scope.isLogged = false;

  SiteData.logged().then(function(response) {
    $scope.isLogged = (response.data === 'true');
  })

  SiteData.loadSiteData().then(function(response) {
    $scope.site = response.data;
  })

  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
    })
  }
})

mod.controller('navCtrl',['$scope', '$rootScope', 'SiteData', function ($scope, $rootScope, SiteData) {

  $scope.site = {};
  $scope.isLogged = false;

  SiteData.logged().then(function(response) {
    $scope.isLogged = (response.data === 'true');
  })

  SiteData.loadSiteData().then(function(response) {
    $scope.site = response.data;
  })

  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
  })
  }
}])

mod.controller('headerCtrl',['$scope', 'Upload', '$timeout', '$http', 'SiteData', '$uibModal', function ($scope, Upload, $timeout, $http, SiteData, $uibModal) {

  $scope.site = {};
  $scope.isLogged = false;
  $scope.crop_box = false

  SiteData.logged().then(function(response) {
    $scope.isLogged = (response.data === 'true');
  })
  SiteData.loadSiteData().then(function(response) {
    $scope.site = response.data;
    $scope.picFile = $scope.site.pages.home.img;
  })

  $scope.saveDiv = function(obj){
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

}])

mod.controller('headerModalInstanceCtrl', ['$scope',  '$rootScope', '$uibModalInstance', 'Upload', '$timeout', '$http', 'SiteData', function ($scope,  $rootScope, $uibModalInstance, Upload, $timeout, $http, SiteData) {

  $scope.isLogged = false;
  $scope.searchButtonText = "Enviar";
  $scope.test = "false";
  $scope.isDisabled = false;

  $scope.search = function () {
    $scope.isDisabled = true;
    $scope.test = "true";
    $scope.searchButtonText = "Enviando";
  }

  SiteData.logged().then(function(response) {
    $scope.isLogged = (response.data === 'true');
  })

   SiteData.loadSiteData().then(function(response) {
    $scope.site = response.data;
    $scope.picFile = null;
    $scope.croppedDataUrl = null;
    var siteNome = $scope.site.name

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
        $scope.site.pages.home.img = dataUrl
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
    $scope.res = $scope.site.pages.home.img
    $scope.site.pages.home.img = ""
    $scope.crop_box = true
  }
  $scope.uploadCancel = function(){
    $scope.site.pages.home.img = $scope.res
    $scope.crop_box = false
  }
}]);

mod.controller('imgGridCtrl',['$scope', '$http','$timeout', '$rootScope', '$uibModal', '$log', '$location', 'SiteData', 'deviceDetector', function ($scope, $http, $timeout, $rootScope, $uibModal, $log, $location, SiteData, deviceDetector) {

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

  SiteData.loadSiteData().then(function(response) {
    var siteNome = response.data.name
    console.log("siteNome:", siteNome);
    $scope.portfolio = response.data.pages.portfolio;
    $scope.portfolioItems = response.data.pages.portfolio.items;
    $scope.portfolioItemsTags = response.data.pages.portfolio.itemsTags;
    // portfolioItemsTags_update();
  })

  SiteData.logged().then(function(response) {
    $scope.isLogged = (response.data === 'true');
    //confere se está logado para bloquear o img drag
    $scope.isSelected = $scope.isLogged
  })

  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {})
  }

  $rootScope.$on("CallDelImg", function(event, id){
    delImg(id);
  });

  $rootScope.$on("ImgChange", function(event, src, id, siteNome){
    ImgChange(src, id, siteNome)
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

  // Atualizar as lista de tags no campo itemTags
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

  var ImgChange = function (src, id, conta){
    src = "/contas/"+conta+"/img/portfolio/"+src+"?decache=" + Math.random();
    //Seleciona o item pelo ID
    $scope.portfolio.items.filter(function(v) {
      return v.id === id; // Filter out the appropriate one
    }).img = src; // Get result and access the foo property
  }

  var delImg = function(id){
    itemRemoved = $scope.portfolio.items.filter(function(v) {
      return v.id !== id; // Filter out the appropriate one
    })
    $scope.portfolio.items = itemRemoved
  };

  $scope.valueSelected = function (value) {
    if (value === null) $scope.tagSelect = undefined;
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
      "cat"    : ""
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
    $scope.portfolio = response.data.pages.portfolio;
    console.log($scope.tags)
    // Build JSTagsCollection
    $scope.tags = new JSTagsCollection($scope.tags);
    // Export jsTags options, inlcuding our own tags object
    $scope.jsTagOptions = {
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
  })

  $scope.isLogged = false;

  SiteData.logged().then(function(response) {
    $scope.isLogged = (response.data === 'true');
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
    SiteData.saveDiv(obj, $scope.$eval(obj), id).then(function(response) {
       $rootScope.$emit("portfolioItemsTags_update");
    })
  }

  $scope.saveTags = function(tags){
    $scope.item.tags = []
    var id = $scope.item.id
    for(var index in tags.tags) {
        $scope.item.tags[index] = tags.tags[index].value
    }
    console.log("item.tags>", item.tags,id)
    $scope.saveDiv("item.tags")
    $rootScope.$emit("portfolioItemsTags_update");
  }
});

mod.controller('ModalInstanceCtrl2', function ($scope, $rootScope, $timeout, SiteData, JSTagsCollection) {

  //caso de edição via telefone:
  //Pega o valor do id do item via querystring
  var url = document.URL;
  var urlArray = url.split("?");
  var id = Number(urlArray[1])

  function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
  }

  SiteData.getSiteData().then(function(response) {
    $scope.item = response.data.pages.portfolio.items[id];
    $scope.items = response.data.pages.portfolio.items;
    $scope.i = id;

    var categoriasUpdate = function (){

      regex = /(<([^>]+)>)/ig
      b = []
      // $scope.imageCategories = $scope.imgs.map(function(val){return val.cat.replace(regex, "").split(",")})[0]
      $scope.items.forEach(function(x){
        if (x.cat != null){
          v = x.cat.replace(regex, "")
          if (v.split(",").length > 1){
              v.split(",").forEach(function(t){
                t = t.replace(/&nbsp;/g, "");
                t = t.replace(/'/g, "");
                t = t.replace(/^\s+|\s+$/gm,''); // trim left and right
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
    }

    categoriasUpdate()


      catArray = $scope.item.cat.split(",")
      for (y=0; y<catArray.length; y++){
        newObj = catArray[y]

        $scope.tags.push(newObj);
      }

     console.log($scope.tags)

      // Build JSTagsCollection
      $scope.tags = new JSTagsCollection($scope.tags);

      // Export jsTags options, inlcuding our own tags object
      $scope.jsTagOptions = {
        'tags': $scope.tags
      };

      // **** Typeahead code **** //

      // Build suggestions array
      var suggestions = $scope.imageCategories
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
  })

  $scope.isLogged = false;

  SiteData.logged2().then(function(response) {
    $scope.isLogged = (response.data === 'true');
  })

  $scope.cancel = function (status) {
    if (status){
      deleteUser = confirm('Tem certeza que quer cancelar o envio da imagem?');
      if(deleteUser){
       location.href='/#/_botton';
      }
    }else{
      location.href='/#/_botton';
    }
  };

  $scope.saveDiv = function(obj, i){
    SiteData.saveDiv(obj, $scope.$eval(obj), i).then(function(response) {
       $rootScope.$emit("categoriasUpdate");
    })
  }

  attr = []
  $scope.saveTags = function(tags, i){
    console.log(tags)
    for(var index in tags.tags) {
       attr[index] = tags.tags[index].value
    }
    console.log("attr>", attr.join(),i)
    $scope.item.cat = attr.join()
    $scope.saveDiv("item.cat", i)
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

  $scope.isLogged = false;

  SiteData.logged().then(function(response) {
    $scope.isLogged = (response.data === 'true');
  })

  $scope.up = function(){
    angular.element('#file').trigger('click');
  };

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
    SiteData.saveDiv(obj, $scope.$eval(obj), id).then(function(response) {
       $rootScope.$emit("portfolioItemsTags_update");
    })
  }

  $scope.openImgSelect = function() {
    $timeout(function() {
        var el = document.getElementById('imgSelect');
        el.click();
    }, 0);
  };

}]);

mod.controller('MyFormCtrl2', ['$scope',  '$rootScope', 'Upload', '$timeout', '$http', 'SiteData', function ($scope,  $rootScope, Upload, $timeout, $http, SiteData) {

  //Pega o nome do site
  var url = document.domain;
  var urlArray = url.split(".");
  var siteNome = urlArray[0];

  //Pega o id da cartão
  var url = document.URL;
  if (url.indexOf("?")){
    var urlArray = url.split("?");
    $scope.i = Number(urlArray[1])
  }

  $scope.imgUploadBtn = true;
  $scope.imgJaSubiu = false;

  var updestino = '/portfolio/uploadPic/'+$scope.i
  console.log($scope.i)

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
    var new_name = Date.now().toString()+ext;

    file.upload = Upload.upload({
      url: updestino,
      data: {new_name: new_name, file: file},
    });

    file.upload.then(function (response) {
      $timeout(function () {
        file.result = response.data;
        $rootScope.$emit("ImgChange", new_name, $scope.i, siteNome);
        src = "contas/"+siteNome+"/img/portfolio/"+new_name+"?decache=" + Math.random();
        $scope.item.img = src
        $scope.imgJaSubiu = true;
        $scope.imgNewSelected = false;
        $scope.picFile = false;
        aa = false
        $scope.searchButtonText = "Enviar";
        $scope.isDisabled = false;
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

    if(confirm('Confirma exclusão?')){
     $http.post('/portfolio/delete/'+item_index);
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
    $timeout(function() {
        var el = document.getElementById('imgSelect');
        el.click();
    }, 0);
  };

}]);

mod.controller('aboutCtrl', function ($scope, $http, SiteData) {

  $scope.isLogged = false;
  SiteData.logged().then(function(response) {
    $scope.isLogged = (response.data === 'true');
  })

  $scope.about = {};
  SiteData.loadSiteData().then(function(response) {
    $scope.about = response.data.pages.about
  })
  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
    })
  }
})

mod.controller('ContactCtrl', function ($scope, $http, SiteData) {

  $scope.isLogged = false;

  SiteData.logged().then(function(response) {
    $scope.isLogged = (response.data === 'true');
  })

  SiteData.loadSiteData().then(function(response) {
    $scope.site = response.data
    $scope.contact = response.data.pages.contact
  })

  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
    })
  }
})

mod.controller('footerCtrl', function ($scope, $http, SiteData) {

  $scope.site = {};
  $scope.isLogged = false;

  SiteData.loadSiteData().then(function(response) {
    $scope.site = response.data;
  })

  $scope.saveDiv = function(obj){
    SiteData.saveDiv(obj, $scope.$eval(obj)).then(function(response) {
    })
  }

  SiteData.logged().then(function(response) {
    $scope.isLogged = (response.data === 'true');
  })
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
