/*Copyright 2015-2019 Kirk McDonald

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

function Belt(name, speed) {
    this.name = name
    this.speed = speed
}

function getBelts(data) {
    var beltData = data["transport-belt"]
    var beltObjs = []
    for (var beltName in beltData) {
        var beltInfo = beltData[beltName]
        var speed = RationalFromFloat(beltInfo["speed"])
        beltObjs.push(new Belt(beltName, speed))
    }
    beltObjs.sort(function(a, b) {
        if (a.speed.less(b.speed)) {
            return -1
        } else if (b.speed.less(a.speed)) {
            return 1
        }
        return 0
    })
    return beltObjs
}
