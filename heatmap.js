const width = 960;
const height = 600;

// Add these variables at the top
let currentMetric = 'value';
let currentData = null;

// Modify the color scales for different metrics
const colorScales = {
    value: d3.scaleLinear()
        .domain([70, 85, 100])
        .range(["#ff4444", "#ffeb3b", "#4CAF50"]),  // Red -> Yellow -> Green
    latency: d3.scaleLinear()
        .domain([15, 50, 85])
        .range(["#4CAF50", "#ffeb3b", "#ff4444"]),  // Green -> Yellow -> Red (reversed because lower is better)
    bandwidth: d3.scaleLinear()
        .domain([70, 85, 100])
        .range(["#ff4444", "#ffeb3b", "#4CAF50"]),  // Red -> Yellow -> Green
    reliability: d3.scaleLinear()
        .domain([90, 95, 100])
        .range(["#ff4444", "#ffeb3b", "#4CAF50"])   // Red -> Yellow -> Green
};

// Create SVG
const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Create tooltip
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Update the tooltip content based on current metric
function getTooltipContent(d, stateData) {
    if (!stateData) return "No data";
    
    if (currentMetric === 'all') {
        return `
            <strong>${d.properties.name}</strong><br/>
            Overall Score: ${stateData.value}<br/>
            Latency: ${stateData.latency}ms<br/>
            Bandwidth: ${stateData.bandwidth}<br/>
            Reliability: ${stateData.reliability}%
        `;
    }
    
    return `
        ${d.properties.name}<br/>
        ${currentMetric.charAt(0).toUpperCase() + currentMetric.slice(1)}: 
        ${currentMetric === 'latency' ? stateData[currentMetric] + 'ms' : 
          currentMetric === 'reliability' ? stateData[currentMetric] + '%' : 
          stateData[currentMetric]}
    `;
}

// Update the map colors based on current metric
function updateMap() {
    svg.selectAll("path")
        .transition()
        .duration(750)
        .attr("fill", d => {
            const stateData = currentData[d.properties.name];
            if (!stateData) return "#ddd";
            if (currentMetric === 'all') {
                // For "Show All", use the overall score color
                return colorScales['value'](stateData['value']);
            }
            return colorScales[currentMetric](stateData[currentMetric]);
        });

    // Update tooltips
    svg.selectAll("path")
        .on("mouseover", function(event, d) {
            const stateData = currentData[d.properties.name];
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(getTooltipContent(d, stateData))
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        });
}

// Load US map data and network data
Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"),
    getNetworkData()
]).then(([us, networkData]) => {
    currentData = networkData; // Store the network data globally
    const states = topojson.feature(us, us.objects.states);

    const projection = d3.geoAlbersUsa()
        .fitSize([width, height], states);

    const path = d3.geoPath().projection(projection);

    svg.selectAll("path")
        .data(states.features)
        .enter()
        .append("path")
        .attr("class", "state")
        .attr("d", path)
        .attr("fill", d => {
            const stateData = networkData[d.properties.name];
            if (!stateData) return "#ddd";
            return colorScales[currentMetric](stateData[currentMetric]);
        })
        .on("mouseover", function(event, d) {
            const stateData = networkData[d.properties.name];
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(getTooltipContent(d, stateData))
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add click handlers for metric buttons
    document.querySelectorAll('.metric-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.metric-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update current metric
            currentMetric = this.dataset.metric;
            
            // Update both map and legend
            updateMap();
            updateLegend(currentMetric);
        });
    });

    // Add legend
    addLegend();
});

