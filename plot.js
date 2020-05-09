// plot.js - handle visualization

// We don't import plotly as it doesn't like browserify. Linked from index.html instead.

const plotlyLayout = {
  title: "Heart rate over time",
  xaxis: {
    rangeslider: {},
  },
  yaxis: {
    fixedrange: true,
  },
  margin: { l: 40, r: 10, t: 40, b: 10 },
};

const plotlyConfig = {
  responsive: true,
};

function prepData(workout) {
  const x = [];
  const y1 = [];
  for (let row of workout.trackpoints) {
    x.push(row.distance_km);
    y1.push(row.heart_rate_bpm);
  }
  return [
    {
      x: x,
      y: y1,
      mode: "lines",
    },
  ];
}

export function attachPlot(id, workout, store) {
  let myPlot = document.getElementById(id);
  let layout = { ...plotlyLayout, title: workout.date.toLocaleString() };
  Plotly.newPlot(id, prepData(workout), layout, plotlyConfig);
  myPlot.on("plotly_afterplot", () => {
    store.setSummaryData(
      workout.filterDistRange(...myPlot.layout.xaxis.range).summarize()
    );
  });
  return myPlot;
}
