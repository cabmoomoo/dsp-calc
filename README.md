# Factorio Calculator

This is the repostory for the [Dyson Sphere Program Calculator](https://cabmoomoo.github.io/dsp-calc/), a tool for calculating resource requirements and production ratios in the game [Dyson Sphere Program](https://store.steampowered.com/app/1366540/Dyson_Sphere_Program/).


## Running locally

For this project, in order to replicate the features of GitHub Pages, I used jekyll to build and serve the page. Once the required resources are installed, the process is entirely local, despite opening in a browser and running like the main site would. 

I followed two tutorials for this process, one from [github docs](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll), and the other by [Karl Broman](https://kbroman.org/simple_site/pages/local_test.html).

## Dumping new datasets

This project yoinks a data reading python script from [d0sboots](https://github.com/d0sboots/dyson-sphere-program). A disappointing amount of the data files are generated manually, so major updates to the game may require major re-writes to this modifed script (yay...). 

To use the data generation scripts, you'll need to be able to extract a few files from the game's unity assets. To do this, I used the [Unity Asset Bundle Extractor](https://github.com/SeriousCache/UABE), which Firefox thought contained virus. My computer isn't on fire and the files need extracted successfully, so it's *probably* safe. There are some more details in dyson_wiki.py and dysonsphere.py.

To update the images, I used a very old version of UnityEX (I don't know where you can safely find a free version of this any more), though I think UABE can do this as well. The filenames used for images in the game are not the same as the translated recipe/item names, so the process was painfully manual. Fortunately, unless they double the resolution on their item icons or something, you should only have to add new items.

## Credit Where It's Due

As explained in a few other places, this calculator is an amalgamation of two or three other projects. This calculator was made piggy-backing off the hard work of Kirk McDonald and the other contributors to the [Factorio Calculator](https://kirkmcdonald.github.io/calc.html). The idea for this project came from another [DSP calculator](https://yesterdaysun.github.io/dsp-calculator/), which seems to have also started from another of Kirk McDonald's works. Finally, the data-generation section of this project uses a modified verson of [this Python script](https://github.com/d0sboots/dyson-sphere-program) which was originally made to pull data for a DSP wiki. Oh, and if you're interested in how the matrix solver works for oil, check out the about page for the Factorio Calculator.

In order to make this calculator, I've had to make several significant changes to both projects, so I believe this counts as fair derivative work. Still, the base design of the calculator, the matrix solver, and even the front-end web interface are basically untouched. I always loved using the Factorio Calculator, and I hope, even with its flaws, someone will get some good use out of my modification.
