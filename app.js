const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const STORAGE_KEY = 'day-one-goals-v1.0'

function dateReviver(value) {
	var isDate = false;
	if (typeof value === "string" && dateFormat.test(value)) {
		isDate = true
		return [isDate, new Date(value)];
	}
	
	return [false, value];
}
var dataStore = {
	fetch: function () {
		var localGoals = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
		var cleanData = []
		localGoals.forEach(function (entry, index) {
			var isDate = dateReviver(entry.started)
			if (isDate[0]) {
				cleanData.push({
					goal: entry.goal,
					started: isDate[1],
					streak: entry.streak
				})
			}
		})
		return cleanData
	},
	save: function (localGoals) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(localGoals))
	}
}

var anApplication = new Vue({
	el: '#application',
	data: {
		showColumns: ['drop', 'goal', 'streak', 'started'],
		goals: dataStore.fetch(),
		today: new Date(),
		newEntry: '',
		selectedGoalId: 0,
	},
	created: function() {
	},
	methods: {
		addNewGoal: function( name ) {
			if (name) {
				this.goals.push({
					goal: name,
					started: this.today,
					streak: 0,
				})
				this.newEntry = ''
			}
			else {
				console.log( 'attempted to add an empty goal, request ignored.' )
			}
		},
		onRowHover: function(ev) {
			var sid = ev.currentTarget.id
			if (sid != this.selectedGoalId) {
				this.selectedGoalId = sid
			}
		},
		onCheckClick: function(ev) {
			// perform check / uncheck operation
			// validate shit
			// and save data
			dataStore.save( this.goals )
		},
		onDeleteClick: function(ev) {
			this.goals.splice( this.selectedGoalId, 1 )
			dataStore.save( this.goals )
		},
		onNewFocused: function(ev) {
			this.selectedGoalId = this.goals.length
		},
		prettyDate: function (oneDay) {
			var options = { month : "long", day : "numeric" };
			var result = oneDay.toLocaleDateString( 'en-GB', options );
			return result;
		},
	},
	filters: {
		capitalize: function (str) {
			return str.charAt(0).toUpperCase() + str.slice(1)
		},
	},
	watch: {
		newEntry: function( text ) {
			if (text) {
				this.addNewGoal( text )
			}
		}
	}
})
