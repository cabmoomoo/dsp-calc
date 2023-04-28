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

function Item(name, col, row, phase, group, subgroup, order, sprays) {
    this.name = name
    this.icon_col = col
    this.icon_row = row
    this.recipes = []
    this.uses = []
    this.phase = phase
    this.group = group
    this.subgroup = subgroup
    this.order = order
    this.sprays = sprays
}
Item.prototype = {
    constructor: Item,
    addRecipe: function(recipe) {
        this.recipes.push(recipe)
    },
    addUse: function(recipe) {
        this.uses.push(recipe)
    },
    isWeird: function() {
        if (this.recipes.length > 1) {
            let recipeCount = this.recipes.length
            for (let x of this.recipes) {
                if (x.name in solver.disabledRecipes) {
                    recipeCount--
                }
            }
            if (recipeCount != 1) {
                return true
            }
        } else if (this.recipes[0].solveGroup !== null) {
            return true
        }
        return false
    },
    produce: function(rate, ignore, spec) {
        var prolif
        try {
            prolif = spec.spec[this.name].modules[0]
        } catch {
            prolif = false
        }
        if (prolif) {
            prolif = solver.items[prolif.name]
        }
        var totals = new Totals(rate, this)
        if (this.isWeird()) {
            totals.addUnfinished(this.name, rate)
            return totals
        }
        var recipe = nonDisabledRecipe(this)
        var gives = recipe.gives(this, spec)
        rate = rate.div(gives)
        totals.add(recipe.name, rate)
        if (ignore[recipe.name]) {
            return totals
        }
        var ingredients = recipe.ingredients.concat(recipe.fuelIngredient(spec))
        for (var i=0; i < ingredients.length; i++) {
            var ing = ingredients[i]
            var ingAmount = rate.mul(ing.amount)
            var subTotals = ing.item.produce(ingAmount, ignore, spec)
            // I don't like this way of handling self proliferation. It's not very performant and uses an arbitrary hard-coded precision. 
            if (prolif && !ingAmount.less(tinyNum)) {
                var prolifSubTotals = prolif.produce(ingAmount.div(prolif["sprays"]), ignore, spec)
                subTotals.combine(prolifSubTotals)
            }
            totals.combine(subTotals)
        }
        return totals
    },
    renderTooltip: function(extra) {
        if (this.recipes.length === 1 && this.recipes[0].name === this.name) {
            return this.recipes[0].renderTooltip(extra)
        }
        var t = document.createElement("div")
        t.classList.add("frame")
        var title = document.createElement("h3")
        var im = getImage(this, true)
        title.appendChild(im)
        title.appendChild(new Text(formatName(this.name)))
        t.appendChild(title)
        if (extra) {
            t.appendChild(extra)
        }
        return t
    }
}

function nonDisabledRecipe(item) {
    let allRecipes = item.recipes
    for (let rec of allRecipes) {
        if (!(rec.name in solver.disabledRecipes)) {
            return rec
        }
    }
}

function getItem(data, items, name) {
    if (name in items) {
        return items[name]
    } else {
        var d = data.items[name]
        var phase
        if (d.type == "fluid") {
            phase = "fluid"
        } else {
            phase = "solid"
        }
        var sprays
        if (d.sprays) {
            sprays = RationalFromFloat(d.sprays)
        } else {
            sprays = zero
        }
        var item = new Item(
            name,
            d.icon_col,
            d.icon_row,
            phase,
            d.group,
            d.subgroup,
            d.order,
            sprays
        )
        items[name] = item
        return item
    }
}

function getItems(data) {
    var items = {}
    return items
}
