//============================ Alexander Sullivan =============================
//
// Purpose: Generates eFP tissue expression data
//
//=============================================================================
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
    if (document.getElementById(createSVGExpressionData.svgObjectName) && document.getElementById(createSVGExpressionData.svgObjectName)) {
        svgDoc = document.getElementById(createSVGExpressionData.svgObjectName);
        svgPart = svgDoc.getElementById(elementID);
        svgPartChildren = svgPart.childNodes;
    };

    /** Increase stroke width within SVG by (multiplied) this much */
    var increaseStrokeWidthBy = 2.25;
    // Storing stroke widths
    var existingStrokeWidth = undefined, 
        existingStrokeColour = undefined;

    if (svgDoc && svgPart) {
        if (svgPart.getAttribute('stroke-width')) {
            existingStrokeWidth = svgPart.getAttribute('stroke-width');

            if (svgPart.getAttribute('stroke')) {
                existingStrokeColour = svgPart.getAttribute('stroke');
            };
        } else if (svgPartChildren.length > 0) {
            for (var s = 0; s < svgPartChildren.length; s++) {
                if (svgPartChildren[s].nodeName === 'path') {
                    if (svgPartChildren[s].getAttribute('stroke-width')) {
                        existingStrokeWidth = svgPartChildren[s].getAttribute('stroke-width');
                    };
    
                    if (svgPartChildren[s].getAttribute('stroke')) {
                        existingStrokeColour = svgPartChildren[s].getAttribute('stroke');
                    };
                };
            };
        };

        if (!existingStrokeData[elementID]) {
            existingStrokeData[elementID] = {};
            existingStrokeData[elementID]['strokeWidth'] = existingStrokeWidth;
            existingStrokeData[elementID]['strokeColour'] = existingStrokeColour;
            existingStrokeData[elementID]['addedMetadata'] = false;
        };

        // Making stroke width thicker
        if (svgDoc.getElementById(elementID) && !existingStrokeData[elementID]['addedMetadata']) {
            existingStrokeData[elementID]['addedMetadata'] = true;

            var strokeElement = svgDoc.getElementById(elementID);
            
            existingStrokeWidth = Number(existingStrokeWidth);
            var newStrokeWidth = existingStrokeWidth * increaseStrokeWidthBy;
            var maxStrokeWidth = increaseStrokeWidthBy;
            var minStrokeWidth = increaseStrokeWidthBy / 2;

            if (newStrokeWidth > maxStrokeWidth && maxStrokeWidth > existingStrokeWidth) {
                newStrokeWidth = maxStrokeWidth;
            } else if (newStrokeWidth < minStrokeWidth && minStrokeWidth > existingStrokeWidth) {
                newStrokeWidth = minStrokeWidth;
            } else if (newStrokeWidth === 0) {
                newStrokeWidth = increaseStrokeWidthBy;
            } else if (!newStrokeWidth) {
                newStrokeWidth = minStrokeWidth;
            };

            /** Boolean to determine if metadata has been added already */
            var addedHoverMetadata = false;
            if (strokeElement.getAttribute('stroke-width')) {
                svgDoc.getElementById(elementID).setAttribute('stroke-width', newStrokeWidth);
                svgDoc.getElementById(elementID).setAttribute('stroke', '#000');

                addedHoverMetadata = true;
            } else if (svgPartChildren && svgPartChildren.length > 0) {
                for (var s = 0; s < svgPartChildren.length; s++) {
                    if (svgPartChildren[s].nodeName === 'path' && svgPartChildren[s].getAttribute('stroke-width')) {
                        svgPartChildren[s].setAttribute('stroke-width', newStrokeWidth);

                        if (svgPartChildren[s].getAttribute('stroke')) {
                            svgPartChildren[s].setAttribute('stroke', '#000');
                        };

                        addedHoverMetadata = true;
                    };
                };
            };

            if (!addedHoverMetadata) {
                svgDoc.getElementById(elementID).setAttribute('stroke-width', newStrokeWidth);
                svgDoc.getElementById(elementID).setAttribute('stroke', '#000');
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

    /** A fallback stroke width for the SVG if one is not already pre-determined */
    var fallbackStrokeWidth = 1;
    /** A fallback stroke colour (black) for the SVG if one is not already pre-determined */
    var fallbackStrokeColour = '#000' // Black
    // Retrieve document objects:
    var svgDoc, svgPart, svgPartChildren;
    if (document.getElementById(createSVGExpressionData.svgObjectName) && document.getElementById(createSVGExpressionData.svgObjectName)) {
        svgDoc = document.getElementById(createSVGExpressionData.svgObjectName);
        svgPart = svgDoc.getElementById(elementID);
        svgPartChildren = svgPart.childNodes;
    };

    // If existing stroke data exists, then proceed
    if (existingStrokeData[elementID] && existingStrokeData[elementID]['addedMetadata']) {
        existingStrokeData[elementID]['addedMetadata'] = false;
        if (svgPart && svgPart.getAttribute('stroke-width')) {
            if (Number(existingStrokeData[elementID]['strokeWidth']) >= 0) {
                svgDoc.getElementById(elementID).setAttribute('stroke-width', (existingStrokeData[elementID]['strokeWidth']));
            } else if (!existingStrokeData[elementID]['strokeWidth']) {
                svgDoc.getElementById(elementID).removeAttribute('stroke-width');
            } else {
                svgDoc.getElementById(elementID).setAttribute('stroke-width', fallbackStrokeWidth);
            };
    
            if (svgPart.getAttribute('stroke')) {
                if (existingStrokeData[elementID]['strokeColour']) {
                    svgDoc.getElementById(elementID).setAttribute('stroke', (existingStrokeData[elementID]['strokeColour']));
                } else {
                    svgDoc.getElementById(elementID).setAttribute('stroke', fallbackStrokeColour);
                };
            };
        } else if (svgPartChildren.length > 0) {
            for (var s = 0; s < svgPartChildren.length; s++) {
                if (svgPartChildren[s].nodeName === 'path') {
                    if (svgPartChildren[s].getAttribute('stroke-width')) {
                        if (Number(existingStrokeData[elementID]['strokeWidth']) >= 0) {
                            svgPartChildren[s].setAttribute('stroke-width', (existingStrokeData[elementID]['strokeWidth']));
                        } else if (!existingStrokeData[elementID]['strokeWidth']) {
                            svgDoc.getElementById(elementID).removeAttribute('stroke-width');
                        } else {
                            svgPartChildren[s].setAttribute('stroke-width', fallbackStrokeWidth);
                        };
                    };

                    if (svgPartChildren[s].getAttribute('stroke')) {
                        if (existingStrokeData[elementID]['strokeColour']) {
                            svgPartChildren[s].setAttribute('stroke', (existingStrokeData[elementID]['strokeColour']));
                        } else {
                            svgPartChildren[s].setAttribute('stroke', fallbackStrokeColour);
                        };
                    };
                };
            };
        } else {
            svgPart.setAttribute('stroke-width', fallbackStrokeWidth);
            svgPart.setAttribute('stroke', fallbackStrokeColour);
        };
    };
};

/**
 * Create and retrieve expression data in an SVG format
 */
class CreateSVGExpressionData {
    constructor() {
        // callPlantEFP
        this.eFPObjects = {};
        // loadSampleData
        this.sampleData = {};
        this.sampleOptions = [];
        this.sampleReadableName = {};
        // Top expression data
        this.topExpressionValues = {};
        this.expressionValues = {};
        this.topExpressionOptions = [
            'Microarray',
            'RNA-seq'
        ];
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
     * Create and generate an SVG based on the desired tissue expression locus
     * @param {String} desiredDOMid The desired DOM location or if kept empty, returns the string version of the output
     * @param {String} locus The AGI ID (example: AT3G24650) 
     * @param {String} svgName Name of the SVG file without the .svg at the end. Default is set to "default", when left this value, the highest expression value (if any) is chosen and if not, then Abiotic Stress is. 
     * @param {Boolean} includeDropdownAll true = include a html dropdown/select of all available SVGs/samples, false = don't
     * @returns {String} If no desiredDOMid is given, returns the string version of the output instead
     */
    generateSVG(desiredDOMid, locus = 'AT3G24650', svgName = 'default', includeDropdownAll = true) {
        // Reset variables:
        this.svgValues = {};
        this.svgMax = undefined;
        this.svgMin = undefined;
        this.svgMaxAverage = undefined;
        this.svgMaxAverageSample = undefined;
        this.svgMinAverage = undefined;
        this.svgMinAverageSample = undefined;
        this.includeDropdownAll = includeDropdownAll;
        if (this.clickList.includes(svgName) === false) {
            this.clickList.push(svgName);
        };
        // Initiate scripts     
        this.desiredDOMid = desiredDOMid;
        this.retrieveTopExpressionValues(svgName, locus.toUpperCase());
    };
    
    /**
     * Retrieve information about the top expression values for a specific locus
     * @param {String} svgName Name of the SVG file without the .svg at the end
     * @param {String} locus The AGI ID (example: AT3G24650) 
     */
    retrieveTopExpressionValues(svgName, locus = 'AT3G24650') {
        var completedFetches = 0;
        // If never been called before
        if (!this.topExpressionValues || !this.topExpressionValues[locus]) {
            for (var t = 0; t < this.topExpressionOptions.length; t++) {
                var topMethod = this.topExpressionOptions[t];

                let url = `https://bar.utoronto.ca/expression_max_api/max_average?method=${topMethod}`;
                var sendHeaders = "application/json";
                var postSend = {
                    'loci': [locus.toUpperCase()],
                    'method': topMethod
                };
                postSend = JSON.stringify(postSend);

                var methods = {mode: 'cors'};
                methods['method'] = 'POST';
                if (sendHeaders) {
                    methods['headers'] = {};
                    methods['headers']["Content-type"] = sendHeaders;
                };
                methods['body'] = postSend;

                fetch(url, methods).then(
                    response => {
                        if (response.status === 200) {
                            response.text().then(data => {
                                let response; 
                                if (data.length > 0) {
                                    response = JSON.parse(data);
                                } else {
                                    response = {};
                                };

                                var topMethodUsed;
                                var urlQuery = url.split('=');
                                if (urlQuery.length > 1) {
                                    topMethodUsed = urlQuery[1];
                                };

                                if (topMethodUsed && response && response["wasSuccessful"] === true) {
                                    if (response['maxAverage']) {
                                        var tempTopExpressionData = {};
                                        tempTopExpressionData[topMethodUsed] = {};

                                        tempTopExpressionData[topMethodUsed]['maxAverage'] = response['maxAverage'][locus.toUpperCase()];

                                        if (response['standardDeviation']) {
                                            tempTopExpressionData[topMethodUsed]['standardDeviation'] = response['standardDeviation'][locus.toUpperCase()]
                                        };
                                        if (response['sample']) {
                                            tempTopExpressionData[topMethodUsed]['sample'] = response['sample'][locus.toUpperCase()]
                                        };
                                        if (response['compendium']) {
                                            tempTopExpressionData[topMethodUsed]['compendium'] = response['compendium'][locus.toUpperCase()]
                                        };

                                        if (!this.topExpressionValues) { 
                                            this.topExpressionValues = {};
                                        };
                                        this.topExpressionValues[locus] = {...this.topExpressionValues[locus], ...tempTopExpressionData};
                                    };
                                };

                                completedFetches++;
                                if (completedFetches === this.topExpressionOptions.length) {
                                    this.loadSampleData(svgName, locus);
                                };
                            });
                        } else if (response.status !== 200) {   
                            completedFetches++;
                            if (completedFetches === this.topExpressionOptions.length) {
                                this.loadSampleData(svgName, locus);
                            };
                            
                            console.error('fetch error - Status Code: ' + response.status + ', fetch-url: ' + response.url + ', document-url: ' + window.location.href);
                        };
                    }		
                ).catch(err => {
                    completedFetches++;
                    if (completedFetches === this.topExpressionOptions.length) {
                        this.loadSampleData(svgName, locus);
                    };

                    console.error(err);
                });
            };
        } else if (Object.keys(this.topExpressionValues[locus]).length > 0) {
            this.loadSampleData(svgName, locus);
        };       
    };

    /**
     * Calls and stores the sample Data for the SVG, SVG's subunits, datasource and it's name-values 
     * @param {String} svgName Name of the SVG file without the .svg at the end
     * @param {String} locus The AGI ID (example: AT3G24650) 
     */
    loadSampleData(svgName, locus) {
        if (Object.keys(this.sampleData).length === 0) {
            let url = 'https://raw.githubusercontent.com/BioAnalyticResource/ePlant_Plant_eFP/master/data/SampleData.min.json';

            var methods = {mode: 'cors'};
    
            fetch(url, methods).then(
                response => {
                    if (response.status === 200) {
                        response.text().then(data => {
                            let res; 
                            if (data.length > 0) {
                                res = JSON.parse(data);
                            } else {
                                res = {};
                            };
                            
                            // Store response
                            this.sampleData = res;
                            // Setup and retrieve information about the target SVG and locus 
                            this.retrieveSampleData(svgName, locus);
                        });
                    } else if (response.status !== 200) {
                          console.error('fetch error - Status Code: ' + response.status + ', fetch-url: ' + response.url + ', document-url: ' + window.location.href);
                    };
                }		
            ).catch(err => {
                console.error(err);
            });
        } else if (Object.keys(this.sampleData).length > 0) {
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
        
        if (this.sampleOptions.length === 0) {
            for (const [key, value] of Object.entries(this.sampleData)) {
                this.sampleOptions.push(key);
                this.sampleReadableName[value['name']] = key;
            };
        };

        // Create variables that will be used in retrieveSampleData
        var sampleDataKeys = Object.keys(this.sampleData); // All possible SVGs
        var sampleDB = ''; // The sample's datasource
        var sampleIDList = []; // List of all of the sample's IDs
        var sampleSubunits = []; // List of SVG's subunits

        // Check if valid SVG
        if (!sampleDataKeys.includes(svgName) && this.topExpressionValues[locus]) {
            // Determine max expression value to default too
            var maxExpressionValue = 0;
            var maxExpressionCompendium = undefined;
            for (const [key, value] of Object.entries(this.topExpressionValues[locus])) {
                if (value['compendium'] && value['compendium'][1] && sampleDataKeys.includes(value['compendium'][1])) {
                    if (value['maxAverage'] && value['maxAverage'][1] && value['maxAverage'][1] > maxExpressionValue) {
                        maxExpressionValue = value.maxAverage[1];
                        maxExpressionCompendium = value.compendium[1];
                    };
                };
            };
            
            if (maxExpressionCompendium) {
                svgName = maxExpressionCompendium;
            } else {
                svgName = 'AbioticStress';
            };
        };

        // If still default, load in Abiotic Stress
        if (svgName === 'default') {
            svgName = 'AbioticStress';
        };

        // Create variables for parsing
        var sampleInfo = this.sampleData[svgName];
        let sampleOptions;
        if (sampleInfo && sampleInfo.sample) {
            sampleOptions = sampleInfo['sample'];
        };
        if (sampleInfo && sampleInfo.db) {
            sampleDB = sampleInfo['db'];
        };

        // If a database is available for this SVG, then find sample ID information
        if (sampleDB !== undefined) {
            sampleSubunits = Object.keys(sampleInfo.sample);
            sampleIDList = [];
            for (var sK = 0; sK < sampleSubunits.length; sK++) {
                sampleIDList = sampleIDList.concat(sampleOptions[sampleSubunits[sK]]);
            };
        };

        // Call plantefp.cgi webservice to retrieve information about the target tissue expression data
        if (!this.eFPObjects[svgName] || !this.eFPObjects[svgName]['locusCalled'].includes(locus)) {
            this.callPlantEFP(sampleDB, locus, sampleIDList, svgName, sampleOptions);
        } else if (this.eFPObjects[svgName]) {
            this.addSVGtoDOM(svgName, locus, this.includeDropdownAll);
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

        var methods = {mode: 'cors'};

        if (sampleSubunits) {
            fetch(url, methods).then(
                response => {
                    if (response.status === 200) {
                        response.text().then(data => {
                            let response; 
                            if (data.length > 0) {
                                response = JSON.parse(data);
                            } else {
                                response = {};
                            };
    
                            let subunitsList = Object.keys(sampleSubunits);
    
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
    
                                        // Add to list of called locus data
                                        if (!this.eFPObjects[svg]['locusCalled']) {
                                            this.eFPObjects[svg]['locusCalled'] = [];
                                        };
                                        if (!this.eFPObjects[svg]['locusCalled'].includes(locus)) {
                                            this.eFPObjects[svg]['locusCalled'].push(locus);
                                        };
                                    };
                                };
                            };
            
                            // Add db
                            this.eFPObjects[svg]['db'] = datasource;
    
                            this.addSVGtoDOM(svg, locus, this.includeDropdownAll);
                        });
                    } else if (response.status !== 200) {
                        this.addSVGtoDOM(svg, locus, this.includeDropdownAll);
    
                        console.error('fetch error - Status Code: ' + response.status + ', fetch-url: ' + response.url + ', document-url: ' + window.location.href);
                    };
                }		
            ).catch(err => {
                this.addSVGtoDOM(svg, locus, this.includeDropdownAll);
    
                console.error(err);
            });
        } else {
            this.addSVGtoDOM(svg, locus, this.includeDropdownAll);

            console.error(`sampleSubunits is ${sampleSubunits}`);
        };
    };

    /**
     * Add the SVG to the designated DOM
     * @param {String} svgName Name of the SVG file without the .svg at the end
     * @param {String} locus The AGI ID (example: AT3G24650) 
     */
    addSVGtoDOM(svgName, locus, includeDropdownAll = false) {
        var svgUse = 'Klepikova';
        var appendSVG = '';
        if (svgName !== '') {
            svgUse = svgName;
        };

        // Empty target region
        var targetDOMRegion = document.getElementById(this.desiredDOMid);
        targetDOMRegion.innerHTML = '';

        // Add dropdown list of all samples to document:
        if (includeDropdownAll && this.sampleOptions) {
            appendSVG += 'Select SVG to display: <select onchange="window.createSVGExpressionData.generateSVG(\'' + this.desiredDOMid + '\', \'' + locus + '\', this.value.toString(), ' + includeDropdownAll + ')" id="sampleOptions" value="' + svgName + '">';
            var sampleOptions = Object.keys(this.sampleReadableName);
            sampleOptions.sort();

            if (this.topExpressionValues[locus] && Object.keys(this.topExpressionValues[locus]).length > 0) {
                // Hidden option
                appendSVG += '<option value="hiddenOption" id="hiddenExpressionOption" disabled>Compendiums with maximum average expression:</option>';

                var topList = Object.keys(this.topExpressionValues[locus]);
            
                for (var i = 0; i < topList.length; i++) {
                    if (this.topExpressionValues[locus][topList[i]]) {
                        var expressionData = this.topExpressionValues[locus][topList[i]];
                        var compendiumOptions = expressionData['compendium'];

                        for (var c = 0; c < Object.keys(compendiumOptions).length; c++) {
                            var cUse = c + 1;

                            if (expressionData['compendium'][cUse]) {
                                var expressionCompendium = expressionData['compendium'][cUse];
                                var expressionSample = expressionData['sample'][cUse];

                                if (expressionSample && this.sampleData[expressionCompendium] && this.sampleData[expressionCompendium] && this.sampleData[expressionCompendium]['description']) {
                                    var readableSampleName = this.sampleData[expressionCompendium]['description'][expressionSample];
                                    var expressionAverageLevel = expressionData['maxAverage'][cUse];
                                    var compendiumName = this.sampleData[expressionCompendium]['name'];
                                    
                                    appendSVG += '<option value="' + expressionCompendium + '">' + compendiumName + ': ' + readableSampleName + ' at ' +  expressionAverageLevel + ' (' + topList[i] + ')</option>';
                                    break;
                                };
                            };
                        };                    
                    };
                };
            };

            appendSVG += '<option value="hiddenOption" id="allCompendiumOptions" disabled>All compendiums:</option>';
            for (var i = 0; i < sampleOptions.length; i++) {
                appendSVG += '<option value="' + this.sampleReadableName[sampleOptions[i]] + '">' + sampleOptions[i] + '</option>';
            };
            appendSVG += '</select></br>';
        };

        // Append SVG to document
        appendSVG += '<b>' + svgName + '</b></br>';

        // Create call for SVG file
        var urlSVG = 'https://raw.githubusercontent.com/BioAnalyticResource/ePlant_Plant_eFP/master/compendiums/' + svgUse + '.min.svg';
        var methods = {mode: 'cors'};

        fetch(urlSVG, methods).then(
            response => {
                if (response.status === 200) {
                    response.text().then(data => {
                        appendSVG += '<div id="' + svgUse + '_object">';
                        appendSVG += data;
                        appendSVG += '</div>';
                        targetDOMRegion.innerHTML = appendSVG;

                        /** Parsable version of the returned SVG */
                        let svgData = new DOMParser().parseFromString(data, 'text/xml');
                        if (svgData.getElementsByTagName('svg') && svgData.getElementsByTagName('svg')[0] && svgData.getElementsByTagName('svg')[0].id) {
                            this.svgObjectName = svgData.getElementsByTagName('svg')[0].id;
                            
                            // Adjust width and height of SVG
                            if (document.getElementById(this.svgObjectName)) {
                                document.getElementById(this.svgObjectName).style = 'width: 95% !important;height: 95% !important;';
                            };
                        };

                        /** All dropdown sample options */
                        let sampleOptions = document.getElementById('sampleOptions').options;
                        for (let i in sampleOptions) {
                            // If sample option is displayed SVG, change that dropdown's selected index to display that option
                            if (sampleOptions[i].value && sampleOptions[i].value === svgName && sampleOptions[i].innerText && this.sampleData[svgName].name && sampleOptions[i].innerText.trim() === this.sampleData[svgName].name.trim()) {
                                document.getElementById('sampleOptions').selectedIndex = i;

                                break;
                            };
                        };

                        setTimeout(() => {
                            this.createLocusMatch(svgUse, locus);
                        }, 200);
                    });
                } else if (response.status !== 200) {
                    console.error('fetch error - Status Code: ' + response.status + ', fetch-url: ' + response.url + ', document-url: ' + window.location.href);
                };
            }		
        ).catch(err => {
            console.error(err);
        });
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
        let dataObject = this.eFPObjects; 
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
            var controlData = this.sampleData[whichSVG];
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
     * Colour the existing SVG that has been created
     * @param {String} whichSVG Name of the SVG file without the .svg at the end
     * @param {Array} svgSubunits A list containing all desired SVG subunits to be interacted with
     */
    colourSVGs(whichSVG, svgSubunits) {
        for (var i = 0; i < svgSubunits.length; i++) {
            // Colouring values
            var denominator = this.svgMaxAverage;
            var numerator = this.svgValues[svgSubunits[i]]['average'];
            if (numerator < 0) {
                numerator = 0;
            };

            var percentage = null;
            if (denominator && denominator >= 0) {
                percentage = (numerator/denominator) * 100;
            };

            if (percentage > 100) {
                percentage = 100;
            } else if (percentage < 0) {
                percentage = 0;
            };
            // Retrieve colouring information
            var colourFill = this.percentageToColour(percentage);

            var expressionLevel = parseFloat(numerator).toFixed(3);
            var sampleSize = this.svgValues[svgSubunits[i]].rawValues.length;

            this.svgValues[svgSubunits[i]]['expressionLevel'] = expressionLevel;
            this.svgValues[svgSubunits[i]]['sampleSize'] = sampleSize;

            // Begin colouring SVG subunits
            this.colourSVGSubunit(whichSVG, svgSubunits[i], colourFill, expressionLevel, sampleSize);
        };
    };

    /**
     * Convert a percentage into a hex-code colour
     * @param {Number} percentage The percentage between 0 - 100 (as an int) into a colour between yellow and red
     * @returns {String} Hex-code colour
     */
    percentageToColour(percentage) {
        var percentageInt = parseInt(percentage);

        if (percentageInt >= 0) {
            // From 0% to 100% as integers 
            var colourList=["#ffff00","#fffc00","#fff900","#fff700","#fef400","#fff200","#ffef00","#feed00","#ffea00","#ffe800","#ffe500","#ffe200","#ffe000","#ffdd00","#ffdb00","#ffd800","#ffd600","#fed300","#ffd100","#ffce00","#ffcc00","#ffc900","#ffc600","#ffc400","#ffc100","#ffbf00","#ffbc00","#ffba00","#ffb700","#feb500","#ffb200","#ffaf00","#ffad00","#ffaa00","#ffa800","#ffa500","#ffa300","#ffa000","#ff9e00","#ff9b00","#ff9900","#ff9600","#ff9300","#ff9100","#ff8e00","#ff8c00","#ff8900","#ff8700","#ff8400","#ff8200","#ff7f00","#ff7c00","#ff7a00","#ff7700","#ff7500","#ff7200","#ff7000","#ff6d00","#ff6b00","#ff6800","#ff6600","#ff6300","#ff6000","#ff5e00","#ff5b00","#ff5900","#ff5600","#ff5400","#ff5100","#ff4f00","#ff4c00","#ff4900","#ff4700","#ff4400","#ff4200","#ff3f00","#ff3d00","#ff3a00","#ff3800","#ff3500","#ff3200","#ff3000","#ff2d00","#ff2b00","#ff2800","#ff2600","#ff2300","#ff2100","#ff1e00","#ff1c00","#ff1900","#ff1600","#ff1400","#ff1100","#ff0f00","#ff0c00","#ff0a00","#ff0700","#ff0500","#ff0200","#ff0000"];

            return (colourList[percentageInt]);
        } else {
            return ("#808080");
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
        let svgObject = document.getElementById(this.svgObjectName);

        if (svgObject && svgObject.getElementById(svgSubunit)) {
            var expressionData = createSVGExpressionData["svgValues"][svgSubunit];
            var descriptionName = undefined;
            if (this.sampleData[whichSVG]['description']) {
                descriptionName = this.sampleData[whichSVG]['description'][svgSubunit];
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
            title.textContent = descriptionName + '\nExpression level: ' + expressionLevel + '\nSample size: ' + sampleSize + '\nStandard Deviation: ' + parseFloat(expressionData['sd']).toFixed(3);
    
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
                if (this.sampleData[whichSVG]['description']) {
                    controlSampleName = this.sampleData[whichSVG]['description'][expressionData['controlSampleName']];
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
};
/**
 * Create and retrieve expression data in an SVG format
 */
let createSVGExpressionData = new CreateSVGExpressionData();
window.createSVGExpressionData = createSVGExpressionData;