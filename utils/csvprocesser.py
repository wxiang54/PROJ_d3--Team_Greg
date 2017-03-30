import csv

'''
Key for Reading the Dictionaries:
Sample Output: {2002: [3917, 22007, 41155, 65690, 102000, 180083], 2003: [4040, 18660, 42980, 70000, 106740, 174035], 2004: [4123, 24000, 47000, 71254, 110806, 193714], 2005: [4273, 24000, 49761, 75200, 117032, 217500], 2006: [4454, 26300, 50000, 80202, 126000, 222429], 2007: [4494, 25312, 51400, 82000, 125800, 211000], 2008: [4573, 24137, 50000, 82680, 130000, 220197], 2009: [4687, 25000, 50194, 82170, 131000, 234082], 2010: [5212, 24357, 50200, 81000, 131240, 218000], 2011: [5374, 25124, 50157, 80440, 125200, 223100], 2012: [5560, 27564, 54414, 85000, 137565, 245691], 2013: [5759, 26000, 52536, 83004, 136552, 240201], 2014: [6040, 28013, 58073, 94780, 147333, 256000], 2015: [6328, 30000, 60002, 98848, 158111, 279998]}
The first # is households (thousands)
The second # is lowest fifth
The third # is second fifth
The fourth # is third fifth
The fifth # is fourth fifth
The sixth # is fifth fifth
'''

asian = open("asians.csv", "rb")
black = open("blacks.csv", "rb")
white = open("whites.csv", "rb")
hspnc = open("hispanics.csv", "rb")

def listify(readin):
	d = {}
	L = []
	for line in readin:
		line = line.strip('\r\n')
		line = line.split(",")
		for entry in line:
			L.append(int(entry))
		d[L[0]] = L[1:]	
		L = []
	return d

alist = listify(asian)
blist = listify(black)
wlist = listify(white)
hlist = listify(hspnc)

print alist
print 
print blist
print 
print wlist
print 
print hlist

