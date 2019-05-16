//============================ Alexander Sullivan =============================
//
// Purpose: Generates eFP tissue expression data
//
//=============================================================================

/**
 * Parses online data sources for information
 */
class RetrieveOnlineBARData {
    constructor() {
        // callPlantEFP
        this.callEFPObjects = {};
        // loadSampleData
        this.sampleData = {};
    }

    /**
     * Calls and stores the sample Data for the SVG, SVG's subunits, datasource and it's name-values 
     * @param {String} svgName Name of the SVG file without the .svg at the end
     * @param {String} locus The AGI ID (example: AT3G24650) 
     * @param {Boolean} continueForward Continue forward with the generation of the tissue expression data
     */
    loadSampleData(svgName, locus, continueForward = true) {
        let xhr = new XMLHttpRequest();
        let url = 'https://bar.utoronto.ca/~asullivan/ePlant_Plant_eFP/data/SampleData.json';

        xhr.responseType = 'json';
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                // Store response
                retrieveOnlineBARData.sampleData = xhr.response;
                // Setup and retrieve information about the target SVG and locus
                if (continueForward) {
                    retrieveOnlineBARData.retrieveSampleData(svgName, locus);
                };                
            };
        };

        xhr.open('GET', url);
        xhr.send();
    };

    /**
     * Retrieves the sample information relating to an SVG for a specific set of data
     * @param {String} svgName Name of the SVG file without the .svg at the end
     * @param {String} locus The AGI ID (example: AT3G24650) 
     */
    retrieveSampleData(svgName, locus) {
        // Check if svgName contains .svg
        if (svgName.substr(-4) === '.svg') {
            svgName = svgName.substr(0, svgName.length -4);
        }

        // Create variables that will be used in retrieveSampleData
        var sampleDataKeys = Object.keys(retrieveOnlineBARData.sampleData); // All possible SVGs 
        var sampleDB = ''; // The sample's datasource
        var sampleIDList = []; // List of all of the sample's IDs
        var sampleSubunits = []; // List of SVG's subunits

        // Check if valid SVG
        if (sampleDataKeys.includes(svgName)) {
            // Find position of the SVG name within the JSON data
            let DataKeyPos = sampleDataKeys.indexOf(svgName);

            // Create variables for parsing
            var sampleInfo = retrieveOnlineBARData.sampleData[sampleDataKeys[DataKeyPos]];
            var sampleOptions = sampleInfo['sample'];
            sampleDB = sampleInfo['db'];

            // If a database is available for this SVG, then find sample ID information
            if (sampleDB != undefined) {
                sampleSubunits = Object.keys(sampleInfo.sample);
                sampleIDList = [];
                for (var sK = 0; sK < sampleSubunits.length; sK++) {
                    sampleIDList = sampleIDList.concat(sampleOptions[sampleSubunits[sK]]);
                }
            }

            // Call plantefp.cgi webservice to retrieve information about the target tissue expression data
            retrieveOnlineBARData.callPlantEFP(sampleDB, locus, sampleIDList, svgName, sampleOptions);
        }
    };    

    /**
     * Calls the plantefp.cgi webservice to retrieve expression data from the BAR
     * @param {String} datasource Which database the information is contained in
     * @param {String} locus The AGI ID (example: AT3G24650) 
     * @param {Array} samples List of sample ID's which the exact expression data is related to
     * @param {String} svg Which SVG is being called 
     * @param {Array} sampleSubunits List of the SVG's subunits
     */
    callPlantEFP(datasource, locus, samples, svg, sampleSubunits) {
        let xhr = new XMLHttpRequest();
        // Create URL
        let url = 'https://bar.utoronto.ca/~asullivan/ePlant_Plant_eFP/webservice/plantefp.cgi?';
        url += 'datasource=' + datasource + '&';
        url += 'id=' + locus + '&';
        url += 'samples=[';
        for (var i = 0; i < samples.length; i++) {
           url += '"' + samples[i] + '"';
           if (i != samples.length-1) {
               url += ',';
           }
        }
        url += ']';

        xhr.responseType = 'json';
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                xhr.onload = function() {
                    // Create object based on response:
                    let subunitsList = Object.keys(sampleSubunits);
                    var response = xhr.response;

                    // Create SVG in dictionary
                    if (retrieveOnlineBARData.callEFPObjects[svg] === undefined) {
                        retrieveOnlineBARData.callEFPObjects[svg] = {};
                    }

                    // Create samples in dictionary
                    if (retrieveOnlineBARData.callEFPObjects[svg]['sample'] === undefined) {
                        retrieveOnlineBARData.callEFPObjects[svg]['sample'] = {};
                    }

                    // Create samples in dictionary
                    if (retrieveOnlineBARData.callEFPObjects[svg]['sample'] === undefined) {
                        retrieveOnlineBARData.callEFPObjects[svg]['sample'] = {};
                    }

                    // Add values
                    for (var t = 0; t < response.length; t++) {
                        // Create key and value variables
                        var responseName = response[t]['name'].trim();
                        var responseValue = response[t]['value'];
                        var subunitName = '';

                        // Create subunits element in dictionary
                        var tempName = responseName;                     
                        tempName = responseName.replace(/\+/g, '%2B');
                        tempName = tempName.replace(/ /g, '+');
                        tempName = tempName.trim();
                        for (var s = 0; s < subunitsList.length; s++) {  
                            if (sampleSubunits[subunitsList[s]].includes(tempName)) {
                                subunitName = subunitsList[s];
                            }
                        };

                        // Create subunit
                        if (retrieveOnlineBARData.callEFPObjects[svg]['sample'][subunitName] === undefined) {
                            retrieveOnlineBARData.callEFPObjects[svg]['sample'][subunitName] = {};
                        }

                        // Create responseName
                        if (retrieveOnlineBARData.callEFPObjects[svg]['sample'][subunitName][tempName] === undefined) {
                            retrieveOnlineBARData.callEFPObjects[svg]['sample'][subunitName][tempName] = {};
                        }

                        // Add to dictionary
                        retrieveOnlineBARData.callEFPObjects[svg]['sample'][subunitName][tempName][locus] = responseValue;
                    }

                    // Add db
                    retrieveOnlineBARData.callEFPObjects[svg]['db'] = datasource;

                    createSVGExpressionData.addSVGtoDOM(svg, locus);
                }
            }
        };

        xhr.open('GET', url);
        xhr.send();
    };
}
/**
 * Parses online data sources for information
 */
