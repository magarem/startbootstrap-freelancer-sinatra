Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};
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


var dataURL = '/dataLoad';
new Vue({
  el: '#app',

  data: {
    siteData: {},
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
    this.loadFont(this.siteData.navbar.logo.fontFamily)
    this.loadFont(this.siteData.head.fontFamily)

  },
  methods: {
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
      $.getJSON( dataURL, function( data ) {
          self.siteData = data;

          //Force images reload cache
          for (index = 0; index < self.siteData.portfolio.items.length; index++) {
            self.siteData.portfolio.items[index].img +='?decache=' + (Math.random()*1000);
          }

          console.log(self.siteData)
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
      }
  }
});
