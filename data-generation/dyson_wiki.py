#!/usr/bin/python3

"""Utility for maintaining the Dyson Sphere Program wiki.

This command-line script (usually) produces output on stdout in a format that
can be directly cut-and-pasted to the edit box of pages at
https://dyson-sphere-program.fandom.com/. In the usual case where there is
existing content, replace that content entirely, and then use the diff feature
to verify correctness.

To run, this requires the following files in the current directory:
* ItemProtoSet.dat
* RecipeProtoSet.dat
* TechProtoSet.dat
* StringProtoSet.dat

These must be extracted from the game files. See the module help in
"dysonsphere.py" for details.
"""

import argparse
import re
import sys
import json

import manual_JSON
import dysonsphere
from dysonsphere import ERecipeType, EItemType

# These aren't worth importing from a file
STARTING_RECIPES = [1, 2, 3, 4, 5, 6, 50]
STARTING_TECHS = [1]
MADE_FROM = {
    ERecipeType.NONE:'-',
    ERecipeType.SMELT:'冶炼设备',
    ERecipeType.CHEMICAL:'化工设备',
    ERecipeType.REFINE:'精炼设备',
    ERecipeType.ASSEMBLE:'制造台',
    ERecipeType.PARTICLE:'粒子对撞机',
    ERecipeType.EXCHANGE:'能量交换器',
    ERecipeType.PHOTON_STORE:'射线接收站',
    ERecipeType.FRACTIONATE:'分馏设备',
    ERecipeType.RESEARCH:'科研设备',
    None:'未知'}
# The second part of the tuple is crafting power: The power of the building
# (Mk.I in the case of Assembler) divided by the crafting speed.
BUILDINGS = {
    ERecipeType.SMELT:([2302], 360000),
    ERecipeType.CHEMICAL:([2309], 720000),
    ERecipeType.REFINE:([2308], 960000),
    ERecipeType.ASSEMBLE:([2303, 2304, 2305], 360000),
    ERecipeType.PARTICLE:([2310], 12000000),
    ERecipeType.EXCHANGE:([2209], 45000000),
    ERecipeType.PHOTON_STORE:([2208], 0),
    ERecipeType.FRACTIONATE:([2314], 720000),
    ERecipeType.RESEARCH:([2901], 480000)}

# This is the only one set of strings that is not localized, because we ended
# up pluralizing all these categories.
CATEGORIES = {
    EItemType.UNKNOWN:'Unknown Category',
    EItemType.RESOURCE:'Natural Resources',
    EItemType.MATERIAL:'Materials',
    EItemType.COMPONENT:'Components',
    EItemType.PRODUCT:'End Products',
    EItemType.LOGISTICS:'Logistics',
    EItemType.PRODUCTION:'Production Facilities',
    EItemType.DECORATION:'Decorations',
    EItemType.WEAPON:'Weapons',
    EItemType.MATRIX:'Science Matrices'}

BUILDING_CATEGORIES = [
    '电力类',    # Power (1)
    '采集类',    # Gathering (2)
    '运输类',    # Logistics (3)
    '仓储类',    # Storage (4)
    '生产类',    # Production (5)
    '物流类',    # Transportation (6)
    '研究类',    # Research (7)
    '戴森球类',  # Dyson Sphere Program (8)
    '环改类']    # Environment Modification (9)


# Patches we make to be explicit about what techs unlock items.
# This lists the recipe id of recipes to be "fixed": Their first output item
# will be marked as having an explict_tech_dep of the tech that unlocks
# the recipe. This works around cases where multiple recipes, unlocked by
# multiple techs produce the same item.
# to the tech id.
UNLOCK_HACKS = [
    16,  # Plasma Extract Refining
    17,  # Energetic Graphite
    37,  # Crystal Silicon
    78]  # Space Warper

# Tweaks to the sort-key function, to get the recipe list to sort in a better
# order.
KEY_TWEAKS = {75: 103, #Universe Matrix -> After Gravity Matrix
    89: 85, #Conveyor Belt MK.II -> After MK.I
    92: 86, #Conveyor Belt MK.III
    85: 87, #Sorter MK.I
    88: 88, #Sorter MK.II
    90: 89, #Sorter Mk.III
    86: 90, #Storage MK. I
    91: 91, #Storage Mk. II
    87: 92} #Splitter
COLOR_RE = re.compile('<color="([^"]*)">([^<]*)</color>')

