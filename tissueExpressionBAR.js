//============================ Alexander Sullivan =============================
//
// Purpose: Generates eFP tissue expression data
//
//=============================================================================
/** Stroke data of compendiums that have already been called */
let existingStrokeData = {};
window.existingStrokeData = existingStrokeData;
/**
 * Add details to an SVG or SVG-subunit including: hover and outline
 * @param {String} elementID Which SVG or SVG-subunit is being found and edited
 */
function addTissueMetadata(elementID) {
	// Adjusting for BioticStressPseudomonassyringae's half leaf:
	if (elementID.includes("Half_Leaf_Pseudomonas_syringae")) {
		elementID = elementID + "_outline";
	}
	// Retrieve document objects:
	let svgDoc, svgPart, svgPartChildren;
	if (document.getElementById(createSVGExpressionData.svgObjectName)) {
		svgDoc = document.getElementById(createSVGExpressionData.svgObjectName);
		svgPart = svgDoc.getElementById(elementID);
		svgPartChildren = svgPart.childNodes;
	}

	/** Increase stroke width within SVG by (multiplied) this much */
	const increaseStrokeWidthBy = 2.25;
	// Storing stroke widths
	let existingStrokeWidth = undefined,
		existingStrokeColour = undefined;

	if (svgDoc && svgPart) {
		if (svgPart.getAttribute("stroke-width")) {
			existingStrokeWidth = svgPart.getAttribute("stroke-width");

			if (svgPart.getAttribute("stroke")) {
				existingStrokeColour = svgPart.getAttribute("stroke");
			}
		} else if (svgPartChildren.length > 0) {
			for (const svgChildPart of svgPartChildren) {
				if (svgChildPart.nodeName === "path") {
					if (svgChildPart.getAttribute("stroke-width")) {
						existingStrokeWidth = svgChildPart.getAttribute("stroke-width");
					}

					if (svgChildPart.getAttribute("stroke")) {
						existingStrokeColour = svgChildPart.getAttribute("stroke");
					}
				}
			}
		}

		if (!existingStrokeData[elementID]) {
			existingStrokeData[elementID] = {};
			existingStrokeData[elementID]["strokeWidth"] = existingStrokeWidth;
			existingStrokeData[elementID]["strokeColour"] = existingStrokeColour;
			existingStrokeData[elementID]["addedMetadata"] = false;
		}

		// Making stroke width thicker
		if (svgDoc.getElementById(elementID) && !existingStrokeData[elementID]["addedMetadata"]) {
			existingStrokeData[elementID]["addedMetadata"] = true;

			const strokeElement = svgDoc.getElementById(elementID);

			// Create hover title box
			if (strokeElement.getBoundingClientRect()) {
				/** Title box's text */
				const titleText = svgPart.getElementsByTagName("title")?.[0]?.textContent;
				/** Title box's x-coordinate */
				const boxLeft = strokeElement.getBoundingClientRect().right;
				/** Title box's y-coordinate */
				const boxTop = strokeElement.getBoundingClientRect().bottom;

				// If all the data is available, add the title box
				if (titleText && boxLeft && boxTop) {
					ePlantPlantEFPChangeTitlePosition(true, boxLeft, boxTop, titleText);
				} else {
					// Fail-safe, hide title box
					ePlantPlantEFPChangeTitlePosition(false);
				}
			} else {
				// Fail-safe, hide title box
				ePlantPlantEFPChangeTitlePosition(false);
			}

			existingStrokeWidth = Number(existingStrokeWidth);
			let newStrokeWidth = existingStrokeWidth * increaseStrokeWidthBy;
			const maxStrokeWidth = increaseStrokeWidthBy;
			const minStrokeWidth = increaseStrokeWidthBy / 2;

			if (newStrokeWidth > maxStrokeWidth && maxStrokeWidth > existingStrokeWidth) {
				newStrokeWidth = maxStrokeWidth;
			} else if (newStrokeWidth < minStrokeWidth && minStrokeWidth > existingStrokeWidth) {
				newStrokeWidth = minStrokeWidth;
			} else if (newStrokeWidth === 0) {
				newStrokeWidth = increaseStrokeWidthBy;
			} else if (!newStrokeWidth) {
				newStrokeWidth = minStrokeWidth;
			}

			/** Boolean to determine if metadata has been added already */
			let addedHoverMetadata = false;
			if (strokeElement.getAttribute("stroke-width")) {
				svgDoc.getElementById(elementID).setAttribute("stroke-width", newStrokeWidth);
				svgDoc.getElementById(elementID).setAttribute("stroke", "#000");

				addedHoverMetadata = true;
			} else if (svgPartChildren && svgPartChildren.length > 0) {
				for (const svgChildPart of svgPartChildren) {
					if (svgChildPart.nodeName === "path" && svgChildPart.getAttribute("stroke-width")) {
						svgChildPart.setAttribute("stroke-width", newStrokeWidth);

						if (svgChildPart.getAttribute("stroke")) {
							svgChildPart.setAttribute("stroke", "#000");
						}

						addedHoverMetadata = true;
					}
				}
			}

			if (!addedHoverMetadata) {
				svgDoc.getElementById(elementID).setAttribute("stroke-width", newStrokeWidth);
				svgDoc.getElementById(elementID).setAttribute("stroke", "#000");
			}
		}
	}
}

/**
 * Remove details to an SVG or SVG-subunit including: hover and outline
 * @param {String} elementID Which SVG or SVG-subunit is being found and edited
 */
function removeTissueMetadata(elementID) {
	// Adjusting for BioticStressPseudomonassyringae's half leaf:
	if (elementID.includes("Half_Leaf_Pseudomonas_syringae")) {
		elementID = elementID + "_outline";
	}

	/** A fallback stroke width for the SVG if one is not already pre-determined */
	const fallbackStrokeWidth = 1;
	/** A fallback stroke colour (black) for the SVG if one is not already pre-determined */
	const fallbackStrokeColour = "#000"; // Black
	// Retrieve document objects:
	let svgDoc, svgPart, svgPartChildren;
	if (document.getElementById(createSVGExpressionData.svgObjectName)) {
		svgDoc = document.getElementById(createSVGExpressionData.svgObjectName);
		svgPart = svgDoc.getElementById(elementID);
		svgPartChildren = svgPart.childNodes;
	}

	// If existing stroke data exists, then proceed
	if (existingStrokeData[elementID] && existingStrokeData[elementID]["addedMetadata"]) {
		existingStrokeData[elementID]["addedMetadata"] = false;
		if (svgPart && svgPart.getAttribute("stroke-width")) {
			if (Number(existingStrokeData[elementID]["strokeWidth"]) >= 0) {
				svgDoc
					.getElementById(elementID)
					.setAttribute("stroke-width", existingStrokeData[elementID]["strokeWidth"]);
			} else if (!existingStrokeData[elementID]["strokeWidth"]) {
				svgDoc.getElementById(elementID).removeAttribute("stroke-width");
			} else {
				svgDoc.getElementById(elementID).setAttribute("stroke-width", fallbackStrokeWidth);
			}

			if (svgPart.getAttribute("stroke")) {
				if (existingStrokeData[elementID]["strokeColour"]) {
					svgDoc
						.getElementById(elementID)
						.setAttribute("stroke", existingStrokeData[elementID]["strokeColour"]);
				} else {
					svgDoc.getElementById(elementID).setAttribute("stroke", fallbackStrokeColour);
				}
			}
		} else if (svgPartChildren.length > 0) {
			for (const svgChildPart of svgPartChildren) {
				if (svgChildPart.nodeName === "path") {
					if (svgChildPart.getAttribute("stroke-width")) {
						if (Number(existingStrokeData[elementID]["strokeWidth"]) >= 0) {
							svgChildPart.setAttribute("stroke-width", existingStrokeData[elementID]["strokeWidth"]);
						} else if (!existingStrokeData[elementID]["strokeWidth"]) {
							svgDoc.getElementById(elementID).removeAttribute("stroke-width");
						} else {
							svgChildPart.setAttribute("stroke-width", fallbackStrokeWidth);
						}
					}

					if (svgChildPart.getAttribute("stroke")) {
						if (existingStrokeData[elementID]["strokeColour"]) {
							svgChildPart.setAttribute("stroke", existingStrokeData[elementID]["strokeColour"]);
						} else {
							svgChildPart.setAttribute("stroke", fallbackStrokeColour);
						}
					}
				}
			}
		} else {
			svgPart.setAttribute("stroke-width", fallbackStrokeWidth);
			svgPart.setAttribute("stroke", fallbackStrokeColour);
		}
	}

	// Hide title box
	ePlantPlantEFPChangeTitlePosition(false);
}

