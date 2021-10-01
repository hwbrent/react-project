from pprint import PrettyPrinter
from bs4 import BeautifulSoup
pp = PrettyPrinter(indent=4)

with open("./Workoutprogress2021.html") as infile:
    doc = BeautifulSoup(infile.read(), 'html.parser')