// Replace the generateMockData function with this more realistic one
function getNetworkData() {
    const stateNetworkData = {
        "Alabama": { value: 85, latency: 32, bandwidth: 95, reliability: 98 },
        "Alaska": { value: 65, latency: 78, bandwidth: 45, reliability: 92 },
        "Arizona": { value: 88, latency: 28, bandwidth: 98, reliability: 97 },
        "Arkansas": { value: 82, latency: 35, bandwidth: 88, reliability: 96 },
        "California": { value: 95, latency: 18, bandwidth: 100, reliability: 99 },
        "Colorado": { value: 90, latency: 25, bandwidth: 95, reliability: 98 },
        "Connecticut": { value: 92, latency: 22, bandwidth: 97, reliability: 99 },
        "Delaware": { value: 88, latency: 28, bandwidth: 92, reliability: 97 },
        "Florida": { value: 87, latency: 30, bandwidth: 94, reliability: 96 },
        "Georgia": { value: 89, latency: 26, bandwidth: 96, reliability: 98 },
        "Hawaii": { value: 70, latency: 85, bandwidth: 75, reliability: 94 },
        "Idaho": { value: 78, latency: 42, bandwidth: 85, reliability: 95 },
        "Illinois": { value: 91, latency: 24, bandwidth: 96, reliability: 98 },
        "Indiana": { value: 86, latency: 31, bandwidth: 92, reliability: 97 },
        "Iowa": { value: 84, latency: 33, bandwidth: 90, reliability: 96 },
        "Kansas": { value: 83, latency: 34, bandwidth: 89, reliability: 96 },
        "Kentucky": { value: 85, latency: 32, bandwidth: 91, reliability: 97 },
        "Louisiana": { value: 83, latency: 34, bandwidth: 88, reliability: 95 },
        "Maine": { value: 81, latency: 38, bandwidth: 86, reliability: 95 },
        "Maryland": { value: 90, latency: 25, bandwidth: 95, reliability: 98 },
        "Massachusetts": { value: 93, latency: 20, bandwidth: 98, reliability: 99 },
        "Michigan": { value: 87, latency: 29, bandwidth: 93, reliability: 97 },
        "Minnesota": { value: 88, latency: 28, bandwidth: 94, reliability: 97 },
        "Mississippi": { value: 81, latency: 36, bandwidth: 87, reliability: 95 },
        "Missouri": { value: 85, latency: 32, bandwidth: 91, reliability: 96 },
        "Montana": { value: 75, latency: 45, bandwidth: 82, reliability: 94 },
        "Nebraska": { value: 82, latency: 35, bandwidth: 88, reliability: 96 },
        "Nevada": { value: 86, latency: 31, bandwidth: 92, reliability: 97 },
        "New Hampshire": { value: 89, latency: 27, bandwidth: 94, reliability: 98 },
        "New Jersey": { value: 92, latency: 22, bandwidth: 97, reliability: 99 },
        "New Mexico": { value: 80, latency: 38, bandwidth: 86, reliability: 95 },
        "New York": { value: 94, latency: 19, bandwidth: 99, reliability: 99 },
        "North Carolina": { value: 88, latency: 28, bandwidth: 94, reliability: 97 },
        "North Dakota": { value: 77, latency: 43, bandwidth: 84, reliability: 95 },
        "Ohio": { value: 89, latency: 27, bandwidth: 95, reliability: 98 },
        "Oklahoma": { value: 82, latency: 35, bandwidth: 88, reliability: 96 },
        "Oregon": { value: 87, latency: 30, bandwidth: 93, reliability: 97 },
        "Pennsylvania": { value: 90, latency: 25, bandwidth: 96, reliability: 98 },
        "Rhode Island": { value: 91, latency: 24, bandwidth: 96, reliability: 98 },
        "South Carolina": { value: 86, latency: 31, bandwidth: 92, reliability: 97 },
        "South Dakota": { value: 76, latency: 44, bandwidth: 83, reliability: 94 },
        "Tennessee": { value: 87, latency: 30, bandwidth: 93, reliability: 97 },
        "Texas": { value: 91, latency: 24, bandwidth: 97, reliability: 98 },
        "Utah": { value: 85, latency: 32, bandwidth: 91, reliability: 97 },
        "Vermont": { value: 83, latency: 34, bandwidth: 89, reliability: 96 },
        "Virginia": { value: 89, latency: 26, bandwidth: 95, reliability: 98 },
        "Washington": { value: 88, latency: 28, bandwidth: 94, reliability: 97 },
        "West Virginia": { value: 82, latency: 35, bandwidth: 88, reliability: 96 },
        "Wisconsin": { value: 86, latency: 31, bandwidth: 92, reliability: 97 },
        "Wyoming": { value: 74, latency: 46, bandwidth: 81, reliability: 94 }
    };

    return stateNetworkData;
}

