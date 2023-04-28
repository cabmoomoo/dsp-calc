/*Copyright 2022 Caleb Barbee
Original Work Copyright Kirk McDonald

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/
"use strict"

/* 
At some point, I might want to remove the Modification system, as it is unlikely this calculator will ever need to support multiple recipe sets, different versions of the game, or mods. At the same time, it doesn't hurt to be optimistic about the future of the game. Who knows, maybe some day we'll be able to support complete overhaul modpacks.
 */

// data set
function Modification(name, filename, legacy, sheetSize) {
    this.name = name
    this.filename = filename
    this.legacy = legacy
    this.sheetSize = sheetSize
}

var MODIFICATIONS = {
    "Base": new Modification("Base Game", "data.json", false, [480, 512]),
}

var DEFAULT_MODIFICATION = "Base"

function addOverrideOptions(version) {
    var tag = "local-" + version.replace(/\./g, "-")
    MODIFICATIONS[tag] = new Modification("Local game data " + version, "local-" + version + ".json")
    MODIFICATIONS[tag + "x"] = new Modification("Local game data " + version + " - Expensive", "local-" + version + "-expensive.json")
    DEFAULT_MODIFICATION = tag
}


// Ideally we'd write this as a generalized function, but for now we can hard-
// code these version upgrades.
var modUpdates = {
}

function normalizeDataSetName(modName) {
    let newName = modUpdates[modName]
    if (newName) {
        modName = newName
    }
    if (modName in MODIFICATIONS) {
        return modName
    }
    return DEFAULT_MODIFICATION
}

function renderDataSetOptions(settings) {
    var modSelector = document.getElementById("data_set")
    var configuredMod = normalizeDataSetName(settings.data)
    for (var modName in MODIFICATIONS) {
        var mod = MODIFICATIONS[modName]
        var option = document.createElement("option")
        option.textContent = mod.name
        option.value = modName
        if (configuredMod && configuredMod === modName || !configuredMod && modName === DEFAULT_MODIFICATION) {
            option.selected = true
        }
        modSelector.appendChild(option)
    }
}

// Returns currently-selected data set.
function currentMod() {
    var elem = document.getElementById("data_set")
    return elem.value
}

// color scheme
var DEFAULT_COLOR_SCHEME = "default"

var colorScheme

function renderColorScheme(settings) {
    var color = DEFAULT_COLOR_SCHEME
    if ("c" in settings) {
        color = settings.c
    }
    setColorScheme(color)
    var colorSelector = document.getElementById("color_scheme")
    if (!colorSelector.hasChildNodes()) {
        for (var i = 0; i < colorSchemes.length; i++) {
            var scheme = colorSchemes[i]
            var option = document.createElement("option")
            option.textContent = scheme.displayName
            option.value = scheme.name
            if (scheme.name === color) {
                option.selected = true
            }
            colorSelector.appendChild(option)
        }
    }
}

function setColorScheme(schemeName) {
    for (var i = 0; i < colorSchemes.length; i++) {
        if (colorSchemes[i].name === schemeName) {
            colorScheme = colorSchemes[i]
            colorScheme.apply()
            return
        }
    }
}

// display rate
var seconds = one
var minutes = RationalFromFloat(60)
var hours = RationalFromFloat(3600)

var displayRates = {
    "s": seconds,
    "m": minutes,
    "h": hours,
}
var longRateNames = {
    "s": "second",
    "m": "minute",
    "h": "hour",
}

var DEFAULT_RATE = "m"

var displayRateFactor = displayRates[DEFAULT_RATE]
var rateName = DEFAULT_RATE

function renderRateOptions(settings) {
    rateName = DEFAULT_RATE
    if ("rate" in settings) {
        rateName = settings.rate
    }
    displayRateFactor = displayRates[rateName]
    var oldNode = document.getElementById("display_rate")
    var cell = oldNode.parentNode
    var node = document.createElement("form")
    node.id = "display_rate"
    for (var name in displayRates) {
        var rate = displayRates[name]
        var input = document.createElement("input")
        input.id = name + "_rate"
        input.type = "radio"
        input.name = "rate"
        input.value = name
        if (rate.equal(displayRateFactor)) {
            input.checked = true
        }
        input.addEventListener("change", displayRateHandler)
        node.appendChild(input)
        var label = document.createElement("label")
        label.htmlFor = name + "_rate"
        label.textContent = "items/" + longRateNames[name]
        node.appendChild(label)
        node.appendChild(document.createElement("br"))
    }
    cell.replaceChild(node, oldNode)
}