const retrieveOnlineBARData = new RetrieveOnlineBARData();

/**
 * Create and retrieve expression data in an SVG format
 */
class CreateSVGExpressionData {
    constructor() {
        // Local for this class
        this.desiredDOMid;
        // createSVGValues
        this.svgValues = {};
        this.svgMax;
        this.svgMin;
        this.svgMaxAverage;
        this.svgMinAverage;
        // Store object name:
        this.svgObjectName;
        // Start or finished colouring:
        this.finishedColouring = false;
    };

    /**
     * Add the SVG to the designated DOM
     * @param {String} svgName Name of the SVG file without the .svg at the end
     * @param {String} locus The AGI ID (example: AT3G24650) 
     */
    addSVGtoDOM(svgName, locus) {
        // Call SVG file
        var urlSVG = 'https://bar.utoronto.ca/~asullivan/ePlant_Plant_eFP/SVG/' + svgName + '.svg';

        // Empty target region
        var targetDOMRegion = document.getElementById(createSVGExpressionData.desiredDOMid);
        targetDOMRegion.innerHTML = '';

        // Append SVG to document
        var appendSVG = '<object id="' + svgName + '_object" data="' + urlSVG + '" type="image/svg+xml"></object>';
        targetDOMRegion.innerHTML = appendSVG;
        createSVGExpressionData.svgObjectName = svgName + '_object';

        // Wait for SVG to load
        var svgLoaded = false;
        while (svgLoaded === false) {
            if (targetDOMRegion.innerHTML != '') {
                // End while loop
                svgLoaded = true;

                // Change shape of SVG
                let svgObject = document.getElementById(svgName + '_object');
                svgObject.style = 'width: 100%; height: 100%; left: 0px; top: 0px; display: inline-block;';

                // Check locus to see if it matches 
                setTimeout(function() {
                    createSVGExpressionData.createLocusMatch(svgName, locus);
                }, 200);
            };
        };
    };