// Add a legend
function addLegend() {
    const legendWidth = 200;
    const legendHeight = 20;
    const legendMargin = { top: 20, right: 20 };
    
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - legendWidth - legendMargin.right}, ${legendMargin.top})`);

    // Create gradient definition
    const defs = legend.append("defs");
    const gradient = defs.append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%")
        .attr("x2", "100%");

    // Add initial gradient stops
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#ff4444");
    gradient.append("stop").attr("offset", "50%").attr("stop-color", "#ffeb3b");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#4CAF50");

    // Add legend title
    legend.append("text")
        .attr("class", "legend-title")
        .attr("x", 0)
        .attr("y", -5)
        .text("Performance Scale");

    // Add the colored rectangle
    legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)");

    // Add initial scale labels
    const labels = [70, 85, 100];
    legend.selectAll(".legend-label")
        .data(labels)
        .enter()
        .append("text")
        .attr("class", "legend-label")
        .attr("x", (d, i) => i * (legendWidth / 2))
        .attr("y", legendHeight + 15)
        .style("text-anchor", (d, i) => i === 1 ? "middle" : i === 0 ? "start" : "end")
        .text(d => d);
}

// Update the legend update function
function updateLegend(metric) {
    const gradient = d3.select("#legend-gradient");
    gradient.selectAll("stop").remove();
    
    // If showing all metrics, use the overall score scale
    const effectiveMetric = metric === 'all' ? 'value' : metric;
    
    if (effectiveMetric === 'latency') {
        gradient.append("stop").attr("offset", "0%").attr("stop-color", "#4CAF50");
        gradient.append("stop").attr("offset", "50%").attr("stop-color", "#ffeb3b");
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "#ff4444");
    } else {
        gradient.append("stop").attr("offset", "0%").attr("stop-color", "#ff4444");
        gradient.append("stop").attr("offset", "50%").attr("stop-color", "#ffeb3b");
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "#4CAF50");
    }

    // Update legend title based on mode
    d3.select(".legend-title")
        .text(metric === 'all' ? "Overall Score Scale" : "Performance Scale");

    const scale = colorScales[effectiveMetric];
    const domain = scale.domain();
    const labels = effectiveMetric === 'latency' ? 
        [`${domain[2]}ms`, `${domain[1]}ms`, `${domain[0]}ms`] :
        effectiveMetric === 'reliability' ? 
            [`${domain[0]}%`, `${domain[1]}%`, `${domain[2]}%`] :
            domain;

    d3.selectAll(".legend-label")
        .data(labels)
        .text(d => d);
} 
/*
===============================================================================
LIVE DATA UPDATE FUNCTIONALITY - Implementation Guide
===============================================================================

This code enables automatic refresh of network metrics data every 10 minutes.
To implement:
1. Uncomment this code
2. Set up an API endpoint that returns network metrics data
3. Update the fetch URL in loadAndUpdateData()
4. Uncomment the related HTML and CSS code
5. Modify updateVisualization() to handle your specific data structure

-------------------------------------------------------------------------------
Configuration Options:
*/

// const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

/*
-------------------------------------------------------------------------------
Core Update Functions:
*/

// async function loadAndUpdateData() {
//     const loadingIndicator = document.createElement('div');
//     loadingIndicator.className = 'loading';
//     loadingIndicator.textContent = 'Updating data...';
//     document.querySelector('.header').appendChild(loadingIndicator);
//
//     try {
//         // Replace this URL with your actual API endpoint
//         const response = await fetch('/api/network-metrics');
//         if (!response.ok) throw new Error('Network response was not ok');
//         
//         const data = await response.json();
//         updateVisualization(data);
//         
//         // Update the timestamp
//         document.getElementById('update-time').textContent = new Date().toLocaleTimeString();
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         showError('Failed to update data. Will try again soon.');
//     } finally {
//         loadingIndicator.remove();
//     }
// }

/*
-------------------------------------------------------------------------------
Helper Functions:
*/

// function showError(message) {
//     const errorDiv = document.createElement('div');
//     errorDiv.className = 'error-message';
//     errorDiv.textContent = message;
//     document.querySelector('.header').appendChild(errorDiv);
//     setTimeout(() => errorDiv.remove(), 5000); // Remove after 5 seconds
// }

// function startDataRefresh() {
//     // Load data immediately
//     loadAndUpdateData();
//     
//     // Set up periodic refresh
//     setInterval(loadAndUpdateData, REFRESH_INTERVAL);
// }

/*
-------------------------------------------------------------------------------
Manual Refresh Button (Optional):
*/

// function addRefreshButton() {
//     const refreshButton = document.createElement('button');
//     refreshButton.textContent = 'Refresh Now';
//     refreshButton.className = 'metric-btn';  // Use existing button styling
//     refreshButton.onclick = loadAndUpdateData;
//     document.querySelector('.control-panel').appendChild(refreshButton);
// }

/*
-------------------------------------------------------------------------------
Initialize Live Updates:
To enable live updates, uncomment this section and call initializeLiveUpdates()
in your main code.
*/

// function initializeLiveUpdates() {
//     startDataRefresh();
//     addRefreshButton();
// }

/*
===============================================================================
IMPLEMENTATION NOTES:

1. Data Format:
   Your API should return data in the format your visualization expects.
   Example format:
   {
     "CA": { value: 85, latency: 20, bandwidth: 100, reliability: 95 },
     "NY": { value: 78, latency: 25, bandwidth: 90, reliability: 88 },
     ...
   }

2. Error Handling:
   - The code includes basic error handling with user feedback
   - Failed updates will be retried on the next interval
   - Network errors are logged to the console

3. Performance Considerations:
   - Consider implementing a websocket connection instead of polling for 
     truly real-time updates
   - Adjust REFRESH_INTERVAL based on your needs
   - Consider adding a loading state to your visualization

4. Security:
   - Ensure your API endpoint is properly secured
   - Consider implementing rate limiting
   - Add appropriate CORS headers if needed

5. User Experience:
   - The loading indicator shows during updates
   - Error messages auto-dismiss after 5 seconds
   - The manual refresh button provides user control
   - The last update time helps users know data freshness

===============================================================================
*/