// precisions
var DEFAULT_RATE_PRECISION = 3
var ratePrecision = DEFAULT_RATE_PRECISION

var DEFAULT_COUNT_PRECISION = 1
var countPrecision = DEFAULT_COUNT_PRECISION

function renderPrecisions(settings) {
    ratePrecision = DEFAULT_RATE_PRECISION
    if ("rp" in settings) {
        ratePrecision = Number(settings.rp)
    }
    document.getElementById("rprec").value = ratePrecision
    countPrecision = DEFAULT_COUNT_PRECISION
    if ("cp" in settings) {
        countPrecision = Number(settings.cp)
    }
    document.getElementById("fprec").value = countPrecision
}

// minimum assembler
var DEFAULT_MINIMUM = "1"

var minimumAssembler = DEFAULT_MINIMUM

function renderMinimumAssembler(settings) {
    var min = DEFAULT_MINIMUM
    // Backward compatibility.
    if ("use_3" in settings && settings.use_3 == "true") {
        min = "3"
    }
    var assemblers = spec.factories["ASSEMBLE"]
    if ("min" in settings) {
        min = settings.min
        if (Number(settings.min) > assemblers.length) {
            min = assemblers.length
        }
    }
    setMinimumAssembler(min)
    var oldNode = document.getElementById("minimum_assembler")
    var cell = oldNode.parentNode
    var node = document.createElement("span")
    node.id = "minimum_assembler"
    let dropdown = makeDropdown(d3.select(node))
    let inputs = dropdown.selectAll("div").data(assemblers).join("div")
    let labels = addInputs(
        inputs,
        "assembler_dropdown",
        (d, i) => String(i + 1) === min,
        (d, i) => changeMin(String(i + 1)),
    )
    labels.append(d => getImage(d, false, dropdown.node()))
    cell.replaceChild(node, oldNode)
}

function setMinimumAssembler(min) {
    spec.setMinimum(min)
    minimumAssembler = min
}

// furnace

// Assigned during FactorySpec initialization.
var DEFAULT_FURNACE

function renderFurnace(settings) {
    var furnaceName = DEFAULT_FURNACE
    if ("furnace" in settings) {
        furnaceName = settings.furnace
    }
    if (furnaceName !== spec.furnace.name) {
        spec.setFurnace(furnaceName)
    }
    var oldNode = document.getElementById("furnace")
    var cell = oldNode.parentNode
    var node = document.createElement("span")
    node.id = "furnace"
    let furnaces = spec.factories["SMELT"]
    let dropdown = makeDropdown(d3.select(node))
    let inputs = dropdown.selectAll("div").data(furnaces).join("div")
    let labels = addInputs(
        inputs,
        "furnace_dropdown",
        d => d.name === furnaceName,
        changeFurnace,
    )
    labels.append(d => getImage(d, false, dropdown.node()))
    cell.replaceChild(node, oldNode)
}

// alt-recipes

var SPECIAL_RESOURCES = [
    "Kimberlite Ore",
    "Fractal Silicon",
    "Optical Grating Crystal",
    "Spiniform Stalagmite Crystal",
    "Unipolar Magnet",
    "Fire Ice"
]

var ENABLED_ALTS = []

var DEFAULT_ENABLED_ALTS = []

function changeAltRecipe(recipe) {
    disableAltRecipes(recipe)
    itemUpdate()
}

function renderIngredient(ingSpan) {
    ingSpan.classed("ingredient", true)
        .attr("title", d => d.name)
        .append("img")
        .classed("icon", true)
        .attr("src", d => {return "images/"+d.name+".png"})
    ingSpan.append("span")
        .classed("count", true)
        .text(d => d.amount)
}

