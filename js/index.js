'use strict';

(function() {
  let data = []; // keep data in global scope
  let svgContainer = ''; // keep SVG reference in global scope
  let bins = []; // keep bin information in global scope

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3
      .select('#histogram')
      .append('svg')
      .attr('width', 650)
      .attr('height', 650);

    d3.csv('../data/Admission_Predict.csv').then(csvData =>
      makeScatterPlot(csvData)
    );
  };

  // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    data = csvData;

    // get an array of toefl scores
    let toeflScores = data.map(row => parseInt(row['TOEFL Score']));

    // group toefl scores into their bins
    bins = findBinSizes(toeflScores);

    // find min and max for x and y axis
    let axesLimits = findMinMax(toeflScores);

    // draw axes with ticks and return mapping and scaling functions
    let mapFunctions = drawTicks(axesLimits);

    // plot the data using the mapping and scaling functions
    plotData(mapFunctions);
  }

  // plot the historgram on the SVG
  function plotData(map) {
    let xScale = map.xScale;
    let yScale = map.yScale;

    svgContainer
      .selectAll('.rec')
      .data(bins)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.x0) + 1)
      .attr('y', d => yScale(d.length))
      .attr('width', d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
      .attr('height', d => 600 - yScale(d.length))
      .attr('fill', '#4286f4');
  }

  // draw the axes and ticks
  function drawTicks(limits) {
    // return toefl score from a row of data
    let xValue = function(d) {
      return +d['TOEFL Score'];
    };

    // function to scale toefl score
    let xScale = d3
      .scaleLinear()
      .domain([limits.toeflMin - 2, limits.toeflMax])
      .range([50, 600]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) {
      return xScale(xValue(d));
    };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer
      .append('g')
      .attr('transform', 'translate(0, 600)')
      .call(xAxis);

    // return toefl from a row of data
    let yValue = function(d) {
      return +d['TOEFL Score'];
    };

    // function to scale bin count
    let yScale = d3
      .scaleLinear()
      .domain([limits.binCountMax, limits.binCountMin - 5])
      .range([50, 600]);

    // yMap returns a scaled y value from a row of data
    let yMap = function(d) {
      return yScale(yValue(d));
    };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer
      .append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale,
    };
  }

  // find min max for x and y axis
  function findMinMax(toeflScores) {
    const toeflMin = d3.min(toeflScores);
    const toeflMax = d3.max(toeflScores);

    const binCounts = bins.reduce((acc, bin) => {
      return [...acc, bin.length];
    }, []);

    let binCountMin = d3.min(binCounts);
    let binCountMax = d3.max(binCounts);

    // Round min/max of binCount to nearest 5
    binCountMin = Math.ceil(binCountMin / 5) * 5;
    binCountMax = Math.ceil(binCountMax / 5) * 5;

    return {
      toeflMin: toeflMin,
      toeflMax: toeflMax,
      binCountMin: binCountMin,
      binCountMax: binCountMax,
    };
  }

  // use d3's histogram function to create bins for histogram
  function findBinSizes(toeflScores) {
    const toeflMax = d3.max(toeflScores);
    const toeflMin = d3.min(toeflScores);

    let histGenerator = d3
      .histogram()
      .domain([toeflMin, toeflMax])
      .thresholds(9);

    return histGenerator(toeflScores);
  }
})();
