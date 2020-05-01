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
        this.eFPObjects = {};
        // loadSampleData
        this.sampleData = {};
        this.sampleOptions = [];
    };

    /**
     * Calls and stores the sample Data for the SVG, SVG's subunits, datasource and it's name-values 
     * @param {String} svgName Name of the SVG file without the .svg at the end
     * @param {String} locus The AGI ID (example: AT3G24650) 
     * @param {Boolean} continueForward Continue forward with the generation of the tissue expression data
     */
    loadSampleData(svgName, locus, continueForward = true) {
        if (Object.keys(this.sampleData).length === 0) {
            let xhr = new XMLHttpRequest();
            let url = 'https://raw.githubusercontent.com/BioAnalyticResource/ePlant_Plant_eFP/master/data/SampleData.min.json';
    
            xhr.responseType = 'json';
            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    // Store response
                    this.sampleData = xhr.response;
                    // Setup and retrieve information about the target SVG and locus 
                    this.retrieveSampleData(svgName, locus);
                };
            };
    
            xhr.open('GET', url);
            xhr.send();   
        };   
        
        if (Object.keys(this.sampleData).length > 0 && continueForward) {
            this.retrieveSampleData(svgName, locus);
        }; 
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
        };

        // Create variables that will be used in retrieveSampleData
        var sampleDataKeys = Object.keys(this.sampleData); // All possible SVGs 
        this.sampleOptions = sampleDataKeys;
        var sampleDB = ''; // The sample's datasource
        var sampleIDList = []; // List of all of the sample's IDs
        var sampleSubunits = []; // List of SVG's subunits

        // Check if valid SVG
        if (sampleDataKeys.includes(svgName)) {
            // Find position of the SVG name within the JSON data
            let DataKeyPos = sampleDataKeys.indexOf(svgName);

            // Create variables for parsing
            var sampleInfo = this.sampleData[sampleDataKeys[DataKeyPos]];
            var sampleOptions = sampleInfo['sample'];
            sampleDB = sampleInfo['db'];

            // If a database is available for this SVG, then find sample ID information
            if (sampleDB !== undefined) {
                sampleSubunits = Object.keys(sampleInfo.sample);
                sampleIDList = [];
                for (var sK = 0; sK < sampleSubunits.length; sK++) {
                    sampleIDList = sampleIDList.concat(sampleOptions[sampleSubunits[sK]]);
                };
            };

            // Call plantefp.cgi webservice to retrieve information about the target tissue expression data
            if (this.eFPObjects[svgName] === undefined) {
                this.callPlantEFP(sampleDB, locus, sampleIDList, svgName, sampleOptions);
            };
        };
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
        let url = 'https://bar.utoronto.ca/~asullivan/webservices/plantefp.cgi?';
        url += 'datasource=' + datasource + '&';
        url += 'id=' + locus + '&';
        url += 'samples=[';
        for (var i = 0; i < samples.length; i++) {
            var sampleName = samples[i].trim();
            sampleName = sampleName.replace(/\+/g, '%2B');
            sampleName = sampleName.replace(/ /g, '%20');

            url += '"' + sampleName + '"';
            if (i !== samples.length-1) {
                url += ',';
            };
        };
        url += ']';

        xhr.responseType = 'json';
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                // Create object based on response:
                let subunitsList = Object.keys(sampleSubunits);
                var response = xhr.response;
                if (this.eFPObjects === undefined) {
                    this.eFPObjects = {};
                };

                // Create SVG in dictionary
                if (this.eFPObjects[svg] === undefined) {
                    this.eFPObjects[svg] = {};
                };

                // Create samples in dictionary
                if (this.eFPObjects[svg]['sample'] === undefined) {
                    this.eFPObjects[svg]['sample'] = {};
                };

                // Create samples in dictionary
                if (this.eFPObjects[svg]['sample'] === undefined) {
                    this.eFPObjects[svg]['sample'] = {};
                };

                // Add values
                for (var t = 0; t < response.length; t++) {
                    // Create key and value variables
                    var responseName = response[t]['name'].trim();
                    var responseValue = response[t]['value'];
                    var subunitName = '';

                    // Create subunits element in dictionary     
                    var tempName = responseName;                
                    tempName = responseName.replace(/%2B/g, '+');
                    tempName = tempName.replace(/%20/g, ' ');
                    tempName = tempName.trim();
                    for (var s = 0; s < subunitsList.length; s++) {  
                        if (sampleSubunits[subunitsList[s]].includes(tempName)) {
                            subunitName = subunitsList[s];

                            // Create subunit
                            if (this.eFPObjects[svg]['sample'][subunitName] === undefined) {
                                this.eFPObjects[svg]['sample'][subunitName] = {};
                            };

                            // Create responseName
                            if (this.eFPObjects[svg]['sample'][subunitName][tempName] === undefined) {
                                this.eFPObjects[svg]['sample'][subunitName][tempName] = {};
                            };

                            // Add to dictionary
                            this.eFPObjects[svg]['sample'][subunitName][tempName][locus] = responseValue;
                        };
                    };
                };

                // Add db
                this.eFPObjects[svg]['db'] = datasource;
            };
        };

        xhr.open('GET', url);
        xhr.send();
    };
};

/**
 * Enables interactivity with the SVG
 */
