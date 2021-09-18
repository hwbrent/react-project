import re

with open("workoutProgress2021.txt", "r") as f:
    for index, line in enumerate(f):
        line = line.strip()
        if line == "":
            continue
        
        out = line if index % 4 != 0 else f"{line}\n"
        print(out)