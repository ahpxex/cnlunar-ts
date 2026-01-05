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

test("boundary years - 1902 and 2099", () => {
  const repoRoot = path.resolve(import.meta.dir, "../..");
  const cases: Case[] = [
    // 1902 年初
    { y: 1902, m: 1, d: 1, hh: 12, mm: 0, godType: "8char", year8Char: "year" },
    { y: 1902, m: 12, d: 31, hh: 23, mm: 59, godType: "8char", year8Char: "year" },
    // 2099 年
    { y: 2099, m: 2, d: 1, hh: 0, mm: 0, godType: "8char", year8Char: "year" },
    { y: 2099, m: 11, d: 30, hh: 23, mm: 59, godType: "8char", year8Char: "year" },
  ];

  for (const c of cases) {
    const py = runPythonOracle(repoRoot, c);
    const ts = tsSnapshot(c);
    expect(ts).toEqual(py);
  }
});

test("leap month dates", () => {
  const repoRoot = path.resolve(import.meta.dir, "../..");
  const cases: Case[] = [
    // 2020 年闰四月
    { y: 2020, m: 5, d: 23, hh: 12, mm: 0, godType: "8char", year8Char: "year" },
    { y: 2020, m: 6, d: 21, hh: 12, mm: 0, godType: "8char", year8Char: "year" },
    // 2023 年闰二月
    { y: 2023, m: 3, d: 22, hh: 12, mm: 0, godType: "8char", year8Char: "year" },
    { y: 2023, m: 4, d: 20, hh: 12, mm: 0, godType: "8char", year8Char: "year" },
    // 2017 年闰六月
    { y: 2017, m: 7, d: 23, hh: 12, mm: 0, godType: "8char", year8Char: "year" },
  ];

  for (const c of cases) {
    const py = runPythonOracle(repoRoot, c);
    const ts = tsSnapshot(c);
    expect(ts).toEqual(py);
  }
});

test("solar terms dates", () => {
  const repoRoot = path.resolve(import.meta.dir, "../..");
  const cases: Case[] = [
    // 立春
    { y: 2022, m: 2, d: 4, hh: 4, mm: 50, godType: "8char", year8Char: "beginningOfSpring" },
    { y: 2023, m: 2, d: 4, hh: 10, mm: 42, godType: "8char", year8Char: "beginningOfSpring" },
    // 清明
    { y: 2022, m: 4, d: 5, hh: 3, mm: 20, godType: "8char", year8Char: "year" },
    // 夏至
    { y: 2022, m: 6, d: 21, hh: 17, mm: 13, godType: "8char", year8Char: "year" },
    // 冬至
    { y: 2022, m: 12, d: 22, hh: 5, mm: 48, godType: "8char", year8Char: "year" },
  ];

  for (const c of cases) {
    const py = runPythonOracle(repoRoot, c);
    const ts = tsSnapshot(c);
    expect(ts).toEqual(py);
  }
});

test("traditional festivals", () => {
  const repoRoot = path.resolve(import.meta.dir, "../..");
  const cases: Case[] = [
    // 春节
    { y: 2022, m: 2, d: 1, hh: 12, mm: 0, godType: "8char", year8Char: "year" },
    { y: 2023, m: 1, d: 22, hh: 12, mm: 0, godType: "8char", year8Char: "year" },
    // 元宵节
    { y: 2022, m: 2, d: 15, hh: 12, mm: 0, godType: "8char", year8Char: "year" },
    // 端午节
    { y: 2022, m: 6, d: 3, hh: 12, mm: 0, godType: "8char", year8Char: "year" },
    // 中秋节
    { y: 2022, m: 9, d: 10, hh: 12, mm: 0, godType: "8char", year8Char: "year" },
    // 重阳节
    { y: 2022, m: 10, d: 4, hh: 12, mm: 0, godType: "8char", year8Char: "year" },
  ];

  for (const c of cases) {
    const py = runPythonOracle(repoRoot, c);
    const ts = tsSnapshot(c);
    expect(ts).toEqual(py);
  }
});

