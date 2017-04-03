import csv, json
from pprint import pprint

# DO THIS ONCE MODULE IS IMPORTED

'''
data dict should look like this in the end:
d = 
{
  "<race>": {
    "<year>": {
        "households": ____,
        "quint_one": ____,
        "quint_two": ____,
        "quint_three": ____,
        "quint_four": ____,
        "quint_five": ____
    }
  }

  ... <more data> ...

}
'''
data = {} #the motherlode of data


'''
generate_data_per_race(): Update data dict with a race's CSV file
Input: 
 * f: filename (String)
 * race: name of key in dict (String, should just be race)
Output: None
'''
def generate_data_per_race(f, race):
        newDict = {}
        with open(f, "rbU") as csv_file:
                reader = csv.DictReader(csv_file)
                for row in reader:
                        newDict[row["year"]] = row
        data[race] = newDict

prefix = ""
if __name__ != "__main__":
        prefix = "utils/"
generate_data_per_race("%sasian.csv" % prefix, "asian")
generate_data_per_race("%sblack.csv" % prefix, "black")
generate_data_per_race("%swhite.csv" % prefix, "white")
generate_data_per_race("%shispanic.csv" %prefix, "hispanic")
#pprint(data)


'''
get_data_by_year(): run thru data dict and get relevent info on a given year in sunburst format
Input:
 * year: year to gather data on (int)
Output: dict in format:
{
    "name": "US citizens",
    "children": [
        {
            "name": "white",
            "children": [
                {"name": "quint_one", "size": _______},
                {"name": "quint_two", "size": _______},
                {"name": "quint_three", "size": _______},
                {"name": "quint_four", "size": _______},
                {"name": "quint_four", "size": _______}
            ]
        },

        ... <more data> ...

    ]
}
'''
def get_data_by_year(year):
        sunburst_dict = {"name": "US Citizens", "children": []}
        for race in data:
                sunburst_raceDict = {"name": race, "children":[]}
                data_raceDict = data[race][str(year)]
                for key in data_raceDict:
                        if key[:5] == "quint":
                                sunburst_quintDict = {"name": key, "size": int(data_raceDict[key].replace(',', ''))}
                                sunburst_raceDict["children"].append( sunburst_quintDict )
                sunburst_dict["children"].append(sunburst_raceDict)

        pprint(sunburst_dict)
        return sunburst_dict
#        print json.dumps( data, sort_keys=True, indent=4, separators=(',', ': ') )

#get_data_by_year(2002)