function renderAltRecipes(settings) {
    /* spec.altRecipes = new Map()
    if ("alt" in settings) {
        let alt = settings.get("alt").split(",")
        for (let recipeName of alt) {
            let recipe = solver.recipes[recipeName]
            spec.setRecipe(recipe)
        }
    } */

    let items = []
    for (let resource of SPECIAL_RESOURCES) {
        let resItem = solver.items[resource]
        let resRecipes = resItem.uses
        for (let rec of resRecipes) {
            let resProduct = rec.products[0].item
            if (resProduct.recipes.length < 2) {
                continue
            }
            solver.addDisabledRecipes({[rec.name]: true})
            items.push(resProduct)
        }
    }
    // Manually add special items with multiple recipes
    // Several others have multiple recipes (like refined oil),
    // but using a matrix to solve those is better
    // These recipes will typically be one recipe or the other
    items.push(solver.items["Silicon Ore"])
    items.push(solver.items["Organic Crystal"])
    items.push(solver.items["Space Warper"])
    items.push(solver.items["Deuterium"])
    let manualAlts = {
        "Silicon Vein": true,
        "Organic Crystal (Original)": true,
        "Organic Crystal Vein": true,
        "Space Warper (Advanced)": true,
        "Deuterium Fractionation": true
    }
    solver.addDisabledRecipes(manualAlts)

    for (let item of items) {
        for (let rec of item.recipes) {
            if (!(rec.name in solver.disabledRecipes)) {
                ENABLED_ALTS.push(rec.name)
            }
        }
    }

    DEFAULT_ENABLED_ALTS = [...ENABLED_ALTS]

    if ("alt" in settings) {
        let alts = settings.alt.split(",")
        for (let recipeName of alts) {
            if (recipeName) {
                while ((recipeName.search("%20")) > -1) {
                    recipeName = recipeName.replace("%20", " ")
                }
                disableAltRecipes(solver.recipes[recipeName])
            }
        }
    }

    let div = d3.select("#alt_recipe_settings")
    div.selectAll("*").remove()

    let inputs = div.selectAll("div")
        .data(items)
        .enter().append("div")
    let recipeLabel = dropdownInputs(
        inputs,
        d => d.recipes,
        d => `altrecipe-${d.products[0].item.name}`,
        d => !(d.name in solver.disabledRecipes),
        changeAltRecipe,
    )

    let productSpan = recipeLabel.append("span")
        .selectAll("span")
        .data(d => {
            let prodList = []
            for (let x of d.products) {
                let itemClone = {}
                itemClone.name = x.item.name
                itemClone.amount = x.amount
                prodList.push(itemClone)
            }
            return prodList
        })
        .join("span")
    renderIngredient(productSpan)
    recipeLabel.append("span")
        .classed("arrow", true)
        .text("\u21d0")
    let ingredientSpan = recipeLabel.append("span")
        .selectAll("span")
        .data(d => {
            let ingList = [];
            for (let x of d.ingredients) {
                let itemClone = {}
                itemClone.name = x.item.name
                itemClone.amount = x.amount
                ingList.push(itemClone)
            };
            return ingList
        })
        .join("span")
    renderIngredient(ingredientSpan)
}

function disableAltRecipes(recipe) {
    let recItem = recipe.products[0].item
    let altRecipes = recItem.recipes
    let allRecsObj = {}
    for (let rec of altRecipes) {
        if (ENABLED_ALTS.includes(rec.name)) {
            ENABLED_ALTS.splice(ENABLED_ALTS.indexOf(rec.name),1)
        }
        allRecsObj[rec.name] = true
    }
    solver.addDisabledRecipes(allRecsObj)
    let newRecObj = {}
    newRecObj[recipe.name] = true
    solver.removeDisabledRecipes(newRecObj)
    ENABLED_ALTS.push(recipe.name)
}


// oil

var DEFAULT_OIL = "HLoNc"

