'use strict';

(function() {
  let data = 'no data';
  let svgContainer = ''; // keep SVG reference in global scope

  // load data and make bar chart after window loads
  window.onload = function() {
    svgContainer = d3
      .select('body')
      .append('svg')
      .attr('width', 1000)
      .attr('height', 500);

    fetch('../data/SeasonsData.json')
      .then(res => res.json())
      .then(csvData => makeBarChart(csvData));
  };

  // make scatter plot with trend line
  function makeBarChart(csvData) {
    data = csvData; // assign data as global variable
    console.log(data);

    // get arrays of avg viewers per season and years for each season
    const avgViewersData = data.map(season => season['Avg. Viewers (mil)']);

    const years = data.map(season => season['Year']);

    // find data limits
    const axesLimits = findMinMax(years, avgViewersData);

    // draw axes and return scaling + mapping functions
    const mapFunctions = drawAxes(axesLimits, 'Year', 'Avg. Viewers (mil)');

    // draw title and axes labels
    makeLabels();

    // // plot data as points and add tooltip functionality
    plotData(mapFunctions);
  }

  // make title and axes labels
  function makeLabels() {
    svgContainer
      .append('text')
      .attr('x', 100)
      .attr('y', 40)
      .style('font-size', '14pt')
      .text('Average Viewership By Season');

    svgContainer
      .append('text')
      .attr('x', 230)
      .attr('y', 495)
      .style('font-size', '10pt')
      .text('Year');

    svgContainer
      .append('text')
      .attr('transform', 'translate(10, 350)rotate(-90)')
      .style('font-size', '10pt')
      .text('Avg. Viewers (in millions)');
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map) {
    // scaling functions
    const xScale = map.xScale;
    const yScale = map.yScale;

    // make tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    // add text to top of each bar
    svgContainer
      .selectAll('.text')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => {
        return xScale(d['Year']) - 15;
      })
      .attr('y', d => yScale(d['Avg. Viewers (mil)']) - 10)
      .text(5)
      .text(d => d['Avg. Viewers (mil)']);

    // create each bar for each season
    svgContainer
      .selectAll()
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => {
        return xScale(d['Year']) - 15;
      })
      .attr('y', d => yScale(d['Avg. Viewers (mil)']) - 5)
      .attr('height', d => 455 - yScale(d['Avg. Viewers (mil)']))
      .attr('width', '30px')
      .attr('fill', d =>
        d.Data === 'Actual' ? 'rgb(88, 154, 220)' : 'rgb(124, 116, 111)'
      )

      // add tooltip functionality to points
      .on('mouseover', function(d) {
        d3.select(this).attr('style', 'outline: thin solid black;');

        tooltip
          .transition()
          .duration(200)
          .style('opacity', 1);

        tooltip
          .html(
            'Season #' +
              d.Year +
              '<br/>' +
              'Year: ' +
              d.Year +
              '<br/>' +
              'Episodes: ' +
              d.Episodes +
              '<br/>' +
              'Avg Viewers (mil): ' +
              d['Avg. Viewers (mil)'] +
              '<br/>' +
              'Most Watched Episode: ' +
              d['Most watched episode'] +
              '<br/>' +
              'Viewers (mil) ' +
              d['Viewers (mil)']
          )
          .style('left', d3.event.pageX + 5 + 'px')
          .style('top', d3.event.pageY + 10 + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('style', 'outline: none;');
        tooltip
          .transition()
          .duration(500)
          .style('opacity', 0);
      });
  }

  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    const xValue = function(d) {
      return +d[x];
    };

    // function to scale x value
    const xScale = d3
      .scaleLinear()
      .domain([limits.xMin - 1, limits.xMax + 1]) // give domain buffer room
      .range([50, 950]);

    // xMap returns a scaled x value from a row of data
    const xMap = function(d) {
      return xScale(xValue(d));
    };

    // plot x-axis at bottom of SVG
    const xAxis = d3.axisBottom().scale(xScale);
    svgContainer
      .append('g')
      .attr('transform', 'translate(0, 450)')
      .call(xAxis);

    // return y value from a row of data
    const yValue = function(d) {
      return +d[y];
    };

    // function to scale y
    const yScale = d3
      .scaleLinear()
      .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
      .range([50, 450]);

    // yMap returns a scaled y value from a row of data
    const yMap = function(d) {
      return yScale(yValue(d));
    };

    // plot y-axis at the left of SVG
    const yAxis = d3.axisLeft().scale(yScale);
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

  // find min and max for arrays of x and y
  function findMinMax(x, y) {
    // get min/max x values
    const xMin = d3.min(x);
    const xMax = d3.max(x);

    // get min/max y values
    const yMin = d3.min(y);
    const yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin: xMin,
      xMax: xMax,
      yMin: yMin,
      yMax: yMax,
    };
  }
})();
