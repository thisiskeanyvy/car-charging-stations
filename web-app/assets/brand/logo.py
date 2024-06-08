import os, json

def lookup():
	count = 0
	for path in os.listdir("."):
		if os.path.isfile(os.path.join(".", path)):
			count += 1
	print(f"Services indexés: {count}")

def json_file(dossier_logo=".", fichier_sortie="brand.json"):
    structure_json = {"logo": {}}
    for fichier in os.listdir(dossier_logo):
        nom_service, extension = os.path.splitext(fichier)
        if(nom_service != "logo" and nom_service != "brand"):
            structure_json["logo"][nom_service] = {"type": extension[1:]}
    json_final = {"logo": {"default": {"type": "svg"}}}
    json_final["logo"].update(structure_json["logo"])
    json_string = json.dumps(json_final, indent=2)
    print(json_string)
    with open(fichier_sortie, "w") as fichier_json:
        fichier_json.write(json_string)

if __name__ == "__main__":
	lookup()
	json_file()