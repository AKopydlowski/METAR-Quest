import assert from 'node:assert/strict';
import test from 'node:test';
import { assessTafMissionWindow, parseTafTimeline } from './taf.ts';

test('parseTafTimeline: splits FM TEMPO BECMG and PROB groups with risk', () => {
  const taf = 'TAF KJFK 121130Z 1212/1318 18012KT P6SM SCT040 TEMPO 1218/1222 3SM TSRA BKN020CB FM130000 22010KT P6SM BKN050 PROB30 1306/1310 1SM FG OVC004';
  const timeline = parseTafTimeline(taf);
  assert.equal(timeline.length, 4);
  assert.equal(timeline[1].kind, 'temporary');
  assert.equal(timeline[1].risk, 'high');
  assert.equal(timeline[3].kind, 'probability');
  assert.equal(timeline[3].risk, 'high');
});

test('assessTafMissionWindow: recommends NO-GO for high-risk mission window', () => {
  const taf = 'TAF KJFK 121130Z 1212/1318 18012KT P6SM SCT040 PROB30 1306/1310 1SM FG OVC004';
  const assessment = assessTafMissionWindow(taf, 7, 9);
  assert.equal(assessment.recommendation, 'NO-GO');
});
