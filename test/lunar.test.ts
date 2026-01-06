import { expect, test } from "bun:test";
import { Lunar } from "../src/lunar";

test("basic lunar date conversion - 2022-11-14", () => {
  const lunar = new Lunar(new Date(2022, 10, 14, 10, 30), { godType: "8char" });

  expect(lunar.lunarYear).toBe(2022);
  expect(lunar.lunarMonth).toBe(10);
  expect(lunar.lunarDay).toBe(21);
  expect(lunar.isLunarLeapMonth).toBe(false);
  expect(lunar.lunarYearCn).toBe("二零二二");
  expect(lunar.lunarMonthCn).toBe("十月大");
  expect(lunar.lunarDayCn).toBe("廿一");
});

test("8char calculation - 2022-11-14", () => {
  const lunar = new Lunar(new Date(2022, 10, 14, 10, 30), { godType: "8char" });

  expect(lunar.year8Char).toBe("壬寅");
  expect(lunar.month8Char).toBe("辛亥");
  expect(lunar.day8Char).toBe("辛未");
  expect(lunar.twohour8Char).toBe("癸巳");
  expect(lunar.chineseYearZodiac).toBe("虎");
});

test("solar terms - winter solstice 2022", () => {
  const lunar = new Lunar(new Date(2022, 11, 22, 5, 48), { godType: "8char" });

  expect(lunar.todaySolarTerms).toBe("冬至");
});

test("leap month detection - 2020", () => {
  // 2020年闰四月，对应公历 5月23日
  const lunar = new Lunar(new Date(2020, 4, 23, 12, 0), { godType: "8char" });

  expect(lunar.isLunarLeapMonth).toBe(true);
  expect(lunar.lunarMonth).toBe(4);
});

test("chinese new year - 2023", () => {
  const lunar = new Lunar(new Date(2023, 0, 22, 12, 0), { godType: "8char" });

  expect(lunar.lunarMonth).toBe(1);
  expect(lunar.lunarDay).toBe(1);
  expect(lunar.chineseYearZodiac).toBe("兔");
});

test("star zodiac calculation", () => {
  const dates = [
    { date: new Date(2022, 0, 15), zodiac: "摩羯座" },
    { date: new Date(2022, 1, 15), zodiac: "水瓶座" },
    { date: new Date(2022, 2, 15), zodiac: "双鱼座" },
    { date: new Date(2022, 3, 15), zodiac: "白羊座" },
  ];

  dates.forEach(({ date, zodiac }) => {
    const lunar = new Lunar(date);
    expect(lunar.starZodiac).toBe(zodiac);
  });
});

test("weekday calculation", () => {
  const lunar = new Lunar(new Date(2022, 10, 14), { godType: "8char" });
  expect(lunar.weekDayCn).toBe("星期一");
});

test("phase of moon", () => {
  const lunar = new Lunar(new Date(2022, 10, 14), { godType: "8char" });
  // phaseOfMoon 可能为空字符串
  expect(typeof lunar.phaseOfMoon).toBe("string");
});

test("next solar term calculation", () => {
  const lunar = new Lunar(new Date(2022, 10, 14), { godType: "8char" });

  expect(lunar.nextSolarTerm).toBe("小雪");
  expect(Array.isArray(lunar.nextSolarTermDate)).toBe(true);
  expect(lunar.nextSolarTermDate.length).toBe(2);
  expect(lunar.nextSolarTermYear).toBeGreaterThan(0);
});

test("zodiac relationships", () => {
  const lunar = new Lunar(new Date(2022, 10, 14), { godType: "8char" });

  expect(Array.isArray(lunar.zodiacMark3List)).toBe(true);
  expect(typeof lunar.zodiacMark6).toBe("string");
  expect(typeof lunar.zodiacWin).toBe("string");
  expect(typeof lunar.zodiacLose).toBe("string");
});

test("heaven and earth numbers", () => {
  const lunar = new Lunar(new Date(2022, 10, 14), { godType: "8char" });

  expect(lunar.yearHeavenNum).toBeGreaterThanOrEqual(0);
  expect(lunar.yearHeavenNum).toBeLessThanOrEqual(9);
  expect(lunar.yearEarthNum).toBeGreaterThanOrEqual(0);
  expect(lunar.yearEarthNum).toBeLessThanOrEqual(11);
});

