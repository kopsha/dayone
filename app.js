const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const STORAGE_KEY = 'day-one-goals-v1.0'

function makeTodayGoal(new_id) {
  var today = {
    id: new_id,
    goal: 'new',
    streak: 0,
    started: new Date(),
  }
  return today
}
function dateReviver(value) {
  var isDate = false;
    if (typeof value === "string" && dateFormat.test(value)) {
      isDate = true
        return [isDate, new Date(value)];
    }
    
    return [false, value];
}
var goalStorage = {
  fetch: function () {
    var goals = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    console.log( 'attempt from localStorage' )
    goals.forEach(function (goal, index) {
      console.log( goal )
      var isDate = dateReviver(goal.started)
      if (isDate[0]) {
        goal.started = isDate[1];
      }

    })

    goals.push( makeTodayGoal(goals.length) )
    goalStorage.next_id = goals.length

    return goals
  },
  save: function (goals) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
  }
}

var anApplication = new Vue({
  el: '#application',
  data: {
    showColumns: ['goal', 'streak', 'started'],
    tagData: goalStorage.fetch(),
    selected: {
      id : '',
      goal: '',
      streak: '',
      started: '',
    },
  },
  created: function() {
  },
  methods: {
    onRowClick: function(ev) {
      var id = ev.currentTarget.id;
      this.selected.id = id;
      this.selected.goal = this.tagData[id].goal;
      this.selected.streak = this.tagData[id].streak;
      this.selected.started = this.tagData[id].started;
    },
    onCheckClick : function (event) {
      this.selected.streak += 1
      this.tagData[this.selected.id].streak = this.selected.streak
      goalStorage.save( this.tagData )
    },
    prettyDate: function (str) {
      var options = { month : "long", day : "numeric" };
      var result = str.toLocaleDateString( 'en-GB', options );
      return result;
    },
  },
  filters: {
    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    },
  },
})