SPECIAL_MATERIALS_COMMENT="""
-- Raw materials that are not always available, and enable secondary or
-- "special" crafting recipes. In same cases, this just means that harvesting
-- the material directly enables skipping a production chain.
-- These are item_ids, ordered in the way they are presented to the user.
-- Sometimes not all options may be available."""
SPECIAL_MATERIALS = [
    1016,  # Unipolar Magnet
    1015,  # Spiniform Stalagmite Crystal
    1014,  # Optical Grating Crystal
    1117,  # Organic Crystal
    1011,  # Fire Ice
    1116,  # Sulfuric Acid
    1013,  # Fractal Silicon
    1012,  # Kimberlite Ore
    1003]  # Silicon Ore

def translate_fields(translations, proto_set, fields):
    """In-place replace text with translations for one proto_set."""
    for item in proto_set.data_array:
        for field in fields:
            val = getattr(item, field)
            if val:
                setattr(item, field, translations.get(val, '**' + val + '**'))

def translate_data(data, lang):
    """In-place translate all text fields in 'data'."""
    translations = {}
    VALID_LANGS = ['zh_cn', 'en_us', 'fr_fr']
    if lang not in VALID_LANGS:
        raise RuntimeError(
            f'{lang!r} is not a valid language, choose one of {VALID_LANGS}')
    for proto in data.StringProtoSet.data_array:
        translations[proto.name] = getattr(proto, lang)
    translate_fields(translations, data.ItemProtoSet,
                     ['name', 'mining_from', 'produce_from', 'description'])
    translate_fields(translations, data.RecipeProtoSet, ['name', 'description'])
    translate_fields(translations, data.TechProtoSet, ['name', 'description', 'conclusion'])
    for k, text in MADE_FROM.items():
        MADE_FROM[k] = translations.get(text, text)
    for i, text in enumerate(BUILDING_CATEGORIES):
        BUILDING_CATEGORIES[i] = translations.get(text, text).rstrip(' (0123456789)')

def wiki_title(name):
    """Like title(), except it never lowercases a letter."""
    return ''.join(min(x,y) for x,y in zip(name, name.title()))

def color_sub(desc):
    """Replace all <color="#B9DFFFC4">(rare)</color> tags with equivalent HTML.

    Also replaces newlines with <br>, which otherwise would get interpreted as
    paragraph breaks.
    """
    return (COLOR_RE
        .sub('<span style="color:\\1">\\2</span>', desc)
        .replace('\n', '<br>'))


def set_valid(items_map, recipe_entry):
    """Set the given recipe_entry valid, and also the associated item(s)"""
    recipe_entry[1] = False
    # Don't bother checking the inputs, we'll assume that a valid tech
    # means they're attainable.
    for iid in recipe_entry[0].results:
        items_map[iid][1] = False

def recipe_key(recipe):
    """Calculate a sort key for recipes"""
    key = recipe.id
    return KEY_TWEAKS.get(key, key)

