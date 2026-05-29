import test from "node:test";
import assert from "node:assert/strict";
import { parseMetar } from "../metar/parser.ts";
import { assessWeatherDecision } from "./decisionEngine.ts";

test("assessWeatherDecision: student VFR rejects low IFR weather", () => {
  const metar = parseMetar("KJFK 121651Z 18012G22KT 1 1/2SM TSRA BKN008CB 18/16 A2992 TEMPO");
  const assessment = assessWeatherDecision("student-vfr", metar, "NO-GO");
  assert.equal(assessment.expected, "NO-GO");
  assert.equal(assessment.match, true);
  assert.equal(assessment.trainingFocus, "visibility");
  assert.ok(assessment.risks.some((risk) => risk.id === "visibility-minimum"));
});

test("assessWeatherDecision: PPL VFR flags marginal but usable VFR", () => {
  const metar = parseMetar("EPWA 121200Z 22014G24KT 6SM BKN025 12/08 Q1010");
  const assessment = assessWeatherDecision("ppl-vfr", metar, "CAUTION");
  assert.equal(assessment.expected, "CAUTION");
  assert.equal(assessment.match, true);
  assert.ok(assessment.risks.some((risk) => risk.severity === "caution"));
});

test("assessWeatherDecision: IFR profile can accept clean VFR", () => {
  const metar = parseMetar("EPPO 281200Z 00000KT CAVOK 20/10 Q1013 NOSIG");
  const assessment = assessWeatherDecision("ifr-brief", metar, "GO");
  assert.equal(assessment.expected, "GO");
  assert.equal(assessment.match, true);
  assert.equal(assessment.keyToken, "VFR");
});
