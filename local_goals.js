var LocalGoals = (function ()
{
    "use strict";

    const setLastingCookie = (name, value, days = 7) =>
    {
        const expires = new Date(Date.now() + days * 1000*60*60*24).toUTCString()
        document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires
    }
    const getCookie = (name) =>
    {
        return document.cookie.split('; ').reduce((r, v) => {
            const parts = v.split('=')
            return parts[0] === name ? decodeURIComponent(parts[1]) : r
        }, undefined)
    }
    const deleteCookie = (name) =>
    {
        setLastingCookie(name, '', -1)
    }
    const makeDateFromString = (value) =>
    {
        const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
        var isDate = false
        if (typeof value === "string" && dateFormat.test(value)) {
            isDate = true
            return [isDate, new Date(value)]
        }

        return [false, value];
    }
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

    const is_goal_valid = ( name, data ) =>
    {
        if ((typeof(name) === undefined) ||
            (typeof(data) === undefined) ||
            (name.length <= 0) ||
            (!('first_check' in data)) ||
            (!('last_check' in data)) ||
            (!('history' in data)))
        {
            return false
        }
        return true
    }
    var goals_from_cookies_reducer = function(accumulator, value)
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
        var pgs = cookies.reduce( goals_from_cookies_reducer, {} )
        return pgs
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
                    first_check: started.toISOString().substring(0,10),
                    last_check: today.toISOString().substring(0,10),
                    history: '111'
                },
                'mustCheck' : {
                    first_check: started.toISOString().substring(0,10),
                    last_check: yesterday.toISOString().substring(0,10),
                    history:'11'
                },
                'broken' : {
                    first_check: started.toISOString().substring(0,10),
                    last_check: started.toISOString().substring(0,10),
                    history:'1'
                }
            }

        for (var short_name in goals)
        {
            setLastingCookie(short_name, JSON.stringify(goals[short_name]))
        }

    }

    var self_check = function ()
    {
        // testing cookies
        var all_cookies = document.cookie
        all_cookies = (all_cookies) ? all_cookies : undefined
        console.log( "Existing cookies: >> " + all_cookies + " <<" )

        console.log("Testing not existing cookies: " +
                assert_true(typeof(getCookie("__should_not_be_set__")) === 'undefined'))

        setLastingCookie('__avoid_any_name_clash__', 0xbeef0101)
        var actual = getCookie('__avoid_any_name_clash__')

        console.log("Testing set cookies ability: " +
                assert_true(parseInt(actual) === 0xbeef0101))

        deleteCookie('__avoid_any_name_clash__')
        console.log("Testing clean up: " +
                assert_true(typeof(getCookie('__avoid_any_name_clash__')) === 'undefined'))

        // testing goals
        insert_test_goals()
        var today = new Date()
        var goals = fetch_all()
        assert_true(Object.keys(goals).length >= 3)

        for (var entry in goals)
        {
            var daysSince = daysBetween(goals[entry].last_check, today)
            console.log( entry, "has ", daysSince, " days since last_check." )
            if (daysSince === 1) {
                console.log(entry+" can be continued.")
                assert_true(entry === "mustCheck")
            }
            else if (daysSince === 0) {
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
        self_check: self_check
    }
}());
