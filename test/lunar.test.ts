import { expect, test } from "bun:test";
import path from "node:path";

import { Lunar } from "../src/lunar";

type Case = {
  y: number;
  m: number;
  d: number;
  hh: number;
  mm: number;
  godType: "8char" | "cnlunar";
  year8Char: "year" | "beginningOfSpring";
};

function runPythonOracle(repoRoot: string, c: Case): any {
  const payloadJson = JSON.stringify(c);
  const py = `
import json
import datetime
import cnlunar

p = json.loads(${JSON.stringify(payloadJson)})
dt = datetime.datetime(p["y"], p["m"], p["d"], p["hh"], p["mm"])
a = cnlunar.Lunar(dt, godType=p["godType"], year8Char=p["year8Char"])

out = {
  "date": dt.strftime("%Y-%m-%d %H:%M:%S"),
  "godType": a.godType,
  "isLunarLeapMonth": a.isLunarLeapMonth,
  "lunarYear": a.lunarYear,
  "lunarMonth": a.lunarMonth,
  "lunarDay": a.lunarDay,
  "lunarYearCn": a.lunarYearCn,
  "lunarMonthCn": a.lunarMonthCn,
  "lunarDayCn": a.lunarDayCn,
  "phaseOfMoon": a.phaseOfMoon,
  "todaySolarTerms": a.todaySolarTerms,
  "nextSolarTerm": a.nextSolarTerm,
  "nextSolarTermDate": list(a.nextSolarTermDate),
  "nextSolarTermYear": a.nextSolarTermYear,
  "thisYearSolarTermsDic": a.thisYearSolarTermsDic,
  "lunarSeason": a.lunarSeason,
  "year8Char": a.year8Char,
  "month8Char": a.month8Char,
  "day8Char": a.day8Char,
  "twohour8Char": a.twohour8Char,
  "twohour8CharList": a.twohour8CharList,
  "today12DayOfficer": a.today12DayOfficer,
  "today12DayGod": a.today12DayGod,
  "chineseYearZodiac": a.chineseYearZodiac,
  "chineseZodiacClash": a.chineseZodiacClash,
  "weekDayCn": a.weekDayCn,
  "starZodiac": a.starZodiac,
  "todayEastZodiac": a.todayEastZodiac,
  "today28Star": a.today28Star,
  "get_legalHolidays": a.get_legalHolidays(),
  "get_otherHolidays": a.get_otherHolidays(),
  "get_otherLunarHolidays": a.get_otherLunarHolidays(),
  "get_pengTaboo": a.get_pengTaboo(),
  "get_pengTaboo_4_br": a.get_pengTaboo(long=4, delimit=\"<br>\"),
  "get_the28Stars": a.get_the28Stars(),
  "get_nayin": a.get_nayin(),
  "get_today5Elements": a.get_today5Elements(),
  "get_the9FlyStar": a.get_the9FlyStar(),
  "get_luckyGodsDirection": a.get_luckyGodsDirection(),
  "get_fetalGod": a.get_fetalGod(),
  "get_twohourLuckyList": a.get_twohourLuckyList(),
  "goodGodName": a.goodGodName,
  "badGodName": a.badGodName,
  "todayLevel": a.todayLevel,
  "todayLevelName": a.todayLevelName,
  "thingLevelName": a.thingLevelName,
  "goodThing": sorted(a.goodThing),
  "badThing": sorted(a.badThing),
  "meridians": a.meridians,
}

print(json.dumps(out, ensure_ascii=False, sort_keys=True))
`;

  const proc = Bun.spawnSync({
    cmd: ["python3", "-c", py],
    cwd: repoRoot,
    env: { ...process.env, PYTHONPATH: repoRoot },
  });
  if (proc.exitCode !== 0) {
    throw new Error(proc.stderr.toString());
  }
  return JSON.parse(proc.stdout.toString());
}

function tsSnapshot(c: Case): any {
  const dt = new Date(c.y, c.m - 1, c.d, c.hh, c.mm, 0, 0);
  const a = new Lunar(dt, { godType: c.godType, year8Char: c.year8Char });
  return {
    date: `${c.y.toString().padStart(4, "0")}-${c.m.toString().padStart(2, "0")}-${c.d.toString().padStart(2, "0")} ${c.hh
      .toString()
      .padStart(2, "0")}:${c.mm.toString().padStart(2, "0")}:00`,
    godType: a.godType,
    isLunarLeapMonth: a.isLunarLeapMonth,
    lunarYear: a.lunarYear,
    lunarMonth: a.lunarMonth,
    lunarDay: a.lunarDay,
    lunarYearCn: a.lunarYearCn,
    lunarMonthCn: a.lunarMonthCn,
    lunarDayCn: a.lunarDayCn,
    phaseOfMoon: a.phaseOfMoon,
    todaySolarTerms: a.todaySolarTerms,
    nextSolarTerm: a.nextSolarTerm,
    nextSolarTermDate: a.nextSolarTermDate,
    nextSolarTermYear: a.nextSolarTermYear,
    thisYearSolarTermsDic: a.thisYearSolarTermsDic,
    lunarSeason: a.lunarSeason,
    year8Char: a.year8Char,
    month8Char: a.month8Char,
    day8Char: a.day8Char,
    twohour8Char: a.twohour8Char,
    twohour8CharList: a.twohour8CharList,
    today12DayOfficer: a.today12DayOfficer,
    today12DayGod: a.today12DayGod,
    chineseYearZodiac: a.chineseYearZodiac,
    chineseZodiacClash: a.chineseZodiacClash,
    weekDayCn: a.weekDayCn,
    starZodiac: a.starZodiac,
    todayEastZodiac: a.todayEastZodiac,
    today28Star: a.today28Star,
    get_legalHolidays: a.get_legalHolidays(),
    get_otherHolidays: a.get_otherHolidays(),
    get_otherLunarHolidays: a.get_otherLunarHolidays(),
    get_pengTaboo: a.get_pengTaboo(),
    get_pengTaboo_4_br: a.get_pengTaboo(4, "<br>"),
    get_the28Stars: a.get_the28Stars(),
    get_nayin: a.get_nayin(),
    get_today5Elements: a.get_today5Elements(),
    get_the9FlyStar: a.get_the9FlyStar(),
    get_luckyGodsDirection: a.get_luckyGodsDirection(),
    get_fetalGod: a.get_fetalGod(),
    get_twohourLuckyList: a.get_twohourLuckyList(),
    goodGodName: a.goodGodName,
    badGodName: a.badGodName,
    todayLevel: a.todayLevel,
    todayLevelName: a.todayLevelName,
    thingLevelName: a.thingLevelName,
    goodThing: [...a.goodThing].sort(),
    badThing: [...a.badThing].sort(),
    meridians: a.meridians,
  };
}

test("matches Python cnlunar for representative dates", () => {
  const repoRoot = path.resolve(import.meta.dir, "../..");
  const cases: Case[] = [
    { y: 2022, m: 11, d: 14, hh: 10, mm: 30, godType: "8char", year8Char: "year" },
    { y: 2022, m: 1, d: 8, hh: 1, mm: 30, godType: "8char", year8Char: "year" },
    { y: 2022, m: 2, d: 3, hh: 10, mm: 30, godType: "8char", year8Char: "beginningOfSpring" },
    { y: 2019, m: 2, d: 4, hh: 22, mm: 30, godType: "cnlunar", year8Char: "year" },
  ];

  for (const c of cases) {
    const py = runPythonOracle(repoRoot, c);
    const ts = tsSnapshot(c);
    expect(ts).toEqual(py);
  }
});

