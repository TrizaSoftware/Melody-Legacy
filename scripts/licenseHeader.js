// Copyright (c) 2020-2021 T:Riza Corporation. All rights reserved.
// The full license is available in the LICENSE file at the root of this project.

const fs = require('fs');
const path = require('path');
const { EOL } = require('os');

const getLicenseText = (eol) =>
  `// Copyright (c) 2020-2021 T:Riza Corporation. All rights reserved.${eol}` +
  `// The full license is available in the LICENSE file at the root of this project.${eol}`;

const getOldLicenseText = (eol) => '';

const write = process.argv[2] == '--write';
const projectRoot = path.join(__dirname, '../');
let error = false;

const checkHeader = (contents) => {
  const eol = (() => {
    const LF = contents.indexOf('\n');
    if (LF == -1) return EOL;
    if (LF == 0) return '\n';
    if (contents[LF - 1] == '\r') return '\r\n';
    return '\n';
  })();
  const LICENSE_TEXT = getLicenseText(eol);
  const OLD_LICENSE_TEXT = getOldLicenseText(eol);

  if (contents.startsWith(LICENSE_TEXT + eol)) return contents;
  if (contents.startsWith(OLD_LICENSE_TEXT + eol)) return LICENSE_TEXT + contents.substr(OLD_LICENSE_TEXT.length);

  let i = contents.indexOf(LICENSE_TEXT);
  if (i > -1) return LICENSE_TEXT + eol + contents.substr(0, i) + contents.substr(i + LICENSE_TEXT.length);

  i = contents.indexOf(OLD_LICENSE_TEXT);
  if (i > -1) return LICENSE_TEXT + eol + contents.substr(0, i) + contents.substr(i + OLD_LICENSE_TEXT.length);

  return LICENSE_TEXT + eol + contents;
};

const readDir = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      readDir(filePath);
    } else if (file.endsWith('.ts')) {
      const fileIdentifier = filePath.substr(projectRoot.length);
      const contents = fs.readFileSync(filePath, 'utf8');
      const newContents = checkHeader(contents);
      if (contents == newContents) continue;
      if (write) {
        fs.writeFileSync(filePath, newContents);
        console.log(`[\u001b[32mfixed\u001b[0m] ${fileIdentifier}`);
      } else {
        error = true;
        console.log(`[\u001b[33mwarn\u001b[0m] ${fileIdentifier}`);
      }
    }
  }
};

console.log('Checking license headers...');
readDir(path.join(projectRoot, 'src'));
console.log((error ? 'Some files did not' : 'All files') + ' include a proper license header.');
