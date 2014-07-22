---
title: pyrrtm
layout: default
---

[pyrrtm](https://github.com/tomflannaghan/pyrrtm) is a python wrapper to the [RRTM](http://rtweb.aer.com/rrtm_frame.html) radiation code.

[RRTM](http://rtweb.aer.com/rrtm_frame.html) is widely used in atmospheric science, but the code has a rather nasty ascii interface that is a big obstacle to using the code in scripts, and also inhibits performance if lots of radiative transfer calculations need doing. pyrrtm addresses these issues.

- The project has a [github repository](https://github.com/tomflannaghan/pyrrtm) where you can download the package.
- Documentation is available [here](http://pyrrtm.flannaghan.com).
- Please [contact me](mailto:tomflannaghan@gmail.com) if you wish to contribute or have any questions.

pyrrtm also includes a NetCDF-based [command-line interface](https://github.com/tomflannaghan/pyrrtm/blob/master/cli_doc.org) that can be used from outside python (it does not require python at all).
