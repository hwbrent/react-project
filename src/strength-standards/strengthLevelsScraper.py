from bs4 import BeautifulSoup
from pprint import PrettyPrinter
import json
import requests
import re
import sys
# import asyncio

pp = PrettyPrinter(indent=4)


def write_to_file(obj):
    ''' Receives the url and the strength levels data for the tables at that url and writes the object to a JSON file '''
    # movement_name = url[45:]
    print(obj)

    with open("./data.json", "w") as out:
        json.dump(obj=obj, fp=out, indent=4)
    
    with open("./data.json") as f:
        print(f.read())
    
    print("finished write_to_file().")

def HTML_to_JSON(url):
    ''' Receives a url and scrapes the strength levels data from the HTML.
    You have to be careful with what you're printing here, because when the JS server runs this script, it takes what's printed. So make sure that you're deliberate with what is printed out '''
    req = requests.get(url).text
    doc = BeautifulSoup(req, "html.parser")

    tables = doc.find_all("table") # should be a male and a female table in the HTML

    movement = {
        "movement_name": url[45:-3],
        "metadata": {"url": url},
        "data": {}
    }

    p = [ " ".join(ptag.text.split()) for ptag in doc.find_all("p") if re.search(r"\d", ptag.text) ] # <p>'s that contain numbers
    # print(p)
    try:
        movement["metadata"]["total"] = p[0],
        movement["metadata"]["men"] = p[1],
        movement["metadata"]["women"] = p[3]
    except:
        # some of the lifts have little to no data on them
        movement["metadata"]["total"] = "No metadata related to number of lifts the standards are based on"

    genders = ["male", "female"] 
    for index, gender in enumerate(genders):
        table = tables[index] # bc the 1st is the `male` table, the 2nd is the `female` one
        # <th> --> "...defines a header cell in an HTML table"
        # <abbr> --> "...is used to define the abbreviation or short form of an element. The <abbr> and <acronym> tags are used as shortened versions and used to represent a series of letters. The abbreviation is used to provide useful information to the browsers, translation systems, and search-engines"
        table_column_names = [ th.abbr["title"] for th in table.thead.find_all("th") ]
        standards = table_column_names[1:] # --> ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite']
        rows = table.tbody.find_all("tr") # <tr> --> table row

        obj = {} # contains the bodyweights and corresponding weight standards
        for row in rows:
            tds = row.find_all("td") # <td> --> standard table cell. Contains data for the table, and no table headings
            data = [ string for td in tds for string in td.stripped_strings if not "x" in string ]
            bodyweight = int(data[0])
            weights = data[1:]
            standards_and_weights = { standard: int(weight) for (standard, weight) in zip(standards,weights) }
            obj[bodyweight] = standards_and_weights
        
        movement["data"][gender] = obj

    # 
    standards_meanings = [th for th in doc.find_all("th") if th.text.strip() in standards]
    meanings = {}
    for entry in standards_meanings:
        try:
            # .parent gets the parent element; printing shows you the tags inside the parent
            # .text gets you all the text inside the parent
            if entry.parent.text.strip().split()[0] not in standards:
                ''' The .strip().split()[0] just gets you the first word.
                In this case, we want the first word to be one of the standards (i.e. novice, elite etc)
                because that's how the target table's HTML looks on the website.
                (For reference, it's a table that has an <h2> heading that says "What do the strength standards mean?" '''
                continue
            cleaned_text_list = entry.parent.text.strip().split() # split up into words
            level = cleaned_text_list[0]
            explanation = " ".join(cleaned_text_list[1:])
            meanings[level] = explanation
        except:
            continue
    movement["metadata"]["meanings"] = meanings

    out = json.dumps(movement)
    return out
    

def scrape_urls():
    '''
    Scrapes the strength-standards page of strengthlevel.com. This page has a lot of buttons on it which
    when clicked take the user to pages containing the strength standards data for that lift. This function
    scrapes the URLs from the href's in the HTML.
    '''
    home_url = "https://strengthlevel.com/"
    req = requests.get(home_url + "strength-standards").text

    doc = BeautifulSoup(req, "html.parser")

    urls = []

    for a in doc.find_all("a", href=True):
        try: # try/except kinda lazy but works. Not all <a> tags have classes
            if 'exerciseitem' in a["class"]: # this is the main buttons you find on the main strength standards page
                href = a["href"]
                url = home_url + href[1:] + "/kg"
                urls.append(url)
        except:
            continue
    
    # urls2 = [url + "/kg" for url in urls]

    with open("./urls.json", "w") as out:
        json.dump(obj=urls, fp=out, indent=4)

    # checking if it actually wrote to the file or not since for some fucking reason in vscode's integrated terminal it won't work
    with open("./urls.json") as infile:
        contents = json.load(infile)
        if contents == urls:
            print("Correctly wrote to file.")
        else:
            print("For fuck's sake, it didn't work :(")
    
    return urls

def main():
    try:
        if len(sys.argv) == 1:
            scrape_urls()
            print("Called scrape_urls().")
        else:
            # the parameter will be a url to pass into HTML_to_JSON(url) and subsequently into write_to_file(url, obj)
            url = sys.argv[1]
            obj = HTML_to_JSON(url)
            print(obj)
    except:
        print("Something went wrong :(")
        raise Exception(sys.exc_info()[0])

if __name__ == "__main__":
    main()
