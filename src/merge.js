import csv from 'csvtojson';
import path from 'path';
import Promise from 'bluebird';

const fs = Promise.promisifyAll(require('fs'));
const arr = [];


function convertToCsv(objArray) {
  const array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  let str = '';

  for (let i = 0; i < array.length; i++) {
    let line = '';
    for (const index in array[i]) {
      if (line != '') line += '^';

      line += array[i][index];
    }

    str += `${line}\r\n`;
  }

  return str;
}

let nutrient = '';

fs.readdirAsync('./csvs').map(file => {
  csv({ noheader: true })
    .fromFile(`./csvs/${file}`)
    .on('json', obj => {
      if (Object.keys(obj).length === 1) {
        return;
      } else if (Object.keys(obj).length === 6) {
        const regex = /(.*)".*,\n(.*?),"(.*)/m;

        obj['field3'].replace(regex, (match, p1, p2, p3, offset, string) => {
          nutrient = p1;
          arr.push({
            id: p2,
            name: p3,
            nutrient,
            weight: obj.field4,
          });
        });
        return;
      } else {
        const { field1, field2, field3 } = obj;
        arr.push({
          id: field1,
          name: field2,
          nutrient,
          weight: field3,
        });
        return;
      }
    })
    .on('done', error => {
      fs.writeFileSync('./all.csv', convertToCsv(arr));
    });
});
