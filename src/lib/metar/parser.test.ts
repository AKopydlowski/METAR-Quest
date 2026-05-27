import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseAltimeter,
  parseCloud,
  parseMetar,
  parseTemperature,
  parseVisibility,
  parseWind,
} from './parser.ts';

test('parseWind: valid token', () => {
  assert.deepEqual(parseWind('27012KT'), { direction: 270, speedKt: 12 });
});

test('parseWind: invalid token', () => {
  assert.equal(parseWind('BADWIND'), undefined);
});

test('parseVisibility: valid token', () => {
  assert.deepEqual(parseVisibility('9999'), { statuteMiles: 6.2, raw: '9999' });
});

test('parseVisibility: invalid token', () => {
  assert.equal(parseVisibility('XXXX'), undefined);
});

test('parseCloud: valid token', () => {
  assert.deepEqual(parseCloud('FEW030'), {
    coverage: 'FEW',
    baseFtAgl: 3000,
    cloudType: undefined,
  });
});

test('parseCloud: invalid token', () => {
  assert.equal(parseCloud('BAD'), undefined);
});

test('parseTemperature: valid token', () => {
  assert.deepEqual(parseTemperature('18/10'), { celsius: 18, dewpointCelsius: 10 });
});

test('parseTemperature: negative values', () => {
  assert.deepEqual(parseTemperature('M02/M05'), { celsius: -2, dewpointCelsius: -5 });
});

test('parseTemperature: invalid token', () => {
  assert.equal(parseTemperature('18//10'), undefined);
});

test('parseAltimeter: valid token', () => {
  assert.deepEqual(parseAltimeter('Q1015'), { hectopascals: 1015, inchesHg: 29.97 });
});

test('parseAltimeter: invalid token', () => {
  assert.equal(parseAltimeter('Q10'), undefined);
});

test('parseMetar: parses common fixture', () => {
  const fixture = 'EPWA 261200Z 27012KT 9999 FEW030 18/10 Q1015';
  const parsed = parseMetar(fixture);
  assert.equal(parsed.station, 'EPWA');
  assert.equal(parsed.observedAt, '261200Z');
  assert.equal(parsed.rawText, fixture);
  assert.deepEqual(parsed.wind, { direction: 270, speedKt: 12, gustKt: undefined });
  assert.deepEqual(parsed.visibility, { statuteMiles: 6.2, raw: '9999' });
  assert.deepEqual(parsed.clouds, [
    { coverage: 'FEW', baseFtAgl: 3000, cloudType: undefined },
  ]);
  assert.deepEqual(parsed.temperature, { celsius: 18, dewpointCelsius: 10 });
  assert.deepEqual(parsed.altimeter, { hectopascals: 1015, inchesHg: 29.97 });
  assert.deepEqual(parsed.weatherCodes, []);
  assert.equal(parsed.flightCategory, 'VFR');
});

test('parseMetar: invalid groups resolve to null/empty', () => {
  const parsed = parseMetar('EPWA 261200Z BADW1ND 12XX XXX0 XX/YY Q10');
  assert.equal(parsed.station, 'EPWA');
  assert.equal(parsed.observedAt, '261200Z');
  assert.equal(parsed.wind, undefined);
  assert.equal(parsed.visibility, undefined);
  assert.deepEqual(parsed.clouds, []);
  assert.equal(parsed.temperature, undefined);
  assert.equal(parsed.altimeter, undefined);
});
