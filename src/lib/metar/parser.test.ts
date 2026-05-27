import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseClouds,
  parseMetar,
  parsePressure,
  parseTemperature,
  parseVisibility,
  parseWind,
} from './parser.ts';

test('parseWind: valid token', () => {
  assert.deepEqual(parseWind('27012KT'), { direction: 270, speedKt: 12 });
});

test('parseWind: invalid token', () => {
  assert.equal(parseWind('VRB03KT'), null);
});

test('parseVisibility: valid token', () => {
  assert.deepEqual(parseVisibility('9999'), { meters: 9999 });
});

test('parseVisibility: invalid token', () => {
  assert.equal(parseVisibility('10SM'), null);
});

test('parseClouds: valid token', () => {
  assert.deepEqual(parseClouds('FEW030'), { coverage: 'FEW', heightFt: 3000 });
});

test('parseClouds: invalid token', () => {
  assert.equal(parseClouds('CLR'), null);
});

test('parseTemperature: valid token', () => {
  assert.deepEqual(parseTemperature('18/10'), { temperatureC: 18, dewPointC: 10 });
});

test('parseTemperature: negative values', () => {
  assert.deepEqual(parseTemperature('M02/M05'), { temperatureC: -2, dewPointC: -5 });
});

test('parseTemperature: invalid token', () => {
  assert.equal(parseTemperature('18//10'), null);
});

test('parsePressure: valid token', () => {
  assert.deepEqual(parsePressure('Q1015'), { qnhHpa: 1015 });
});

test('parsePressure: invalid token', () => {
  assert.equal(parsePressure('A2992'), null);
});

test('parseMetar: parses common fixture', () => {
  const fixture = 'EPWA 261200Z 27012KT 9999 FEW030 18/10 Q1015';
  assert.deepEqual(parseMetar(fixture), {
    station: 'EPWA',
    observationTime: '261200Z',
    wind: { direction: 270, speedKt: 12 },
    visibility: { meters: 9999 },
    clouds: [{ coverage: 'FEW', heightFt: 3000 }],
    temperature: { temperatureC: 18, dewPointC: 10 },
    pressure: { qnhHpa: 1015 },
  });
});

test('parseMetar: invalid groups resolve to null/empty', () => {
  assert.deepEqual(parseMetar('EPWA 261200Z BADWIND XXXX CLR XX/YY Q10'), {
    station: 'EPWA',
    observationTime: '261200Z',
    wind: null,
    visibility: null,
    clouds: [],
    temperature: null,
    pressure: null,
  });
});