class InteractiveSVGData {
    constructor() {
        this.topExpressionValues = {};
        this.expressionValues = {};
    };

    /**
     * Retrieve information about the top expression values for a specific locus
     * @param {String} locus The AGI ID (example: AT3G24650) 
     */
    retrieveTopExpressionValues(locus = 'AT3G24650') {
        // If never been called before
        if (Object.keys(this.topExpressionValues).length === 0 || this.topExpressionValues === undefined) {
            this.retrieveTopMicroarray(locus);
            this.retrieveTopRNASeq(locus);
        };       
    };

    retrieveTopMicroarray(locus = 'AT3G24650') {
        let xhr = new XMLHttpRequest();
        let url = 'https://bar.utoronto.ca/expression_max_api/max_average';
        let method = 'POST';
        var sendHeaders = "application/json";
        var postSend = {
            'loci': [locus.toUpperCase()],
            'method': 'Microarray'
        };
        postSend = JSON.stringify(postSend);

        xhr.responseType = 'json';
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                let response = xhr.response;
                if (response && response["wasSuccessful"] === true) {
                    if (response['maxAverage']) {
                        var tempMicroarray = {
                            'microarray': {
                                'maxAverage': response['maxAverage'][locus.toUpperCase()]
                            }
                        };

                        if (response['standardDeviation']) {
                            tempMicroarray['microarray']['standardDeviation'] = response['standardDeviation'][locus.toUpperCase()]
                        };
                        if (response['sample']) {
                            tempMicroarray['microarray']['sample'] = response['sample'][locus.toUpperCase()]
                        };
                        if (response['compendium']) {
                            tempMicroarray['microarray']['compendium'] = response['compendium'][locus.toUpperCase()]
                        };
                        this.topExpressionValues = Object.assign(this.topExpressionValues, tempMicroarray);
                    };
                };
            };
        };

        xhr.open(method, url, true);
        if (method === 'POST') {
            xhr.setRequestHeader("Content-Type", sendHeaders);
            xhr.send(postSend); 
        } else {
            xhr.send();
        }; 
    };

    retrieveTopRNASeq(locus = 'AT3G24650') {
        let xhr = new XMLHttpRequest();
        let url = 'https://bar.utoronto.ca/expression_max_api/max_average';
        let method = 'POST';
        var sendHeaders = "application/json";
        var postSend = {
            'loci': [locus.toUpperCase()],
            'method': 'RNA-seq'
        };
        postSend = JSON.stringify(postSend);

        xhr.responseType = 'json';
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                let response = xhr.response;
                if (response && response["wasSuccessful"] === true) {
                    if (response['maxAverage']) {
                        var tempRNASeq = {
                            'rnaSeq': {
                                'maxAverage': response['maxAverage'][locus.toUpperCase()]
                            }
                        };

                        if (response['standardDeviation']) {
                            tempRNASeq['rnaSeq']['standardDeviation'] = response['standardDeviation'][locus.toUpperCase()]
                        };
                        if (response['sample']) {
                            tempRNASeq['rnaSeq']['sample'] = response['sample'][locus.toUpperCase()]
                        };
                        if (response['compendium']) {
                            tempRNASeq['rnaSeq']['compendium'] = response['compendium'][locus.toUpperCase()]
                        };
                        this.topExpressionValues = Object.assign(this.topExpressionValues, tempRNASeq);
                    };
                };
            };
        };

        xhr.open(method, url, true);
        if (method === 'POST') {
            xhr.setRequestHeader("Content-Type", sendHeaders);
            xhr.send(postSend); 
        } else {
            xhr.send();
        }; 
    };
};

let existingStrokeData = {};
/**
 * Add details to an SVG or SVG-subunit including: hover and outline
 * @param {String} elementID Which SVG or SVG-subunit is being found and edited
 */
