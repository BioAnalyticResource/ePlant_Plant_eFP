# ePlant Plant eFP

The ePlant Plant eFP is a tissue expression API provided by the [Bio-Analytic Resource for Plant Biology (BAR)](https://bar.utoronto.ca/) from the University of Toronto. This tool will provide visualized tissue expression data corresponding for Arabidopsis thaliana with one of the listed [compendiums](./compendiums).

[![Follow on Twitter](https://img.shields.io/twitter/follow/BAR_PlantBio?style=social)](https://twitter.com/BAR_PlantBio)
[![GitHub repo size](https://img.shields.io/github/repo-size/BioAnalyticResource/ePlant_Plant_eFP)](https://github.com/BioAnalyticResource/ePlant_Plant_eFP)
[![GitHub](https://img.shields.io/github/license/BioAnalyticResource/ePlant_Plant_eFP)](https://github.com/BioAnalyticResource/ePlant_Plant_eFP)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fbar.utoronto.ca%2F~asullivan%2FePlant_Plant_eFP%2F)](https://bar.utoronto.ca/~asullivan/ePlant_Plant_eFP/)

## Getting Started

To use the ePlant Plant eFP, you will be required to either call the [tissueExpressionBAR.js](tissueExpressionBAR.js) from our hosted location (https://raw.githubusercontent.com/BioAnalyticResource/ePlant_Plant_eFP/master/tissueExpressionBAR.min.js) or download the files locally (including the tissueExpressionBAR.js, compendiums and data) which can be done using the following:

`git clone https://github.com/BioAnalyticResource/ePlant_Plant_eFP.git`

Just an important note, the ePlant Plant eFP tissue expression API requires an online connection to run and display data correctly.

## How to use

For the ePlant Plant eFP to work correctly, you need to call the CreateSVGExpressionData's generateSVG. For generateSVG, you will need the desired compendium you wish to call, the gene/locus input as formatted by AGI ID (example: AT3G24650) and the ID of the desired location for this information to be printed to (example: a div with ID 'desiredDOM'):

```javascript
// A variable already exists called createSVGExpressionData for CreateSVGExpressionData
// but if you wish to create your own function, just instantiate a new one
// through variableName = new CreateSVGExpressionData();

// To create your own visualized tissue expression, call generateSVG(). Documentation below:
// /**
//  * Create and generate an SVG based on the desired tissue expression locus
//  * @param {String} locus The AGI ID (example: AT3G24650)
//  * @param {String} desiredDOMid The desired DOM location or if kept empty, would not replace any DOM elements and just create the related HTML DOM elements within appendSVG
//  * @param {String} svgName Name of the SVG file without the .svg at the end. Default is set to "default", when left this value, the highest expression value (if any) is chosen and if not, then Abiotic Stress is.
//  * @param {Boolean} includeDropdownAll true = include a html dropdown/select of all available SVGs/samples, false = don't
//  * @param {String | Number} containerHeight The height of the SVG container, default is 100vh
//  * @returns {String} If no desiredDOMid is given, returns the string version of the output instead
//  */
createSVGExpressionData.generateSVG("AT3G24650", "desiredDOM", "default");
// or
window.createSVGExpressionData.generateSVG("AT3G24650", "desiredDOM", "default");
```

This will display the visualized and coloured tissue expression data within the desired location.

Instructions with an example can be found here: [https://bar.utoronto.ca/~asullivan/ePlant_Plant_eFP/example/index.html](https://bar.utoronto.ca/~asullivan/ePlant_Plant_eFP/example/index.html) (or in the example's [index.html](./example/index.html)).

[![Maintainability](https://api.codeclimate.com/v1/badges/ed34ffac71dd5a1b2d72/maintainability)](https://codeclimate.com/github/BioAnalyticResource/ePlant_Plant_eFP/maintainability)

## Browser Compatibilities

| Chrome | Firefox | IE  | Edge | Safari | Opera | Tor | Mobile |
| ------ | ------- | --- | ---- | ------ | ----- | --- | ------ |
| ✔      | ✔       | X   | ✔    | ✔      | ✔     | ✔   | ✔      |

## Known issues

We aim to make the ePlant Plant eFP as perfect as possible but unfortunately, there may be some unforeseen bugs. If you manage to find one that is not here, feel free to create a [bug report](https://github.com/BioAnalyticResource/ePlant_Plant_eFP/issues/new/choose) so we can fix it.

-   None at the moment... Help us find some!

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## License

[GPL-2.0](LICENSE)

## Authors

-   Alexander Sullivan - [GitHub](https://github.com/ASully), [Twitter](https://twitter.com/alexjsully), [ORCiD](https://orcid.org/0000-0002-4463-4473), [LinkedIn](https://www.linkedin.com/in/alexanderjsullivan/), [Website](https://alexjsully.me/)
-   Asher Pasha - [Github](https://github.com/asherpasha), [Twitter](https://twitter.com/AsherPasha), [ORCiD](https://orcid.org/0000-0002-9315-0520)
-   Youyang Li - [Github](https://github.com/lyy321)
-   Nicholas J. Provart - [Github](https://github.com/BioAnalyticResource), [Twitter](https://twitter.com/BAR_PlantBio), [Website](https://bar.utoronto.ca)
