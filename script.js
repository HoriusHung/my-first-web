"use strict";

// Split the string into an array of numbers; throw if empty or any token is invalid.
function parseInput(text) {
  const tokens = String(text).split(/[\s,;]+/).filter(function (t) {
    return t !== "";
  });

  if (tokens.length === 0) {
    throw new Error("Please enter a list of numbers.");
  }

  const pattern = /^[+-]?(\d+\.?\d*|\.\d+)$/;
  const numbers = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!pattern.test(token)) {
      throw new Error("Invalid token: '" + token + "'. Only decimal numbers are allowed (period is the decimal separator).");
    }
    const value = Number(token);
    if (!Number.isFinite(value)) {
      throw new Error("Invalid token: '" + token + "' (number too large or infinite).");
    }
    numbers.push(value);
  }

  return numbers;
}

function sum(arr) {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s;
}

function mean(arr) {
  return sum(arr) / arr.length;
}

function median(arr) {
  const sorted = arr.slice().sort(function (a, b) {
    return a - b;
  });
  const n = sorted.length;
  const mid = Math.floor(n / 2);
  if (n % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

// Return all modes (every value with the highest frequency),
// or null if every value appears exactly once.
function modes(arr) {
  const freq = new Map();
  for (let i = 0; i < arr.length; i++) {
    freq.set(arr[i], (freq.get(arr[i]) || 0) + 1);
  }
  let maxFreq = 0;
  freq.forEach(function (count) {
    if (count > maxFreq) maxFreq = count;
  });
  if (maxFreq === 1) return null;
  const result = [];
  freq.forEach(function (count, value) {
    if (count === maxFreq) result.push(value);
  });
  return result.sort(function (a, b) {
    return a - b;
  });
}

function variance(arr, isSample) {
  if (isSample && arr.length < 2) return null;
  const m = mean(arr);
  let s = 0;
  for (let i = 0; i < arr.length; i++) {
    const d = arr[i] - m;
    s += d * d;
  }
  return s / (isSample ? arr.length - 1 : arr.length);
}

function std(arr, isSample) {
  const v = variance(arr, isSample);
  return v === null ? null : Math.sqrt(v);
}

function formatNumber(x) {
  if (x === null || x === undefined || Number.isNaN(x)) return "N/A";
  let rounded = Number(x.toFixed(6));
  if (rounded === 0) return "0"; // handles both -0 and values that round to 0
  return String(rounded);
}

function parsedLineText(numbers) {
  const MAX_SHOW = 50;
  let list;
  if (numbers.length > MAX_SHOW) {
    list = numbers.slice(0, MAX_SHOW).map(formatNumber).join(", ") + ", ...";
  } else {
    list = numbers.map(formatNumber).join(", ");
  }
  const label = numbers.length === 1 ? "Parsed 1 number: " : "Parsed " + numbers.length + " numbers: ";
  return label + list;
}

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

function calculate() {
  const inputEl = document.getElementById("input");
  const errorEl = document.getElementById("error");
  const tableEl = document.getElementById("resultTable");

  try {
    const numbers = parseInput(inputEl.value);

    errorEl.textContent = "";
    document.getElementById("parsedLine").textContent = parsedLineText(numbers);

    const sortedMinMax = numbers.slice().sort(function (a, b) {
      return a - b;
    });
    const mn = sortedMinMax[0];
    const mx = sortedMinMax[sortedMinMax.length - 1];
    const m = modes(numbers);

    setText("r_n", String(numbers.length));
    setText("r_sum", formatNumber(sum(numbers)));
    setText("r_mean", formatNumber(mean(numbers)));
    setText("r_median", formatNumber(median(numbers)));
    setText("r_mode", m === null ? "None" : m.map(formatNumber).join(", "));
    setText("r_min", formatNumber(mn));
    setText("r_max", formatNumber(mx));
    setText("r_range", formatNumber(mx - mn));
    setText("r_var_pop", formatNumber(variance(numbers, false)));
    setText("r_std_pop", formatNumber(std(numbers, false)));
    setText("r_var_sample", formatNumber(variance(numbers, true)));
    setText("r_std_sample", formatNumber(std(numbers, true)));

    tableEl.hidden = false;
  } catch (err) {
    errorEl.textContent = err.message;
    document.getElementById("parsedLine").textContent = "";
    tableEl.hidden = true;
  }
}

function clearAll() {
  document.getElementById("input").value = "";
  document.getElementById("error").textContent = "";
  document.getElementById("parsedLine").textContent = "";
  document.getElementById("resultTable").hidden = true;
}

document.getElementById("btnCalc").addEventListener("click", calculate);
document.getElementById("btnClear").addEventListener("click", clearAll);
