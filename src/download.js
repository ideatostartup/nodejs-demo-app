import { exec } from 'child_process';
import https from 'https';
import fs from 'fs';

const download = (url, dest, cb) => {
  const file = fs.createWriteStream(dest);
  const request = https
    .get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(cb); // close() is async, call cb after close completes.
      });
    })
    .on('error', err => {
      // Handle errors
      fs.unlinkSync(dest); // Delete the file async. (But we don't check the result)
      if (cb) cb(err.message, dest);
    });
};

for (let i = 100; i < 1000; i++) {
  const url = `https://ndb.nal.usda.gov/ndb/nutrients/download?nutrient1=${i}&nutrient2=&nutrient3=&fg=18&fg=8&fg=20&fg=1&fg=4&fg=9&fg=16&fg=12&fg=2&fg=11&subset=1&sort=c&totCount=10000&max=&measureby=g`;
  const dest = `${i}.csv`;
  download(url, dest, (a, s) => {
    console.log(a, s);
  });
}
