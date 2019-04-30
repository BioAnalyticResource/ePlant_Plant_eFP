/**
 * Contains necessary code required to create an interactive example page
 */
class Example {
    /**
     * Fills the dropdown of SVGs with list of possible options
     */
    findListOfSVGs() {
        // Load SVGs sample data
        retrieveOnlineBARData.loadSampleData('svgName', document.getElementById('selectLocus').value, false);
        // Fill SVG list
        setTimeout(function() {
            var select = document.getElementById("selectSVG"); 
            var sampleDataSVGs = Object.keys(retrieveOnlineBARData.sampleData);
            // Create SVG options as a dropdown list
            for (var i = 0; i < sampleDataSVGs.length; i++) {
                var opt = sampleDataSVGs[i];
                var el = document.createElement("option");
                el.textContent = opt;
                el.value = opt;
                select.appendChild(el);
            }
        }, 100);        
    };
}
/**
 * Contains necessary code required to create an interactive example page
 */
const example = new Example();

/**
 * Initialization the example
 */
function init() {
    // Create interactive example page
    example.findListOfSVGs();
    // Load default data
    setTimeout(function() {
        document.getElementById('selectSVG').value = 'Klepikova';
        createSVGExpressionData.generateSVG(document.getElementById('selectSVG').value, document.getElementById('selectLocus').value, 'tissueExpressionSVG');
    }, 100);
}
init();