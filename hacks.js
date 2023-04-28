/* Copyright 2022 Caleb Barbee

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

// This file is for any and all messy hacks I have to do for needy recipes. 

/* 
Deuterium Fractionation is a silly recipe in that it works at the speed of your belt. It'll process hydrogen as fast as you can feed it, making your belt speed the main determiner in how many building you need to get your desired output. The function below figures the average time to produce a deuterium, and sets the recipe time accordingly. The result in the calculator is the average number of fractionators required to produce at that rate.
*/
function hackDeuteriumFractionation() {
    rec = solver.recipes["Deuterium Fractionation"]
    prodSpeed = preferredBeltSpeed.mul(RationalFromString("0.01"))
    rec.time = prodSpeed.reciprocate()
    // Also see: setPreferredBelt in settings.js
}

/*
When you spray proliferator with proliferator, the number of sprays increases. This code is very ugly, and there are probably better ways to handle it, but meh. This is a setting that most will only change once.
*/
function hackSelfProlifChange(module) {
    proliferator = module["name"]
    if (proliferator == "Proliferator Mk.I") {
        solver.items["Proliferator Mk.I"].sprays = RationalFromFloat(13)
        solver.items["Proliferator Mk.II"].sprays = RationalFromFloat(27)
        solver.items["Proliferator Mk.III"].sprays = RationalFromFloat(67)
    }
    else if (proliferator == "Proliferator Mk.II") {
        solver.items["Proliferator Mk.I"].sprays = RationalFromFloat(14)
        solver.items["Proliferator Mk.II"].sprays = RationalFromFloat(28)
        solver.items["Proliferator Mk.III"].sprays = RationalFromFloat(72)
    }
    else if (proliferator == "Proliferator Mk.III") {
        solver.items["Proliferator Mk.I"].sprays = RationalFromFloat(15)
        solver.items["Proliferator Mk.II"].sprays = RationalFromFloat(30)
        solver.items["Proliferator Mk.III"].sprays = RationalFromFloat(75)
    }
    else {
        solver.items["Proliferator Mk.I"].sprays = RationalFromFloat(12)
        solver.items["Proliferator Mk.II"].sprays = RationalFromFloat(24)
        solver.items["Proliferator Mk.III"].sprays = RationalFromFloat(60)
    }
}