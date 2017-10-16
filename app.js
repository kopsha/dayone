Vue.component('tags-grid', {
  template: '#grid-template',
  replace: true,
  props: {
    data: Array,
    columns: Array,
    filterKey: String
  },
  data: function () {
    var sortOrders = {}
    this.columns.forEach(function (key) {
      sortOrders[key] = 1
    })
    return {
      sortKey: '',
      sortOrders: sortOrders
    }
  },
  computed: {
    filteredData: function () {
      var sortKey = this.sortKey
      var filterKey = this.filterKey && this.filterKey.toLowerCase()
      var order = this.sortOrders[sortKey] || 1
      var data = this.data
      if (filterKey) {
        data = data.filter(function (row) {
          return Object.keys(row).some(function (key) {
            return String(row[key]).toLowerCase().indexOf(filterKey) > -1
          })
        })
      }
      if (sortKey) {
        data = data.slice().sort(function (a, b) {
          a = a[sortKey]
          b = b[sortKey]
          return (a === b ? 0 : a > b ? 1 : -1) * order
        })
      }
      return data
    }
  },
  methods: {
    sortBy: function (key) {
      this.sortKey = key
      this.sortOrders[key] = this.sortOrders[key] * -1
    },
    tryMe: function(ty) {
      alert(ty);
    }
  },
  filters: {
    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    },
    enrich: function(str) {
      /*****/
      var isNumeric = function(input) {
          return (input - 0) == input && (''+input).trim().length > 0;
      };
      var isDate = function(input) {
        dd = Date.parse( input );
        //alert( "a " + input + " is " + (dd > 0) );
        return (dd > 0);
      };
      /*****/
      var prefix = '#'
      var suffix = ''

      if (isNumeric(str)) {
        prefix = '< ';
        suffix = ' >';
      }
      else if (isDate(str)) {
        prefix = '{ ';
        suffix = ' }'
      }

      return prefix+str+suffix;
    },
  },
})



var anApplication = new Vue({
  el: '#application',
  data: {
    searchQuery: '',
    tagColumns: ['goal', 'streak', 'date'],
    tagData: [
      { goal: 'pushups', streak: 9, date: 'Oct-1' },
      { goal: 'running', streak: 3, date: 'Oct-12' },
      { goal: 'meditation', streak: 9, date: 'Oct-1' },
    ]
  }

})