    /**
     * Check and verify locus name
     * @param {String} whichSVG Name of the SVG file without the .svg at the end
     * @param {String} locus The AGI ID (example: AT3G24650) 
     */
    createLocusMatch(whichSVG, locus) {
        var locusPoint = locus;
        var locusValue = '';
        for (var i = 0; i < locusPoint.length; i++) {
            if (i === 1 || i === 3) {
                locusValue = locusValue + locusPoint[i].toLowerCase();
            }
            else {
                locusValue = locusValue + locusPoint[i];
            }
        }
        // console.log(locusValue);
        createSVGExpressionData.createSVGValues(whichSVG, locus);
    };

    /**
     * Retrieves and stores raw values based on the searched SVG
     * @param {String} whichSVG Name of the SVG file without the .svg at the end
     * @param {String} locus The AGI ID (example: AT3G24650) 
     */
    createSVGValues(whichSVG, locus) {
        // Create variables used for this function:
        let svgSamples = []; // List of sample's included in this expression call

        // Retrieve tissue expression information 
        let dataObject = retrieveOnlineBARData.callEFPObjects; 
        let svgDataObject = dataObject[whichSVG]['sample'];

        // Find tissue expression's sample IDs
        let svgSubunits = Object.keys(svgDataObject);
        for (var i = 0; i < svgSubunits.length; i++) {
            svgSamples.push(svgDataObject[svgSubunits[i]]);
        }

        // Find respective values
        for (var n = 0; n < svgSubunits.length; n++) {
            var sampleValues = Object.keys(svgDataObject[svgSubunits[n]]);
            // Create SVG subunit in dictionary
            if (createSVGExpressionData.svgValues[svgSubunits[n]] === undefined) {
                createSVGExpressionData.svgValues[svgSubunits[n]] = {};
            }
            // Add raw values
            for (var v = 0; v < sampleValues.length; v++) {
                // Create raw values in dictionary
                if (createSVGExpressionData.svgValues[svgSubunits[n]]['rawValues'] === undefined) {
                    createSVGExpressionData.svgValues[svgSubunits[n]]['rawValues'] = [];
                }
                createSVGExpressionData.svgValues[svgSubunits[n]]['rawValues'].push(svgDataObject[svgSubunits[n]][sampleValues[v]][locus]);
            }
        }
        createSVGExpressionData.findMaxAndMin(whichSVG, svgSubunits);
    };

    /**
     * Find the maximum, minimum and average values
     * @param {String} whichSVG Name of the SVG file without the .svg at the end
     * @param {*} svgSubunits 
     */
    findMaxAndMin(whichSVG, svgSubunits) {
        // Reset variables 
        createSVGExpressionData.svgMax = undefined;
        createSVGExpressionData.svgMin = undefined;

        // Iterate over each SVG subunit for their respective values
        for (var i = 0; i < svgSubunits.length; i++) {
            var values = createSVGExpressionData.svgValues[svgSubunits[i]]['rawValues'].sort();
            var numValues = [];
            for (var y = 0; y < values.length; y++) {
                if (isNaN(values[y]) === false) {
                    numValues.push(parseFloat(values[y]))
                }
            }

            // Find averages
            var sumValues = 0;
            for (var v = 0; v < numValues.length; v++) {
                sumValues += numValues[v];
            }
            var averageValues = (sumValues / numValues.length);

            // Compare max values
            var maxValue = numValues[numValues.length - 1];
            var minValue = numValues[1];
            if (createSVGExpressionData.svgMax === undefined) {
                createSVGExpressionData.svgMax = maxValue;
            } else {
                if (maxValue > createSVGExpressionData.svgMax) {                   
                    createSVGExpressionData.svgMax = maxValue;
                }
            };
            if (createSVGExpressionData.svgMin === undefined) {
                createSVGExpressionData.svgMin = minValue;
            } else {
                if (minValue < createSVGExpressionData.svgMin) {                   
                    createSVGExpressionData.svgMin = minValue;
                }
            };
            // Now for averages:
            if (createSVGExpressionData.svgMaxAverage === undefined) {
                createSVGExpressionData.svgMaxAverage = averageValues;
            } else {
                if (averageValues > createSVGExpressionData.svgMaxAverage) {                   
                    createSVGExpressionData.svgMaxAverage = averageValues;
                }
            };
            if (createSVGExpressionData.svgMinAverage === undefined) {
                createSVGExpressionData.svgMinAverage = averageValues;
            } else {
                if (averageValues < createSVGExpressionData.svgMinAverage) {                   
                    createSVGExpressionData.svgMinAverage = averageValues;
                }
            };

            // Add to value's dictionary:
            // Create SVG subunit in dictionary
            if (createSVGExpressionData.svgValues[svgSubunits[i]] === undefined) {
                createSVGExpressionData.svgValues[svgSubunits[i]] = {};
            }
            createSVGExpressionData.svgValues[svgSubunits[i]]['average'] = averageValues;
        };

        createSVGExpressionData.colourSVGs(whichSVG, svgSubunits);
    }

