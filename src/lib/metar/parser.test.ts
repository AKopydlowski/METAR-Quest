import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseAltimeter,
  parseCloud,
  parseMetar,
  parseRunwayVisualRange,
  parseTemperature,
  parseVisibility,
  parseWeatherPhenomenon,
  parseWind,
} from './parser.ts';

test('parseWind: valid token', () => {
  assert.deepEqual(parseWind('27012KT'), { direction: 270, speedKt: 12, gustKt: undefined });
});

test('parseWind: variable and calm tokens', () => {
  assert.deepEqual(parseWind('VRB03KT'), { direction: null, speedKt: 3, gustKt: undefined });
  assert.deepEqual(parseWind('00000KT'), { direction: 0, speedKt: 0, gustKt: undefined });
  assert.deepEqual(parseWind('27012G22KT'), { direction: 270, speedKt: 12, gustKt: 22 });
});

test('parseWind: invalid token', () => {
  assert.equal(parseWind('BADWIND'), undefined);
});

test('parseVisibility: valid token', () => {
  assert.deepEqual(parseVisibility('9999'), { statuteMiles: 6.2, raw: '9999' });
});

test('parseVisibility: CAVOK and fractions', () => {
  assert.deepEqual(parseVisibility('CAVOK'), { statuteMiles: 6.2, raw: 'CAVOK', cavok: true });
  assert.deepEqual(parseVisibility('1/2SM'), { statuteMiles: 0.5, raw: '1/2SM' });
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

test('parseCloud: low ceiling and convective cloud tokens', () => {
  assert.deepEqual(parseCloud('BKN008'), { coverage: 'BKN', baseFtAgl: 800, cloudType: undefined });
  assert.deepEqual(parseCloud('OVC003'), { coverage: 'OVC', baseFtAgl: 300, cloudType: undefined });
  assert.deepEqual(parseCloud('VV002'), { coverage: 'VV', baseFtAgl: 200, cloudType: undefined });
  assert.deepEqual(parseCloud('SCT030CB'), { coverage: 'SCT', baseFtAgl: 3000, cloudType: 'CB' });
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

test('parseAltimeter: valid tokens', () => {
  assert.deepEqual(parseAltimeter('Q1015'), { hectopascals: 1015, inchesHg: 29.97 });
  assert.deepEqual(parseAltimeter('A2992'), { inchesHg: 29.92 });
});

test('parseAltimeter: invalid token', () => {
  assert.equal(parseAltimeter('Q10'), undefined);
});

test('parseRunwayVisualRange: metric and imperial groups', () => {
  assert.deepEqual(parseRunwayVisualRange('R27/0800'), { runway: '27', rangeMeters: 800, rangeFt: undefined, tendency: undefined, raw: 'R27/0800' });
  assert.deepEqual(parseRunwayVisualRange('R09L/P6000FT/U'), { runway: '09L', rangeMeters: undefined, rangeFt: 6000, tendency: 'U', raw: 'R09L/P6000FT/U' });
});

test('parseWeatherPhenomenon: weather codes', () => {
  assert.deepEqual(parseWeatherPhenomenon('-RA'), { raw: '-RA', intensity: 'light', descriptors: [], phenomena: ['RA'] });
  assert.deepEqual(parseWeatherPhenomenon('TSRA'), { raw: 'TSRA', intensity: undefined, descriptors: ['TS'], phenomena: ['RA'] });
  assert.deepEqual(parseWeatherPhenomenon('FZFG'), { raw: 'FZFG', intensity: undefined, descriptors: ['FZ'], phenomena: ['FG'] });
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

test('parseMetar: parses variable wind, mixed visibility, weather, RVR, trend, and remarks', () => {
  const parsed = parseMetar('KJFK 121651Z 18012G22KT 150V220 1 1/2SM R04R/1200FT/D TSRA BR BKN008CB 18/16 A2992 TEMPO RMK AO2');
  assert.deepEqual(parsed.wind, { direction: 180, speedKt: 12, gustKt: 22, variable: [150, 220] });
  assert.deepEqual(parsed.visibility, { statuteMiles: 1.5, raw: '1 1/2SM' });
  assert.deepEqual(parsed.runwayVisualRange, [{ runway: '04R', rangeFt: 1200, rangeMeters: undefined, tendency: 'D', raw: 'R04R/1200FT/D' }]);
  assert.deepEqual(parsed.weatherCodes, ['TSRA', 'BR']);
  assert.equal(parsed.clouds[0].cloudType, 'CB');
  assert.deepEqual(parsed.trend, ['TEMPO']);
  assert.equal(parsed.remarks, 'AO2');
  assert.equal(parsed.flightCategory, 'IFR');
});

test('parseMetar: parses CAVOK and NOSIG', () => {
  const parsed = parseMetar('EPPO 281200Z 00000KT CAVOK 20/10 Q1013 NOSIG');
  assert.deepEqual(parsed.wind, { direction: 0, speedKt: 0, gustKt: undefined });
  assert.deepEqual(parsed.visibility, { statuteMiles: 6.2, raw: 'CAVOK', cavok: true });
  assert.deepEqual(parsed.trend, ['NOSIG']);
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
