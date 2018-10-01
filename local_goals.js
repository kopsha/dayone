var LocalGoals = (function ()
{
    "use strict";

    const dateIsoFormat = /^\d{4}-\d{2}-\d{2}$/
    const set_lasting_cookie = (name, value, days = 7) =>
    {
        const expires = new Date(Date.now() + days * 1000*60*60*24).toUTCString()
        document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires
    }
    const get_cookie = (name) =>
    {
        return document.cookie.split('; ').reduce((r, v) => {
                const parts = v.split('=')
                return parts[0] === name ? decodeURIComponent(parts[1]) : r
            }, undefined)
    }
    const delete_cookie = (name) =>
    {
        set_lasting_cookie(name, '', -1)
    }
    const date_from_string = (value) =>
    {
        if (typeof value === "string" && dateIsoFormat.test(value))
        {
            return new Date(value)
        }
        return undefined
    }
    const days_between = (startDate, endDate) =>
    {
        const msPerDay = 24 * 60 * 60 * 1000
        return parseInt( (endDate.getTime() - startDate.getTime()) / msPerDay)
    }
    const days_since = (since) =>
    {
        const today = new Date()
        const aDate = dateIsoFormat.test(since) ? date_from_string(since) : today
        return days_between(aDate, today)
    }

    const is_goal_valid = ( name, data ) =>
    {
        if ((typeof(name) === undefined) ||
            (typeof(data) === undefined) ||
            (name.length <= 0) ||
            (!('last_check' in data)) ||
            (!('streak' in data)))
        {
            return false
        }
        return true
    }
    const goals_from_cookies_reducer = function(accumulator, value)
    {
        const parts = value.split('=')
        const name = parts[0]
        const data = JSON.parse(decodeURIComponent(parts[1]))
        if (is_goal_valid(name, data))
        {
            accumulator[name] = data
        }
        return accumulator
    }

    var _failed_asserts = 0
    var _passed_asserts = 0
    const assert_true = ( condition ) =>
    {
        if (condition)
        {
            _passed_asserts += 1
            return "ok"
        }
        else
        {
            _failed_asserts += 1
            return "failed"
        }

        return "failed" // unreachable
    }

    var fetch_all = function ()
    {
        insert_test_goals()
        var cookies = document.cookie.split('; ')
        var all_goals = cookies.reduce( goals_from_cookies_reducer, {} )
        return all_goals
    }
    var delete_all = function ()
    {
        var cookies = document.cookie.split('; ')
        var all_goals = cookies.reduce( goals_from_cookies_reducer, {} )
        for (var goal in all_goals)
            delete_cookie( goal )
    }
    var store_all = function ( goals )
    {
        delete_all()
        for (var goal in goals)
        {
            // TODO: consider to add validation on save
            set_lasting_cookie( goal, JSON.stringify(goals[goal]) )
        }
    }

    var insert_test_goals = function ()
    {
        // sample data
        var today = new Date()
        var yesterday = new Date()
        yesterday.setDate(today.getDate() - 1)
        var started = new Date()
        started.setDate(today.getDate() - 3)
        var goals = {
                'alreadyChecked' : {
                    last_check: today.toISOString().substring(0,10),
                    streak: 10
                },
                'mustCheck' : {
                    last_check: yesterday.toISOString().substring(0,10),
                    streak: 7
                },
                'broken' : {
                    last_check: started.toISOString().substring(0,10),
                    streak: 4
                }
            }

        for (var short_name in goals)
        {
            set_lasting_cookie(short_name, JSON.stringify(goals[short_name]))
        }

    }

    var self_check = function ()
    {
        // testing cookies
        var all_cookies = document.cookie
        all_cookies = (all_cookies) ? all_cookies : undefined
        console.log( "Existing cookies: >> " + all_cookies + " <<" )

        console.log("Testing not existing cookies: " +
                assert_true(typeof(get_cookie("__should_not_be_set__")) === 'undefined'))

        set_lasting_cookie('__avoid_any_name_clash__', 0xbeef0101)
        var actual = get_cookie('__avoid_any_name_clash__')

        console.log("Testing set cookies ability: " +
                assert_true(parseInt(actual) === 0xbeef0101))

        delete_cookie('__avoid_any_name_clash__')
        console.log("Testing clean up: " +
                assert_true(typeof(get_cookie('__avoid_any_name_clash__')) === 'undefined'))

        // testing goals
        insert_test_goals()
        var today = new Date()
        var goals = fetch_all()
        assert_true(Object.keys(goals).length >= 3)

        for (var entry in goals)
        {
            var days_past = days_since(goals[entry].last_check)
            console.log( entry, "has ", days_past, " days since last_check." )
            if (days_past === 1) {
                console.log(entry+" can be continued.")
                assert_true(entry === "mustCheck")
            }
            else if (days_past === 0) {
                console.log(entry+" was checked today.")
                assert_true(entry === "alreadyChecked")
            }
            else {
                console.log( entry+" has broken streak, should be restarted." )
                assert_true(entry === "broken")
            }
        }

        // TODO: remove test goals

        // summarize
        console.log(`Out of ${_passed_asserts+_failed_asserts} total tests ${_passed_asserts} did passed and ${_failed_asserts} failed.`)
    }

    return {
        fetch_all: fetch_all,
        store_all: store_all,
        self_check: self_check
    }
}());
