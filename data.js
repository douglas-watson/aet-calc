// data.js - stores the current workout data

import { Parser } from "tcx-js";

// // in typescript this would be an interface
// interface Trackpoint {
//     elapsed_sec;
//     distance_km;
//     heart_rate_bpm;
//     pace_kph;           // pace in km/h
// }

// interface SummaryData {
//   heart_rate_min;
//   heart_rate_max;
//   heart_rate_mean;
//   distance_km;
//   pace_mean_kph;
//   pace_mean_mpk;  // minutes per km
// }

export class Workout {
  constructor({ trackpoints, date }) {
    this.trackpoints = trackpoints;
    this.date = date;
  }

  static fromTCX(filename, text = null) {
    let parser = new Parser(filename, text);
    console.log(parser);
    let trackpoints = parser.activity.trackpoints
      // keep only sane bpm range
      .filter((row) => row.heart_rate_bpm > 0 && row.heart_rate_bpm <= 250)
      // some distance points jump back to zero!
      .filter((row, i, arr) => (i == 0 ? true : row.distance_km > 0))
      // ditch duplicated, i.e. subsequent points at same time:
      .filter((row, i, arr) =>
        i == 0 ? true : row.elapsed_sec > arr[i - 1].elapsed_sec
      )
      // generate a Trackpoint
      .map((row, i, arr) => ({
        elapsed_sec: row.elapsed_sec,
        distance_km: row.distance_km,
        heart_rate_bpm: row.heart_rate_bpm,
        // Pace defined as delta_dist / delta_t. delta_t guaranteed to be > 0 from
        // filter above.
        pace_kph:
          i == 0
            ? 0
            : ((row.distance_km - arr[i - 1].distance_km) /
                (row.elapsed_sec - arr[i - 1].elapsed_sec)) *
              3600,
      }))
      .map((row) => ({
        ...row,
        pace_per_beat: row.pace_kph / row.heart_rate_bpm,
      }));

    let date = new Date(parser.activity.startingEpoch);
    return new Workout({ trackpoints, date });
  }

  filterDistRange(distMin, distMax) {
    return new Workout({
      trackpoints: this.trackpoints.filter(
        (row) => row.distance_km >= distMin && row.distance_km <= distMax
      ),
      date: this.date,
    });
  }

  summarize() {
    let d = {
      heart_rate_min: 0,
      heart_rate_max: 0,
      heart_rate_mean: 0,
      distance_km: 0,
      pace_mean_kph: 0,
      pace_mean_mpk: 0,
      pace_drift: 0,
    };
    if (this.trackpoints.length == 0) {
      return d;
    }

    let elapsed_sec = this.trackpoints.map((row) => row.elapsed_sec);
    let heart_rate = this.trackpoints.map((row) => row.heart_rate_bpm);
    let distance_km = this.trackpoints.map((row) => row.distance_km);
    let pace_kph = this.trackpoints.map((row) => row.pace_kph);

    d.heart_rate_min = arrayMin(heart_rate);
    d.heart_rate_max = arrayMax(heart_rate);
    d.heart_rate_mean = arrayMean(heart_rate);
    d.distance_km = arrayMax(distance_km) - arrayMin(distance_km);
    d.pace_mean_kph = arrayMean(pace_kph);
    d.pace_mean_mpk = 60 / d.pace_mean_kph;

    // Drift: separate first and second half
    let t0 = elapsed_sec[0];
    let tf = elapsed_sec[elapsed_sec.length - 1];
    let tm = t0 + (tf - t0) / 2;

    let firstHalf = arrayMean(
      this.trackpoints
        .filter((row) => row.elapsed_sec < tm)
        .map((row) => row.pace_per_beat)
    );
    let secondHalf = arrayMean(
      this.trackpoints
        .filter((row) => row.elapsed_sec >= tm)
        .map((row) => row.pace_per_beat)
    );

    d.pace_drift = ((secondHalf - firstHalf) / firstHalf) * 100;

    return d;
  }
}

// ---------  Helpers -----------

function arrayMin(values) {
  return values.reduce((c, n) => (c < n ? c : n));
}

function arrayMax(values) {
  return values.reduce((c, n) => (c > n ? c : n));
}

// Returns 0 if values is empty array.
function arrayMean(values) {
  return values.reduce((c, n) => c + n, 0) / values.length || 0;
}