/**
 * Create and display the ePlant Plant eFP's hover title box
 * @param {Boolean} display Whether to display [true] or hide [false, default] the title box
 * @param {Number | String} x The x-coordinate of the element being hovered over
 * @param {Number | String} y The y-coordinate of the element being hovered over
 * @param {String} textContent The text to be displayed in the title box
 * @param {String} domID The ID of the title box DOM element
 */
function ePlantPlantEFPChangeTitlePosition(
	display = false,
	x = 0,
	y = 0,
	textContent = "",
	domID = "ePlant-hover-title-box",
) {
	/** DOM of the title box element */
	const domElm = document.getElementById(domID);

	if (domElm) {
		if (!display) {
			// Hide title box
			domElm.style.display = "none";
		} else {
			// Display title box
			domElm.style.display = "block";
			domElm.style.left = `${x}px`;
			domElm.style.top = `${y}px`;
			domElm.textContent = textContent;
		}
	}
}

/** ePlant Plant's eFP mouse event data */
const ePlantPlantEFPHandleMouseEventData = {
	/** Whether mouse events can occur [true] or not [false, default] */
	start: false,
	/** Cache last mouse position to calculate next position on drag */
	cacheMousePos: {x: null, y: null},
	/** Initial height of the SVG */
	startHeight: null,
	/** How much the SVG has been zoomed in by */
	zoomLevel: 1,
};

/**
 * Handle mouse events to drag the SVG compendium
 * @param {String} domID DOM ID of the SVG container
 * @param {String} type What type of event is happening: 'down' to initiate drag, 'move' to drag, 'up' to end drag
 * @param {Event} e Mouse event object
 * @param {Number} moveBy How much the SVG has been moved by
 */
function ePlantPlantEFPHandleMouseEvent(domID, type, e, moveBy = 1.5) {
	/** SVG document */
	const svgElement = domID.firstElementChild;

	// If SVG is not loaded, then return
	if (svgElement?.viewBox?.baseVal) {
		// If the SVG is not yet been cached, then cache it
		if (!ePlantPlantEFPHandleMouseEventData.startHeight) {
			ePlantPlantEFPHandleMouseEventData.startHeight = svgElement.viewBox.baseVal.height;
		}

		// Determine if SVG should be draggable or not
		if (
			type === "down" &&
			!ePlantPlantEFPHandleMouseEventData.start &&
			window.getSelection() &&
			window.getSelection().isCollapsed
		) {
			// Prevent highlighting of text when dragging
			e.preventDefault();

			// Cache the mouse position and begin dragging
			ePlantPlantEFPHandleMouseEventData.start = true;
			ePlantPlantEFPHandleMouseEventData.cacheMousePos = {x: e.clientX, y: e.clientY};
		}

		// If the SVG is being dragged, then drag it
		if (type === "move" && ePlantPlantEFPHandleMouseEventData.start) {
			// Prevent highlighting of text when dragging
			e.preventDefault();

			/** How much the SVG will be dragged */
			const moveByValue = svgElement.viewBox.baseVal.height
				? window.innerHeight / svgElement.viewBox.baseVal.height / moveBy
				: moveBy;

			// Calculate the new position of the SVG
			/** New X position of SVG */
			const xDiff = -(e.clientX - ePlantPlantEFPHandleMouseEventData.cacheMousePos.x) / moveByValue;
			/** New Y position of SVG */
			const yDiff = -(e.clientY - ePlantPlantEFPHandleMouseEventData.cacheMousePos.y) / moveByValue;

			// Find boundaries of the SVG so it does not leave viewpoint
			/** Default boundaries for SVG viewpoint */
			const defaultScaleBoundaries = 0.95;

			/** Boundaries to scale the SVG's viewpoint on the X axis */
			let scaleBoundariesX = svgElement.height.baseVal.value
				? (defaultScaleBoundaries * 100 - svgElement.height.baseVal.value / svgElement.viewBox.baseVal.height) /
				  100
				: (defaultScaleBoundaries * 100 - window.innerHeight / svgElement.viewBox.baseVal.height) / 100;
			// Should be between 0 and 1
			if (scaleBoundariesX <= 0 || scaleBoundariesX >= 1) {
				scaleBoundariesX = defaultScaleBoundaries;
			}

			/** Boundaries to scale the SVG's viewpoint on the Y axis */
			let scaleBoundariesY = svgElement.width.baseVal.value
				? (defaultScaleBoundaries * 100 - svgElement.width.baseVal.value / svgElement.viewBox.baseVal.width) /
				  100
				: (defaultScaleBoundaries * 100 - window.innerWidth / svgElement.viewBox.baseVal.height) / 100;
			// Should be between 0 and 1
			if (scaleBoundariesY <= 0 || scaleBoundariesY >= 1) {
				scaleBoundariesY = defaultScaleBoundaries;
			}

			/** Current zoom level on the SVG compendium */
			const zoomLevel =
				1 / ePlantPlantEFPHandleMouseEventData.zoomLevel === 1
					? defaultScaleBoundaries
					: 1 / ePlantPlantEFPHandleMouseEventData.zoomLevel;

			/** Boundaries to scale the SVG's viewpoint on the X axis */
			const xBoundaries = svgElement.viewBox.baseVal.width * scaleBoundariesX * zoomLevel;
			/** Boundaries for the X axis on the right side of the SVG compendium's viewpoint */
			const xRightBoundaries = svgElement.viewBox.baseVal.width * scaleBoundariesX;

			/** Boundaries to scale the SVG's viewpoint on the Y axis */
			const yBoundaries = svgElement.viewBox.baseVal.height * scaleBoundariesY;
			/** Upper boundaries to scale the SVG's viewpoint on the Y axis */
			const yUpperBoundaries = yBoundaries * zoomLevel;

			// Cache mouse position
			ePlantPlantEFPHandleMouseEventData.cacheMousePos = {x: e.clientX, y: e.clientY};

			// If SVG's Y position within viewpoint, then move it
			if (
				svgElement.viewBox.baseVal.y + yDiff <= yUpperBoundaries &&
				svgElement.viewBox.baseVal.y + yDiff >= -yBoundaries
			) {
				svgElement.viewBox.baseVal.y += yDiff;
			} else {
				// If SVG's Y position is outside viewpoint, then move it to the top or bottom
				svgElement.viewBox.baseVal.y =
					svgElement.viewBox.baseVal.y + yDiff > 0 ? yUpperBoundaries : -yBoundaries;
			}

			// If SVG's X position within viewpoint, then move it
			if (
				svgElement.viewBox.baseVal.x + xDiff <= xBoundaries &&
				svgElement.viewBox.baseVal.x + xDiff >= -xRightBoundaries
			) {
				svgElement.viewBox.baseVal.x += xDiff;
			} else {
				// If SVG's X position is outside viewpoint, then move it to the left or right
				svgElement.viewBox.baseVal.x =
					svgElement.viewBox.baseVal.x + xDiff > 0 ? xBoundaries : -xRightBoundaries;
			}
		}
	}

	// End dragging
	if (type === "up") {
		ePlantPlantEFPHandleMouseEventData.start = false;
	}
}