    /**
     * Colour the existing SVG that has been created
     * @param {String} whichSVG Name of the SVG file without the .svg at the end
     */
    colourSVGs(whichSVG, svgSubunits) {
        let svgObject = document.getElementById(whichSVG + '_object').getSVGDocument();
        for (var i = 0; i < svgSubunits.length; i++) {
            // Colouring values
            var denominator = createSVGExpressionData.svgMaxAverage - createSVGExpressionData.svgMinAverage;
            var numerator = createSVGExpressionData.svgValues[svgSubunits[i]]['average'] - createSVGExpressionData.svgMinAverage;
            if (numerator < 0) {
                numerator = 0;
            }
            var percentage = (numerator/denominator) * 100;
            if (percentage > 100) {
                percentage = 100;
            } else if ((percentage < 0) ||(percentage === undefined) || (percentage === null)) {
                percentage = 0;
            };
            // Check for duplicate error:
            var duplicateShoot = ['Control_Shoot_0_Hour', 'Cold_Shoot_0_Hour', 'Osmotic_Shoot_0_Hour', 'Salt_Shoot_0_Hour', 'Drought_Shoot_0_Hour', 'Genotoxic_Shoot_0_Hour', 'Oxidative_Shoot_0_Hour', 'UV-B_Shoot_0_Hour', 'Wounding_Shoot_0_Hour', 'Heat_Shoot_0_Hour'];
            var duplicateRoot = ['Control_Root_0_Hour', 'Cold_Root_0_Hour', 'Osmotic_Root_0_Hour', 'Salt_Root_0_Hour', 'Drought_Root_0_Hour', 'Genotoxic_Root_0_Hour', 'Oxidative_Root_0_Hour', 'UV-B_Root_0_Hour', 'Wounding_Root_0_Hour', 'Heat_Root_0_Hour'];
            var isdupShoot = false;
            var isdupRoot = false;
            if (duplicateShoot.includes(svgSubunits[i])) {
                isdupShoot = true;
            } else if (duplicateRoot.includes(svgSubunits[i])) {
                isdupRoot = true;
            };
            
            // Colouring
            var colourFill = createSVGExpressionData.percentageToColour(percentage);
            var childElements = svgObject.getElementById(svgSubunits[i]).childNodes;
            if (childElements.length > 0) {
                for (var c = 0; c < childElements.length; c++) {
                    if (childElements[c].nodeName === 'path' || childElements[c].nodeName === 'g') {           
                        childElements[c].setAttribute("fill", colourFill);       
                    }
                }
            } else {             
                svgObject.getElementById(svgSubunits[i]).setAttribute("fill", colourFill);
            };

            // Add interactivity 
            // Adding hover features:
            svgObject.getElementById(svgSubunits[i]).setAttribute("class", 'hoverDetails');
            svgObject.getElementById(svgSubunits[i]).addEventListener('mouseenter', function(event) {
                interactiveSVGData.addDetails(this.id);
            });
            svgObject.getElementById(svgSubunits[i]).addEventListener('mouseleave', function(event) {
                interactiveSVGData.removeDetails(this.id);
            });
            // Adding details about sub-tissue:
            var expressionLevel = parseFloat(numerator + createSVGExpressionData.svgMinAverage).toFixed(3);
            svgObject.getElementById(svgSubunits[i]).setAttribute("data-expressionValue", expressionLevel);
            var sampleSize = createSVGExpressionData.svgValues[svgSubunits[i]].rawValues.length;
            svgObject.getElementById(svgSubunits[i]).setAttribute("data-sampleSize", sampleSize);
            // Add tooltip/title on hover
            var title = document.createElementNS("http://www.w3.org/2000/svg","title");
            title.textContent = svgSubunits[i] + '\nExpression level: ' + expressionLevel + '\nSample size: ' + sampleSize;
            svgObject.getElementById(svgSubunits[i]).appendChild(title)

            // Correcting duplicate error:
            if (isdupShoot) {
                for (var dupS = 0; dupS < duplicateShoot.length; dupS++) {
                    var childElements = svgObject.getElementById(duplicateShoot[dupS]).childNodes;
                    // Add interactivity 
                    svgObject.getElementById(duplicateShoot[dupS]).setAttribute("class", 'hoverDetails');
                    svgObject.getElementById(duplicateShoot[dupS]).addEventListener('mouseenter', function(event) {
                        interactiveSVGData.addDetails(this.id);
                    });
                    svgObject.getElementById(duplicateShoot[dupS]).addEventListener('mouseleave', function(event) {
                        interactiveSVGData.removeDetails(this.id);
                    });
                    // Adding colour
                    if (childElements.length > 0) {
                        for (var c = 0; c < childElements.length; c++) {
                            if (childElements[c].nodeName === 'path') {           
                                childElements[c].setAttribute("fill", colourFill);
                            }
                        }
                    } else {             
                        svgObject.getElementById(duplicateShoot[dupS]).setAttribute("fill", colourFill);
                    };                    
                    // Add tooltip/title on hover
                    var title = document.createElementNS("http://www.w3.org/2000/svg","title");
                    title.textContent = duplicateShoot[dupS] + '\nExpression level: ' + expressionLevel + '\nSample size: ' + sampleSize;
                    svgObject.getElementById(duplicateShoot[dupS]).appendChild(title)
                }
            } else if (isdupRoot) {
                for (var dupR = 0; dupR < duplicateRoot.length; dupR++) {
                    var childElements = svgObject.getElementById(duplicateRoot[dupR]).childNodes;
                    // Add interactivity 
                    svgObject.getElementById(duplicateRoot[dupR]).setAttribute("class", 'hoverDetails');
                    svgObject.getElementById(duplicateRoot[dupR]).addEventListener('mouseenter', function(event) {
                        interactiveSVGData.addDetails(this.id);
                    });
                    svgObject.getElementById(duplicateRoot[dupR]).addEventListener('mouseleave', function(event) {
                        interactiveSVGData.removeDetails(this.id);
                    });
                    // Adding colour
                    if (childElements.length > 0) {
                        for (var c = 0; c < childElements.length; c++) {
                            if (childElements[c].nodeName === 'path') {           
                                childElements[c].setAttribute("fill", colourFill);
                            }
                        }
                    } else {             
                        svgObject.getElementById(duplicateRoot[dupR]).setAttribute("fill", colourFill);
                    };                 
                    // Add tooltip/title on hover
                    var title = document.createElementNS("http://www.w3.org/2000/svg","title");
                    title.textContent = duplicateRoot[dupR] + '\nExpression level: ' + expressionLevel + '\nSample size: ' + sampleSize;
                    svgObject.getElementById(duplicateRoot[dupR]).appendChild(title)
                };
            };

            // Finished colouring:
            createSVGExpressionData.finishedColouring = true;
        }
    }

