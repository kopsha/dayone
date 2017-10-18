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
function treatAsUTC(date) {
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}
function daysBetween(startDate, endDate) {
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    return parseInt((treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay);
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
		newEntry: '',
		selectedGoalId: 0,
		wasCheckedToday: false,
	},
	created: function() {
		// perform streak checks ?
		today = new Date()
		testDate = new Date()
		testDate.setDate(today.getDate()-2)
		this.goals.push({
			goal: 'invalid',
			streak: 3,
			started: testDate
		})
		testDate = new Date()
		testDate.setDate( today.getDate()-3 )
		this.goals.push({
			goal: 'alreadyChecked',
			streak: 3,
			started: testDate
		})
		testDate = new Date()
		testDate.setDate( today.getDate()-4 )
		this.goals.push({
			goal: 'mustCheck',
			streak: 3,
			started: testDate
		})
		testDate = new Date()
		testDate.setDate( today.getDate()-5 )
		this.goals.push({
			goal: 'streakBroken',
			streak: 3,
			started: testDate
		})

		var toRemove = []
		this.goals.forEach(function (entry, index) {
			daysSince = daysBetween(entry.started, today)
			console.log( entry.goal, "has streak", entry.streak, "and", daysSince, "since started." )

			if (entry.streak > daysSince) {
				console.log( "entry", entry.goal, "is invalid. Will be removed." )
				toRemove.push( index )
			}
			else {
				var diff = daysSince - entry.streak
				if (diff === 1) {
					console.log( entry.goal+" can be continued." )
				}
				else if (diff === 0) {
					console.log( entry.goal+" was checked today." )
				}
				else {
					console.log( entry.goal+" has broken streak. Will be reset." )
					entry.started = ''
					entry.streak = 0
				}
			}
		})

		for (var i = toRemove.length - 1; i >= 0; i--) {
			console.log( "removing index", toRemove[i] )
			this.goals.splice( toRemove[i], 1 )
		}

		this.wasCheckedToday = this.isSelectionChecked()
	},
	methods: {
		addNewGoal: function( name ) {
			if (name) {
				this.goals.push({
					goal: name,
					started: '',
					streak: 0,
				})
				this.newEntry = ''
			}
			else {
				console.log( 'attempted to add an empty goal, request ignored.' )
			}
		},
		onRowClicked: function(ev) {
			var sid = ev.currentTarget.id
			if (sid != this.selectedGoalId) {
				this.selectedGoalId = sid
				this.wasCheckedToday = this.isSelectionChecked()
			}
		},
		isSelectionChecked: function() {
			var entry = this.goals[this.selectedGoalId]
			var today = new Date()
			daysSince = daysBetween(entry.started, today)

			var diff = daysSince - entry.streak
			if (diff === 0) {
				return true
			}
			return false
		},
		onCheckClick: function(ev) {
			var today = new Date()
			var entry = this.goals[this.selectedGoalId]
			daysSince = daysBetween(entry.started, today)

			var diff = daysSince - entry.streak
			if (diff === 1) {
				entry.streak++
			}
			else if (diff === 0) {
				if (entry.streak > 0) {
					entry.streak--
				} else {
					entry.started = ''
				}
			}
			else {
				entry.started = today
				entry.streak = 0
			}
			this.wasCheckedToday = this.isSelectionChecked()
			dataStore.save( this.goals )
		},
		onDeleteClick: function(ev) {
			this.onRowClicked(ev)
			this.goals.splice( this.selectedGoalId, 1 )
			dataStore.save( this.goals )
		},
		onNewFocused: function(ev) {
			this.selectedGoalId = this.goals.length
		},
		prettyDate: function (oneDay) {
			if (oneDay) {
				var options = { month : "long", day : "numeric" };
				var result = oneDay.toLocaleDateString( 'en-GB', options );
				return result;
			}
			else return '--'
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
