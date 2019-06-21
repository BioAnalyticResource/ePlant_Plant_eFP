# ePlant Plant eFP

The ePlant Plant eFP is a tissue expression API provided by the [Bio-Analytic Resource for Plant Biology (BAR)](https://bar.utoronto.ca/) from the University of Toronto. This tool will provide visualized tissue expression data corresponding for Arabidopsis thaliana with one of the listed [compendiums](./compendiums).

## Getting Started

To use the ePlant Plant eFP, you will be required to either call the [tissueExpressionBAR.js](tissueExpressionBAR.js) from our hosted location (https://raw.githubusercontent.com/BioAnalyticResource/ePlant_Plant_eFP/master/tissueExpressionBAR.min.js) or download the files locally (including the tissueExpressionBAR.js, compendiums and data). 

Just an important note, the ePlant Plant eFP tissue expression API requires an online connection to run correctly.

## How to use

For the ePlant Plant eFP to work correctly, you need to call the CreateSVGExpressionData's generateSVG. For generateSVG, you will need the desired compendium you wish to call, the gene/locus input as formatted by AGI ID (example: AT3G24650) and the ID of the desired location for this information to be printed to (example: a div with ID 'desiredDOM'):

```javascript
// A variable already exists called createSVGExpressionData for CreateSVGExpressionData 
// but if you wish to create your own function, just instantiate a new one 
// through variableName = new CreateSVGExpressionData();
createSVGExpressionData.generateSVG('AbioticStress', 'AT3G24650', 'desiredDOM');
```

This will display the visualized and coloured tissue expression data within the desired location. 

## Browser Compatibilities 

Chrome | Firefox | IE | Edge | Safari | Opera | Mobile
--- | --- | --- | --- | --- | --- | --- |
✔ |  ✔ | ? |  ✔ | ? |  ✔ | ✔ | 

## Known issues

We aim to make the ePlant Plant eFP as perfect as possible but unfortunately, there may be some unforeseen bugs. If you manage to find one that is not here, feel free to create a [bug report](https://github.com/BioAnalyticResource/ePlant_Plant_eFP/issues/new/choose) so we can fix it.
* None at the moment... Help us find some!

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## License

[GPL-2.0](LICENSE)

## Authors

* Alexander Sullivan - [GitHub](https://github.com/ASully), [Twitter](https://twitter.com/alexjsully), [ORCiD](https://orcid.org/0000-0002-4463-4473), [LinkedIn](https://www.linkedin.com/in/alexanderjsullivan/)
* Asher Pasha - [Github](https://github.com/asherpasha), [ORCiD](https://orcid.org/0000-0002-9315-0520)
* Nicholas J. Provart - [Github](https://github.com/BioAnalyticResource), [Twitter](https://twitter.com/BAR_PlantBio), [Website](http://bar.utoronto.ca)