function changeOilPriority() {
    let highPrio = document.getElementById("highPrio")
    let lowPrio = document.getElementById("lowPrio")
    let noPrio = document.getElementById("noPrio")

    // While there can currently only be 1 item in each priority (hardcoded
    // in calc.html), doing it this way is just as easy and leaves room
    // for more priority choices in the future.
    if (highPrio.children.length > 0) {
        for (let childNode of highPrio.children) {
            let resName = childNode.name
            if (!(PRIORITY.includes(resName))) {
                PRIORITY.splice(-1,0,resName)
            }
        }
    }
    if (lowPrio.children.length > 0) {
        for (let childNode of lowPrio.children) {
            let resName = childNode.name
            if (!(PRIORITY.includes(resName))) {
                PRIORITY.splice(-1,0,resName)
            }
        }
    }
    if (noPrio.children.length > 0) {
        for (let childNode of noPrio.children) {
            let resName = childNode.name
            if (!(PRIORITY.includes(resName))) {
                continue
            }
            PRIORITY.splice(PRIORITY.indexOf(resName),1)
        }
    }
}

function handleOil(settings) {
    changeOilPriority()
}

// belt
var DEFAULT_BELT = "Conveyor Belt MK.I"

var preferredBelt = DEFAULT_BELT
var preferredBeltSpeed = null

function renderBelt(settings) {
    var pref = DEFAULT_BELT
    if ("belt" in settings) {
        pref = settings.belt
    }
    console.log(pref)
    setPreferredBelt(pref)
    var oldNode = document.getElementById("belt")
    var cell = oldNode.parentNode
    var node = document.createElement("span")
    node.id = "belt"
    let dropdown = makeDropdown(d3.select(node))
    let inputs = dropdown.selectAll("div").data(belts).join("div")
    let labels = addInputs(
        inputs,
        "belt_dropdown",
        d => d.name === preferredBelt,
        changeBelt,
    )
    labels.append(d => getImage(new BeltIcon(solver.items[d.name], d.speed), false, dropdown.node()))
    cell.replaceChild(node, oldNode)
}

function setPreferredBelt(name) {
    for (var i = 0; i < belts.length; i++) {
        var belt = belts[i]
        if (belt.name === name) {
            preferredBelt = name
            preferredBeltSpeed = belt.speed
        }
    }
    hackDeuteriumFractionation() //hacks.js
}

// mining productivity bonus

// Usable feature, but disabled until I can rework the math
var DEFAULT_MINING_PROD = "0"

function renderMiningProd(settings) {
    var mprod = DEFAULT_MINING_PROD
    if ("mprod" in settings) {
        mprod = settings.mprod
    }
    var mprodInput = document.getElementById("mprod")
    mprodInput.value = mprod
    spec.miningProd = getMprod()
}

function getMprod() {
    var mprod = document.getElementById("mprod").value
    return RationalFromFloats(Number(mprod), 100)
}

// default module
function renderDefaultModule(settings) {
    var defaultModule = null
    if ("dm" in settings) {
        defaultModule = shortModules[settings.dm]
    }
    spec.setDefaultModule(defaultModule)

    var oldDefMod = document.getElementById("default_module")
    var cell = oldDefMod.parentNode
    var node = document.createElement("span")
    node.id = "default_module"
    moduleDropdown(
        d3.select(node),
        "default_module_dropdown",
        d => d === defaultModule,
        changeDefaultModule,
    )
    cell.replaceChild(node, oldDefMod)
}

// default prolifMode
function renderDefaultProlifMode(settings) {
    var defaultProlifMode = 'Prod'
    if ("dpm" in settings) {
        defaultProlifMode = 'Speed'
    }
    spec.setDefaultProlifMode(defaultProlifMode)

    var dpmSlider = document.getElementById("default_prolif_mode")
    dpmSlider.value = defaultProlifMode == 'Prod' ? 1 : 2
    dpmSlider.classList.add("slider-" + defaultProlifMode)
    var dpmTip = document.getElementById("default_prolif_mode_tip")
    dpmTip.textContent = dpmSlider.value == 1 ? 'Productivity' : 'Speed'
    dpmTip.classList.add("tip-" + defaultProlifMode)
}

function updateProlifModeUI(mode) {
    var dpmSlider = document.getElementById("default_prolif_mode")
    dpmSlider.value = mode == 'Prod' ? 1 : 2
    dpmSlider.className = ("prolif-range slider-" + mode)
    var dpmTip = document.getElementById("default_prolif_mode_tip")
    dpmTip.textContent = dpmSlider.value == 1 ? 'Productivity' : 'Speed'
    dpmTip.className = ("setting-tip tip-" + mode)
}

