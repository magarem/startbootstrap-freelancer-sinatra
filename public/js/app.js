Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    count: 0,
    siteData: ""
  },
  mutations: {
  	increment: state => state.count++,
    decrement: state => state.count--,
    set_siteData: function(state, data){
       this.state.siteData = data
    },
    set_avatar: function(state, data){
       this.state.siteData.head.avatar = data
       console.log(this.state.siteData.head.avatar)
    }
  }
})

Vue.directive('sortable', {
  inserted: function (el, binding) {
    new Sortable(el, binding.value || {})
  }
})
Vue.component('edit', {
    template: `<component :is="tag" contenteditable="true" @blur="onBlur" @input="$emit('update:content', $event.target.innerText)"></component>`,
    props: ['tipo', 'content','content2', 'tag'],
    mounted: function () {
      if (this.tipo=='2'){
        console.log("this.content2:[",this.content2,"]")
        this.$el.innerText = this.content2;
      }else{
        this.$el.innerText = eval("this.$root."+this.content);
      }
        $('[contenteditable]').attr('contenteditable', this.$root.siteData.logged);
        if (this.$root.siteData.logged){
          $('[contenteditable]').addClass("editArea");
        }else{
          $('[contenteditable]').removeClass("editArea");
        }
    },
    watch: {
        content: function () {
          if (this.content2){
            this.$el.innerText = this.content2;
          }else{
            this.$el.innerText = eval("this.$root."+this.content);
          }
        }
    },
    methods:{
      update:function(event){
        this.$emit('update',event.target.innerText);
      },
      onBlur:function(){
        // console.log(siteData)
        this.saveDiv (this.content, event.target.innerText)
        console.log(this.$root.siteData)
      },
      saveDiv: function(obj, val){
        // if (val != undefined) {val = val.trim();}
        //val = eval(obj)
        console.log("obj:", obj)
        console.log("val:", val)
        if (val){
          // val = val.replace(/<(?:.|\n)*?>/gm, '')
          val = val.replace(/&lt;(?:.|\n)*?&gt;/gim, '')
          val = val.replace(/&nbsp;/gim, '')
        }
        this.$http.post("/objSave",{obj: obj, val: val})
           .then(function (response) {
              // Success
              console.log("success")
             },function (response) {
              // Error
              console.log("Error")
             }
           );
      }

    }
})

Vue.component('modal', {
  template: '#modal-template',
  props: {
    show: {
      type: Boolean,
      required: true,
      twoWay: true
    }
  }
})

Vue.component('avatar', {
    template: `<div style="height: 380px;  margin:auto;"><div :id=id></div><input type="file" id="btn-upload" name=file value="Selecionar imagem" accept="image/*" @change="processFile($event)"/><button id="btn-usar" @click="onSave()">Usar</button></div>`,
    props: ['id'],
    data: function () {
      return {
        basic: ""
      }
    },
    mounted: function () {
      console.log(this.basic)
      // this.basic = $('#'+this.id).croppie({
      //   enableExif: true,
      //   viewport: {
      //     width: 260,
      //     height: 260,
      //     type: 'circle'
      //   },
      //   boundary: {
      // 		width: 300,
      // 		height: 300
      // 	}
      // });
      // this.basic.croppie('bind', {
      //   url: '',
      //   points: [0,0,150,150]
      // });
    },
    methods:{
      processFile:function(event) {
         this.readFile(event.target.files[0]);
       },
      readFile:function(input) {
        var self = this
      	if (input) {
          if (this.basic) $('#t1').croppie('destroy');
          this.basic = $('#'+this.id).croppie({
            enableExif: true,
            viewport: {
              width: 260,
              height: 260,
              type: 'circle'
            },
            boundary: {
          		width: 300,
          		height: 300
          	}
          });
          this.basic.croppie('bind', {
            url: '',
            points: [0,0,150,150]
          });

              var reader = new FileReader();
              reader.onload = function (e) {
                console.log(self.basic)
                self.basic.croppie('bind', {
                  url: e.target.result
                }).then(function(){
              		console.log('jQuery bind complete');
              	});
              }
              reader.readAsDataURL(input);
          }
          else {
            swal("Sorry - you're browser doesn't support the FileReader API");
        }
      },
      onSave:function (){
        var self = this
        console.log("onSave")
        this.basic.croppie('result', {
      	 			type: 'rawcanvas',
      				circle: true,
              format: 'png'
          }).then(function (canvas) {
              // src = canvas.toDataURL()
              // html = '<img src="' + src + '" />'
              var DOM_img = document.createElement("img");
              DOM_img.src = canvas.toDataURL()
              //console.log(self.siteData.head)
              //atualiza a imagem da capa
              // this.siteData.head.avatar = DOM_img.src
              store.commit('set_avatar', DOM_img.src)

              // div_preview.appendChild(DOM_img);
              console.log(DOM_img)
              // var posting = $.post( "/upload", {file: DOM_img.src} ).done(function( data ) {
              //   alert( "Data Loaded: " + data );
              // });
              // var form = $('form')[0]; // You need to use standard javascript object here
              // var formData = new FormData(form)
              // var img = formData.get('file');
              // console.log("formData:", formData)
              const url = "/upload";
              fetch(url, {
                method: 'POST',
                // mode: 'cors', // pode ser cors ou basic(default)
                // redirect: 'follow',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
               },
                body: JSON.stringify({file: DOM_img.src})

              }).then(function(response) {
                console.log(response)
                // tratar a response
                self.basic = {}
                // $('#t1').cropper("destroy");
                $('#t1').croppie('destroy');
                $('#headerModal').modal('hide')
              });


      		});

       }
    }
})

