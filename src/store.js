// store.js - flux-like state store

export default {
  debug: false,
  listeners: {},
  state: {
    fileInfo: {
      name: localStorage.getItem("tcxName"),
    },
    summaryData: {
      heart_rate_min: 0,
      heart_rate_max: 0,
      heart_rate_mean: 0,
      distance_km: 0,
      elapsed_sec: 0,
      pace_mean_kph: 0,
      pace_mean_mpk: 0,
      pace_drift: 0,
      date: new Date(), // not really a summary metric but easier to include here.
    },
  },

  setSummaryData(summary) {
    if (this.debug) {
      console.log("New keys for summaryData:", summary);
    }
    this.state.summaryData = Object.assign({}, this.state.summaryData, summary);
    this._notifyListeners("summaryData");
  },

  setFileInfo(fileInfo) {
    this.state.fileInfo = Object.assign({}, this.state.fileInfo, fileInfo);
    this._notifyListeners("fileInfo");
  },

  // Callback will receive a single arg: the new state (all of it)
  registerListener(key, callback) {
    if (key in this.listeners) {
      this.listeners[key].push(callback);
    } else {
      this.listeners[key] = [callback];
    }
  },

  _notifyListeners(key) {
    console.log("updated", key, this.state[key]);
    if (key in this.listeners) {
      for (let callback of this.listeners[key]) {
        callback(this.state);
      }
    }
  },
};
