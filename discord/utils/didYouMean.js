const osaDistance = (a, b) => {
  const d = new Array(a.length + 1).fill().map(() => new Array(b.length + 1));
  for (let i = 0; i <= a.length; i++) {
    d[i][0] = i;
  }
  for (let j = 0; j <= b.length; j++) {
    d[0][j] = j;
  }
  let correction = 0;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      let cost;
      if (a[i-1] == b[j-1]) {
        cost = 0;
      } else {
        cost = 1;
      }
      d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1);
      if (i > 1 && j > 1 && a[i-1] == b[j-2] && a[i-2] == b[j-1]) {
        d[i][j] = Math.min(d[i][j], d[i-2, j-2] + 1);
      }
      if (cost == 1 && d[i-1][j-1] + 1 < d[i][j]) {
        correction += keyboardDistance(a[i-1], b[j-1]) / 10 / a.length;
      }
      d[i][j] = Math.min(d[i][j], d[i-1][j-1] + cost);
    }
  }
  return d[a.length][b.length] + correction;
}

const keyboardLayout = [ "qwertyuiop", "asdfghjkl", "zxcvbnm" ];
const keyOffsets = [ 0, 0.25, 0.75 ];

const keyboardDistance = (a, b) => {
  let xa = -1, ya = -1, xb = -1, yb = -1;
  for (let y = 0; y <= 2; y++) {
    for (let x = 0; x < keyboardLayout[y].length; x++) {
      if (xa == -1 && keyboardLayout[y][x] == a.toLowerCase()) {
        xa = x + keyOffsets[y];
        ya = y;
      }
      if (xb == -1 && keyboardLayout[y][x] == b.toLowerCase()) {
        xb = x + keyOffsets[y];
        yb = y;
      }
    }
  }
  if (xa == -1 || xb == -1) return 0;
  return Math.sqrt((xb-xa)**2 + (yb-ya)**2);
}

const didYouMean = (input, options, threshold = 0.3, caseSensitive = true) => {
  if (options.length == 0) {
    throw new Error("There must be at least one option");
  }
  if (caseSensitive) input = input.toLowerCase();
  let min = Infinity;
  let minOption;
  for (let i in options) {
    let option = caseSensitive ? options[i].toLowerCase() : options[i];
    if (input == option ) {
      return {
        match: true,
        result: options[i],
      }
    }
    let distance = osaDistance(input, option);
    if (distance < min) {
      min = distance;
      minOption = options[i];
    }
  }
  if (min / minOption.length <= threshold) {
    return {
      match: false,
      result: minOption,
    }
  }
  return {
    match: false,
    result: null,
  }
}

module.exports = didYouMean;
