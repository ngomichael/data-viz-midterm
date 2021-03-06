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

    d3.csv('./data/season_data.csv').then(csvData => makeBarChart(csvData));
  };

  // make bar chart with trend line
  function makeBarChart(csvData) {
    data = csvData; // assign data as global variable

    // get arrays of avg viewers per season and years for each season
    const avgViewersData = data.map(season =>
      parseFloat(season['Avg. Viewers (mil)'])
    );
    const years = data.map(season => parseInt(season['Year']));

    // find data limits
    const axesLimits = findMinMax(years, avgViewersData);

    // draw axes and return scaling + mapping functions
    const mapFunctions = drawAxes(axesLimits, 'Year', 'Avg. Viewers (mil)');

    // draw title and axes labels
    makeLabels();

    // plot data as bars and add tooltip functionality
    createBars(mapFunctions);

    // draw horizontal line that represents the avg of avg. viewers
    makeAvgLine(avgViewersData, mapFunctions, axesLimits);
  }

  // draw horizontal line for avg. viewers
  function makeAvgLine(avgViewersData, mapFunctions, axesLimits) {
    const unroundedAvg = _.sum(avgViewersData) / avgViewersData.length;
    const roundedViewerAvg = Math.round(unroundedAvg * 100) / 100;

    const x1 = axesLimits.xMin - 1;
    const x2 = axesLimits.xMax + 1;

    // create avg viewers line tooltip
    const avgTooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'avgTooltip')
      .style('opacity', 0);

    // create line for avg. viewers
    svgContainer
      .append('line')
      .style('stroke', 'lightgray')
      .attr('class', 'dashed')
      .attr('x1', mapFunctions.xScale(x1))
      .attr('y1', mapFunctions.yScale(roundedViewerAvg))
      .attr('x2', mapFunctions.xScale(x2))
      .attr('y2', mapFunctions.yScale(roundedViewerAvg))
      .on('mouseover', function(d) {
        avgTooltip
          .transition()
          .duration(200)
          .style('opacity', 1);

        avgTooltip
          .html('Average = ' + roundedViewerAvg)
          .style('left', d3.event.pageX + 5 + 'px')
          .style('top', d3.event.pageY + 10 + 'px');
      })
      .on('mouseout', function(d) {
        avgTooltip
          .transition()
          .duration(200)
          .style('opacity', 0);
      });
  }

  // make title and axes labels and legend
  function makeLabels() {
    svgContainer
      .append('text')
      .attr('x', 650)
      .attr('y', 100)
      .style('font-size', '10pt')
      .text('Viewership Data');

    svgContainer
      .append('text')
      .attr('x', 680)
      .attr('y', 135)
      .style('font-size', '10pt')
      .text('Actual');

    svgContainer
      .append('text')
      .attr('x', 680)
      .attr('y', 170)
      .style('font-size', '10pt')
      .text('Estimated');

    svgContainer
      .append('rect')
      .attr('x', 650)
      .attr('y', 120)
      .attr('height', '20px')
      .attr('width', '20px')
      .attr('fill', 'rgb(88, 154, 220)');

    svgContainer
      .append('rect')
      .attr('x', 650)
      .attr('y', 155)
      .attr('height', '20px')
      .attr('width', '20px')
      .attr('fill', 'rgb(124, 116, 111)');

    svgContainer
      .append('text')
      .attr('x', 100)
      .attr('y', 40)
      .style('font-size', '14pt')
      .text('Average Viewership By Season');

    svgContainer
      .append('text')
      .attr('x', 430)
      .attr('y', 495)
      .style('font-size', '10pt')
      .text('Year');

    svgContainer
      .append('text')
      .attr('transform', 'translate(10, 350)rotate(-90)')
      .style('font-size', '10pt')
      .text('Avg. Viewers (in millions)');
  }

  // create all of the bars on the SVG
  // and add tooltip functionality
  function createBars(map) {
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
      .attr('y', d => yScale(d['Avg. Viewers (mil)']) - 3)
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
      .attr('y', d => yScale(d['Avg. Viewers (mil)']))
      .attr('height', d => 450 - yScale(d['Avg. Viewers (mil)']))
      .attr('width', '30px')
      .attr('fill', d =>
        d.Data === 'Actual' ? 'rgb(88, 154, 220)' : 'rgb(124, 116, 111)'
      )

      // add tooltip functionality to points and add outline to bars
      .on('mouseover', function(d) {
        // add outline to bar chart on hover
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
              '<br/>' +
              'Avg Viewers (mil): ' +
              d['Avg. Viewers (mil)'] +
              '<br/>' +
              'Most Watched Episode: ' +
              d['Most watched episode'] +
              '<br/>' +
              'Viewers (mil): ' +
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
    const xAxis = d3
      .axisBottom()
      .scale(xScale)
      .tickSizeOuter(0)
      .ticks(25);

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