// self-prolif settings
function renderSelfProlif(settings) {
    var defaultModule = null
    if ("sp" in settings) {
        defaultModule = shortModules[settings.sp]
    }

    var oldSelPro = document.getElementById("self_prolif")
    var cell = oldSelPro.parentNode
    var node = document.createElement("span")
    node.id = "self_prolif"
    moduleDropdown(
        d3.select(node),
        "self_prolif_dropdown",
        d => d === defaultModule,
        changeSelfProlif,
    )
    cell.replaceChild(node, oldSelPro)
}

// visualizer settings
let DEFAULT_VISUALIZER = "sankey"

let visualizer = DEFAULT_VISUALIZER

function renderVisualizerType(settings) {
    visualizer = DEFAULT_VISUALIZER
    if ("vis" in settings) {
        visualizer = settings.vis
    }
    let input = document.getElementById("vis_" + visualizer)
    input.checked = true
}

let DEFAULT_DIRECTION = "right"

let visDirection = DEFAULT_DIRECTION

function renderVisualizerDirection(settings) {
    visDirection = DEFAULT_DIRECTION
    if ("vd" in settings) {
        visDirection = settings.vd
    }
    let input = document.getElementById("visdir_" + visDirection)
    input.checked = true
}

const DEFAULT_NODE_BREADTH = 175

let maxNodeHeight = DEFAULT_NODE_BREADTH

function renderNodeBreadth(settings) {
    maxNodeHeight = DEFAULT_NODE_BREADTH
    if ("nh" in settings) {
        maxNodeHeight = Number(settings.nh)
    }
    let input = document.getElementById("vis-node-breadth")
    input.value = maxNodeHeight
}

const DEFAULT_LINK_LENGTH = 200

let linkLength = DEFAULT_LINK_LENGTH

function renderLinkLength(settings) {
    linkLength = DEFAULT_LINK_LENGTH
    if ("ll" in settings) {
        linkLength = Number(settings.ll)
    }
    let input = document.getElementById("vis-link-length")
    input.value = linkLength
}

// value format
var DEFAULT_FORMAT = "decimal"

var displayFormat = DEFAULT_FORMAT

var displayFormats = {
    "d": "decimal",
    "r": "rational"
}

function renderValueFormat(settings) {
    displayFormat = DEFAULT_FORMAT
    if ("vf" in settings) {
        displayFormat = displayFormats[settings.vf]
    }
    var input = document.getElementById(displayFormat + "_format")
    input.checked = true
}

// tooltips
var DEFAULT_TOOLTIP = true

var tooltipsEnabled = DEFAULT_TOOLTIP

function renderTooltip(settings) {
    tooltipsEnabled = DEFAULT_TOOLTIP
    if ("t" in settings) {
        tooltipsEnabled = settings.t !== "off"
    }
    var input = document.getElementById("tooltip")
    input.checked = tooltipsEnabled
}

// debug tab
var DEFAULT_DEBUG = false

var showDebug = DEFAULT_DEBUG

function renderShowDebug(settings) {
    showDebug = DEFAULT_DEBUG
    if ("debug" in settings) {
        showDebug = settings.debug === "on"
    }
    var debug = document.getElementById("render_debug")
    debug.checked = showDebug
}

// all
function renderSettings(settings) {
    renderTooltip(settings)
    renderColorScheme(settings)
    renderRateOptions(settings)
    renderPrecisions(settings)
    renderMinimumAssembler(settings)
    renderFurnace(settings)
    renderAltRecipes(settings)
    handleOil(settings) //Oil made directly in HTML
    renderBelt(settings)
    // renderMiningProd(settings)
    renderDefaultProlifMode(settings)
    renderDefaultModule(settings)
    renderSelfProlif(settings)
    renderVisualizerType(settings)
    renderVisualizerDirection(settings)
    renderNodeBreadth(settings)
    renderLinkLength(settings)
    renderValueFormat(settings)
}
