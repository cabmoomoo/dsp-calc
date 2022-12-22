def prepare_groups():
    groups = {"groups":{
        "items":{
            "order": "a",
            "subgroups": {
                "row1": "a",
                "row2": "b",
                "row3": "c",
                "row4": "d",
                "row5": "e",
                "row6": "f",
                "row7": "g"
            }
        },
        "buildings":{
            "order": "b",
            "subgroups": {
                "row1": "a",
                "row2": "b",
                "row3": "c",
                "row4": "d",
                "row5": "e",
                "row6": "f",
                "row7": "g"
            }
        }
    }}
    return groups

def prepare_furnaces():
    furnaces = {}
    furnaces["Arc Smelter"] = {
        "crafting_categories": ["SMELT"],
        "crafting_speed": 1,
        "energy_usage": 360000,
        "name": "Arc Smelter"
    }
    furnaces["Plane Smelter"] = {
        "crafting_categories": ["SMELT"],
        "crafting_speed": 2,
        "energy_usage": 360000,
        "name": "Plane Smelter"
    }
    return furnaces

def prepare_drills():
    drills = {
        "Mining Machine": {
            "energy_usage": 420,
            "mining_rate": 60,
            "name": "Mining Machine",
            "resource_categories": [ "mining" ]
        },
        "Oil Extractor": {
            "name": "Oil Extractor",
            "resource_categories": [ "oil" ],
            "mining_rate": 120,
            "energy_usage": 840
        },
        "Water Pump": {
            "name": "Water Pump",
            "resource_categories": [ "pump" ],
            "mining_rate": 60,
            "energy_usage": 300
        }
    }
    return drills

def prepare_belts():
    belts = {
        "Conveyor Belt MK.I": {
            "name": "Conveyor Belt MK.I",
            "speed": 360
        },
        "Conveyor Belt MK.II": {
            "name": "Conveyor Belt MK.II",
            "speed": 720
        },
        "Conveyor Belt MK.III": {
            "name": "Conveyor Belt MK.III",
            "speed": 1800
        }
    }
    return belts

def prepare_assemblers():
    assemblers = {
        "Assembling Machine Mk.I": {
            "crafting_categories": [ "ASSEMBLE" ],
            "crafting_speed": 0.75,
            "energy_usage": 360000,
            "name": "Assembling Machine Mk.I"
        },
        "Assembling Machine Mk.II": {
            "crafting_categories": [ "ASSEMBLE" ],
            "crafting_speed": 1,
            "energy_usage": 360000,
            "name": "Assembling Machine Mk.II"
        },
        "Assembling Machine Mk.III": {
            "crafting_categories": [ "ASSEMBLE" ],
            "crafting_speed": 1.5,
            "energy_usage": 360000,
            "name": "Assembling Machine Mk.III"
        },
        "Oil Refinery": {
            "name": "Oil Refinery",
            "crafting_categories": [ "REFINE" ],
            "crafting_speed": 1,
            "energy_usage": 960000,
        },
        "Matrix Lab": {
            "name": "Matrix Lab",
            "crafting_categories": ["RESEARCH"],
            "energy_usage": 480000,
            "crafting_speed": 1,
        },
        "Chemical Plant": {
            "name": "Chemical Plant",
            "crafting_categories": ["CHEMICAL"],
            "energy_usage": 720000,
            "crafting_speed": 1,
        },
        "Fractionator": {
            "name": "Fractionator",
            "crafting_categories": ["fractionator"],
            "energy_usage": 720000,
            "crafting_speed": 1,
        },
        "Miniature Particle Collider": {
            "name": "Miniature Particle Collider",
            "crafting_categories": ["miniature_particle_collider"],
            "energy_usage": 12000000,
            "crafting_speed": 1,
        }
    }
    return assemblers

def accumulator_hack(items):
    # Every item needs a recipe, and the energy exchanger is not a registered building
    # No point registering the building just for the one recipe
    acc = ""
    acc_full = ""
    for x in items:
        if x["name"] == "Accumulator":
            acc = x["key_name"]
        elif x["name"] == "Accumulator (Full)":
            acc_full = x["key_name"]
    fields = {
    'key_name': acc_full,
    'name': "Accumulator(full)",
    'category': None,
    'ingredients': [[acc,1]],
    'products': [[acc_full,1]],
    'time': 150,
    }  
    return fields

def organic_crystal_hack(items):
    # Organic crystals are labeled in game files as material
    # As such, they need to be specifically pulled out
    org_crys = {}
    for x in items:
        if x["name"] == "Organic Crystal":
            org_crys = x
    org_crys["item"] = org_crys["key_name"]
    org_crys["category"] = "mining"
    return org_crys

def custom_oil(items, recipes): 
    recipe_list = [
        {
            "key_name": "oil1",
            "name": "Plasma Refining",
            "category": "REFINE",
            "ingredients": [
                [
                    "1007",
                    2
                ]
            ],
            "products": [
                [
                    "1120",
                    1
                ],
                [
                    "1114",
                    2
                ]
            ],
            "time": 4
        },
        {
            "key_name": "oil2",
            "name": "X-Ray Cracking",
            "category": "REFINE",
            "ingredients": [
                [
                    "1114",
                    1
                ]
            ],
            "products": [
                [
                    "1120",
                    1
                ],
                [
                    "1109",
                    1
                ]
            ],
            "time": 4
        },
        {
            "key_name": "oil3",
            "name": "Reforming Refine",
            "category": "REFINE",
            "ingredients": [
                [
                    "1120",
                    1
                ],
                [
                    "1006",
                    1
                ]
            ],
            "products": [
                [
                    "1114",
                    1
                ]
            ],
            "time": 4
        }
    ]
    game_recipe_keys = ["16", "58", "121"]
    for k,v in recipes:
        if v["key_name"] in game_recipe_keys:
            recipes.pop(k)
    recipes.append(recipe_list)
    return recipe_list