def create_augmented_maps(data):
    """Create augmented maps to determine whether items/recipes are disabled or not.

    The return is a tuple of (items_map, recipes_map), where each map goes
    from id -> [object, is_disabled]. For recipes, disabled means it should
    never be shown. For items, it should still probably be allowed for direct
    lookups (i.e. Infobox queries), but not for traversals (e.g. creating a
    grid layout of all the items).
    """
    items = data.ItemProtoSet.data_array
    items.sort(key=lambda x:x.id)
    items_map = {}
    # The unlock_key field lets us know for sure that an item is not disabled,
    # and if a recipe is unlocked from a non-disabled tech, or if it is
    # unlocked from the start, then it is not disabled.
    for item in items:
        # Second element is whether item is disabled
        items_map[item.id] = [item, item.unlock_key == 0]

    recipes = data.RecipeProtoSet.data_array
    # The first part of the key determines if this is a building recipe, based
    # on its grid index.
    recipes.sort(key=lambda x:(
        x.grid_index // 1000, x.type.name, recipe_key(x)))
    recipes_map = {}
    for rec in recipes:
        # Second element is whether recipe is disabled
        entry = [rec, True]
        recipes_map[rec.id] = entry
        if rec.id in STARTING_RECIPES:
            set_valid(items_map, entry)

    techs = data.TechProtoSet.data_array
    techs.sort(key=lambda x:x.id)
    for tech in techs:
        if not tech.published:
            continue
        for rid in tech.unlock_recipes:
            set_valid(items_map, recipes_map[rid])
    return items_map, recipes_map

#   NEW CODE

def format_item_for_JSON(item_entry):
    item, disabled = item_entry
    if disabled:
        return None
    if item.id == 1121: #Deuterium hack ???
        item.produce_from = None
    fields = {
        'game_id': str(item.id),
        'name':wiki_title(item.name),
        'type':item.type.name,
        'stack_size':item.stack_size
    }
    item.grid_index = str(item.grid_index)
    if item.grid_index[0] == "1":
        fields['group'] = "items"
    else:
        fields['group'] = "buildings"
    fields['subgroup'] = "row" + item.grid_index[1]
    fields['order'] = int(item.grid_index[2] + item.grid_index[3])
    return (fields['name'], fields)

def mapIDs(items_map):
    ID_dict = {}
    for x in items_map.values():
        item, disabled = x
        if disabled:
            continue
        ID_dict[item.id] = wiki_title(item.name)
    return ID_dict

def format_recipe_for_JSON(recipe_entry, ID_dict):
    rec, disabled = recipe_entry

    time_spend = round(rec.time_spend / 60.0, 3)
    if time_spend == int(time_spend):
        time_spend = int(time_spend)
    if 0 < time_spend < 1:
        time_spend = str(time_spend).lstrip("0")

    inputs = []
    outputs = []
    for i in range(0, len(rec.items)):
        fullItem = {}
        fullItem["name"] =  str(ID_dict[rec.items[i]]) #name
        fullItem["amount"] = rec.item_counts[i] #amount
        inputs.append(fullItem)
    for i in range(0, len(rec.results)):
        fullItem = {}
        fullItem["name"] = str(ID_dict[rec.results[i]]) #name
        fullItem["amount"] = rec.result_counts[i] #amount
        outputs.append(fullItem)

    fields = {
        'id': str(rec.id),
        'name': wiki_title(rec.name),
        'category': rec.type.name,
        'ingredients': inputs,
        'results': outputs,
        'energy_required': time_spend,
    }
    if disabled:
        fields['disabled'] = 'true'

    if rec.name == 'Deuterium Fractionation':
        fields['energy_required'] = 1
        fields['ingredients'][0]['amount'] = 1
        fields['results'][0]["probability"] = 0.01
        fields['results'].append({"name": "Hydrogen", "amount": 1, "probability":0.99})
    
    return (fields['name'], fields)

def prepare_resources(items):
    all_resources = []
    for x in items:
        item = items[x]
        if item["type"] == "RESOURCE":
            all_resources.append(item)
    
    prepped_resources = {}
    for x in all_resources:
        fields = {}
        if (x["name"] != "Silicon Ore"):
            fields["name"] = x["name"]
        else:
            fields["name"] = "Silicon Vein"
        fields["minable"] = {
            "mining_time": 1,
            "results": [{
                "amount": 1,
                "name": x["name"]
            }]
        }
        prepped_resources[x["name"]] = fields


    #all_resources.append(manual_JSON.organic_crystal_hack(items))
    return prepped_resources

def print_JSON(data):
    """Sturctured like print_wiki, but as a JSON string"""
    items_map, recipes_map = create_augmented_maps(data)
    mega_dict = {
        #"assembling-machine":{},
        #"furnace":{},
        #"groups":{},
        "items":{}, 
        #"mining-drill":{},
        "recipes":{}, 
        #"resource":{},
        #"transport-belt":{}
        }
    mega_dict["assembling-machine"] = manual_JSON.prepare_assemblers()
    mega_dict["furnace"] = manual_JSON.prepare_furnaces()
    mega_dict["groups"] = manual_JSON.prepare_groups()
    for x in items_map.values():
        new_item = format_item_for_JSON(x)
        if new_item != None:
            mega_dict["items"][new_item[0]] = new_item[1]
    mega_dict["mining-drill"] = manual_JSON.prepare_drills()
    id_to_name_dict = mapIDs(items_map)
    for x in recipes_map.values():
        new_rec = format_recipe_for_JSON(x, id_to_name_dict)
        mega_dict["recipes"][new_rec[0]] = new_rec[1]
    # mega_dict["recipes"] = manual_JSON.custom_oil(mega_dict["recipes"])
    mega_dict["resource"] = prepare_resources(mega_dict["items"])
    mega_dict["transport-belt"] = manual_JSON.prepare_belts()

    # "../data/data.json"
    save_file = open("../data/testing_data.json", "w")
    save_file.write(json.dumps(mega_dict))
    save_file.close

#    END NEW CODE

# pylint: disable=too-many-branches
def main():
    """Main function, keeps a separate scope"""
    parser = argparse.ArgumentParser()
    parser.add_argument('--lang', '-l', default='en_us',
                        help='Language to translate all strings to')
    parser.add_argument('--json', action='store_true',
                        help='Similar to wiki, but formatted as JSON.')
    args = parser.parse_args()

    print('Reading data... ', end='', flush=True, file=sys.stderr)
    data = dysonsphere.load_all()
    translate_data(data, args.lang)
    print('Done!', flush=True, file=sys.stderr)

    try:
        if args.json:
            print_JSON(data)
        else:
            print('Nothing to do!', file=sys.stderr)
    except RuntimeError as ex:
        print(ex, file=sys.stderr)

if __name__ == '__main__':
    main()
