// store.js - flux-like state store

export default {
  debug: false,
  listeners: {},
  state: {
    summaryData: {},
  },

  setSummaryData(summary) {
    if (this.debug) {
      console.log("New keys for summaryData:", summary);
    }
    this.state.summaryData = summary;
    this._notifyListeners('summaryData')
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
      console.log("updated", key)
    for ( let callback of this.listeners[key] ) {
        callback(this.state);
    }
  }
};
