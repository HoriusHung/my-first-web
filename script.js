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

function quartiles(arr) {
  const sorted = arr.slice().sort(function (a, b) {
    return a - b;
  });
  const n = sorted.length;
  const mid = Math.floor(n / 2);
  const lower = sorted.slice(0, mid);
  const upper = n % 2 === 1 ? sorted.slice(mid + 1) : sorted.slice(mid);
  return {
    q1: lower.length ? median(lower) : null,
    q3: upper.length ? median(upper) : null,
  };
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

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const key in attrs) el.setAttribute(key, attrs[key]);
  return el;
}

function renderHistogram(numbers) {
  const svg = document.getElementById("histogram");
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const lo = Math.min.apply(null, numbers);
  const hi = Math.max.apply(null, numbers);
  const W = 560, H = 220, PAD = 30;

  if (lo === hi) {
    const bar = svgEl("rect", { x: W / 2 - 40, y: 40, width: 80, height: H - PAD - 40, rx: 6, fill: "#06b6d4" });
    const t = svgEl("title", {});
    t.textContent = "Value " + formatNumber(lo) + ": " + numbers.length;
    bar.appendChild(t);
    svg.appendChild(bar);
    return;
  }

  const binCount = Math.min(10, Math.max(4, Math.ceil(numbers.length / 3)));
  const binWidth = (hi - lo) / binCount;
  const bins = new Array(binCount).fill(0);
  numbers.forEach(function (x) {
    let i = Math.floor((x - lo) / binWidth);
    if (i >= binCount) i = binCount - 1;
    bins[i]++;
  });
  const maxBin = Math.max.apply(null, bins);
  const LEFT = 38, RIGHT = 14, TOP = 14, BOTTOM = 42;
  const plotW = W - LEFT - RIGHT;
  const plotH = H - TOP - BOTTOM;
  const barW = plotW / binCount;

  // Y axis: frequency, with a few light gridlines.
  const yTicks = Math.min(4, maxBin) || 1;
  for (let i = 0; i <= yTicks; i++) {
    const value = Math.round((maxBin * i) / yTicks);
    const y = TOP + plotH - (value / maxBin) * plotH;
    svg.appendChild(svgEl("line", { x1: LEFT, y1: y, x2: W - RIGHT, y2: y, stroke: "#e2e8f0", "stroke-width": 1 }));
    const yt = svgEl("text", { x: LEFT - 6, y: y + 4, "text-anchor": "end", "font-size": 10, fill: "#94a3b8" });
    yt.textContent = value;
    svg.appendChild(yt);
  }
  const yLabel = svgEl("text", { x: 12, y: TOP + plotH / 2, "font-size": 10, fill: "#64748b", transform: "rotate(-90 12 " + (TOP + plotH / 2) + ")", "text-anchor": "middle" });
  yLabel.textContent = "Frequency";
  svg.appendChild(yLabel);

  for (let i = 0; i < binCount; i++) {
    const h = (bins[i] / maxBin) * plotH;
    const rect = svgEl("rect", {
      x: LEFT + i * barW + 2,
      y: TOP + (plotH - h),
      width: barW - 4,
      height: h,
      rx: 4,
      fill: i % 2 === 0 ? "#2563eb" : "#06b6d4",
    });
    const t = svgEl("title", {});
    const a = lo + i * binWidth;
    const b = lo + (i + 1) * binWidth;
    t.textContent = formatNumber(a) + " to " + formatNumber(b) + ": " + bins[i];
    rect.appendChild(t);
    svg.appendChild(rect);
  }

  // X axis: bin edge labels (every other edge when crowded).
  svg.appendChild(svgEl("line", { x1: LEFT, y1: TOP + plotH, x2: W - RIGHT, y2: TOP + plotH, stroke: "#94a3b8", "stroke-width": 1.5 }));
  const step = binCount > 7 ? 2 : 1;
  for (let i = 0; i <= binCount; i += step) {
    const v = lo + i * binWidth;
    const tx = svgEl("text", { x: LEFT + i * barW, y: TOP + plotH + 16, "text-anchor": "middle", "font-size": 10, fill: "#64748b" });
    tx.textContent = formatNumber(v);
    svg.appendChild(tx);
  }
  // Ensure the last edge is always shown.
  if (binCount % step !== 0) {
    const last = svgEl("text", { x: LEFT + plotW, y: TOP + plotH + 16, "text-anchor": "middle", "font-size": 10, fill: "#64748b" });
    last.textContent = formatNumber(hi);
    svg.appendChild(last);
  }
  const xLabel = svgEl("text", { x: LEFT + plotW / 2, y: H - 6, "text-anchor": "middle", "font-size": 10, fill: "#64748b" });
  xLabel.textContent = "Value range (bin edges)";
  svg.appendChild(xLabel);
}