function addTissueMetadata(elementID) {
    // Adjusting for BioticStressPseudomonassyringae's half leaf:
    if (elementID.includes('Half_Leaf_Pseudomonas_syringae')) {
        elementID = elementID + '_outline';
    };
    // Retrieve document objects:
    var svgDoc, svgPart, svgPartChildren;
    if (document.getElementById(createSVGExpressionData.svgObjectName) && document.getElementById(createSVGExpressionData.svgObjectName).getSVGDocument()) {
        svgDoc = document.getElementById(createSVGExpressionData.svgObjectName).getSVGDocument();
        svgPart = svgDoc.getElementById(elementID);
        svgPartChildren = svgPart.childNodes;
    };
    /** Increase stroke width within SVG by (multiplied) this much */
    var increaseStrokeWidthBy = 1.5;
    // Storing stroke widths
    var existingStrokeWidth = undefined, 
        existingStrokeColour = undefined,
        doesStrokeDataExist = false;
    if (svgDoc && svgPartChildren && svgPartChildren.length > 0) {
        var strokeID = '';
        if (svgPart.getAttribute('stroke-width')) {
            existingStrokeWidth = svgPart.getAttribute('stroke-width');
            doesStrokeDataExist = true;
        };

        if (svgPart.getAttribute('stroke')) {
            existingStrokeColour = svgPart.getAttribute('stroke');
            doesStrokeDataExist = true;
        };
        if (doesStrokeDataExist === false) {
            for (var s = 0; s < svgPartChildren.length; s++) {
                if (svgPartChildren[s].nodeName === 'path') {
                    if (svgPartChildren[s].getAttribute('stroke-width')) {
                        existingStrokeWidth = svgPartChildren[s].getAttribute('stroke-width');
                        doesStrokeDataExist = true;
                    };
    
                    if (svgPartChildren[s].getAttribute('stroke')) {
                        existingStrokeColour = svgPartChildren[s].getAttribute('stroke');
                        doesStrokeDataExist = true;
                    };
                };
            };
        };
        strokeID = elementID;

        if (doesStrokeDataExist) {
            if (existingStrokeWidth === null || existingStrokeWidth === undefined) {
                existingStrokeWidth = 0;
            }; 
            if (existingStrokeColour === null || existingStrokeColour === undefined) {
                existingStrokeColour = 'none';
            };

            if (existingStrokeData[elementID] === undefined) {
                existingStrokeData[elementID] = {};
                existingStrokeData[elementID]['strokeDataExist'] = doesStrokeDataExist;
                existingStrokeData[elementID]['strokeWidth'] = existingStrokeWidth;
                existingStrokeData[elementID]['strokeColour'] = existingStrokeColour;
                existingStrokeData[elementID]['strokeID'] = strokeID;
            } else {
                existingStrokeData[elementID]['strokeDataExist'] = doesStrokeDataExist;
                existingStrokeData[elementID]['strokeWidth'] = existingStrokeWidth;
                existingStrokeData[elementID]['strokeColour'] = existingStrokeColour;
                existingStrokeData[elementID]['strokeID'] = strokeID;
            };

            // Making stroke width thicker
            if (svgDoc.getElementById(existingStrokeData[elementID]['strokeID'])) {
                var strokeElement = svgDoc.getElementById(existingStrokeData[elementID]['strokeID']);
                
                var newStrokeWidth = existingStrokeWidth * increaseStrokeWidthBy;
                var maxStrokeWidth = 5;
                if (newStrokeWidth < maxStrokeWidth && newStrokeWidth !== 0) {
                    if ((increaseStrokeWidthBy * 1.5) < maxStrokeWidth && (increaseStrokeWidthBy * 1.5) !== 0) {
                        newStrokeWidth = increaseStrokeWidthBy * 1.5;
                    } else {
                        newStrokeWidth = 1.5;
                    };
                };

                if (strokeElement.getAttribute('stroke-width')) {
                    svgDoc.getElementById(existingStrokeData[elementID]['strokeID']).setAttribute('stroke-width', newStrokeWidth);
                    svgDoc.getElementById(existingStrokeData[elementID]['strokeID']).setAttribute('stroke', '#000000');
                } else {
                    if (svgDoc && svgPartChildren && svgPartChildren.length > 0) {
                        for (var s = 0; s < svgPartChildren.length; s++) {
                            if (svgPartChildren[s].nodeName === 'path') {
                                if (svgPartChildren[s].getAttribute('stroke-width')) {
                                    svgPartChildren[s].setAttribute('stroke-width', newStrokeWidth);
                                };
                
                                if (svgPartChildren[s].getAttribute('stroke')) {
                                    svgPartChildren[s].setAttribute('stroke', '#000000');
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};

/**
 * Remove details to an SVG or SVG-subunit including: hover and outline
 * @param {String} elementID Which SVG or SVG-subunit is being found and edited
 */
function removeTissueMetadata(elementID) {
    // Adjusting for BioticStressPseudomonassyringae's half leaf:
    if (elementID.includes('Half_Leaf_Pseudomonas_syringae')) {
        elementID = elementID + '_outline';
    };

    // Retrieve document objects:
    var svgDoc = document.getElementById(createSVGExpressionData.svgObjectName).getSVGDocument();
    var svgPart = svgDoc.getElementById(elementID);

    // Add thicker boarder:
    var svgPartChildren = svgPart.childNodes;
    /** use svgDetailsRemoved to double check if been outlined or not */
    var svgDetailsRemoved = false;

    if (svgDetailsRemoved === false || svgPartChildren.length <= 0 || svgPartChildren === null) {
        if (existingStrokeData[elementID] && existingStrokeData[elementID]['strokeWidth'] && parseFloat(existingStrokeData[elementID]['strokeWidth']) >= 0) {
            svgPart.setAttribute('stroke-width', (existingStrokeData[elementID]['strokeWidth']));
        };

        if (existingStrokeData[elementID] && existingStrokeData[elementID]['strokeColour']) {
            svgPart.setAttribute('stroke', (existingStrokeData[elementID]['strokeColour']));
        };

        svgDetailsRemoved = true;
    };
    
    if (svgDetailsRemoved === false && svgPartChildren.length > 0) {
        for (var s = 0; s < svgPartChildren.length; s++) {
            if (svgPartChildren[s].nodeName === 'path') {
                if (svgPartChildren[s].getAttribute('stroke-width') && existingStrokeData[elementID]['strokeWidth'] && parseFloat(existingStrokeData[elementID]['strokeWidth']) >= 0) {
                    svgPartChildren[s].setAttribute('stroke-width', (existingStrokeData[elementID]['strokeWidth']));
                    svgDetailsRemoved = true;
                } else if (svgPartChildren[s].getAttribute('stroke-width')) {
                    svgPartChildren[s].setAttribute('stroke-width', 1.5);
                    svgDetailsRemoved = true;
                };

                if (svgPartChildren[s].getAttribute('stroke') && existingStrokeData[elementID]['strokeColour']) {
                    svgPartChildren[s].setAttribute('stroke', (existingStrokeData[elementID]['strokeColour']));
                    svgDetailsRemoved = true;
                } else if (svgPartChildren[s].getAttribute('stroke')) {
                    svgPartChildren[s].setAttribute('stroke', '#000000');
                    svgDetailsRemoved = true;
                };
            };
        };
    };

    if (svgDetailsRemoved === false) {
        svgPart.setAttribute('stroke-width', 1.5);
        svgPart.setAttribute('stroke', '#000000');
    };
};

/**
 * Create and retrieve expression data in an SVG format
 */
class CreateSVGExpressionData {
    constructor() {
        // Class calls:
        this.retrieveOnlineBARData = new RetrieveOnlineBARData();
        this.interactiveSVGData = new InteractiveSVGData();
        // Local for this class
        this.desiredDOMid = '';
        // createSVGValues
        this.clickList = [];
        this.svgValues = {};
        this.svgMax = 0;
        this.svgMin = 0;
        this.svgMaxAverage = 0;
        this.svgMaxAverageSample = '';
        this.svgMinAverage = 0;
        this.svgMinAverageSample = '';
        // Store object name:
        this.svgObjectName = '';
    };

    /**
     * Add the SVG to the designated DOM
     * @param {String} svgName Name of the SVG file without the .svg at the end
     * @param {String} locus The AGI ID (example: AT3G24650) 
     */
    addSVGtoDOM(svgName, locus, includeDropdownAll = false, includeMaxDropdown = false) {
        var svgUse = 'Klepikova';
        var appendSVG = '';
        if (svgName !== '') {
            svgUse = svgName;
        };

        // Empty target region
        var targetDOMRegion = document.getElementById(this.desiredDOMid);
        targetDOMRegion.innerHTML = '';

        // Add dropdown list of all samples to document:
        if (includeDropdownAll && this.retrieveOnlineBARData.sampleOptions) {
            appendSVG += 'Select SVG to display: <select onchange="createSVGExpressionData.generateSVG(this.value.toString(), \'' + locus + '\', \'' + this.desiredDOMid + '\', ' + includeDropdownAll + ', ' + includeMaxDropdown + ')" id="sampleOptions" value="' + svgName + '">';
            var sampleOptions = this.retrieveOnlineBARData.sampleOptions;
            for (var i = 0; i < sampleOptions.length; i++) {
                appendSVG += '<option value="' + sampleOptions[i] + '">' + sampleOptions[i] + '</option>';
            };
            appendSVG += '</select></br>';
        };

        // Add max dropdown list to document:
        if (includeMaxDropdown && this.interactiveSVGData.topExpressionValues) {
            appendSVG += 'Select top expression to display: <select onchange="createSVGExpressionData.generateSVG(this.value.toString(), \'' + locus + '\', \'' + this.desiredDOMid + '\', ' + includeDropdownAll + ', ' + includeMaxDropdown + ')" id="topExpressionOptions">';
            var topList = Object.keys(topExpressionValues);
            for (var i = 0; i < topList.length; i++) {
                if (topList[i].length > 3 && topList[i].substring(0, 3).toLowerCase() !== 'top') {
                    appendSVG += '<option value="' + expressionValues[topList[i]]['Compendium'] + '">' + topList[i] + ': ' + expressionValues[topList[i]]['Compendium'] + '</option>';
                };
            };
            appendSVG += '</select></br>';
        };

        // Create call for SVG file
        var urlSVG = 'https://bar.utoronto.ca/~asullivan/ePlant_Plant_eFP/compendiums/' + svgUse + '.min.svg';

        // Append SVG to document
        appendSVG += '<b>' + svgName + '</b></br>';
        appendSVG += '<object id="' + svgUse + '_object" data="' + urlSVG + '" type="image/svg+xml"></object>';
        targetDOMRegion.innerHTML = appendSVG;
        this.svgObjectName = svgUse + '_object';

        // Wait for SVG to load
        var svgLoaded = false;
        while (svgLoaded === false) {
            if (targetDOMRegion.innerHTML !== '') {
                // End while loop
                svgLoaded = true;

                // Change shape of SVG
                let svgObject = document.getElementById(svgUse + '_object');
                svgObject.style = 'width: 100%; height: 100%; left: 0px; top: 0px; display: inline-block;';

                // Check locus to see if it matches 
                let timer = setTimeout(() => {
                    this.createLocusMatch(svgUse, locus);
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
            } else {
                locusValue = locusValue + locusPoint[i];
            };
        };
        // console.log(locusValue);
        this.createSVGValues(whichSVG, locus);
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
        let dataObject = this.retrieveOnlineBARData.eFPObjects; 
        let svgDataObject = dataObject[whichSVG]['sample'];

        // Find tissue expression's sample IDs
        let svgSubunits = Object.keys(svgDataObject);
        for (var i = 0; i < svgSubunits.length; i++) {
            svgSamples.push(svgDataObject[svgSubunits[i]]);
        };

        // Find respective values
        for (var n = 0; n < svgSubunits.length; n++) {
            var sampleValues = Object.keys(svgDataObject[svgSubunits[n]]);
            // Create SVG subunit in dictionary
            if (this.svgValues[svgSubunits[n]] === undefined) {
                this.svgValues[svgSubunits[n]] = {};
            };
            // Add raw values
            for (var v = 0; v < sampleValues.length; v++) {
                // Create raw values in dictionary
                if (this.svgValues[svgSubunits[n]]['rawValues'] === undefined) {
                    this.svgValues[svgSubunits[n]]['rawValues'] = [];
                };
                this.svgValues[svgSubunits[n]]['rawValues'].push(svgDataObject[svgSubunits[n]][sampleValues[v]][locus]);
            };
        };
        this.findExpressionValues(whichSVG, svgSubunits);
    };

    /**
     * Calculate the functional standard deviation
     * Modified from https://www.geeksforgeeks.org/php-program-find-standard-deviation-array/
     * @param {Array} numbers An array of numbers that the standard deviation will be found for
     * @return sd Standard deviation
     */
    standardDeviationCalc(numbers) {
        var sd = 0;

        var num_of_elements = numbers.length; 

        if (num_of_elements >= 1) {
            var variance = 0.0; 
          
            var number_sum = 0;
            for (var i = 0; i < num_of_elements; i++) {
                number_sum += numbers[i];
            };
            var average = number_sum/num_of_elements;
            
            for (var x = 0; x < num_of_elements; x++) {
                variance += (Math.pow((numbers[x] - average), 2));
            };

            sd = Math.sqrt(variance/num_of_elements);
        };
        
        return sd; 
    };

    /**
     * Find the maximum, minimum and average values
     * @param {String} whichSVG Name of the SVG file without the .svg at the end
     * @param {Array} svgSubunits A list containing all desired SVG subunits to be interacted with
     */
    findExpressionValues(whichSVG, svgSubunits) {
        // Reset variables 
        this.svgMax = undefined;
        this.svgMin = undefined;

        // Iterate over each SVG subunit for their respective values
        for (var i = 0; i < svgSubunits.length; i++) {
            var values = this.svgValues[svgSubunits[i]]['rawValues'].sort();
            var numValues = [];
            for (var y = 0; y < values.length; y++) {
                if (isNaN(values[y]) === false) {
                    numValues.push(parseFloat(values[y]))
                };
            };

            // Find averages
            var sumValues = 0;
            for (var v = 0; v < numValues.length; v++) {
                sumValues += numValues[v];
            };
            var averageValues = (sumValues / numValues.length);

            // Compare max values
            var maxValue = numValues[numValues.length - 1];
            var minValue = numValues[1];
            if (this.svgMax === undefined) {
                this.svgMax = maxValue;
            } else {
                if (maxValue > this.svgMax) {                   
                    this.svgMax = maxValue;
                };
            };
            if (this.svgMin === undefined) {
                this.svgMin = minValue;
            } else {
                if (minValue < this.svgMin) {                   
                    this.svgMin = minValue;
                };
            };

            // Now for averages:
            if (this.svgMaxAverage === undefined) {
                this.svgMaxAverage = averageValues;
                this.svgMaxAverageSample = svgSubunits[i];
            } else {
                if (averageValues > this.svgMaxAverage) {                   
                    this.svgMaxAverage = averageValues;
                    this.svgMaxAverageSample = svgSubunits[i];
                };
            };
            if (this.svgMinAverage === undefined) {
                this.svgMinAverage = averageValues;
                this.svgMinAverageSample = svgSubunits[i];
            } else {
                if (averageValues < this.svgMinAverage) {                   
                    this.svgMinAverage = averageValues;
                    this.svgMinAverageSample = svgSubunits[i];
                };
            };
            // Add to value's dictionary:
            // Create SVG subunit in dictionary
            if (this.svgValues[svgSubunits[i]] === undefined) {
                this.svgValues[svgSubunits[i]] = {};
            };
            this.svgValues[svgSubunits[i]]['average'] = averageValues;
            this.svgValues[svgSubunits[i]]['sd'] = this.standardDeviationCalc(numValues);

            // Find control value
            var controlData = this.retrieveOnlineBARData.sampleData[whichSVG];
            var controlKeys = Object.keys(controlData["controlComparison"]);
            if (controlKeys.includes(svgSubunits[i]) === false) {
                var controlSampleName = '';
                for (var c = 0; c < controlKeys.length; c++) {
                    if (controlData["controlComparison"][controlKeys[c]].includes(svgSubunits[i])) {
                        controlSampleName = controlKeys[c];
                    }
                };

                if (this.svgValues[controlSampleName] && this.svgValues[controlSampleName]["rawValues"]) {
                    // Calculate control average:
                    var controlValues = this.svgValues[controlSampleName]["rawValues"];
                    var controlSum = 0;
                    for (var cv = 0; cv < controlValues.length; cv++) {
                        controlSum += parseFloat(controlValues[cv]);
                    };
                    var controlAverage = (controlSum / controlValues.length);

                    var inductionValue = 0;
                    var reductionValue = 0;
                    if (controlAverage !== null && controlAverage > 0 && averageValues > 0) {
                        if (averageValues > controlAverage) {
                            inductionValue = averageValues - controlAverage;
                            this.svgValues[svgSubunits[i]]['inductionValue'] = inductionValue;
                        } else if (controlAverage > averageValues) {
                            reductionValue = controlAverage - averageValues;
                            this.svgValues[svgSubunits[i]]['reductionValue'] = reductionValue;
                        };

                        var expressionRatio = averageValues / controlAverage;
                        this.svgValues[svgSubunits[i]]['expressionRatio'] = expressionRatio;
                        
                        this.svgValues[svgSubunits[i]]['controlSampleName'] = controlSampleName;
                        this.svgValues[svgSubunits[i]]['controlAverage'] = controlAverage;
                    };
                };
            };
        };

        this.colourSVGs(whichSVG, svgSubunits);
    };

    /**
     * Colour the existing SVG that has been created
     * @param {String} whichSVG Name of the SVG file without the .svg at the end
     * @param {Array} svgSubunits A list containing all desired SVG subunits to be interacted with
     */
    colourSVGs(whichSVG, svgSubunits) {
        for (var i = 0; i < svgSubunits.length; i++) {
            // Colouring values
            var denominator = this.svgMaxAverage - this.svgMinAverage;
            var numerator = this.svgValues[svgSubunits[i]]['average'] - this.svgMinAverage;
            if (numerator < 0) {
                numerator = 0;
            };
            var percentage = (numerator/denominator) * 100;
            if (percentage > 100) {
                percentage = 100;
            } else if ((percentage < 0) ||(percentage === undefined) || (percentage === null)) {
                percentage = 0;
            };
            var expressionLevel = parseFloat(numerator + this.svgMinAverage).toFixed(3);
            var sampleSize = this.svgValues[svgSubunits[i]].rawValues.length;

            this.svgValues[svgSubunits[i]]['expressionLevel'] = expressionLevel;
            this.svgValues[svgSubunits[i]]['sampleSize'] = sampleSize;

            // Retrieve colouring information
            var colourFill = this.percentageToColour(percentage);

            // Begin colouring SVG subunits
            this.colourSVGSubunit(whichSVG, svgSubunits[i], colourFill, expressionLevel, sampleSize);
        };
    };

    /**
     * The intent is to colour the subunit of a desired location within an SVG
     * @param {String} whichSVG Name of the SVG file without the .svg at the end
     * @param {Array} svgSubunit A list containing all desired SVG subunits to be interacted with
     * @param {String} colour A hex code for what colour it is meant to be filled with
     * @param {Number} expressionLevel The expression level for the interactive data
     * @param {Number} sampleSize The sample size of the input information, default to 1
     */
    colourSVGSubunit(whichSVG, svgSubunit, colour, expressionLevel, sampleSize = 1) {
        let svgObject = document.getElementById(whichSVG + '_object').getSVGDocument();
        if (svgObject && svgObject.getElementById(svgSubunit)) {
            var expressionData = createSVGExpressionData["svgValues"][svgSubunit];
            var descriptionName = undefined;
            if (this.retrieveOnlineBARData.sampleData[whichSVG]['description']) {
                descriptionName = this.retrieveOnlineBARData.sampleData[whichSVG]['description'][svgSubunit];
            };
            if (descriptionName === undefined || descriptionName === '') {
                descriptionName = svgSubunit;
            };
        
            // Check for duplicate error:
            var duplicateShoot = ['Control_Shoot_0_Hour', 'Cold_Shoot_0_Hour', 'Osmotic_Shoot_0_Hour', 'Salt_Shoot_0_Hour', 'Drought_Shoot_0_Hour', 'Genotoxic_Shoot_0_Hour', 'Oxidative_Shoot_0_Hour', 'UV-B_Shoot_0_Hour', 'Wounding_Shoot_0_Hour', 'Heat_Shoot_0_Hour'];
            var duplicateRoot = ['Control_Root_0_Hour', 'Cold_Root_0_Hour', 'Osmotic_Root_0_Hour', 'Salt_Root_0_Hour', 'Drought_Root_0_Hour', 'Genotoxic_Root_0_Hour', 'Oxidative_Root_0_Hour', 'UV-B_Root_0_Hour', 'Wounding_Root_0_Hour', 'Heat_Root_0_Hour'];
            var isdupShoot = false;
            var isdupRoot = false;
            if (duplicateShoot.includes(svgSubunit)) {
                isdupShoot = true;
            } else if (duplicateRoot.includes(svgSubunit)) {
                isdupRoot = true;
            };
    
            // This is used to determine if the SVG should be automatically coloured or manually done
            var childElements;
            if (svgObject.getElementById(svgSubunit) && svgObject.getElementById(svgSubunit).childNodes) {
                childElements = svgObject.getElementById(svgSubunit).childNodes;
            } else {
                setTimeout(function() {
                    if (svgObject.getElementById(svgSubunit) && svgObject.getElementById(svgSubunit).childNodes) {
                        childElements = svgObject.getElementById(svgSubunit).childNodes;
                    };
                }, 500);
            };
    
            if (childElements && childElements.length > 0) {
                for (var c = 0; c < childElements.length; c++) {
                    if (childElements[c].nodeName === 'path' || childElements[c].nodeName === 'g') {           
                        childElements[c].setAttribute("fill", colour);       
                    };
                };
            } else if (svgObject && svgObject.getElementById(svgSubunit)) {             
                svgObject.getElementById(svgSubunit).setAttribute("fill", colour);
            };        
    
            // Add interactivity 
            // Adding hover features:
            svgObject.getElementById(svgSubunit).setAttribute("class", 'hoverDetails');
            svgObject.getElementById(svgSubunit).addEventListener('mouseenter', function(event) {
                addTissueMetadata(this.id);
            });
            svgObject.getElementById(svgSubunit).addEventListener('mouseleave', function(event) {
                removeTissueMetadata(this.id);
            });
            // Adding details about sub-tissue:
            svgObject.getElementById(svgSubunit).setAttribute("data-expressionValue", expressionLevel);
            svgObject.getElementById(svgSubunit).setAttribute("data-sampleSize", sampleSize);
            svgObject.getElementById(svgSubunit).setAttribute("data-standardDeviation", expressionData['sd']);
            svgObject.getElementById(svgSubunit).setAttribute("data-sampleSize", sampleSize);
            
            // Add tooltip/title on hover
            var title = document.createElementNS("http://www.w3.org/2000/svg","title");
            title.textContent = descriptionName + '\nExpression level: ' + expressionLevel + '\nSample size: ' + sampleSize + '\nStandardDeviation: ' + parseFloat(expressionData['sd']).toFixed(3);
    
            // Add rest of titles and tooltip/title
            var inducReduc = false;
            if (expressionData['inductionValue']) {
                svgObject.getElementById(svgSubunit).setAttribute("data-inductionValue", expressionData['inductionValue']);
                title.textContent += '\nInduction Value: ' + parseFloat(expressionData['inductionValue']).toFixed(3);
                inducReduc = true;
            } else if (expressionData['reductionValue']) {
                svgObject.getElementById(svgSubunit).setAttribute("data-reductionValue", expressionData['reductionValue']);
                title.textContent += '\nReduction Value: ' + parseFloat(expressionData['ReductionValue']).toFixed(3);
                inducReduc = true;
            };
            if (inducReduc === true) {
                svgObject.getElementById(svgSubunit).setAttribute("data-expressionRatio", expressionData['expressionRatio']);
                title.textContent += '\nExpression Ratio: ' + parseFloat(expressionData['expressionRatio']).toFixed(3);
                svgObject.getElementById(svgSubunit).setAttribute("data-controlSampleName", expressionData['controlSampleName']);

                var controlSampleName = undefined;
                if (this.retrieveOnlineBARData.sampleData[whichSVG]['description']) {
                    controlSampleName = this.retrieveOnlineBARData.sampleData[whichSVG]['description'][expressionData['controlSampleName']];
                };
                if (controlSampleName === undefined || controlSampleName === '') {
                    controlSampleName = expressionData['controlSampleName'];
                };
                title.textContent += '\nControl Sample Name: ' + controlSampleName;

                svgObject.getElementById(svgSubunit).setAttribute("data-controlAverage", expressionData['controlAverage']);
                title.textContent += '\nControl Expression: ' + parseFloat(expressionData['controlAverage']).toFixed(3);
            };
            svgObject.getElementById(svgSubunit).appendChild(title);
    
            // Correcting duplicate error:
            if (isdupShoot) {
                for (var dupS = 0; dupS < duplicateShoot.length; dupS++) {
                    if (svgObject.getElementById(duplicateShoot[dupS])) {
                        // Add interactivity 
                        svgObject.getElementById(duplicateShoot[dupS]).setAttribute("class", 'hoverDetails');
                        svgObject.getElementById(duplicateShoot[dupS]).addEventListener('mouseenter', function(event) {
                            addTissueMetadata(this.id);
                        });
                        svgObject.getElementById(duplicateShoot[dupS]).addEventListener('mouseleave', function(event) {
                            removeTissueMetadata(this.id);
                        });
                        // Adding colour
                        childElements = svgObject.getElementById(duplicateShoot[dupS]).childNodes;
                        if (childElements.length > 0) {
                            for (var c = 0; c < childElements.length; c++) {
                                if (childElements[c].nodeName === 'path') {           
                                    childElements[c].setAttribute("fill", colour);
                                };
                            };
                        } else {             
                            svgObject.getElementById(duplicateShoot[dupS]).setAttribute("fill", colour);
                        };                    
                        // Add tooltip/title on hover
                        title.textContent = duplicateShoot[dupS] + '\nExpression level: ' + expressionLevel + '\nSample size: ' + sampleSize;
                        svgObject.getElementById(duplicateShoot[dupS]).appendChild(title);
                    };
                };
            } else if (isdupRoot) {
                for (var dupR = 0; dupR < duplicateRoot.length; dupR++) {
                    // Add interactivity 
                    svgObject.getElementById(duplicateRoot[dupR]).setAttribute("class", 'hoverDetails');
                    svgObject.getElementById(duplicateRoot[dupR]).addEventListener('mouseenter', function(event) {
                        addTissueMetadata(this.id);
                    });
                    svgObject.getElementById(duplicateRoot[dupR]).addEventListener('mouseleave', function(event) {
                        removeTissueMetadata(this.id);
                    });
                    childElements = svgObject.getElementById(duplicateRoot[dupR]).childNodes;
                    // Adding colour
                    if (childElements.length > 0) {
                        for (var c = 0; c < childElements.length; c++) {
                            if (childElements[c].nodeName === 'path') {           
                                childElements[c].setAttribute("fill", colour);
                            };
                        };
                    } else {             
                        svgObject.getElementById(duplicateRoot[dupR]).setAttribute("fill", colour);
                    };                 
                    // Add tooltip/title on hover
                    title.textContent = duplicateRoot[dupR] + '\nExpression level: ' + expressionLevel + '\nSample size: ' + sampleSize;
                    svgObject.getElementById(duplicateRoot[dupR]).appendChild(title)
                };
            };
        };
    };

    /**
     * Convert a percentage into a hex-code colour
     * @param {Number} percentage The percentage between 0 - 100 (as an int) into a colour between yellow and red
     * @returns {String} Hex-code colour
     */
    percentageToColour(percentage) {
        var percentageInt = parseInt(percentage);

        // From 0% to 100% as integers 
        var colourList = ['#ffff00','#fffd00','#fffc00','#fff900','#fff800','#fff600','#fff500','#fff300','#fff200','#fff000','#ffee00','#ffec00','#ffeb00','#ffe800','#ffe700','#ffe600','#ffe300','#ffe100','#ffe000','#ffdf00','#ffdd00','#ffdb00','#ffda00','#ffd800','#ffd600','#ffd300','#ffd200','#ffd000','#ffcf00','#ffcc00','#ffcb00','#ffc900','#ffc700','#ffc500','#ffc300','#ffc300','#ffc000','#ffbf00','#ffbd00','#ffbb00','#ffb900','#ffb800','#ffb500','#ffb300','#ffb200','#ffb000','#ffad00','#ffac00','#ffa900','#ffa800','#ffa600','#ffa400','#ffa200','#ffa100','#ff9e00','#ff9c00','#ff9a00','#ff9900','#ff9600','#ff9400','#ff9300','#ff9000','#ff8f00','#ff8c00','#ff8900','#ff8700','#ff8600','#ff8300','#ff8200','#ff7f00','#ff7c00','#ff7b00','#ff7800','#ff7600','#ff7300','#ff7100','#ff6e00','#ff6c00','#ff6900','#ff6700','#ff6500','#ff6100','#ff5e00','#ff5c00','#ff5900','#ff5600','#ff5300','#ff5000','#ff4d00','#ff4900','#ff4600','#ff4200','#ff3d00','#ff3a00','#ff3400','#ff3000','#ff2a00','#ff2400','#ff1c00','#ff1100','#ff0000'];

        return (colourList[percentageInt]);
    };

    /**
     * Create and generate an SVG based on the desired tissue expression locus
     * @param {String} svgName Name of the SVG file without the .svg at the end
     * @param {String} locus The AGI ID (example: AT3G24650) 
     * @param {String} desiredDOMid The desired DOM location or if kept empty, returns the string version of the output
     * @param {Boolean} includeDropdownAll true = include a html dropdown/select of all available SVGs/samples, false = don't
     * @param {Boolean} includeMaxDropdown true = include a html dropdown/select of the highest/lowest expression SVGs/samples, false = don't
     * @returns {String} If no desiredDOMid is given, returns the string version of the output instead
     */
    generateSVG(svgName, locus, desiredDOMid, includeDropdownAll = false, includeMaxDropdown = false) {   
        // Reset variables:
        this.svgValues = {};
        this.svgMax = undefined;
        this.svgMin = undefined;
        this.svgMaxAverage = undefined;
        this.svgMaxAverageSample = undefined;
        this.svgMinAverage = undefined;
        this.svgMinAverageSample = undefined;
        this.includeDropdownAll = includeDropdownAll;
        this.includeMaxDropdown = includeMaxDropdown;
        if (this.clickList.includes(svgName) === false) {
            this.clickList.push(svgName);
        };
        // Initiate scripts     
        this.desiredDOMid = desiredDOMid;
        this.retrieveOnlineBARData.loadSampleData(svgName, locus);
        if (includeMaxDropdown) {
            this.interactiveSVGData.retrieveTopExpressionValues(locus);
        };
        this.updateChecker(svgName, locus);
    };

    /**
     * Checks if a call has received its data yet
     * @param {String} svgName Which SVG is being called
     * @param {String} locus The AGI ID (example: AT3G24650) 
     * @param {Number} iteration How many times has this recursive function been called
     */
    updateChecker(svgName, locus, iteration = 0) {
        if (iteration < 200) { 
            let newIt = iteration + 1;

            let timer = setTimeout(() => {
                var checkList = Object.keys(this.retrieveOnlineBARData.eFPObjects);

                // Want to double check if not already been called or not
                if (checkList.length === this.clickList.length) {
                    this.addSVGtoDOM(svgName, locus, this.includeDropdownAll, this.includeMaxDropdown);
                } else {
                    this.updateChecker(svgName, locus, newIt);
                }
            }, 100);
        };
    };
};
/**
 * Create and retrieve expression data in an SVG format
 */
const createSVGExpressionData = new CreateSVGExpressionData();