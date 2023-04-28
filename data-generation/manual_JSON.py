def prepare_groups():
    groups = {
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
    }
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
        "energy_usage": 1440000,
        "name": "Plane Smelter"
    }
    return furnaces

def prepare_drills():
    drills = {
        "Mining Machine": {
            "energy_usage": 420000,
            "mining_speed": "1/2",
            "name": "Mining Machine",
            "resource_categories": [ "mining" ]
        },
        "Oil Extractor": {
            "name": "Oil Extractor",
            "resource_categories": [ "oil" ],
            "mining_speed": "5/2",
            "energy_usage": 840000
        },
        "Water Pump": {
            "name": "Water Pump",
            "resource_categories": [ "pump" ],
            "mining_speed": "5/6",
            "energy_usage": 300000
        }
    }
    return drills

def prepare_belts():
    belts = {
        "Conveyor Belt MK.I": {
            "name": "Conveyor Belt MK.I",
            "speed": 6
        },
        "Conveyor Belt MK.II": {
            "name": "Conveyor Belt MK.II",
            "speed": 12
        },
        "Conveyor Belt MK.III": {
            "name": "Conveyor Belt MK.III",
            "speed": 30
        }
    }
    return belts

def prepare_assemblers():
    assemblers = {
        "Assembling Machine Mk.I": {
            "crafting_categories": [ "ASSEMBLE" ],
            "crafting_speed": 0.75,
            "energy_usage": 270000,
            "name": "Assembling Machine Mk.I"
        },
        "Assembling Machine Mk.II": {
            "crafting_categories": [ "ASSEMBLE" ],
            "crafting_speed": 1,
            "energy_usage": 540000,
            "name": "Assembling Machine Mk.II"
        },
        "Assembling Machine Mk.III": {
            "crafting_categories": [ "ASSEMBLE" ],
            "crafting_speed": 1.5,
            "energy_usage": 1080000,
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
            "crafting_categories": ["FRACTIONATE"],
            "energy_usage": 720000,
            "crafting_speed": 1,
        },
        "Miniature Particle Collider": {
            "name": "Miniature Particle Collider",
            "crafting_categories": ["PARTICLE"],
            "energy_usage": 12000000,
            "crafting_speed": 1,
        }
    }
    return assemblers

def prepare_prolif_modules(items):
    modules = {
        "Proliferator Mk.I": {
            "name": "Proliferator Mk.I",
            "effect": {
                "consumption": {
                    "bonus": 0.3
                },
                "productivity": {
                    "bonus": 0.125
                },
                "speed": {
                    "bonus": 0.25
                }
            },
            "sprays": 12
        },
        "Proliferator Mk.II": {
            "name": "Proliferator Mk.II",
            "effect": {
                "consumption": {
                    "bonus": 0.7
                },
                "productivity": {
                    "bonus": 0.2
                },
                "speed": {
                    "bonus": 0.5
                }
            },
            "sprays": 24
        },
        "Proliferator Mk.III": {
            "name": "Proliferator Mk.II",
            "effect": {
                "consumption": {
                    "bonus": 1.5
                },
                "productivity": {
                    "bonus": 0.25
                },
                "speed": {
                    "bonus": 1
                }
            },
            "sprays": 60
        },
    }
    allItems = items
    for moduleName in modules:
        module = modules[moduleName]
        allItems[moduleName] = {**items[moduleName], **module}
    return allItems

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
    'results': [[acc_full,1]],
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

def custom_oil(recipes): 
    recipe_list = {
        "Plasma Refining (simplified)": {
            "key_name": "oil1",
            "name": "Plasma Refining (simplified)",
            "category": "REFINE",
            "ingredients": [
                {
                    "name": "Crude Oil",
                    "amount": 2
                }
            ],
            "results": [
                {
                    "name": "Hydrogen",
                    "amount": 1
                },
                {
                    "name": "Refined Oil",
                    "amount": 2
                }
            ],
            "energy_required": 4,
        },
        "X-Ray Cracking (simplified)":{
            "key_name": "oil2",
            "name": "X-Ray Cracking (simplified)",
            "category": "REFINE",
            "ingredients": [
                {
                    "name": "Refined Oil",
                    "amount": 1
                }
            ],
            "results": [
                {
                    "name": "Hydrogen",
                    "amount": 1
                },
                {
                    "name": "Energetic Graphite",
                    "amount": 1
                }
            ],
            "energy_required": 4,
        },
        "Reforming Refine (simplified)":{
            "key_name": "oil3",
            "name": "Reforming Refine (simplified)",
            "category": "REFINE",
            "ingredients": [
                {
                    "name": "Hydrogen",
                    "amount": 1
                },
                {
                    "name": "Coal",
                    "amount": 1
                }
            ],
            "results": [
                {
                    "name": "Refined Oil",
                    "amount": 1
                }
            ],
            "energy_required": 4,
        }
    }

    for x in recipe_list.values():
        rec_name = x["name"]
        recipes[rec_name] = x
    
    return recipes
