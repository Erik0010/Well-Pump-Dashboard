// Load cleaned water level data and display chart + summary
fetch('cleaned_data.json')
  .then(response => response.json())
  .then(data => {
    const readings = data.readings;
    const labels = readings.map(entry => entry.timestamp);
    const levels = readings.map(entry => entry.waterLevel);

    // Display summary stats
    document.getElementById("min-level").textContent = `${data.summary.min} ft`;
    document.getElementById("max-level").textContent = `${data.summary.max} ft`;
    document.getElementById("avg-level").textContent = `${data.summary.avg} ft`;

    // Create a container for the two charts side by side
    let chartGrid = document.getElementById('chart-grid');
    if (!chartGrid) {
      chartGrid = document.createElement('div');
      chartGrid.id = 'chart-grid';
      chartGrid.style.display = 'grid';
      chartGrid.style.gridTemplateColumns = '1fr 1fr';
      chartGrid.style.gap = '40px';
      chartGrid.style.alignItems = 'start';
      chartGrid.style.marginTop = '30px';
      // Move the chart grid above the first script tag
      document.body.insertBefore(chartGrid, document.querySelector('script'));
    }

    // Move or create the water level chart in the left cell
    let waterChartCanvas = document.getElementById('waterChart');
    let waterChartDiv = document.getElementById('waterChartDiv');
    if (!waterChartDiv) {
      waterChartDiv = document.createElement('div');
      waterChartDiv.id = 'waterChartDiv';
      waterChartDiv.appendChild(waterChartCanvas);
      chartGrid.appendChild(waterChartDiv);
    } else if (waterChartDiv.parentNode !== chartGrid) {
      chartGrid.appendChild(waterChartDiv);
    }

    // Move or create the pump cycles chart in the right cell
    let pumpCyclesCanvas = document.getElementById('pumpCyclesChart');
    let pumpCyclesDiv = document.getElementById('pumpCyclesDiv');
    if (!pumpCyclesDiv) {
      pumpCyclesDiv = document.createElement('div');
      pumpCyclesDiv.id = 'pumpCyclesDiv';
      if (!pumpCyclesCanvas) {
        pumpCyclesCanvas = document.createElement('canvas');
        pumpCyclesCanvas.id = 'pumpCyclesChart';
      }
      pumpCyclesDiv.appendChild(pumpCyclesCanvas);
      chartGrid.appendChild(pumpCyclesDiv);
    } else if (pumpCyclesDiv.parentNode !== chartGrid) {
      chartGrid.appendChild(pumpCyclesDiv);
    }

    // Draw chart
    const ctx = waterChartCanvas.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Water Level (ft)',
          data: levels,
          borderColor: 'goldenrod',
          backgroundColor: 'rgba(255, 193, 7, 0.2)',
          fill: true,
          tension: 0.3,
          pointRadius: 0
        }]
      },
      options: {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: false,
      suggestedMin: 30,
      suggestedMax: 60
    },
    x: {
      ticks: {
        autoSkip: true,
        maxTicksLimit: 10
      }
    }
  },
  plugins: {
    legend: { display: true },
    tooltip: {
      mode: 'index',
      intersect: false
    
          }
        }
      }
    });

    // Draw Pump Cycles Over Time Chart
    fetch('pump_stats.json')
      .then(response => response.json())
      .then(stats => {
        document.getElementById("pump-runtime").textContent = `${stats.pump_runtime} hrs`;
        document.getElementById("pump-cycles").textContent = stats.pump_cycles;
      })
      .catch(error => {
        console.error("Failed to load pump stats:", error);
      });

    // Calculate cumulative pump cycles over time
    let pumpCyclesOverTime = [];
    let cumulative = 0;
    for (let i = 1; i < readings.length; i++) {
      if (readings[i].waterLevel - readings[i-1].waterLevel > 0.1) {
        cumulative++;
      }
      pumpCyclesOverTime.push(cumulative);
    }
    const pumpCyclesLabels = labels.slice(1);

    // Create a new canvas for the pump cycles chart if not present
    const ctxCycles = pumpCyclesCanvas.getContext('2d');
    new Chart(ctxCycles, {
      type: 'line',
      data: {
        labels: pumpCyclesLabels,
        datasets: [{
          label: 'Cumulative Pump Cycles',
          data: pumpCyclesOverTime,
          borderColor: 'royalblue',
          backgroundColor: 'rgba(65, 105, 225, 0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          },
          x: {
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10
            }
          }
        },
        plugins: {
          legend: { display: true },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        }
      }
    });
  })
  .catch(error => {
    console.error("Failed to load chart data:", error);
  });
