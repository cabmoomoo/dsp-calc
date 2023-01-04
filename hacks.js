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