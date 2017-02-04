#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');
const exec = require('child_process').execSync;

const co      = require('co');
const tts     = require('google-tts-api');
const program = require('commander');

const pkg      = require('./package.json');
const download = require('./download');
const player   = require('./player');

// show package.json
function info () {
  for (let k in pkg.config) {
    console.log(`  ${k} = ${pkg.config[k]}`);
  }
}

// save package.json
function save () {
  fs.writeFileSync(
    path.resolve(__dirname, './package.json'),
    JSON.stringify(pkg, null, 2) + '\n'
  );
}

program
  .usage('<sentence>')
  .version(pkg.version)
  .option('-p, --path [path]', "download to target path")
  .option('-r, --rate <rate>', "speed rate (0.5 ~ 2.0), default: 1.4")
  .parse(process.argv);

// init target path
if (pkg.config.path === '') {
  pkg.config.path = __dirname;
  save();
}

// show help info if input is empty
if (process.argv.length <= 2) {
  info();
  program.help();
  // process.exit();
}

// 1. set target path
if (program.path === true) {
  info();
} else if (typeof program.path === 'string') {
  pkg.config.path = program.path;
  save();
  info();
}

// 2. set rate
if (program.rate === true) {
  info();
} else if (typeof program.rate === 'string') {
  const rate = Number.parseFloat(program.rate);
  if (isNaN(rate)) {
    console.log(`rate '${program.rate}' should be a float number`);
    process.exit();
  }

  pkg.config.rate = rate;
  save();
  info();
}

// check args
if (program.args.length === 0) {
  process.exit();
}

// start
co(function * () {

  // 1. get URL
  const sentence = program.args[0];
  console.log(sentence);
  const url = yield tts(sentence, 'zh-tw');

  // 2. download to tmp file
  const tmp = path.resolve(__dirname, './translate_tts.mp3');
  yield download(url, tmp);

  // 3. convert tmp file with the rate
  const rate = pkg.config.rate;
  const target = path.resolve(pkg.config.path, `./translate_tts@${rate}.mp3`);
  exec(`ffmpeg -i ${tmp} -codec:a libmp3lame -filter:a "atempo=${rate}" -loglevel 0 -vn ${target} -y`);

  // 4. afplay for Mac
  exec(`${player} ${target}`);
})
.catch(e => {
  console.error(e.stack);
});