test("legal holidays", () => {
  const repoRoot = path.resolve(import.meta.dir, "../..");
  const cases: Case[] = [
    // 元旦
    { y: 2022, m: 1, d: 1, hh: 12, mm: 0, godType: "8char", year8Char: "year" },
    // 劳动节
    { y: 2022, m: 5, d: 1, hh: 12, mm: 0, godType: "8char", year8Char: "year" },
    // 国庆节
    { y: 2022, m: 10, d: 1, hh: 12, mm: 0, godType: "8char", year8Char: "year" },
  ];

  for (const c of cases) {
    const py = runPythonOracle(repoRoot, c);
    const ts = tsSnapshot(c);
    expect(ts).toEqual(py);
  }
});

test("different godType configurations", () => {
  const repoRoot = path.resolve(import.meta.dir, "../..");
  const date = { y: 2022, m: 6, d: 15, hh: 14, mm: 30 };

  const cases: Case[] = [
    { ...date, godType: "8char", year8Char: "year" },
    { ...date, godType: "cnlunar", year8Char: "year" },
    { ...date, godType: "8char", year8Char: "beginningOfSpring" },
  ];

  for (const c of cases) {
    const py = runPythonOracle(repoRoot, c);
    const ts = tsSnapshot(c);
    expect(ts).toEqual(py);
  }
});

test("different times of day", () => {
  const repoRoot = path.resolve(import.meta.dir, "../..");
  const baseDate = { y: 2022, m: 6, d: 15, godType: "8char" as const, year8Char: "year" as const };

  const cases: Case[] = [
    // 子时 (23:00-01:00)
    { ...baseDate, hh: 0, mm: 0 },
    // 丑时 (01:00-03:00)
    { ...baseDate, hh: 2, mm: 0 },
    // 寅时 (03:00-05:00)
    { ...baseDate, hh: 4, mm: 0 },
    // 卯时 (05:00-07:00)
    { ...baseDate, hh: 6, mm: 0 },
    // 辰时 (07:00-09:00)
    { ...baseDate, hh: 8, mm: 0 },
    // 巳时 (09:00-11:00)
    { ...baseDate, hh: 10, mm: 0 },
    // 午时 (11:00-13:00)
    { ...baseDate, hh: 12, mm: 0 },
    // 未时 (13:00-15:00)
    { ...baseDate, hh: 14, mm: 0 },
    // 申时 (15:00-17:00)
    { ...baseDate, hh: 16, mm: 0 },
    // 酉时 (17:00-19:00)
    { ...baseDate, hh: 18, mm: 0 },
    // 戌时 (19:00-21:00)
    { ...baseDate, hh: 20, mm: 0 },
    // 亥时 (21:00-23:00)
    { ...baseDate, hh: 22, mm: 0 },
  ];

  for (const c of cases) {
    const py = runPythonOracle(repoRoot, c);
    const ts = tsSnapshot(c);
    expect(ts).toEqual(py);
  }
});

test("month boundaries", () => {
  const repoRoot = path.resolve(import.meta.dir, "../..");
  const cases: Case[] = [
    // 月初
    { y: 2022, m: 1, d: 1, hh: 0, mm: 0, godType: "8char", year8Char: "year" },
    { y: 2022, m: 6, d: 1, hh: 0, mm: 0, godType: "8char", year8Char: "year" },
    // 月末
    { y: 2022, m: 1, d: 31, hh: 23, mm: 59, godType: "8char", year8Char: "year" },
    { y: 2022, m: 2, d: 28, hh: 23, mm: 59, godType: "8char", year8Char: "year" },
    { y: 2022, m: 6, d: 30, hh: 23, mm: 59, godType: "8char", year8Char: "year" },
  ];

  for (const c of cases) {
    const py = runPythonOracle(repoRoot, c);
    const ts = tsSnapshot(c);
    expect(ts).toEqual(py);
  }
});

