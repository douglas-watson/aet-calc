// plot.js - handle visualization

// We don't import plotly as it doesn't like browserify. Linked from index.html instead.

const plotlyLayout = {
  xaxis: {
    rangeslider: {},
    title: "Distance [km]",
  },
  yaxis: {
    fixedrange: true,
    title: "Heart rate [bpm]",
  },
  yaxis2: {
    title: "Pace [km/h]",
    side: "right",
    overlaying: "y",
  },
  margin: { l: 50, r: 40, t: 0, b: 10 },
  legend: {
    orientation: "h",
    x: 1,
    xanchor: "right",
    y: 1.05,
  },
};

const plotlyConfig = {
  responsive: true,
};

function prepData(workout) {
  const x = [];
  const y1 = [];
  const y2 = [];
  for (let row of workout.trackpoints) {
    x.push(row.distance_km);
    y1.push(row.heart_rate_bpm);
    y2.push(row.pace_kph);
  }
  return [
    {
      x: x,
      y: y1,
      mode: "lines",
      name: "Heart rate",
      yaxis: "y1",
    },
    {
      x: x,
      y: y2,
      mode: "lines",
      name: "Pace",
      yaxis: "y2",
    },
  ];
}

export function attachPlot(id, workout, store) {
  let myPlot = document.getElementById(id);
  Plotly.newPlot(id, prepData(workout), plotlyLayout, plotlyConfig);
  myPlot.on("plotly_afterplot", () => {
    store.setSummaryData(
      workout.filterDistRange(...myPlot.layout.xaxis.range).summarize()
    );
  });
  return myPlot;
}
