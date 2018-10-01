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
        selectedId: '',
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
                this.goals[newName] = { last_check: '', streak: 0 }
                this.selectedId = newName
                LocalGoals.store_all( this.goals )
            }
            else {
                console.log( 'attempted to add an empty goal, request ignored.' )
            }
        },
        onRowClicked: function(event)
        {
            const sid = event.currentTarget.id
            if (sid != this.selectedId) {
                this.selectedId = sid
            }
        },
        onCheckClick: function(ev)
        {
            const today = new Date()
            if (dateIsoFormat.test(this.goals[this.selectedId].last_check))
            {
                var last_check = new Date(this.goals[this.selectedId].last_check)
                var days_ago = daysBetween(last_check, today)
                if (days_ago == 0)
                {
                    console.log( 'already checked, request ignored.' )
                    return
                }
                else if (days_ago == 1)
                {
                    console.log( 'streak continued. woohoo! \\o\/' )
                    this.goals[this.selectedId].last_check = today.toISOString().substring(0,10)
                    this.goals[this.selectedId].streak += 1
                    return
                }
            }
            console.log( 'streak broken. restarting!' )
            this.goals[this.selectedId].last_check = today.toISOString().substring(0,10)
            this.goals[this.selectedId].streak = 1
        },
        onDeleteClick: function(event)
        {
            const sid = event.currentTarget.id
            delete this.goals[sid]
            this.selectedId = ''
            LocalGoals.store_all( this.goals )
        },
        wasCheckedToday: function(key)
        {
            if (dateIsoFormat.test(this.goals[key].last_check))
            {
                const today = new Date()
                const last_check = new Date(this.goals[key].last_check)
                if (daysBetween(last_check, today) == 0)
                    return true
            }
            return false
        },
        prettyStreak: function(streak)
        {
            var days = parseInt(streak)
            if (isNaN(days))
                return '--'
            else if (days == 0)
                return '--'
            else return (days == 1) ? "day one" : `${days} days`
        },
        humanizeCheckDate: function(key)
        {
            if (dateIsoFormat.test(this.goals[key].last_check))
            {
                const today = new Date()
                const last_check = new Date(this.goals[key].last_check)
                var days_ago = daysBetween(last_check, today)
                if (days_ago == 0)
                    return 'today'
                else if (days_ago == 1)
                    return 'yesterday'
                else
                    return `${days_ago} days ago`;
            }
            return '--'
        },
        prettyCheckDate: function(key)
        {
            if (dateIsoFormat.test(this.goals[key].last_check))
            {
                const oneDate = new Date(this.goals[key].last_check)
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
