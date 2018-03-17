
Vue.component('edit', {
    template: `<div contenteditable="true" @blur="onBlur" @input="$emit('update:content', $event.target.innerText)"></div>`,
    props: ['content'],
    mounted: function () {
        this.$el.innerText = eval("this.$root."+this.content);
    },
    watch: {
        content: function () {
            this.$el.innerText = eval("this.$root."+this.content);
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
      },
    }
})

Vue.component('editable',{
  template:'<div contenteditable="true" @input="update" @blur="onBlur"></div>',
  props:['content','campo'],
  mounted:function(){
    this.$el.innerText = eval("this.$root."+this.campo);
  },
  methods:{
    update:function(event){
      this.$emit('update',event.target.innerText);
    },
    onBlur:function(){
      // console.log(siteData)
      this.saveDiv (this.campo, eval("this.$root."+this.campo))
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
      this.$http.post("/objSave", {obj: obj, val: val}).then(function (response) {
              // Success
              console.log("success")
          },function (response) {
              // Error
              console.log("Error")
          });;
    },
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