var dataURL = '/dataLoad';
new Vue({
  el: '#app',
  data: {
    // siteData: {},
    siteName: window.location.host.split('.')[0],
    ak: 2,
    dataIsLoaded:false,
    showModal: false,
    tagSelector: 'all'
  },
  created: function () {
    this.fetchData();

    // this.loadFont(this.siteData.navbar.logo.fontFamily)
  },
  updated: function (){
    //Carregas as fontes do Google
    this.set_siteData()
    this.loadFont(this.siteData.navbar.logo.fontFamily)
    this.loadFont(this.siteData.head.fontFamily)

  },
  methods: {
    increment () {
      store.commit('increment')
    },
    decrement () {
      store.commit('decrement')
    },
    set_siteData (){
      store.commit('set_siteData', this.siteData)
    },
    getItemsTags: function(event) {
      //Pega a lista de todas as tags utilizadas
      let itemsTags = []
      this.siteData.portfolio.items.forEach( function(s) {
         (s.tags || []).forEach( function(tag) {
            itemsTags.push(tag);
         })
      } );
      //Retira os valores duplicados e faz uma ordenação alfabética
      itemsTags = itemsTags.filter((x, i, a) => a.indexOf(x) == i).sort()
      console.log("itemsTags:",itemsTags)
      this.siteData.portfolio.itemsTags = itemsTags
    },
    select: function(event) {
      this.tagSelector = event
      console.log(event); // returns 'foo'
    },
    tt: function(x) {
      console.log(x); // returns 'foo'
    },
    saveDiv: function(obj, val){
      // if (val != undefined) {val = val.trim();}
      //val = eval(obj)
      console.log("obj:", obj)
      console.log("val:", val)
      if (val){
        // val = val.replace(/<(?:.|\n)*?>/gm, '')
        val = val.replace(/&lt;(?:.|\n)*?&gt;/gim, '')
        val = val.replace(/&nbsp;/gim, '')
      }
      this.$http.post("/objSave", {obj: obj, val: val}).then(function (response) {
              // Success
              console.log("success")
          },function (response) {
              // Error
              console.log("Error")
          });;
    },
    fetchData: function () {
      var self = this;
      $.getJSON( dataURL, function( data2 ) {
          data2.head.avatar = 'contas/'+self.siteName+'/img/'+data2.head.avatar+'?decache=' + (Math.random()*1000);
          store.commit('set_siteData', data2)
          //Force images reload cache
          // for (index = 0; index < self.siteData.portfolio.items.length; index++) {
          //   self.siteData.portfolio.items[index].img +='?decache=' + (Math.random()*1000);
          // }

          // console.log(self.siteData)
          self.dataIsLoaded = true;
      });

    },
    loadFont: function (font){
      loadFont(font);
    },
    portfolio_add: function () {
      //var siteNome = SiteData.getSiteNome()
      var newId = Date.now().toString();
      itemNew = {
        "id"     : newId,
        "titulo" : "",
        "mediaType" : "image",
        "img"    : "img_teste.jpg",
        "img_"   : "",
        "txt"    : "",
        "nome"   : "",
        "site"   : "",
        "data"   : "",
        "servico": "",
        "tags"    : ""
      }
      //Salva no disco o novo registro
      this.$http.post("/portfolio/add/"+newId).then(function(response) {})
      // SiteData.portAdd(newId).then(function(response) {})
      this.siteData.portfolio.items = this.siteData.portfolio.items || []
      this.siteData.portfolio.items.push(itemNew)
      // $scope.preOpen(itemNew, $scope.siteData.portfolio.items.length-1)
    },
    onUpdate: function (event) {
      let data = this.siteData.portfolio.items
      //data.splice(event.newIndex, 0, data.splice(event.oldIndex, 1)[0])
      //data.move(event.oldIndex, event.newIndex)
      this.$http.post('/portfolioSort/'+event.oldIndex+"/"+event.newIndex);
      console.log(this.siteData.portfolio.items)
    }
  },
  computed: {
    filteredList() {
      this.getItemsTags()
      if (!this.siteData.portfolio.itemsTags) {
        return this.siteData.portfolio.items
      } else {
        return this.siteData.portfolio.items.filter( item => {
          if (this.tagSelector == "all" ){
            return item.tags || this.siteData.portfolio.items
          }else{
            if (item.tags){
              return item.tags.includes(this.tagSelector)
            }
          }
        })
      }
    },
    count () {
   	  return store.state.count
    },
    siteData () {
   	  return store.state.siteData
    }
  }
});