    /**
     * Convert a percentage into a hex-code colour
     * @param {Number} percentage The percentage between 0 - 100 (as an int) into a colour between yellow and red
     * @returns {String} Hex-code colour
     */
    percentageToColour(percentage) {
        var percentage = parseInt(percentage);

        var colourList = ['#ffff00','#fffd00','#fffc00','#fff900','#fff800','#fff600','#fff500','#fff300','#fff200','#fff000','#ffee00','#ffec00','#ffeb00','#ffe800','#ffe700','#ffe600','#ffe300','#ffe100','#ffe000','#ffdf00','#ffdd00','#ffdb00','#ffda00','#ffd800','#ffd600','#ffd300','#ffd200','#ffd000','#ffcf00','#ffcc00','#ffcb00','#ffc900','#ffc700','#ffc500','#ffc300','#ffc300','#ffc000','#ffbf00','#ffbd00','#ffbb00','#ffb900','#ffb800','#ffb500','#ffb300','#ffb200','#ffb000','#ffad00','#ffac00','#ffa900','#ffa800','#ffa600','#ffa400','#ffa200','#ffa100','#ff9e00','#ff9c00','#ff9a00','#ff9900','#ff9600','#ff9400','#ff9300','#ff9000','#ff8f00','#ff8c00','#ff8900','#ff8700','#ff8600','#ff8300','#ff8200','#ff7f00','#ff7c00','#ff7b00','#ff7800','#ff7600','#ff7300','#ff7100','#ff6e00','#ff6c00','#ff6900','#ff6700','#ff6500','#ff6100','#ff5e00','#ff5c00','#ff5900','#ff5600','#ff5300','#ff5000','#ff4d00','#ff4900','#ff4600','#ff4200','#ff3d00','#ff3a00','#ff3400','#ff3000','#ff2a00','#ff2400','#ff1c00','#ff1100','#ff0000'];

        return (colourList[percentage]);
    }

