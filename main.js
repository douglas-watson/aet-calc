import Mustache from 'mustache'

import { attachPlot } from './plot.js';
import { Workout } from './data.js'
import store from './store.js'

// import * as Plotly from "plotly.js-dist";

async function getTCX() {
  const response = await fetch("/30768899072.tcx");
  return await response.text();
}

function updateSummary(state) {
  let summaryTable = document.getElementById('summary');
  let summaryTemplate = document.getElementById('summaryTemplate');

  // TODO: maybe switch to handlebars to avoid this crap:
  summaryTable.innerHTML = Mustache.render(summaryTemplate.innerHTML, {
    ...state.summaryData,
    heart_rate_mean: state.summaryData.heart_rate_mean.toFixed(1),
    distance_km: state.summaryData.distance_km.toFixed(2),
    pace_mean_kph: state.summaryData.pace_mean_kph.toFixed(2),
    pace_mean_mpk: state.summaryData.pace_mean_mpk.toFixed(2),
    pace_drift: state.summaryData.pace_drift.toFixed(1)
  });
}

function attach() {
  // ------------- tmp ----------------------
  let input = document.querySelector("input");
  input.addEventListener("change", () => {
    if (input.files.length > 0) {
      let file = input.files[0];
      let reader = new FileReader()
      reader.addEventListener('load', () => {
          console.log(reader.result.slice(0, 100))
          let workout = Workout.fromTCX(file.name, reader.result);
          attachPlot('viz', workout, store);
      })
      reader.readAsText(file);
    }
  });
  // ---------------- tmp ----------------------

  getTCX()
    .then((text) => {
      let workout = Workout.fromTCX("30768899072.tcx", text);
      attachPlot('viz', workout, store);
    })

  store.registerListener('summaryData', updateSummary);
  updateSummary(store.state);
}

attach()