/**
 * Handle zooming of SVG
 * @param {String} domID DOM ID of the SVG container
 * @param {Event} e Mouse event object
 * @param {Number} changeBy How much the SVG has been moved by
 */
function ePlantPlantEFPHandleMouseWheel(domID, e, changeBy = 3) {
	/** SVG document */
	const svgElement = domID.firstElementChild;
	/** SVG viewpoint */
	const baseValues = svgElement.viewBox.baseVal;

	/** If should zoom in [true] or out [false] */
	const up = e.deltaY > 0;

	/** How much the zoom will zoom in by */
	const changeByValue = ePlantPlantEFPHandleMouseEventData.startHeight
		? window.innerHeight / ePlantPlantEFPHandleMouseEventData.startHeight / changeBy
		: changeBy;

	if (
		window.getSelection() &&
		window.getSelection().isCollapsed &&
		baseValues &&
		e.deltaY &&
		ePlantPlantEFPHandleMouseEventData.start
	) {
		// Prevent scrolling window
		e.preventDefault();

		if (up) {
			svgElement.viewBox.baseVal.width = baseValues.width * changeByValue;
			svgElement.viewBox.baseVal.height = baseValues.height * changeByValue;
			ePlantPlantEFPHandleMouseEventData.zoomLevel *= changeByValue;
		} else {
			svgElement.viewBox.baseVal.width = baseValues.width / changeByValue;
			svgElement.viewBox.baseVal.height = baseValues.height / changeByValue;
			ePlantPlantEFPHandleMouseEventData.zoomLevel /= changeByValue;
		}
	}
}

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
		this.topExpressionOptions = ["Microarray", "RNA-seq"];

		// Local for this class
		this.desiredDOMid = "";
		/** Markup for the visualization container */
		this.appendSVG;

		// createSVGValues
		this.clickList = [];
		this.svgValues = {};
		this.svgMax = 0;
		this.svgMin = 0;
		this.svgMaxAverage = 0;
		this.svgMaxAverageSample = "";
		this.svgMinAverage = 0;
		this.svgMinAverageSample = "";
		// Store object name:
		this.svgObjectName = "";

		/** SVG DOM container's height styling */
		this.svgContainerHeight = "95vh";
	}

	/**
	 * Verify that the locus being called is valid
	 * IMPORTANT: The current script only works for Arabidopsis thaliana
	 * TODO: Add support for other languages. Fill list of loci patterns can be found within GAIA's tools (accessible only to BAR developer at the moment)
	 * @param {String} locus The AGI ID (example: AT3G24650 or AT3G24650.1)
	 * @returns {Boolean} If locus is valid [true] or not [false, default]
	 */
	verifyLoci(locus) {
		// Check if locus is a string
		if (typeof locus === "string") {
			/** Arabidopsis thaliana locus pattern */
			const arabidopsisThalianaPattern = `^[A][T][MC0-9][G][0-9]{5}[.][0-9]{1,2}$|^[A][T][MC0-9][G][0-9]{5}$`;

			/** Reg Exp for the locus pattern */
			const regexPattern = new RegExp(arabidopsisThalianaPattern, "i");

			// If match, then return true, else return false
			return Boolean(locus.trim().match(regexPattern));
		} else {
			return false;
		}
	}

	/**
	 * Create and generate an SVG based on the desired tissue expression locus
	 * @param {String} locus The AGI ID (example: AT3G24650)
	 * @param {String} desiredDOMid The desired DOM location or if kept empty, would not replace any DOM elements and just create the related HTML DOM elements within appendSVG
	 * @param {String} svgName Name of the SVG file without the .svg at the end. Default is set to "default", when left this value, the highest expression value (if any) is chosen and if not, then Abiotic Stress is.
	 * @param {Boolean} includeDropdownAll true = include a html dropdown/select of all available SVGs/samples, false = don't
	 * @param {String | Number} containerHeight The height of the SVG container, default is 95vh
	 */
	generateSVG(
		locus = "AT3G24650",
		desiredDOMid = undefined,
		svgName = "default",
		includeDropdownAll = true,
		containerHeight = undefined,
	) {
		if (this.verifyLoci(locus.trim())) {
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
			}
			if (containerHeight && typeof containerHeight === "string") {
				this.svgContainerHeight = containerHeight.toString();
			} else if (containerHeight && typeof containerHeight === "number") {
				this.svgContainerHeight = `${containerHeight.toString()}px`;
			}

			// Initiate scripts
			this.desiredDOMid = desiredDOMid;
			this.#retrieveTopExpressionValues(svgName, locus.trim().toUpperCase());
		} else {
			console.error(`Invalid locus: ${locus.trim()}`);
		}
	}

	/**
	 * Retrieve information about the top expression values for a specific locus
	 * @param {String} svgName Name of the SVG file without the .svg at the end
	 * @param {String} locus The AGI ID (example: AT3G24650)
	 */
	async #retrieveTopExpressionValues(svgName, locus = "AT3G24650") {
		let completedFetches = 0;
		// If never been called before
		if (!this.topExpressionValues || !this.topExpressionValues[locus]) {
			for (const topMethod of this.topExpressionOptions) {
				const url = `https://bar.utoronto.ca/expression_max_api/max_average?method=${topMethod}`;
				const sendHeaders = "application/json";
				let postSend = {
					loci: [locus.toUpperCase()],
					method: topMethod,
				};
				postSend = JSON.stringify(postSend);

				const methods = {mode: "cors"};
				methods["method"] = "POST";
				if (sendHeaders) {
					methods["headers"] = {};
					methods["headers"]["Content-type"] = sendHeaders;
				}
				methods["body"] = postSend;

				await fetch(url, methods)
					.then(async (response) => {
						if (response.status === 200) {
							await response.text().then(async (data) => {
								let responseData;
								if (data.length > 0) {
									responseData = JSON.parse(data);
								} else {
									responseData = {};
								}

								let topMethodUsed;
								const urlQuery = url.split("=");
								if (urlQuery.length > 1) {
									topMethodUsed = urlQuery[1];
								}

								if (topMethodUsed && responseData && responseData["wasSuccessful"] === true) {
									if (responseData["maxAverage"]) {
										const tempTopExpressionData = {};
										tempTopExpressionData[topMethodUsed] = {};

										tempTopExpressionData[topMethodUsed]["maxAverage"] =
											responseData["maxAverage"][locus.toUpperCase()];

										if (responseData["standardDeviation"]) {
											tempTopExpressionData[topMethodUsed]["standardDeviation"] =
												responseData["standardDeviation"][locus.toUpperCase()];
										}
										if (responseData["sample"]) {
											tempTopExpressionData[topMethodUsed]["sample"] =
												responseData["sample"][locus.toUpperCase()];
										}
										if (responseData["compendium"]) {
											tempTopExpressionData[topMethodUsed]["compendium"] =
												responseData["compendium"][locus.toUpperCase()];
										}

										if (!this.topExpressionValues) {
											this.topExpressionValues = {};
										}
										this.topExpressionValues[locus] = {
											...this.topExpressionValues[locus],
											...tempTopExpressionData,
										};
									}
								}

								completedFetches++;
								if (completedFetches === this.topExpressionOptions.length) {
									await this.#loadSampleData(svgName, locus);
								}
							});
						} else if (response.status !== 200) {
							completedFetches++;
							if (completedFetches === this.topExpressionOptions.length) {
								await this.#loadSampleData(svgName, locus);
							}

							console.error(
								"fetch error - Status Code: " +
									response.status +
									", fetch-url: " +
									response.url +
									", document-url: " +
									window.location.href,
							);
						}
					})
					.catch(async (err) => {
						completedFetches++;
						if (completedFetches === this.topExpressionOptions.length) {
							await this.#loadSampleData(svgName, locus);
						}

						console.error(err);
					});
			}
		} else if (Object.keys(this.topExpressionValues[locus]).length > 0) {
			await this.#loadSampleData(svgName, locus);
		}
	}

	/**
	 * Calls and stores the sample Data for the SVG, SVG's subunits, datasource and it's name-values
	 * @param {String} svgName Name of the SVG file without the .svg at the end
	 * @param {String} locus The AGI ID (example: AT3G24650)
	 */
	async #loadSampleData(svgName, locus) {
		if (Object.keys(this.sampleData).length === 0) {
			/** Whether to fetch the sample data container from GitHub (true, default) or not */
			let fetchFromGitHub = true;

			/** Browser's local storage for the sample data, if exists */
			let localStoredSampleData = localStorage?.["bar_eplant-sample-data-storage"];
			// If the local storage exists, see if it's expired (1 week) to fetch from GitHub or use the local storage data
			if (localStoredSampleData) {
				// Convert to JSON
				localStoredSampleData = JSON.parse(localStoredSampleData);

				// If a week has passed since the last time the data was stored
				if (
					localStoredSampleData.expiry &&
					localStoredSampleData.data &&
					new Date().getTime() - localStoredSampleData.expiry <= 7 * 24 * 60 * 60 * 1000
				) {
					// Has not expire, use this data
					fetchFromGitHub = false;

					this.sampleData = localStoredSampleData.data;
				}
			}

			if (fetchFromGitHub) {
				/** GitHub's URL for the sample data container */
				const url =
					"https://raw.githubusercontent.com/BioAnalyticResource/ePlant_Plant_eFP/master/data/SampleData.min.json";

				/** Fetch methods */
				const methods = {mode: "cors"};

				await fetch(url, methods)
					.then(async (response) => {
						if (response.status === 200) {
							await response.text().then(async (data) => {
								/** Response data */
								const res = data.length > 0 ? JSON.parse(data) : {};

								// Store response
								this.sampleData = res;
								// Store into local storage
								const sampleDataStorage = {
									data: res,
									expiry: new Date().getTime(),
								};
								localStorage.setItem(
									"bar_eplant-sample-data-storage",
									JSON.stringify(sampleDataStorage),
								);
							});
						} else if (response.status !== 200) {
							console.error(
								"fetch error - Status Code: " +
									response.status +
									", fetch-url: " +
									response.url +
									", document-url: " +
									window.location.href,
							);
						}
					})
					.catch(async (err) => {
						console.error(err);
					});
			}

			// Setup and retrieve information about the target SVG and locus
			await this.#retrieveSampleData(svgName, locus);
		} else if (Object.keys(this.sampleData).length > 0) {
			await this.#retrieveSampleData(svgName, locus);
		}
	}

	/**
	 * Retrieves the sample information relating to an SVG for a specific set of data
	 * @param {String} svgName Name of the SVG file without the .svg at the end
	 * @param {String} locus The AGI ID (example: AT3G24650)
	 */
	async #retrieveSampleData(svgName, locus) {
		// Check if svgName contains .svg
		if (svgName.substring(-4) === ".svg") {
			svgName = svgName.substring(0, svgName.length - 4);
		}

		if (this.sampleOptions.length === 0) {
			for (const [key, value] of Object.entries(this.sampleData)) {
				this.sampleOptions.push(key);
				this.sampleReadableName[value["name"]] = key;
			}
		}

		// Create variables that will be used in #retrieveSampleData
		const sampleDataKeys = Object.keys(this.sampleData); // All possible SVGs
		let sampleDB = ""; // The sample's datasource
		let sampleIDList = []; // List of all of the sample's IDs
		let sampleSubunits = []; // List of SVG's subunits

		// Check if valid SVG
		if (!sampleDataKeys.includes(svgName) && this.topExpressionValues[locus]) {
			// Determine max expression value to default too
			let maxExpressionValue = 0;
			let maxExpressionCompendium = undefined;
			for (const [, value] of Object.entries(this.topExpressionValues[locus])) {
				if (value["compendium"] && value["compendium"][1] && sampleDataKeys.includes(value["compendium"][1])) {
					if (value["maxAverage"] && value["maxAverage"][1] && value["maxAverage"][1] > maxExpressionValue) {
						maxExpressionValue = value.maxAverage[1];
						maxExpressionCompendium = value.compendium[1];
					}
				}
			}

			if (maxExpressionCompendium) {
				svgName = maxExpressionCompendium;
			} else {
				svgName = "AbioticStress";
			}
		}

		// If still default, load in Abiotic Stress
		if (svgName === "default") {
			svgName = "AbioticStress";
		}

		// Create variables for parsing
		const sampleInfo = this.sampleData[svgName];
		let sampleOptions;
		if (sampleInfo && sampleInfo.sample) {
			sampleOptions = sampleInfo["sample"];
		}
		if (sampleInfo && sampleInfo.db) {
			sampleDB = sampleInfo["db"];
		}

		// If a database is available for this SVG, then find sample ID information
		if (sampleDB !== undefined) {
			sampleSubunits = Object.keys(sampleInfo.sample);
			sampleIDList = [];
			for (const sample of sampleSubunits) {
				sampleIDList = sampleIDList.concat(sampleOptions[sample]);
			}
		}

		// Call plantefp.cgi webservice to retrieve information about the target tissue expression data
		if (!this.eFPObjects[svgName] || !this.eFPObjects[svgName]["locusCalled"].includes(locus)) {
			await this.#callPlantEFP(sampleDB, locus, sampleIDList, svgName, sampleOptions);
		} else if (this.eFPObjects[svgName]) {
			await this.#addSVGtoDOM(svgName, locus, this.includeDropdownAll);
		}
	}

	/**
	 * Calls the plantefp.cgi webservice to retrieve expression data from the BAR
	 * @param {String} datasource Which database the information is contained in
	 * @param {String} locus The AGI ID (example: AT3G24650)
	 * @param {Array} samples List of sample ID's which the exact expression data is related to
	 * @param {String} svg Which SVG is being called
	 * @param {Array} sampleSubunits List of the SVG's subunits
	 */
	async #callPlantEFP(datasource, locus, samples, svg, sampleSubunits) {
		// Create URL
		let url = "https://bar.utoronto.ca/~asullivan/webservices/plantefp.cgi?";
		url += "datasource=" + datasource + "&";
		url += "id=" + locus + "&";
		url += "samples=[";
		for (let i = 0; i < samples.length; i++) {
			let sampleName = samples[i].trim();
			sampleName = sampleName.replace(/\+/g, "%2B");
			sampleName = sampleName.replace(/ /g, "%20");

			url += '"' + sampleName + '"';
			if (i !== samples.length - 1) {
				url += ",";
			}
		}
		url += "]";

		const methods = {mode: "cors"};

		if (sampleSubunits) {
			await fetch(url, methods)
				.then(async (response) => {
					if (response.status === 200) {
						await response.text().then(async (data) => {
							let responseData;
							if (data.length > 0) {
								responseData = JSON.parse(data);
							} else {
								responseData = {};
							}

							const subunitsList = Object.keys(sampleSubunits);

							if (this.eFPObjects === undefined) {
								this.eFPObjects = {};
							}

							// Create SVG in dictionary
							if (this.eFPObjects[svg] === undefined) {
								this.eFPObjects[svg] = {};
							}

							// Create samples in dictionary
							if (this.eFPObjects[svg]["sample"] === undefined) {
								this.eFPObjects[svg]["sample"] = {};
							}

							// Create samples in dictionary
							if (this.eFPObjects[svg]["sample"] === undefined) {
								this.eFPObjects[svg]["sample"] = {};
							}

							// Add values
							for (const resData of responseData) {
								// Create key and value variables
								const responseName = resData["name"].trim();
								const responseValue = resData["value"];
								let subunitName = "";

								// Create subunits element in dictionary
								let tempName = responseName;
								tempName = responseName.replace(/%2B/g, "+");
								tempName = tempName.replace(/%20/g, " ");
								tempName = tempName.trim();

								for (const subunit of subunitsList) {
									if (sampleSubunits[subunit].includes(tempName)) {
										subunitName = subunit;

										// Create subunit
										if (this.eFPObjects[svg]["sample"][subunitName] === undefined) {
											this.eFPObjects[svg]["sample"][subunitName] = {};
										}

										// Create responseName
										if (this.eFPObjects[svg]["sample"][subunitName][tempName] === undefined) {
											this.eFPObjects[svg]["sample"][subunitName][tempName] = {};
										}

										// Add to dictionary
										this.eFPObjects[svg]["sample"][subunitName][tempName][locus] = responseValue;

										// Add to list of called locus data
										if (!this.eFPObjects[svg]["locusCalled"]) {
											this.eFPObjects[svg]["locusCalled"] = [];
										}
										if (!this.eFPObjects[svg]["locusCalled"].includes(locus)) {
											this.eFPObjects[svg]["locusCalled"].push(locus);
										}
									}
								}
							}

							// Add db
							this.eFPObjects[svg]["db"] = datasource;

							await this.#addSVGtoDOM(svg, locus, this.includeDropdownAll);
						});
					} else if (response.status !== 200) {
						await this.#addSVGtoDOM(svg, locus, this.includeDropdownAll);

						console.error(
							"fetch error - Status Code: " +
								response.status +
								", fetch-url: " +
								response.url +
								", document-url: " +
								window.location.href,
						);
					}
				})
				.catch(async (err) => {
					await this.#addSVGtoDOM(svg, locus, this.includeDropdownAll);

					console.error(err);
				});
		} else {
			await this.#addSVGtoDOM(svg, locus, this.includeDropdownAll);

			console.error(`sampleSubunits is ${sampleSubunits}`);
		}
	}

	/**
	 * Add the SVG to the designated DOM
	 * @param {String} svgName Name of the SVG file without the .svg at the end
	 * @param {String} locus The AGI ID (example: AT3G24650)
	 */
	async #addSVGtoDOM(svgName, locus, includeDropdownAll = false) {
		let svgUse = "Klepikova";
		let localAppendSVG = new DOMParser().parseFromString('<div class="expressionContainer"></div>', "text/html");
		localAppendSVG = localAppendSVG.querySelector(".expressionContainer");
		if (svgName !== "") {
			svgUse = svgName;
		}

		// Add dropdown list of all samples to document:
		if (includeDropdownAll && this.sampleOptions) {
			let selectedIndexPos = 0;
			let preSelectedIndex = 0;
			let options = "";

			if (this.topExpressionValues[locus] && Object.keys(this.topExpressionValues[locus]).length > 0) {
				// Hidden option
				options += `<option
                        value="hiddenOption"
                        id="hiddenExpressionOption"
                        disabled="true"
                    >
                        Compendiums with maximum average expression:
                    </option>`;
				preSelectedIndex += 1;

				const topList = Object.keys(this.topExpressionValues[locus]);

				for (const top of topList) {
					if (this.topExpressionValues[locus][top]) {
						const expressionData = this.topExpressionValues[locus][top];
						const compendiumOptions = expressionData["compendium"];

						for (let c = 0; c < Object.keys(compendiumOptions).length; c++) {
							const cUse = c + 1;

							if (expressionData["compendium"][cUse]) {
								const expressionCompendium = expressionData["compendium"][cUse];
								const expressionSample = expressionData["sample"][cUse];

								if (
									expressionSample &&
									this.sampleData[expressionCompendium] &&
									this.sampleData[expressionCompendium] &&
									this.sampleData[expressionCompendium]["description"]
								) {
									const readableSampleName =
										this.sampleData[expressionCompendium]["description"][expressionSample];
									const expressionAverageLevel = expressionData["maxAverage"][cUse];
									const compendiumName = this.sampleData[expressionCompendium]["name"];

									options += `<option
                                            value="${expressionCompendium}"
                                        >
                                            ${compendiumName}: ${readableSampleName} at ${expressionAverageLevel} (${top})
                                        </option>`;

									preSelectedIndex += 1;

									break;
								}
							}
						}
					}
				}
			}

			options += `<option
                    value="hiddenOption"
                    id="allCompendiumOptions"
                    disabled="true"
                >
                    All compendiums:
                </option>`;

			preSelectedIndex += 1;

			const sampleOptions = Object.keys(this.sampleReadableName);
			sampleOptions.sort();

			for (let i in sampleOptions) {
				options += `<option
                        value="${this.sampleReadableName[sampleOptions[i]]}"
                    >
                        ${sampleOptions[i]}
                    </option>`;

				if (this.sampleReadableName[sampleOptions[i]] === svgName) {
					selectedIndexPos = parseInt(preSelectedIndex) + parseInt(i);
				}
			}

			const dropdownList = new DOMParser().parseFromString(
				`<div class="selectSVGContainer">
                    <span>Select SVG to display:</span>
                    <select
                        onchange="window.createSVGExpressionData.generateSVG('${locus}', '${this.desiredDOMid}', this?.value?.toString()?.length > 0 ? this.value.toString() : 'default', ${includeDropdownAll})"
                        id="sampleOptions"
                        value="${svgName}"
      style="width: 100%; max-width: 40em;"
                        class="selectCompendiumOptions"
						aria-label="Select SVG to display"
                    >
                        ${options}
                    </select>
                </div>`,
				"text/html",
			).body.childNodes[0];
			dropdownList.getElementsByTagName("select")[0].selectedIndex = selectedIndexPos;
			localAppendSVG.appendChild(dropdownList);
		}

		const titleBoxDOM = new DOMParser().parseFromString(
			`<div
                id="ePlant-hover-title-box"
                style="
                    position: fixed;
                    z-index: 100;
                    color: #fff;
                    background-color: #000;
                    border: 1px solid #000;
                    border-radius: 3px;
                    padding: 5px;
                    opacity: 0.85;
                    white-space: pre-line;
                    display: none;
                "
            >Test</div>`,
			"text/html",
		).body.childNodes[0];
		localAppendSVG.appendChild(titleBoxDOM);

		// Create call for SVG file
		const urlSVG = "https://bar.utoronto.ca/~asullivan/ePlant_Plant_eFP/compendiums/" + svgUse + ".svg";
		const methods = {mode: "cors"};

		await fetch(urlSVG, methods)
			.then(async (response) => {
				if (response.status === 200) {
					await response.text().then(async (data) => {
						const svgData = new DOMParser().parseFromString(data, "text/html").body.childNodes[0];

						/** Adjust styling of SVG */
						if (svgData.id) {
							this.svgObjectName = svgData.id;

							svgData.style = "width: 100% !important; height: 100% !important;";
						}

						const svgContainer = new DOMParser().parseFromString(
							`<div id="${svgUse}_object" style="height:${this.svgContainerHeight};"
                                onMouseDown="ePlantPlantEFPHandleMouseEvent(${svgUse}_object, 'down', event)"
                                onMouseMove="ePlantPlantEFPHandleMouseEvent(${svgUse}_object, 'move', event)"
                                onMouseUp="ePlantPlantEFPHandleMouseEvent(${svgUse}_object, 'up', event)"
                                onMouseLeave="ePlantPlantEFPHandleMouseEvent(${svgUse}_object, 'up', event)"
                                onWheel="ePlantPlantEFPHandleMouseWheel(${svgUse}_object, event)"
                            ></div>`,
							"text/html",
						).body.childNodes[0];
						svgContainer.appendChild(svgData);

						localAppendSVG.appendChild(svgContainer);

						this.appendSVG = localAppendSVG;

						await this.#createLocusMatch(svgUse, locus);
					});
				} else if (response.status !== 200) {
					console.error(
						"fetch error - Status Code: " +
							response.status +
							", fetch-url: " +
							response.url +
							", document-url: " +
							window.location.href,
					);
				}
			})
			.catch(async (err) => {
				console.error(err);
			});

		if (this.desiredDOMid && this.desiredDOMid.length > 0) {
			// Add SVG to DOM
			/** DOM Region being modified */
			const targetDOMRegion = document.getElementById(this.desiredDOMid);

			const targetDOMChildren = targetDOMRegion.childNodes;
			for (let i in targetDOMChildren) {
				if (targetDOMChildren[i].className && targetDOMChildren[i].className.includes("expressionContainer")) {
					targetDOMRegion.removeChild(targetDOMChildren[i]);
				}
			}

			targetDOMRegion.appendChild(this.appendSVG);
		}
	}

	/**
	 * Check and verify locus name
	 * @param {String} whichSVG Name of the SVG file without the .svg at the end
	 * @param {String} locus The AGI ID (example: AT3G24650)
	 */
	async #createLocusMatch(whichSVG, locus) {
		const locusPoint = locus;
		let locusValue = "";
		for (let i = 0; i < locusPoint.length; i++) {
			if (i === 1 || i === 3) {
				locusValue = locusValue + locusPoint[i].toLowerCase();
			} else {
				locusValue = locusValue + locusPoint[i];
			}
		}
		await this.#createSVGValues(whichSVG, locus);
	}

	/**
	 * Retrieves and stores raw values based on the searched SVG
	 * @param {String} whichSVG Name of the SVG file without the .svg at the end
	 * @param {String} locus The AGI ID (example: AT3G24650)
	 */
	async #createSVGValues(whichSVG, locus) {
		// Retrieve tissue expression information
		const dataObject = this.eFPObjects;
		const svgDataObject = dataObject[whichSVG]["sample"];

		// Find tissue expression's sample IDs
		const svgSubunits = Object.keys(svgDataObject);

		// Find respective values
		for (const svg of svgSubunits) {
			const sampleValues = Object.keys(svgDataObject[svg]);
			// Create SVG subunit in dictionary
			if (this.svgValues[svg] === undefined) {
				this.svgValues[svg] = {};
			}
			// Add raw values
			for (const sample of sampleValues) {
				// Create raw values in dictionary
				if (this.svgValues[svg]["rawValues"] === undefined) {
					this.svgValues[svg]["rawValues"] = [];
				}
				this.svgValues[svg]["rawValues"].push(svgDataObject[svg][sample][locus]);
			}
		}
		await this.#findExpressionValues(whichSVG, svgSubunits);
	}

	/**
	 * Find the maximum, minimum and average values
	 * @param {String} whichSVG Name of the SVG file without the .svg at the end
	 * @param {Array} svgSubunits A list containing all desired SVG subunits to be interacted with
	 */
	async #findExpressionValues(whichSVG, svgSubunits) {
		// Reset variables
		this.svgMax = undefined;
		this.svgMin = undefined;

		// Iterate over each SVG subunit for their respective values
		for (const svg of svgSubunits) {
			const values = this.svgValues[svg]["rawValues"].sort();
			const numValues = [];
			for (const value of values) {
				if (isNaN(value) === false) {
					numValues.push(parseFloat(value));
				}
			}

			// Find averages
			let sumValues = 0;
			for (const num of numValues) {
				sumValues += num;
			}
			const averageValues = sumValues / numValues.length;

			// Compare max values
			const maxValue = numValues[numValues.length - 1];
			const minValue = numValues[1];
			if (this.svgMax === undefined) {
				this.svgMax = maxValue;
			} else {
				if (maxValue > this.svgMax) {
					this.svgMax = maxValue;
				}
			}
			if (this.svgMin === undefined) {
				this.svgMin = minValue;
			} else {
				if (minValue < this.svgMin) {
					this.svgMin = minValue;
				}
			}

			// Now for averages:
			if (this.svgMaxAverage === undefined) {
				this.svgMaxAverage = averageValues;
				this.svgMaxAverageSample = svg;
			} else {
				if (averageValues > this.svgMaxAverage) {
					this.svgMaxAverage = averageValues;
					this.svgMaxAverageSample = svg;
				}
			}
			if (this.svgMinAverage === undefined) {
				this.svgMinAverage = averageValues;
				this.svgMinAverageSample = svg;
			} else {
				if (averageValues < this.svgMinAverage) {
					this.svgMinAverage = averageValues;
					this.svgMinAverageSample = svg;
				}
			}
			// Add to value's dictionary:
			// Create SVG subunit in dictionary
			if (this.svgValues[svg] === undefined) {
				this.svgValues[svg] = {};
			}
			this.svgValues[svg]["average"] = averageValues;
			this.svgValues[svg]["sd"] = this.#standardDeviationCalc(numValues);

			// Find control value
			const controlData = this.sampleData[whichSVG];
			const controlKeys = Object.keys(controlData["controlComparison"]);
			if (controlKeys.includes(svg) === false) {
				let controlSampleName = "";
				for (const key of controlKeys) {
					if (controlData["controlComparison"][key].includes(svg)) {
						controlSampleName = key;
					}
				}

				if (this.svgValues[controlSampleName] && this.svgValues[controlSampleName]["rawValues"]) {
					// Calculate control average:
					const controlValues = this.svgValues[controlSampleName]["rawValues"];
					let controlSum = 0;
					for (const value of controlValues) {
						controlSum += parseFloat(value);
					}
					const controlAverage = controlSum / controlValues.length;

					let inductionValue = 0;
					let reductionValue = 0;
					if (controlAverage !== null && controlAverage > 0 && averageValues > 0) {
						if (averageValues > controlAverage) {
							inductionValue = averageValues - controlAverage;
							this.svgValues[svg]["inductionValue"] = inductionValue;
						} else if (controlAverage > averageValues) {
							reductionValue = controlAverage - averageValues;
							this.svgValues[svg]["reductionValue"] = reductionValue;
						}

						const expressionRatio = averageValues / controlAverage;
						this.svgValues[svg]["expressionRatio"] = expressionRatio;

						this.svgValues[svg]["controlSampleName"] = controlSampleName;
						this.svgValues[svg]["controlAverage"] = controlAverage;
					}
				}
			}
		}

		await this.#colourSVGs(whichSVG, svgSubunits);
	}

	/**
	 * Calculate the functional standard deviation
	 * Modified from https://www.geeksforgeeks.org/php-program-find-standard-deviation-array/
	 * @param {Array} numbers An array of numbers that the standard deviation will be found for
	 * @return sd Standard deviation
	 */
	#standardDeviationCalc(numbers) {
		let sd = 0;

		const num_of_elements = numbers.length;

		if (num_of_elements >= 1) {
			let variance = 0.0;

			let number_sum = 0;
			for (let i = 0; i < num_of_elements; i++) {
				number_sum += numbers[i];
			}
			const average = number_sum / num_of_elements;

			for (let x = 0; x < num_of_elements; x++) {
				variance += Math.pow(numbers[x] - average, 2);
			}

			sd = Math.sqrt(variance / num_of_elements);
		}

		return sd;
	}

	/**
	 * Colour the existing SVG that has been created
	 * @param {String} whichSVG Name of the SVG file without the .svg at the end
	 * @param {Array} svgSubunits A list containing all desired SVG subunits to be interacted with
	 */
	async #colourSVGs(whichSVG, svgSubunits) {
		for (const subunit of svgSubunits) {
			// Colouring values
			const denominator = this.svgMaxAverage;
			let numerator = this.svgValues[subunit]["average"];
			if (numerator < 0) {
				numerator = 0;
			}

			let percentage = null;
			if (denominator && denominator >= 0) {
				percentage = (numerator / denominator) * 100;
			}

			if (percentage > 100) {
				percentage = 100;
			} else if (percentage < 0) {
				percentage = 0;
			}
			// Retrieve colouring information
			const colourFill = this.percentageToColour(percentage);

			const expressionLevel = parseFloat(numerator).toFixed(3);
			const sampleSize = this.svgValues[subunit].rawValues.length;

			this.svgValues[subunit]["expressionLevel"] = expressionLevel;
			this.svgValues[subunit]["sampleSize"] = sampleSize;

			// Begin colouring SVG subunits
			await this.#colourSVGsubunit(whichSVG, subunit, colourFill, expressionLevel, sampleSize);
		}
	}

	/**
	 * Convert a percentage into a hex-code colour
	 * @param {Number} percentage The percentage between 0 - 100 (as an int) into a colour between yellow and red
	 * @returns {String} Hex-code colour
	 */
	percentageToColour(percentage) {
		const percentageInt = parseInt(percentage);

		if (percentageInt >= 0) {
			// From 0% to 100% as integers
			const colourList = [
				"#ffff00",
				"#fffc00",
				"#fff900",
				"#fff700",
				"#fef400",
				"#fff200",
				"#ffef00",
				"#feed00",
				"#ffea00",
				"#ffe800",
				"#ffe500",
				"#ffe200",
				"#ffe000",
				"#ffdd00",
				"#ffdb00",
				"#ffd800",
				"#ffd600",
				"#fed300",
				"#ffd100",
				"#ffce00",
				"#ffcc00",
				"#ffc900",
				"#ffc600",
				"#ffc400",
				"#ffc100",
				"#ffbf00",
				"#ffbc00",
				"#ffba00",
				"#ffb700",
				"#feb500",
				"#ffb200",
				"#ffaf00",
				"#ffad00",
				"#ffaa00",
				"#ffa800",
				"#ffa500",
				"#ffa300",
				"#ffa000",
				"#ff9e00",
				"#ff9b00",
				"#ff9900",
				"#ff9600",
				"#ff9300",
				"#ff9100",
				"#ff8e00",
				"#ff8c00",
				"#ff8900",
				"#ff8700",
				"#ff8400",
				"#ff8200",
				"#ff7f00",
				"#ff7c00",
				"#ff7a00",
				"#ff7700",
				"#ff7500",
				"#ff7200",
				"#ff7000",
				"#ff6d00",
				"#ff6b00",
				"#ff6800",
				"#ff6600",
				"#ff6300",
				"#ff6000",
				"#ff5e00",
				"#ff5b00",
				"#ff5900",
				"#ff5600",
				"#ff5400",
				"#ff5100",
				"#ff4f00",
				"#ff4c00",
				"#ff4900",
				"#ff4700",
				"#ff4400",
				"#ff4200",
				"#ff3f00",
				"#ff3d00",
				"#ff3a00",
				"#ff3800",
				"#ff3500",
				"#ff3200",
				"#ff3000",
				"#ff2d00",
				"#ff2b00",
				"#ff2800",
				"#ff2600",
				"#ff2300",
				"#ff2100",
				"#ff1e00",
				"#ff1c00",
				"#ff1900",
				"#ff1600",
				"#ff1400",
				"#ff1100",
				"#ff0f00",
				"#ff0c00",
				"#ff0a00",
				"#ff0700",
				"#ff0500",
				"#ff0200",
				"#ff0000",
			];

			return colourList[percentageInt];
		} else {
			return "#808080";
		}
	}

	/**
	 * The intent is to colour the subunit of a desired location within an SVG
	 * @param {String} whichSVG Name of the SVG file without the .svg at the end
	 * @param {Array} svgSubunit A list containing all desired SVG subunits to be interacted with
	 * @param {String} colour A hex code for what colour it is meant to be filled with
	 * @param {Number} expressionLevel The expression level for the interactive data
	 * @param {Number} sampleSize The sample size of the input information, default to 1
	 */
	async #colourSVGsubunit(whichSVG, svgSubunit, colour, expressionLevel, sampleSize = 1) {
		const svgObject = this.appendSVG.lastElementChild.getElementsByTagName("svg")[0];
		const allParsableElements = [...svgObject.getElementsByTagName("path"), ...svgObject.getElementsByTagName("g")];

		if (svgObject && allParsableElements.length > 0) {
			const expressionData = createSVGExpressionData["svgValues"][svgSubunit];
			let descriptionName = undefined;
			if (this.sampleData[whichSVG]["description"]) {
				descriptionName = this.sampleData[whichSVG]["description"][svgSubunit];
			}
			if (descriptionName === undefined || descriptionName === "") {
				descriptionName = svgSubunit;
			}

			// Check for duplicate error:
			const duplicateShoot = [
				"Control_Shoot_0_Hour",
				"Cold_Shoot_0_Hour",
				"Osmotic_Shoot_0_Hour",
				"Salt_Shoot_0_Hour",
				"Drought_Shoot_0_Hour",
				"Genotoxic_Shoot_0_Hour",
				"Oxidative_Shoot_0_Hour",
				"UV-B_Shoot_0_Hour",
				"Wounding_Shoot_0_Hour",
				"Heat_Shoot_0_Hour",
			];
			const duplicateRoot = [
				"Control_Root_0_Hour",
				"Cold_Root_0_Hour",
				"Osmotic_Root_0_Hour",
				"Salt_Root_0_Hour",
				"Drought_Root_0_Hour",
				"Genotoxic_Root_0_Hour",
				"Oxidative_Root_0_Hour",
				"UV-B_Root_0_Hour",
				"Wounding_Root_0_Hour",
				"Heat_Root_0_Hour",
			];
			let isdupShoot = false;
			let isdupRoot = false;
			if (duplicateShoot.includes(svgSubunit)) {
				isdupShoot = true;
			} else if (duplicateRoot.includes(svgSubunit)) {
				isdupRoot = true;
			}

			let subunitElement;
			for (let i in allParsableElements) {
				if (allParsableElements[i].id === svgSubunit) {
					subunitElement = allParsableElements[i];
				}
			}

			// This is used to determine if the SVG should be automatically coloured or manually done
			if (subunitElement && subunitElement.childNodes.length > 0) {
				let childElements;

				childElements = subunitElement.childNodes;

				let coloured = false;

				for (let c in childElements) {
					if (childElements[c].tagName === "path" || childElements[c].tagName === "g") {
						childElements[c].setAttribute("fill", colour);

						coloured = true;
					}
				}

				if (!coloured) {
					subunitElement.setAttribute("fill", colour);
				}
			} else if (subunitElement) {
				subunitElement.setAttribute("fill", colour);
			}

			// Add interactivity
			if (subunitElement) {
				// Adding hover features:
				subunitElement.setAttribute("class", "hoverDetails");
				subunitElement.addEventListener(
					"mouseenter",
					function (_event) {
						addTissueMetadata(this.id);
					},
					{passive: true},
				);
				subunitElement.addEventListener(
					"mouseleave",
					function (_event) {
						removeTissueMetadata(this.id);
					},
					{passive: true},
				);
				// Adding details about sub-tissue:
				subunitElement.setAttribute("data-expressionValue", expressionLevel);
				subunitElement.setAttribute("data-sampleSize", sampleSize);
				subunitElement.setAttribute("data-standardDeviation", expressionData["sd"]);
				subunitElement.setAttribute("data-sampleSize", sampleSize);

				// Add tooltip/title on hover
				const title = document.createElementNS("https://www.w3.org/2000/svg", "title");
				title.textContent =
					descriptionName +
					"\r\nExpression level: " +
					expressionLevel +
					"\r\nSample size: " +
					sampleSize +
					"\r\nStandard Deviation: " +
					parseFloat(expressionData["sd"]).toFixed(3);

				// Add rest of titles and tooltip/title
				let inducReduc = false;

				// if (expressionData['inductionValue']) {
				//     subunitElement.setAttribute("data-inductionValue", expressionData['inductionValue']);
				//     title.textContent += '\r\nInduction Value: ' + parseFloat(expressionData['inductionValue']).toFixed(3);
				//     inducReduc = true;
				// } else if (expressionData['reductionValue']) {
				//     subunitElement.setAttribute("data-reductionValue", expressionData['reductionValue']);
				//     title.textContent += '\r\nReduction Value: ' + parseFloat(expressionData['ReductionValue']).toFixed(3);
				//     inducReduc = true;
				// };

				if (inducReduc === true) {
					subunitElement.setAttribute("data-expressionRatio", expressionData["expressionRatio"]);
					title.textContent +=
						"\r\nExpression Ratio: " + parseFloat(expressionData["expressionRatio"]).toFixed(3);
					subunitElement.setAttribute("data-controlSampleName", expressionData["controlSampleName"]);

					let controlSampleName = undefined;
					if (this.sampleData[whichSVG]["description"]) {
						controlSampleName =
							this.sampleData[whichSVG]["description"][expressionData["controlSampleName"]];
					}
					if (controlSampleName === undefined || controlSampleName === "") {
						controlSampleName = expressionData["controlSampleName"];
					}
					title.textContent += "\r\nControl Sample Name: " + controlSampleName;

					subunitElement.setAttribute("data-controlAverage", expressionData["controlAverage"]);
					title.textContent +=
						"\r\nControl Expression: " + parseFloat(expressionData["controlAverage"]).toFixed(3);
				}
				subunitElement.appendChild(title);
			}

			// Correcting duplicate error:
			if (isdupShoot) {
				for (let dupS in duplicateShoot) {
					// Find duplicate shoot element:
					let dupShootElement;
					for (let i in allParsableElements) {
						if (allParsableElements[i].id === duplicateShoot[dupS]) {
							dupShootElement = allParsableElements[i];
						}
					}

					if (dupShootElement) {
						// Add interactivity
						dupShootElement.setAttribute("class", "hoverDetails");
						dupShootElement.addEventListener(
							"mouseenter",
							function (_event) {
								addTissueMetadata(this.id);
							},
							{passive: true},
						);
						dupShootElement.addEventListener(
							"mouseleave",
							function (_event) {
								removeTissueMetadata(this.id);
							},
							{passive: true},
						);
						// Adding colour
						const childElements = dupShootElement.childNodes;
						if (childElements.length > 0) {
							let foundColor = false;

							for (const element of childElements) {
								if (element.tagName === "path") {
									element.setAttribute("fill", colour);
									foundColor = true;
								}
							}

							if (!foundColor) {
								dupShootElement.setAttribute("fill", colour);
							}
						} else {
							dupShootElement.setAttribute("fill", colour);
						}
						// Add tooltip/title on hover
						title.textContent =
							duplicateShoot[dupS] +
							"\r\nExpression level: " +
							expressionLevel +
							"\r\nSample size: " +
							sampleSize;
						dupShootElement.appendChild(title);
					}
				}
			} else if (isdupRoot) {
				for (let dupR in duplicateRoot) {
					let dupRootElement;
					for (let i in allParsableElements) {
						if (allParsableElements[i].id === duplicateRoot[dupR]) {
							dupRootElement = allParsableElements[i];
						}
					}

					if (dupRootElement) {
						// Add interactivity
						dupRootElement.setAttribute("class", "hoverDetails");
						dupRootElement.addEventListener(
							"mouseenter",
							function (_event) {
								addTissueMetadata(this.id);
							},
							{passive: true},
						);
						dupRootElement.addEventListener(
							"mouseleave",
							function (_event) {
								removeTissueMetadata(this.id);
							},
							{passive: true},
						);
						// Adding colour
						let childElements = dupRootElement.childNodes;
						if (childElements.length > 0) {
							let foundColor = false;

							for (const element of childElements) {
								if (element.tagName === "path") {
									element.setAttribute("fill", colour);
									foundColor = true;
								}
							}

							if (!foundColor) {
								dupRootElement.setAttribute("fill", colour);
							}
						} else {
							dupRootElement.setAttribute("fill", colour);
						}
						// Add tooltip/title on hover
						title.textContent =
							duplicateRoot[dupR] +
							"\r\nExpression level: " +
							expressionLevel +
							"\r\nSample size: " +
							sampleSize;
						dupRootElement.appendChild(title);
					}
				}
			}
		}
	}
}
/**
 * Create and retrieve expression data in an SVG format
 */
const createSVGExpressionData = new CreateSVGExpressionData();
window.createSVGExpressionData = createSVGExpressionData;
