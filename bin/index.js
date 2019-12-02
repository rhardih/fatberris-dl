#!/usr/bin/env node

const ProgressBar = require('progress');
const http = require('http');
const path = require('path');
const sanitize = require("sanitize-filename");
const { execSync } = require( 'child_process' );

const url = 'http://m.fatberris.com';
const listUrl = `${url}/list.json`;
var list; 

const getGenre = (dir, files, cb) => {
  execSync(`mkdir -p ${dir}`);

  files.forEach((file, index) => {
    let srcFile = `${url}/${encodeURI(file.file)}`;
    let dstFil;

    if (file.artist) {
      dstFile = `${file.artist} - ${file.title}.mp3`;
    } else {
      dstFile = path.basename(file.file);
    }

    dstFile = sanitize(dstFile);

    let curlCmd = `curl -s -o "${dstFile}" "${srcFile}"`;
    execSync(`pushd ${dir} && ${curlCmd} && popd`);
    cb(index, file.file)
  });
};

const getAll = list => {
  const downtempo = list['downtempo'];
  const uptempo = list['uptempo'];
  const sundaychillsession = list['sundaychillsession'];
  const length = downtempo.length + uptempo.length + sundaychillsession.length;

  var bar = new ProgressBar('Downloading :current/:total [:bar] :percent ETA: :etas - :filename', {
    complete: '=',
    incomplete: ' ',
    width: 30,
    curr: 0,
    total: length
  });

  const tick = (i, name) => bar.tick(1, { filename: name });

  getGenre('downtempo', downtempo, tick);
  getGenre('uptempo', uptempo, tick);
  getGenre('sundaychillsession', sundaychillsession, tick);
};

http.get(listUrl, res => {
  let body = '';

  res.on('data', chunk => body += chunk);
  res.on('end', () => getAll(JSON.parse(body)));
}).on('error', console.error);
