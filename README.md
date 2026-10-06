# Descriptive Statistics Calculator

A descriptive statistics calculator that runs entirely in the browser with plain HTML, CSS, and JavaScript.

## Features

- Count (n)
- Sum
- Mean
- Median
- Mode
- Minimum (min)
- Maximum (max)
- Range
- Population variance and population standard deviation
- Sample variance and sample standard deviation (n − 1 divisor)

## Input rules

- Numbers are separated by spaces, commas, semicolons, or newlines.
- Period (`.`) is the decimal separator.
- `1,5` is read as two numbers: `1` and `5`.
- Each token must match `/^[+-]?(\d+\.?\d*|\.\d+)$/` — plain decimals only, optionally signed; forms like `.5` and `5.` are accepted.

## Output formatting

- Up to 6 decimal places, with trailing zeros removed.
- No thousands separator.
- `-0` and values that round to zero are shown as `0`.
- Undefined values are shown as `N/A`.

## Error handling

- Empty input → "Please enter a list of numbers."
- Invalid token → "Invalid token: '<value>'. Only decimal numbers are allowed (period is the decimal separator)."
- Non-finite / too large number → "Invalid token: '<value>' (number too large or infinite)."

The error names the offending token. On error, the result table is hidden and the parsed-numbers line is cleared.

## Edge cases

- Single value: mean, median, min, max, range, and population statistics are computed; sample variance and sample standard deviation show `N/A`.
- Multiple modes: all of them are listed, comma-separated.
- No mode (every value appears exactly once): mode shows `None`.
- More than 50 numbers: the "Parsed N numbers: ..." line lists the first 50 numbers followed by `...`.

## How to run locally

Open `index.html` in any modern browser. No dependencies, no build step, no server required.

## Manual tests

Expected results:

| Input | Expected result |
| --- | --- |
| `2, 4, 4, 4, 5, 5, 7, 9` | n = 8, sum = 40, mean = 5, median = 4.5, mode = 4, min = 2, max = 9, range = 7, population variance = 4, population SD = 2, sample variance = 4.571429, sample SD = 2.13809 |
| `10, 9, 2` | median = 9 |
| `1, 1, 2, 2, 3` | mode = "1, 2" |
| `1, 2, 3, 4` | median = 2.5 |
| `1,5` | "Parsed 2 numbers: 1, 5", n = 2, sum = 6, mean = 3 |
| `7` | mode = "None", population SD = 0, sample variance = N/A, sample SD = N/A |
| `1, 2, 3` | mode = "None" |
| `-0.0000001` | mean shows `0` |
| `0x10`, `Infinity`, `abc` | error naming the invalid token |
| very long digit string (e.g. 400 digits) | error: number too large or infinite |

## Project structure

```
my-first-web/
├── index.html   # Page markup
├── style.css    # Styles (responsive, mobile-first)
├── script.js    # Parsing, statistics, and UI logic
└── README.md
```
