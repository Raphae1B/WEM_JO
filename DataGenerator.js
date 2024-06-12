//import { timeFormat } from 'd3';
// import { timeFormat } from 'https://d3js.org/d3-time-format.v3.min.js';
import { timeFormat } from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
const brands = [
  'Alcatel',
  'Apple',
  'Google',
  'Huawei',
  'LG',
  'Motorola',
  'Nokia',
  'Razer',
  'Samsung',
  'Xiaomi',
  'HTC',
  'Sony',
  'BlackBerry',
  'Palm',
  'ZTE',
  'Oppo',
  'Lenovo',
];

export function generateDataSets({ size = 1 }) {
  const dataSets = [];
  const currentYear = +timeFormat('%Y')(new Date());
  const maxLimitForValue = 2000;
  const minLimitForValue = 200;
  const maximumModelCount = 90;

  for (let i = 0; i < size; i++) {
    dataSets.push({
      date: currentYear - (size - (i + 1)),
      dataSet: brands
        .sort(function () {
          return Math.random() - 0.5;
        })
        .slice(0, maximumModelCount)
        .map((brand) => ({
          name: brand,
          value: Math.random() * (maxLimitForValue - minLimitForValue) + minLimitForValue,
        })),
    });
  }
  console.log(dataSets);
  return dataSets;
}
