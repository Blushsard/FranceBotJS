import json

data = None
with open("data.json", "r") as file:
	data = json.load(file)


new_data = list()
added_ids = list()
cpt = 0
for user in data:
	if user['id'] not in added_ids:
		new_data.append(user)
		added_ids.append(user['id'])
		print(user)
		cpt += 1

print( "Users dans le fichier: " + str(cpt) )

with open( "data.json", "w" ) as file:
	json.dump(new_data, file)