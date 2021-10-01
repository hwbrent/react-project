import re
import os
from ast import literal_eval
from datetime import date, timedelta
from pprint import PrettyPrinter
pp = PrettyPrinter(indent=4)

indices = lambda array, target: [index for index in range(len(array)) if array[index] == target]
properly_capitalise_string = lambda string: string[0].upper() + "".join([char.lower() for char in string[1:]])
properly_capitalise_sentence = lambda sentence: " ".join([properly_capitalise_string(substring) for substring in sentence.split()])
lower_case_string = lambda string: "".join([char.lower() for char in string])
format_date = lambda date: "20" + date.split("/")[2] + "-" + date.split("/")[1] + "-" + date.split("/")[0]

def add_days(date_param, days=0):
    out = date_param[:]
    out = date.fromisoformat(out) + timedelta(days=days)
    return out.isoformat()

all_movements = [
    "Arnold Press",
    "Tricep Pushdown",
    "Incline Dumbbell Press",
    "Overhead Tricep Extension",
    "Lat Pulldown",
    "Cable Row",
    "Dumbbell Shrug",
    "Dumbbell Bicep Curl",
    "Dumbbell Lat Raise",
    "Cable Fly",
    "Barbell Squat",
    "Barbell Deadlift",
    "Bench Press",
    "Seated Leg Curl",
    "Assisted Pull Up",
    "Quad Extensions",
    "Calf Raises",
    "Dumbbell Squeeze Press",
    "Dumbbell Bent-Over Row"
]

with open("/Users/henrybrent/Documents/misc/react-project/workout-progress/workout_out.txt") as f:
    f = f.read()
    #f = f.replace("cable fly", "Cable Fly")
    f = f.replace("'Bench'", "'Bench Press'")
    f = f.replace("'Shrug'", "'Dumbbell Shrug'")
    f = f.replace("Lat raises", "Dumbbell Lat Raise")
    f = f.replace("Bicep Curl", "Dumbbell Bicep Curl")
    f = f.replace("DB incline press", "Incline Dumbbell Press")

    replacements = {
    "Db Squeeze Press": "Dumbbell Squeeze Press",
    "Bent Over Dumbbell Row": "Dumbbell Bent-Over Row",
    "Lat Raises": "Dumbbell Lat Raise",
    "Tricep Push Down": "Tricep Pushdown",
    "Dumbbell Lat Raises": "Dumbbell Lat Raise",
    }

    f = f.split('\n\n\n') # because between each week there are two empty lines
    weeks = [line.strip() for line in f]

    # this next part will work for 
    for week in weeks: # each week
        week = week.split("\n\n") # splits the week into separate days
        '''
        The delimiter \n\n looks like an empty line in the file. So it's splitting up the week's days and the week date
        week[0] is the string that looks something like Week 2 - 10/05/21
        Each entry in week[1:] is a string representing a PUSH/PULL/LEGS day
        '''

        week_start_date = re.search(r"\d\d/\d\d/\d\d", week[0])[0] # the date of the monday i.e. the day the week started on
        week_start_date = format_date(week_start_date)

        data = week[1]

        day_name = re.findall(r"(PUSH|PULL|LEGS)", data)
        re_movement = re.findall("|".join(all_movements), data)
        re_movement_lowercase = re.findall("|".join([lower_case_string(movement) for movement in all_movements]), data)
        weight = re.findall("", data)
        setsXreps = re.findall(r"\d{1,2} x \d{1,2}" , data)
        weight = re.findall(r"\d{1,3}", data)
        
        '''
        {day_name} e.g. PUSH
        {movement_name} e.g. Bench Press
        {setsXreps}
        {
            {weight} (for {sets})
        } one to three of these
        '''
        days = [entry.split("\n") for entry in week[1:]] # turns each line into an item in the array
        #print("Beginning of week beginning", week_start_date)
        for index, day in enumerate(days):
            # in_week_date = date.fromisoformat(week_start_date) + timedelta(days = index)
            # in_week_date = in_week_date.isoformat()
            in_week_date = add_days(week_start_date, index)
            #print("in_week_date:", in_week_date)
            for entry in day: # individual values in the log
                entry = f"[{entry[1:-1]}]"
                try:
                    entry = literal_eval(entry)
                except:
                    continue
                # making sure that each entry has a correct movement name:
                entry[0] = properly_capitalise_sentence(entry[0])
                if entry[0] not in all_movements:
                    entry[0] = replacements[entry[0]]

                # making sure each entry has a date in it:
                # if isinstance(entry[1], int): # entry[1] should be a date - if it isn't, that's a problem
                if type(entry[1]) == int or type(entry[1]) == float:
                    movement_occurences = [log for log in day if entry[0] in log] # the length of this is what matters - if more than two, probs just ignore that day, or manually log it
                    # print("movement_occurences:" ,movement_occurences)
                    if len(movement_occurences) == 1:
                        entry.insert(1, in_week_date)
                        print(tuple(entry))
                    elif len(movement_occurences) == 2:
                        log1 = literal_eval(f"[{movement_occurences[0][1:-1]}]")
                        log1.insert(1, in_week_date)
                        #print(entry[0], "new_date:", add_days(in_week_date, 3))
                        log2 = literal_eval(f"[{movement_occurences[1][1:-1]}]")
                        log2.insert(1, add_days(in_week_date, 3))
                        print(tuple(log1))
                        print(tuple(log2))
                    else:
                        continue
                else:
                    print(tuple(entry))
                    continue
                
                #print(f"{tuple(entry)},")
        #print("End of week beginning", week_start_date)
        print()
        #print()