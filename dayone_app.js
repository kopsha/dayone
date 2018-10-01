const dateIsoFormat = /^\d{4}-\d{2}-\d{2}$/

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
		selectedId: undefined,
		wasCheckedToday: false,
	},
	created: function()
	{
		console.log("let's attempt to import LocalGoals and run a sanity check.")
		LocalGoals.self_check()
		console.log("---- LocalGoals check has finished.")
		this.goals = LocalGoals.fetch_all()
	},
	methods:
	{
		addNewGoal: function( ev )
		{
			newName = this.newEntry.replace(/[^0-9a-zA-Z_]+/g, '_')
			this.newEntry = ''
			if (newName.match(/^[0-9a-zA-Z_]+$/)) {
				this.goals[newName] = { last_check: '', history: '' }
				LocalGoals.store_all( this.goals )
			}
			else {
				console.log( 'attempted to add an empty goal, request ignored.' )
			}
		},
		onRowClicked: function(ev)
		{
			var sid = ev.currentTarget.id
			if (sid != this.selectedId) {
				this.selectedId = sid
			}
		},
		onCheckClick: function(ev)
		{
			// TODO: redo this
		},
		onDeleteClick: function(ev)
		{
			// TODO: redo this
		},
		onNewFocused: function(ev)
		{
			// TODO: redo this
		},
		prettyStreak: function(key)
		{
			const days = (this.goals[key].streak) ? this.goals[key].streak : 0
			return (days == 1) ? "day one" : `${days} days`
		},
		prettyDate: function (oneDay)
		{
	        if (dateIsoFormat.test(oneDay))
	        {
	            const oneDate = new Date(oneDay)
				var options = { month : "long", day : "numeric" };
				var result = oneDate.toLocaleDateString( 'en-US', options );
				return result;
	        }
			return '--'
		},
	},
	filters:
	{
		capitalize: function (str) {
			// not used, remove ?
			return str.charAt(0).toUpperCase() + str.slice(1)
		},
	},
	watch:
	{
		newEntry: function( text )
		{
			// TODO: re-analyze, might not be needed
		}
	}
})