function renderBoxPlot(numbers) {
  const svg = document.getElementById("boxplot");
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const sorted = numbers.slice().sort(function (a, b) {
    return a - b;
  });
  const lo = sorted[0];
  const hi = sorted[sorted.length - 1];
  const med = median(numbers);
  const q = quartiles(numbers);
  const W = 560, PAD = 40;
  const span = hi === lo ? 1 : hi - lo;

  function x(v) {
    return PAD + ((v - lo) / span) * (W - 2 * PAD);
  }

  const q1 = q.q1 === null ? med : q.q1;
  const q3 = q.q3 === null ? med : q.q3;

  const MID = 78;

  // Numerical scale along the top.
  const AXIS_Y = 26;
  svg.appendChild(svgEl("line", { x1: x(lo), y1: AXIS_Y, x2: x(hi), y2: AXIS_Y, stroke: "#cbd5e1", "stroke-width": 1.5 }));
  for (let i = 0; i <= 4; i++) {
    const v = lo + (span * i) / 4;
    svg.appendChild(svgEl("line", { x1: x(v), y1: AXIS_Y, x2: x(v), y2: AXIS_Y + 5, stroke: "#cbd5e1", "stroke-width": 1.5 }));
    const tk = svgEl("text", { x: x(v), y: AXIS_Y - 8, "text-anchor": "middle", "font-size": 10, fill: "#94a3b8" });
    tk.textContent = formatNumber(v);
    svg.appendChild(tk);
  }

  svg.appendChild(svgEl("line", { x1: x(lo), y1: MID, x2: x(hi), y2: MID, stroke: "#94a3b8", "stroke-width": 2 }));
  svg.appendChild(svgEl("line", { x1: x(lo), y1: MID - 14, x2: x(lo), y2: MID + 14, stroke: "#94a3b8", "stroke-width": 2 }));
  svg.appendChild(svgEl("line", { x1: x(hi), y1: MID - 14, x2: x(hi), y2: MID + 14, stroke: "#94a3b8", "stroke-width": 2 }));
  const box = svgEl("rect", { x: x(q1), y: MID - 20, width: Math.max(2, x(q3) - x(q1)), height: 40, rx: 6, fill: "#ede9fe", stroke: "#8b5cf6", "stroke-width": 2 });
  svg.appendChild(box);
  svg.appendChild(svgEl("line", { x1: x(med), y1: MID - 20, x2: x(med), y2: MID + 20, stroke: "#2563eb", "stroke-width": 3 }));

  // Median label goes above the box so it never collides with Q1/Q3.
  const medLabel = svgEl("text", { x: x(med), y: MID - 30, "text-anchor": "middle", "font-size": 11, "font-weight": 700, fill: "#2563eb" });
  medLabel.textContent = "median=" + formatNumber(med);
  svg.appendChild(medLabel);

  // min / Q1 / Q3 / max labels are placed below, staggered into two rows
  // so close values do not overlap.
  const points = [
    { v: lo, label: "min" },
    { v: q1, label: "Q1" },
    { v: q3, label: "Q3" },
    { v: hi, label: "max" },
  ];
  const rows = [[], []]; // each row: last used right-edge x position
  const placed = [null, null];
  points
    .slice()
    .sort(function (a, b) {
      return x(a.v) - x(b.v);
    })
    .forEach(function (item) {
      const px = x(item.v);
      let row = 0;
      if (placed[0] !== null && px - placed[0] < 62) row = 1;
      if (row === 1 && placed[1] !== null && px - placed[1] < 62) row = 0; // fall back; collisions still avoided in practice
      placed[row] = px;
      const t = svgEl("text", {
        x: px,
        y: MID + 38 + row * 18,
        "text-anchor": "middle",
        "font-size": 11,
        fill: "#475569",
      });
      t.textContent = item.label + "=" + formatNumber(item.v);
      svg.appendChild(t);
    });
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

    const q = quartiles(numbers);
    setText("r_q1", formatNumber(q.q1));
    setText("r_q3", formatNumber(q.q3));
    setText("r_iqr", q.q1 === null || q.q3 === null ? "N/A" : formatNumber(q.q3 - q.q1));

    const sortedView = document.getElementById("sortedView");
    const sorted = numbers.slice().sort(function (a, b) {
      return a - b;
    });
    sortedView.textContent = "Sorted data: " + sorted.map(formatNumber).join(", ");
    sortedView.classList.add("show");

    renderHistogram(numbers);
    renderBoxPlot(numbers);
    document.getElementById("vizContent").hidden = false;
    document.getElementById("vizHint").textContent = "";

    tableEl.hidden = false;
  } catch (err) {
    errorEl.textContent = err.message;
    document.getElementById("parsedLine").textContent = "";
    document.getElementById("sortedView").classList.remove("show");
    document.getElementById("sortedView").textContent = "";
    document.getElementById("vizContent").hidden = true;
    document.getElementById("vizHint").textContent = "Press Calculate to see the histogram and box plot.";
    tableEl.hidden = true;
  }
}