    /**
     * Create and generate an SVG based on the desired tissue expression locus
     * @param {String} svgName Name of the SVG file without the .svg at the end
     * @param {String} locus The AGI ID (example: AT3G24650) 
     * @param {String} desiredDOMid
     */
    generateSVG(svgName, locus, desiredDOMid) {   
        // Reset variables:
        createSVGExpressionData.svgValues = {};
        createSVGExpressionData.svgMax = undefined;
        createSVGExpressionData.svgMin = undefined;
        createSVGExpressionData.svgMaxAverage = undefined;
        createSVGExpressionData.svgMinAverage = undefined;
        interactiveSVGData.existingStrokeWidths = {};
        interactiveSVGData.existingStrokeColours = {};
        createSVGExpressionData.finishedColouring = false;
        // Initiate scripts     
        createSVGExpressionData.desiredDOMid = desiredDOMid;
        retrieveOnlineBARData.loadSampleData(svgName, locus, desiredDOMid);
    }
}
/**
 * Create and retrieve expression data in an SVG format
 */
const createSVGExpressionData = new CreateSVGExpressionData();

/**
 * Enables interactivity with the SVG
 */
class InteractiveSVGData {
    constructor() {
        this.existingStrokeWidths = {};
        this.existingStrokeColours = {};
    }

    /**
     * Add details to an SVG or SVG-subunit including: hover and outline
     * @param {String} elementID Which SVG or SVG-subunit is being found and edited
     */
    addDetails(elementID) {
        // Adjusting for BioticStressPseudomonassyringae's half leaf:
        if (elementID.includes('Half_Leaf_Pseudomonas_syringae')) {
            elementID = elementID + '_outline';
        };
        // Retrieve document objects:
        var svgDoc = document.getElementById(createSVGExpressionData.svgObjectName).getSVGDocument();
        var svgPart = svgDoc.getElementById(elementID);
        // Add thicker boarder:
        var svgPartChildren = svgPart.childNodes;
        var increaseStrokeWidthBy = 4;
        // use svgDetailsAdded to double check if been outlined or not
        var svgDetailsAdded = false;
        if (svgPartChildren.length > 0) {
            for (var s = 0; s < svgPartChildren.length; s++) {
                if (svgPartChildren[s].nodeName === 'path') {
                    // Storing stroke widths
                    var existingStrokeWidth = svgPartChildren[s].getAttribute('stroke-width');
                    if (existingStrokeWidth === null || existingStrokeWidth === undefined) {
                        existingStrokeWidth = 0;
                    };
                    var existingStrokeColour = svgPartChildren[s].getAttribute('stroke');
                    if (existingStrokeColour === null || existingStrokeColour === undefined) {
                        existingStrokeColour = 'none';
                    };
                    if (interactiveSVGData.existingStrokeWidths[elementID] === undefined) {
                        interactiveSVGData.existingStrokeWidths[elementID] = existingStrokeWidth;
                        interactiveSVGData.existingStrokeColours[elementID] = existingStrokeColour;
                    } else {
                        existingStrokeWidth = interactiveSVGData.existingStrokeWidths[elementID];
                        existingStrokeColour = 
                        interactiveSVGData.existingStrokeColours[elementID];
                    };
                    // Making stroke width thicker
                    if ((existingStrokeWidth * increaseStrokeWidthBy) < 10 && (existingStrokeWidth * increaseStrokeWidthBy) != 0) {
                        svgPartChildren[s].setAttribute('stroke-width', (existingStrokeWidth * increaseStrokeWidthBy));
                        svgPartChildren[s].setAttribute('stroke', '#000000');
                    } else {
                        svgPartChildren[s].setAttribute('stroke-width', (increaseStrokeWidthBy * 1.5));
                        svgPartChildren[s].setAttribute('stroke', '#000000');
                    };
                    svgDetailsAdded = true;        
                };
            };
        } 
        if (svgDetailsAdded === false || svgPartChildren.length <= 0 || svgPartChildren === null) {
            var existingStrokeWidth = svgPart.getAttribute('stroke-width');
            if (existingStrokeWidth === null || existingStrokeWidth === undefined) {
                existingStrokeWidth = 0;
            };
            var existingStrokeColour = svgPart.getAttribute('stroke');
            if (existingStrokeColour === null || existingStrokeColour === undefined) {
                existingStrokeColour = 'none';
            };
            if (interactiveSVGData.existingStrokeWidths[elementID] === undefined) {
                interactiveSVGData.existingStrokeWidths[elementID] = existingStrokeWidth;
                interactiveSVGData.existingStrokeColours[elementID] = existingStrokeColour;
            } else {
                existingStrokeWidth = interactiveSVGData.existingStrokeWidths[elementID];
                existingStrokeColour = 
                interactiveSVGData.existingStrokeColours[elementID];
            };
            // Making stroke width thicker
            if ((existingStrokeWidth * increaseStrokeWidthBy) < 10 && (existingStrokeWidth * increaseStrokeWidthBy) != 0) {
                svgPart.setAttribute('stroke-width', (existingStrokeWidth * increaseStrokeWidthBy));
                svgPart.setAttribute('stroke', '#000000');
            } else {
                svgPart.setAttribute('stroke-width', (increaseStrokeWidthBy * 1.5));
                svgPart.setAttribute('stroke', '#000000');
            };
            svgDetailsAdded = true;  
        };
    };

