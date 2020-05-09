import Mustache from "mustache";

import { attachPlot } from "./plot.js";
import { Workout } from "./data.js";
import store from "./store.js";

// import * as Plotly from "plotly.js-dist";

function updateSummary(state) {
  let summaryTable = document.getElementById("summary");
  let summaryTemplate = document.getElementById("summaryTemplate");

  // TODO: maybe switch to handlebars to avoid this crap:
  summaryTable.innerHTML = Mustache.render(summaryTemplate.innerHTML, {
    ...state.summaryData,
    heart_rate_mean: state.summaryData.heart_rate_mean.toFixed(1),
    distance_km: state.summaryData.distance_km.toFixed(2),
    pace_mean_kph: state.summaryData.pace_mean_kph.toFixed(2),
    pace_mean_mpk: state.summaryData.pace_mean_mpk.toFixed(2),
    pace_drift: state.summaryData.pace_drift.toFixed(1),
  });
}

function attachLocalTCX(id) {
  let localTCX = localStorage.getItem("tcxData");
  if (localTCX) {
    let workout = Workout.fromTCX(
      localStorage.getItem("tcxName") || "local.tcx",
      localTCX
    );
    attachPlot(id, workout, store);
  }
}

function attachFileHandler(id) {
  // old skool listeners in listeners
  let input = document.querySelector("input");
  input.addEventListener("change", () => {
    if (input.files.length > 0) {
      let file = input.files[0];
      let reader = new FileReader();
      reader.addEventListener("load", () => {
        localStorage.setItem("tcxData", reader.result);
        localStorage.setItem("tcxName", file.name);

        let workout = Workout.fromTCX(file.name, reader.result);
        attachPlot(id, workout, store);
      });

      reader.readAsText(file);
    }
  });
}

function main() {
  const id = "viz";
  updateSummary(store.state);
  attachLocalTCX(id);
  attachFileHandler(id);
  store.registerListener("summaryData", updateSummary);
}

main();