function collectResults() {
  const rows = document.getElementById("resultTable").getElementsByTagName("tr");
  const results = [];
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName("th");
    const values = rows[i].getElementsByTagName("td");
    if (cells.length > 0 && values.length > 0) {
      results.push({ label: cells[0].textContent, value: values[0].textContent });
    }
  }
  return results;
}

function hasResults() {
  return !document.getElementById("resultTable").hidden;
}

function setExportStatus(text) {
  document.getElementById("exportStatus").textContent = text;
}

function handleCopy() {
  if (!hasResults()) {
    setExportStatus("No results to copy yet. Press Calculate first.");
    return;
  }
  const lines = collectResults().map(function (r) {
    return r.label + ": " + r.value;
  });
  const text = lines.join("\n");

  function done() {
    setExportStatus("Results copied to clipboard.");
  }
  function fallback() {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(ta);
    setExportStatus(ok ? "Results copied to clipboard." : "Copy failed. Please copy manually.");
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, fallback);
  } else {
    fallback();
  }
}

function handleDownload() {
  if (!hasResults()) {
    setExportStatus("No results to download yet. Press Calculate first.");
    return;
  }
  function csvField(s) {
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  const lines = ["statistic,value"];
  collectResults().forEach(function (r) {
    lines.push(csvField(r.label) + "," + csvField(r.value));
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "statistics.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  setExportStatus("CSV downloaded.");
}

function clearAll() {
  document.getElementById("input").value = "";
  document.getElementById("error").textContent = "";
  document.getElementById("parsedLine").textContent = "";
  document.getElementById("resultTable").hidden = true;
  setExportStatus("");
  document.getElementById("sortedView").classList.remove("show");
  document.getElementById("sortedView").textContent = "";
  document.getElementById("vizContent").hidden = true;
  document.getElementById("vizHint").textContent = "Press Calculate to see the histogram and box plot.";
  updateInputCount();
}

function updateInputCount() {
  const el = document.getElementById("inputCount");
  const value = document.getElementById("input").value;
  if (String(value).trim() === "") {
    el.textContent = "";
    el.classList.remove("warn");
    return;
  }
  try {
    const nums = parseInput(value);
    el.textContent = nums.length === 1 ? "1 value detected" : nums.length + " values detected";
    el.classList.remove("warn");
  } catch (e) {
    el.textContent = "Some tokens look invalid — check your separators and numbers.";
    el.classList.add("warn");
  }
}

document.getElementById("btnCalc").addEventListener("click", calculate);
document.getElementById("btnClear").addEventListener("click", clearAll);
document.getElementById("btnCopy").addEventListener("click", handleCopy);
document.getElementById("btnDownload").addEventListener("click", handleDownload);
document.getElementById("btnSample").addEventListener("click", function () {
  document.getElementById("input").value = "4, 8, 15, 16, 23, 42, 8, 16, 4, 11";
  updateInputCount();
});
document.getElementById("input").addEventListener("input", updateInputCount);
document.getElementById("input").addEventListener("keydown", function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    calculate();
  }
});
