from bs4 import BeautifulSoup
import json
# import requests

def extractDataToFile(infile, outfile = None):
    with open(infile, "r") as f:
        doc = BeautifulSoup(f, "html.parser") 

    tables = doc.find_all("table")
    movement = {}
    genders = ["male", "female"] 
    for gender in genders:
        gender_table = tables[genders.index(gender)] # bc the first table appears is the `male` table, the second is the `female` table
        head = gender_table.thead
        body = gender_table.tbody
        table_column_names = [ th.abbr["title"] for th in head.find_all("th") ] # the ["title"] gets the value of the attribute called title
        standards = table_column_names[1:]
        rows = body.find_all("tr") # <tr> --> table row

        obj = {} # contains the bodyweights and corresponding weight standards
        for row in rows:
            tds = row.find_all("td") # <td> --> standard table cell. Contains data for the table, and no table headings
            data = [ string for td in tds for string in td.stripped_strings if not "x" in string ]
            bodyweight = int(data[0])
            weights = data[1:]
            standards_and_weights = { standard: int(weight) for (standard, weight) in zip(standards,weights) }
            obj[bodyweight] = standards_and_weights
        
        movement[gender] = obj

    if outfile == None:
        return movement
    
    with open(outfile, "w") as out:
        json.dump(obj=movement, fp=out, indent=4)

movements = [
    "bench",
    "deadlift",
    "dumbbell-curl",
    "lat-pulldown",
    "squat"
]

infile = lambda x: f"./strength-levels-html/{x}.html"
outfile = lambda x: f"./strength-levels-data/{x}.json"

'''
for movement in movements:
    extractDataToFile(
        infile(movement),
        outfile(movement)
    )
    print(f"Extracted data from '{infile(movement)}' to '{outfile(movement)}'")
'''