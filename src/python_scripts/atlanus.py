import requests
import json
import sys


data = list()
offset = 0
while True:
	with requests.get(f"https://atlas.bot/api/leaderboards/724408079550251080/players?limit=100&offset={offset}") as req:
		print(f"Requête avec offsett {offset} effectuée !")
		offset += 100
		array = json.loads(req.text)

		# Récupération des données.
		data.extend( array["players"] )

		if ( array["isLastPage"] ):
			with open("data.json", "w") as fichier:
				json.dump(data, fichier)
			sys.exit(0)	