test("methods return valid data", () => {
  const lunar = new Lunar(new Date(2022, 10, 14, 10, 30), { godType: "8char" });

  expect(typeof lunar.get_pengTaboo()).toBe("string");
  expect(typeof lunar.get_the28Stars()).toBe("string");
  expect(typeof lunar.get_nayin()).toBe("string");
  expect(typeof lunar.get_the9FlyStar()).toBe("string");
  expect(typeof lunar.get_fetalGod()).toBe("string");
  expect(Array.isArray(lunar.get_twohourLuckyList())).toBe(true);
});

test("different godType options", () => {
  const date = new Date(2022, 10, 14, 10, 30);

  const lunar1 = new Lunar(date, { godType: "8char" });
  const lunar2 = new Lunar(date, { godType: "cnlunar" });

  expect(lunar1.godType).toBe("8char");
  expect(lunar2.godType).toBe("cnlunar");
});

test("year8Char mode - beginningOfSpring", () => {
  const lunar = new Lunar(new Date(2022, 1, 3, 10, 30), {
    godType: "8char",
    year8Char: "beginningOfSpring",
  });

  expect(typeof lunar.year8Char).toBe("string");
  expect(lunar.year8Char).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
});

test("boundary dates within supported range", () => {
  // 测试边界日期（避免超出 1901-2100 范围）
  const lunar1 = new Lunar(new Date(1902, 0, 1), { godType: "8char" });
  const lunar2 = new Lunar(new Date(2099, 11, 31), { godType: "8char" });

  expect(lunar1.lunarYear).toBeGreaterThan(0);
  expect(lunar2.lunarYear).toBeGreaterThan(0);
});

test("angelDemon structure", () => {
  const lunar = new Lunar(new Date(2022, 10, 14, 10, 30), { godType: "8char" });

  expect(Array.isArray(lunar.angelDemon)).toBe(true);
  expect(lunar.angelDemon).toHaveLength(2);
  expect(Array.isArray(lunar.angelDemon[0])).toBe(true);
  expect(lunar.angelDemon[0]).toHaveLength(2);
  expect(Array.isArray(lunar.angelDemon[0][0])).toBe(true);
  expect(Array.isArray(lunar.angelDemon[0][1])).toBe(true);
});

// i18n tests
test("default locale is Chinese (backward compatible)", () => {
  const lunar = new Lunar(new Date(2022, 10, 14, 10, 30), { godType: "8char" });

  // Should match existing Chinese tests
  expect(lunar.lunarYearCn).toBe("二零二二");
  expect(lunar.lunarMonthCn).toBe("十月大");
  expect(lunar.lunarDayCn).toBe("廿一");
  expect(lunar.chineseYearZodiac).toBe("虎");
  expect(lunar.starZodiac).toBe("天蝎座");
  expect(lunar.weekDayCn).toBe("星期一");
});

test("English locale returns English strings", () => {
  const lunar = new Lunar(new Date(2022, 10, 14, 10, 30), { godType: "8char", locale: "en" });

  expect(lunar.lunarYearCn).toBe("TwoZeroTwoTwo");
  expect(lunar.lunarMonthCn).toBe("10th MonthLong");
  expect(lunar.lunarDayCn).toBe("21st");
  expect(lunar.chineseYearZodiac).toBe("Tiger");
  expect(lunar.starZodiac).toBe("Scorpio");
  expect(lunar.weekDayCn).toBe("Monday");
});

test("English zodiac names", () => {
  const lunar = new Lunar(new Date(2023, 0, 22), { locale: "en" });
  expect(lunar.chineseYearZodiac).toBe("Rabbit");
});

test("English solar terms", () => {
  const lunar = new Lunar(new Date(2022, 11, 22, 5, 48), { locale: "en" });
  expect(lunar.todaySolarTerms).toBe("Winter Solstice");
});

test("English next solar term", () => {
  const lunar = new Lunar(new Date(2022, 10, 14), { locale: "en" });
  expect(lunar.nextSolarTerm).toBe("Minor Snow");
});

test("locale option can be combined with other options", () => {
  const lunar = new Lunar(new Date(2022, 10, 14, 10, 30), {
    godType: "8char",
    year8Char: "beginningOfSpring",
    locale: "en",
  });

  expect(lunar.godType).toBe("8char");
  expect(lunar.chineseYearZodiac).toBe("Tiger");
});

test("Chinese locale explicit", () => {
  const lunar = new Lunar(new Date(2022, 10, 14), { locale: "zh" });
  expect(lunar.chineseYearZodiac).toBe("虎");
  expect(lunar.starZodiac).toBe("天蝎座");
});