    /**
     * Remove details to an SVG or SVG-subunit including: hover and outline
     * @param {String} elementID Which SVG or SVG-subunit is being found and edited
     */
    removeDetails(elementID) {
        // Adjusting for BioticStressPseudomonassyringae's half leaf:
        if (elementID.includes('Half_Leaf_Pseudomonas_syringae')) {
            elementID = elementID + '_outline';
        };
        // Retrieve document objects:
        var svgDoc = document.getElementById(createSVGExpressionData.svgObjectName).getSVGDocument();
        var svgPart = svgDoc.getElementById(elementID);
        // Add thicker boarder:
        var svgPartChildren = svgPart.childNodes;
        // use svgDetailsRemoved to double check if been outlined or not
        var svgDetailsRemoved = false;
        if (svgPartChildren.length > 0) {
            for (var s = 0; s < svgPartChildren.length; s++) {
                if (svgPartChildren[s].nodeName === 'path') {
                    if (parseFloat(interactiveSVGData.existingStrokeWidths[elementID]) >= 0) {
                        svgPartChildren[s].setAttribute('stroke-width', (interactiveSVGData.existingStrokeWidths[elementID]));
                        svgPartChildren[s].setAttribute('stroke', (interactiveSVGData.existingStrokeColours[elementID]));
                    } else {
                        svgPartChildren[s].setAttribute('stroke-width', 1.5);
                        svgPartChildren[s].setAttribute('stroke', '#000000');
                    };
                    svgDetailsRemoved = true;
                };
            };
        } 
        if (svgDetailsRemoved === false || svgPartChildren.length <= 0 || svgPartChildren === null) {
            if (parseFloat(interactiveSVGData.existingStrokeWidths[elementID]) >= 0) {
                svgPart.setAttribute('stroke-width', (interactiveSVGData.existingStrokeWidths[elementID]));
                svgPart.setAttribute('stroke', (interactiveSVGData.existingStrokeColours[elementID]));
            } else {
                svgPart.setAttribute('stroke-width', 1.5);
                svgPart.setAttribute('stroke', '#000000');
            };
            svgDetailsRemoved = true;
        }        
    }
}
/**
 * Enables interactivity with the SVG
 */
const interactiveSVGData = new InteractiveSVGData();