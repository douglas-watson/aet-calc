import Mustache from 'mustache'

import { attachPlot } from './plot.js';
import { Workout } from './data.js'
import store from './store.js'

// import * as Plotly from "plotly.js-dist";

async function getTCX() {
  const response = await fetch("30768899072.tcx");
  return await response.text();
}

function computePpbDrift(parser, xmin, xmax) {
  let xhalf = xmin + ( xmax - xmin ) / 2;

  let firstHalf = computeMetrics(parser, xmin, xhalf)
  let secondHalf = computeMetrics(parser, xhalf, xmax)

  console.log(firstHalf, secondHalf);
  // TODO: fix division by zero
  return (secondHalf.ppb_mean - firstHalf.ppb_mean) / secondHalf.ppb_mean;
}

function updateSummary(state) {
  let summaryTable = document.getElementById('summary');
  let summaryTemplate = document.getElementById('summaryTemplate');

  // TODO: maybe switch to handlebars to avoid this crap:
  summaryTable.innerHTML = Mustache.render(summaryTemplate.innerHTML, {
    ...state.summaryData,
    heart_rate_mean: state.summaryData.heart_rate_mean.toFixed(1),
    pace_mean_kph: state.summaryData.pace_mean_kph.toFixed(2),
    pace_mean_mpk: state.summaryData.pace_mean_mpk.toFixed(2),
    pace_drift: state.summaryData.pace_drift.toFixed(1)
  });
}

function attach() {
  getTCX()
    .then((text) => {
      let workout = Workout.fromTCX("30768lkj.tcx", text);
      attachPlot('viz', workout, store);
    })

  store.registerListener('summaryData', updateSummary);
  updateSummary(store.state);
}

attach()