import Mustache from "mustache";

import { attachPlot } from "./plot.js";
import { Workout } from "./data.js";
import store from "./store.js";

// import * as Plotly from "plotly.js-dist";

// Update the summary data table
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
    pace_mean_mpk_formatted: state.summaryData.pace_mean_mpk_formatted,
    pace_drift: state.summaryData.pace_drift.toFixed(1),
    duration: new Date(state.summaryData.elapsed_sec * 1000)
      .toISOString()
      .substring(11, 19),
    date: state.summaryData.date.toLocaleDateString(),
    start_time: state.summaryData.date.toLocaleTimeString(),
  });
}

// Update the filename next to file input
function updateFileName(state) {
  document.getElementById("filename-display").innerText = state.fileInfo.name;
}

/* 
We have three ways to load a file:
- From a file input: get file object and load it
- Drag and drop: same as from form, but triggered by a different event.
- From local storage: file contents already available as string, TCX data just needs to be parsed again.
*/
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

// From a File object (from input or drop event): parse and plot
function loadFile(plotId, file) {
  let reader = new FileReader();
  reader.addEventListener("load", () => {
    localStorage.setItem("tcxData", reader.result);
    localStorage.setItem("tcxName", file.name);
    store.setFileInfo({ name: file.name });

    let workout = Workout.fromTCX(file.name, reader.result);
    attachPlot(plotId, workout, store);
  });

  reader.readAsText(file);
}

function attachFileHandler(plotId) {
  // old skool listeners in listeners
  let input = document.querySelector("input");
  input.addEventListener("change", () => {
    if (input.files.length > 0) {
      let file = input.files[0];
      loadFile(plotId, file);
    }
  });
}

function attachDropzone(plotId, dzId) {
  const dropzone = document.getElementById(dzId);
  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  dropzone.addEventListener("drop", (event) => {
    console.log(event.dataTransfer.files[0]);
    loadFile(plotId, event.dataTransfer.files[0]);
    event.preventDefault();
  });
}

function main() {
  updateSummary(store.state);
  updateFileName(store.state);
  const plotId = "viz";
  attachDropzone(plotId, "dropzone");
  attachLocalTCX(plotId);
  attachFileHandler(plotId);
  store.registerListener("summaryData", updateSummary);
  store.registerListener("fileInfo", updateFileName);
}

main();
