# Methodology

This document describes exactly how the calculator in `script.js` computes and formats its results. It was written to match the actual code — if the code changes, this document should be updated too.

## Parsing input

1. The input string is split on the delimiters whitespace, comma (`,`), and semicolon (`;`) — i.e. the regex `/[\s,;]+/`. Newlines are whitespace, so they act as separators too.
2. Empty tokens are discarded. If no tokens remain, the error is:
   `Please enter a list of numbers.`
3. Each token must match:
   `/^[+-]?(\d+\.?\d*|\.\d+)$/`

   This accepts plain decimals with an optional sign, including the forms `5`, `5.`, `.5`, `+5`, `-5.25`. It rejects things like `0x10`, `Infinity`, `NaN`, `1e3`, and letters. On failure the error is:
   `Invalid token: '<token>'. Only decimal numbers are allowed (period is the decimal separator).`
4. Each token is converted with `Number(token)` and must satisfy `Number.isFinite(value)`. Otherwise:
   `Invalid token: '<token>' (number too large or infinite).`

Consequences worth knowing:

- `1,5` is read as two numbers, `1` and `5`, because the comma is a separator, not a decimal mark.
- `.` is always the decimal separator; there is no thousands separator in the input format.

## Statistics

Let `n` be the number of parsed values, `xᵢ` the values, and `x̄` their mean.

| Statistic | Formula / rule |
| --- | --- |
| Count (n) | Number of values |
| Sum | Σ xᵢ |
| Mean (x̄) | (Σ xᵢ) / n |
| Median | The values are sorted numerically (a numeric comparison `(a, b) => a - b` on a copy of the data). If n is odd, the middle element; if n is even, the average of the two middle elements. |
| Mode | The value(s) with the highest frequency. If every value occurs exactly once, the mode is shown as `None`. When several values share the highest frequency, all of them are listed (comma-separated, sorted numerically). |
| Minimum (min) | Smallest value |
| Maximum (max) | Largest value |
| Range | max − min |
| Q1 | Median of the lower half of the sorted data (the overall median excluded when n is odd) |
| Q3 | Median of the upper half of the sorted data (the overall median excluded when n is odd) |
| IQR | Q3 − Q1 |
| Population variance (σ²) | Σ (xᵢ − x̄)² / n |
| Population standard deviation (σ) | √σ² |
| Sample variance (s²) | Σ (xᵢ − x̄)² / (n − 1) |
| Sample standard deviation (s) | √s² |

### The n vs n − 1 rule

- Population statistics divide the sum of squared deviations by `n`.
- Sample statistics divide the same sum by `n − 1` (Bessel's correction).
- Sample variance and standard deviation require at least two values: with a single value they are `null` internally and displayed as `N/A`. With a single value, Q1 and Q3 are also `null`, so IQR shows `N/A`.

## Output formatting

Every numeric result passes through `formatNumber`:

1. `null`, `undefined`, or `NaN` → `"N/A"`.
2. Otherwise the value is rounded with `toFixed(6)` — at most 6 decimal places — and converted back with `Number(...)`, which strips trailing zeros.
3. If the rounded value equals `0`, it is displayed as `"0"`, which also normalizes `-0`.
4. The result is rendered as a plain string — the period is the decimal separator and there is no thousands separator (e.g. `12345.678901` is shown as-is, not `12,345.678901`).

## Parsed-input line

After a successful calculation the page shows:

`Parsed 1 number: 7` or `Parsed N numbers: x1, x2, ...`

When there are more than 50 numbers, only the first 50 are listed, followed by `", ..."`.

## Exporting results

- **Copy results** puts a plain-text summary (`Label: value` per line) on the clipboard, using `navigator.clipboard` with a `textarea` + `execCommand('copy')` fallback.
- **Download CSV** downloads `statistics.csv` with two columns: `statistic,value`. Fields containing commas, quotes, or newlines are quoted per standard CSV rules.
- If there are no results yet (Calculate not pressed or an error occurred), both actions show `No results to copy/download yet. Press Calculate first.` instead of producing output.

## Visualizations

- **Histogram** (SVG): the data range is split into equal-width bins; each bar's height is the bin frequency. Hover a bar to see its range and count. The number of bins is `min(10, max(4, ceil(n / 3)))`. When all values are identical, a single bar shows their count.
- **Box plot** (SVG): whiskers span min to max; the box spans Q1 to Q3; the median is the vertical line inside the box.

Both charts are rebuilt from the parsed data each time **Calculate** is pressed and use the same numeric formatting as the results.

## Extras

- **Sample data** button fills the input with `4, 8, 15, 16, 23, 42, 8, 16, 4, 11`.
- **Ctrl/Cmd + Enter** inside the textarea triggers calculation.
- A live counter under the textarea shows how many values were detected, or a warning when some tokens look invalid.
- A sorted-data line appears above the results after each calculation.