test("various zodiac years", () => {
  const repoRoot = path.resolve(import.meta.dir, "../..");
  const cases: Case[] = [
    // 鼠年
    { y: 2020, m: 6, d: 15, hh: 12, mm: 0, godType: "8char", year8Char: "year" },
    // 牛年
    { y: 2021, m: 6, d: 15, hh: 12, mm: 0, godType: "8char", year8Char: "year" },
    // 虎年
    { y: 2022, m: 6, d: 15, hh: 12, mm: 0, godType: "8char", year8Char: "year" },
    // 兔年
    { y: 2023, m: 6, d: 15, hh: 12, mm: 0, godType: "8char", year8Char: "year" },
    // 龙年
    { y: 2024, m: 6, d: 15, hh: 12, mm: 0, godType: "8char", year8Char: "year" },
  ];

  for (const c of cases) {
    const py = runPythonOracle(repoRoot, c);
    const ts = tsSnapshot(c);
    expect(ts).toEqual(py);
  }
});

test("basic Lunar instance properties", () => {
  const lunar = new Lunar(new Date(2022, 10, 14, 10, 30));

  expect(lunar.lunarYear).toBeGreaterThan(0);
  expect(lunar.lunarMonth).toBeGreaterThanOrEqual(1);
  expect(lunar.lunarMonth).toBeLessThanOrEqual(12);
  expect(lunar.lunarDay).toBeGreaterThanOrEqual(1);
  expect(lunar.lunarDay).toBeLessThanOrEqual(30);
  expect(typeof lunar.lunarYearCn).toBe("string");
  expect(typeof lunar.lunarMonthCn).toBe("string");
  expect(typeof lunar.lunarDayCn).toBe("string");
});

test("8char properties format", () => {
  const lunar = new Lunar(new Date(2022, 10, 14, 10, 30));

  expect(lunar.year8Char).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
  expect(lunar.month8Char).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
  expect(lunar.day8Char).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
  expect(lunar.twohour8Char).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
});

test("twohour list contains 13 elements", () => {
  const lunar = new Lunar(new Date(2022, 10, 14, 10, 30));
  expect(lunar.twohour8CharList).toHaveLength(13);
  expect(lunar.twohour8CharList.length).toBeGreaterThan(0);
});

test("zodiac properties", () => {
  const lunar = new Lunar(new Date(2022, 10, 14, 10, 30));

  expect(lunar.chineseYearZodiac).toMatch(/^[鼠牛虎兔龙蛇马羊猴鸡狗猪]$/);
  expect(typeof lunar.chineseZodiacClash).toBe("string");
  expect(typeof lunar.starZodiac).toBe("string");
});

test("method returns are valid", () => {
  const lunar = new Lunar(new Date(2022, 10, 14, 10, 30));

  expect(typeof lunar.get_legalHolidays()).toBe("string");
  expect(typeof lunar.get_otherHolidays()).toBe("string");
  expect(typeof lunar.get_otherLunarHolidays()).toBe("string");
  expect(typeof lunar.get_pengTaboo()).toBe("string");
  expect(typeof lunar.get_the28Stars()).toBe("string");
  expect(typeof lunar.get_nayin()).toBe("string");
  // get_today5Elements and get_luckyGodsDirection return objects
  expect(typeof lunar.get_today5Elements()).toBe("object");
  expect(typeof lunar.get_the9FlyStar()).toBe("string");
  expect(typeof lunar.get_luckyGodsDirection()).toBe("object");
  expect(typeof lunar.get_fetalGod()).toBe("string");
  expect(Array.isArray(lunar.get_twohourLuckyList())).toBe(true);
});

test("goodThing and badThing are arrays", () => {
  const lunar = new Lunar(new Date(2022, 10, 14, 10, 30));

  expect(Array.isArray(lunar.goodThing)).toBe(true);
  expect(Array.isArray(lunar.badThing)).toBe(true);
});

test("solar terms properties", () => {
  const lunar = new Lunar(new Date(2022, 10, 14, 10, 30));

  expect(typeof lunar.nextSolarTerm).toBe("string");
  expect(Array.isArray(lunar.nextSolarTermDate)).toBe(true);
  expect(lunar.nextSolarTermDate).toHaveLength(2);
  expect(typeof lunar.nextSolarTermYear).toBe("number");
  expect(typeof lunar.thisYearSolarTermsDic).toBe("object");
});

