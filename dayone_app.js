
const treatAsUTC = (date) =>
{
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}
const daysBetween = (startDate, endDate) =>
{
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    return parseInt((treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay);
}

var anApplication = new Vue({
	el: '#application',
	data: {
		showColumns: ['Goals', 'Streak', 'Checked', 'x'],
		goals: {},
		newEntry: '',
		selectedGoalId: 0,
		wasCheckedToday: false,
	},
	created: function() {
		console.log("let's attempt to import LocalGoals and run a sanity check.")
		LocalGoals.self_check()
		console.log("---- LocalGoals check has finished.")
		this.goals = LocalGoals.fetch_all()
	},
	methods: {
		addNewGoal: function( ev ) {
			newName = this.newEntry
			this.newEntry = ''
			if (newName) {
				this.goals[newName] = { first_check: '', last_check: '', history: '' }
			}
			else {
				console.log( 'attempted to add an empty goal, request ignored.' )
			}
		},
		onRowClicked: function(ev) {
			var sid = ev.currentTarget.id
			if (sid != this.selectedGoalId) {
				this.selectedGoalId = sid
			}
		},
		onCheckClick: function(ev) {
			// TODO: redo this
		},
		onDeleteClick: function(ev) {
			// TODO: redo this
		},
		onNewFocused: function(ev) {
			// TODO: redo this
		},
	    makeDateFromString: function(value) {
	        const dateFormat = /^\d{4}-\d{2}-\d{2}$/
	        if (typeof value === "string" && dateFormat.test(value)) {
	            isDate = true
	            return new Date(value)
	        }
	        return undefined
	    },
		computePrettyStreak: function(key) {
			// TODO: rethink this
			const start = this.makeDateFromString( this.goals[key].first_check )
			if (!start) return '--'

			const finish = this.makeDateFromString( this.goals[key].last_check )
			if (!finish) return '--'

			var days = 1+daysBetween( start, finish )
			return (days == 1) ? 'one day' : `${days} days`
		},
		prettyDate: function (oneDay) {
	        const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
	        var isDate = false
	        if (typeof value === "string" && dateFormat.test(oneDay)) {
	            isDate = true
	            var anyDay = new Date(oneDay)
	        }

			if (isDate) {
				var options = { month : "long", day : "numeric" };
				var result = anyDay.toLocaleDateString( 'en-GB', options );
				return result;
			}
			else return '--'
		},
	},
	filters: {
		capitalize: function (str) {
			// not used, remove ?
			return str.charAt(0).toUpperCase() + str.slice(1)
		},
	},
	watch: {
		newEntry: function( text ) {
			// TODO: re-analyze, might not be needed
		}
	}
})
