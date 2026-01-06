/* Ported from cnlunar/lunar.py in this repo. */

import { addDays, DateInput, DateParts, diffDays, getIsoWeekInfo, getWeekdayIndexMonday0, toDateParts } from "./datetime";
import {
  EAST_ZODIAC_LIST,
  LEAPMONTH_NUM_BIT,
  MONTH_DAY_BIT,
  SOLAR_TERMS_NAME_LIST,
  STAR_ZODIAC_DATE,
  STAR_ZODIAC_NAME,
  START_YEAR,
  bujiang,
  chinese12DayGods,
  chinese12DayOfficers,
  chinese8Trigrams,
  chineseZodiacNameList,
  day8CharThing,
  directionList,
  fetalGodList,
  luckyGodDirection,
  lunarDayNameList,
  lunarMonthData,
  lunarMonthNameList,
  lunarNewYearList,
  mascotGodDirection,
  meridiansName,
  moonNobleDirection,
  officerThings,
  pengTatooList,
  sunNobleDirection,
  the10HeavenlyStems,
  the10HeavenlyStems5ElementsList,
  the12EarthlyBranches,
  the12EarthlyBranches5ElementsList,
  the28StarsList,
  the60HeavenlyEarth,
  theHalf60HeavenlyEarth5ElementsList,
  thingsSort,
  twohourLuckyTimeList,
  upperNum,
  wealthGodDirection,
  weekDay,
} from "./config";
import { legalHolidays, legalLunarHolidays, legalSolarTermsHoliday, otherHolidaysByMonth, otherLunarHolidaysByMonth } from "./holidays";
import { getTheYearAllSolarTermsList } from "./solar24";
import { rfAdd, rfRemove, sortCollation } from "./tools";

export type GodType = "8char" | "cnlunar";
export type Year8CharMode = "year" | "beginningOfSpring";

export type LunarOptions = {
  godType?: GodType;
  year8Char?: Year8CharMode;
};

type SolarTermName = (typeof SOLAR_TERMS_NAME_LIST)[number];
type HeavenlyEarth = (typeof the60HeavenlyEarth)[number];
type EarthlyBranch = (typeof the12EarthlyBranches)[number];
type HeavenlyStem = (typeof the10HeavenlyStems)[number];

function pyIndex<T>(arr: ReadonlyArray<T>, index: number): T {
  const len = arr.length;
  let idx = index;
  if (idx < 0) idx = len + idx;
  if (idx < 0 || idx >= len) {
    throw new RangeError("IndexError: tuple index out of range");
  }
  return arr[idx]!;
}

function pyMod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function tupleLE(a: Readonly<[number, number]>, b: Readonly<[number, number]>): boolean {
  if (a[0] < b[0]) return true;
  if (a[0] > b[0]) return false;
  return a[1] <= b[1];
}

function tupleLT(a: Readonly<[number, number]>, b: Readonly<[number, number]>): boolean {
  if (a[0] < b[0]) return true;
  if (a[0] > b[0]) return false;
  return a[1] < b[1];
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  return false;
}

function includesDeep(container: unknown, value: unknown): boolean {
  if (typeof container === "string") {
    return typeof value === "string" && container.includes(value);
  }
  if (Array.isArray(container)) {
    return container.some((item) => deepEqual(item, value));
  }
  return false;
}

function uniqueStrings(list: string[]): string[] {
  return [...new Set(list)];
}

export class Lunar {
  godType: GodType;

  date: Date;
  private readonly _dateParts: DateParts;

  twohourNum: number;
  private _upper_year: string;
  isLunarLeapMonth: boolean;

  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  spanDays: number;

  monthDaysList: [number, number, number];
  lunarYearCn: string;
  lunarMonthCn: string;
  lunarDayCn: string;
  lunarMonthLong: boolean;

  phaseOfMoon: string;

  todaySolarTerms: string;
  nextSolarNum: number;
  nextSolarTerm: string;
  nextSolarTermDate: [number, number];
  nextSolarTermYear: number;
  thisYearSolarTermsDateList: Array<[number, number]>;
  thisYearSolarTermsDic: Record<string, [number, number]>;

  private _x: number;
  year8Char: string;
  month8Char: string;
  day8Char: string;
  dayHeavenlyEarthNum: number;

  yearEarthNum: number;
  monthEarthNum: number;
  dayEarthNum: number;
  yearHeavenNum: number;
  monthHeavenNum: number;
  dayHeavenNum: number;

  seasonType: number;
  seasonNum: number;
  lunarSeason: string;

  twohour8CharList: string[];
  twohour8Char: string;

  today12DayOfficer: string;
  today12DayGod: string;

  chineseYearZodiac: string;
  chineseZodiacClash: string;
  zodiacMark6: string;
  zodiacMark3List: string[];
  zodiacWin: string;
  zodiacLose: string;

  weekDayCn: string;
  starZodiac: string;
  todayEastZodiac: string;

  today28Star: string;
  content: string;

  goodGodName: string[];
  badGodName: string[];
  goodThing: string[];
  badThing: string[];
  todayLevel: number;
  todayLevelName: string;
  thingLevelName: string;
  isDe: boolean;

  angelDemon: [[string[], string[]], [string[], string[]]];
  meridians: string;

  constructor(date: DateInput = new Date(), options: LunarOptions = {}) {
    const godType = options.godType ?? "8char";
    const year8CharMode = options.year8Char ?? "year";

    this.godType = godType;
    this._dateParts = toDateParts(date);
    this.date = new Date(
      this._dateParts.year,
      this._dateParts.month - 1,
      this._dateParts.day,
      this._dateParts.hour,
      this._dateParts.minute,
      this._dateParts.second,
      0,
    );

    this.twohourNum = Math.floor((this._dateParts.hour + 1) / 2);
    this._upper_year = "";
    this.isLunarLeapMonth = false;

    this.lunarYear = this._dateParts.year;
    this.lunarMonth = 1;
    this.lunarDay = 1;
    this.spanDays = 0;
    this.monthDaysList = [0, 0, 0];
    this.lunarMonthLong = false;

    [this.lunarYear, this.lunarMonth, this.lunarDay] = this.get_lunarDateNum();
    [this.lunarYearCn, this.lunarMonthCn, this.lunarDayCn] = this.get_lunarCn();
    this.phaseOfMoon = this.getPhaseOfMoon();

    this.nextSolarNum = 0;
    this.nextSolarTerm = SOLAR_TERMS_NAME_LIST[0];
    this.nextSolarTermDate = [1, 1];
    this.nextSolarTermYear = this._dateParts.year;
    this.thisYearSolarTermsDateList = [];
    this.todaySolarTerms = this.get_todaySolarTerms();
    this._x = this.getBeginningOfSpringX(year8CharMode);

    this.year8Char = "";
    this.month8Char = "";
    this.day8Char = "";
    this.dayHeavenlyEarthNum = 0;
    [this.year8Char, this.month8Char, this.day8Char] = this.get_the8char();

    this.yearEarthNum = 0;
    this.monthEarthNum = 0;
    this.dayEarthNum = 0;
    this.yearHeavenNum = 0;
    this.monthHeavenNum = 0;
    this.dayHeavenNum = 0;
    this.seasonType = 0;
    this.seasonNum = 0;
    this.lunarSeason = "";

    this.get_earthNum();
    this.get_heavenNum();
    this.get_season();

    this.twohour8CharList = this.get_twohour8CharList();
    this.twohour8Char = this.get_twohour8Char();
    this.today12DayOfficer = "";
    this.today12DayGod = "";
    this.get_today12DayOfficer();

    this.zodiacMark6 = "";
    this.zodiacMark3List = [];
    this.zodiacWin = "";
    this.zodiacLose = "";
    this.chineseYearZodiac = this.get_chineseYearZodiac();
    this.chineseZodiacClash = this.get_chineseZodiacClash();
    this.weekDayCn = this.get_weekDayCn();
    this.starZodiac = this.get_starZodiac();
    this.todayEastZodiac = this.get_eastZodiac();
    this.thisYearSolarTermsDic = Object.fromEntries(
      SOLAR_TERMS_NAME_LIST.map((name, idx) => [name, this.thisYearSolarTermsDateList[idx]!]),
    ) as Record<string, [number, number]>;

    this.today28Star = this.get_the28Stars();
    this.content = "";

    this.goodGodName = [];
    this.badGodName = [];
    this.goodThing = [];
    this.badThing = [];
    this.todayLevel = -1;
    this.todayLevelName = "无";
    this.thingLevelName = "";
    this.isDe = false;

    this.angelDemon = this.get_AngelDemon();
    this.meridians = pyIndex(meridiansName, pyMod(this.twohourNum, 12));
  }

  private getBeginningOfSpringX(year8CharMode: Year8CharMode): number {
    const isBeforBeginningOfSpring = this.nextSolarNum < 3;
    const isBeforLunarYear = this.spanDays < 0;
    let x = 0;
    if (year8CharMode !== "beginningOfSpring") return x;

    if (isBeforLunarYear) {
      if (!isBeforBeginningOfSpring) {
        x = -1;
      }
    } else {
      if (isBeforBeginningOfSpring) {
        x = 1;
      }
    }
    return x;
  }

  get_lunarYearCN(): string {
    this._upper_year = "";
    for (const ch of String(this.lunarYear)) {
      this._upper_year += pyIndex(upperNum, Number(ch));
    }
    return this._upper_year;
  }

  get_lunarMonthCN(): string {
    let lunarMonth: string = pyIndex(lunarMonthNameList, pyMod(this.lunarMonth - 1, 12));
    let thisLunarMonthDays = this.monthDaysList[0];
    if (this.isLunarLeapMonth) {
      lunarMonth = `闰${lunarMonth}`;
      thisLunarMonthDays = this.monthDaysList[2];
    }
    this.lunarMonthLong = thisLunarMonthDays >= 30;
    const s = this.lunarMonthLong ? "大" : "小";
    return lunarMonth + s;
  }

  get_lunarCn(): [string, string, string] {
    return [this.get_lunarYearCN(), this.get_lunarMonthCN(), pyIndex(lunarDayNameList, pyMod(this.lunarDay - 1, 30))];
  }

  getPhaseOfMoon(): string {
    if (this.lunarDay - Number(this.lunarMonthLong) === 15) return "望";
    if (this.lunarDay === 1) return "朔";
    if (this.lunarDay >= 7 && this.lunarDay <= 8) return "上弦";
    if (this.lunarDay >= 22 && this.lunarDay <= 23) return "下弦";
    return "";
  }

  get_chineseYearZodiac(): string {
    const idx = pyMod(this.lunarYear - 4, 12) - this._x;
    return pyIndex(chineseZodiacNameList, idx);
  }

  get_chineseZodiacClash(): string {
    const zodiacNum = this.dayEarthNum;
    const zodiacClashNum = pyMod(zodiacNum + 6, 12);
    this.zodiacMark6 = pyIndex(chineseZodiacNameList, pyMod(25 - zodiacNum, 12));
    this.zodiacMark3List = [pyIndex(chineseZodiacNameList, pyMod(zodiacNum + 4, 12)), pyIndex(chineseZodiacNameList, pyMod(zodiacNum + 8, 12))];
    this.zodiacWin = pyIndex(chineseZodiacNameList, zodiacNum);
    this.zodiacLose = pyIndex(chineseZodiacNameList, zodiacClashNum);
    return `${this.zodiacWin}日冲${this.zodiacLose}`;
  }

  get_weekDayCn(): string {
    return pyIndex(weekDay, getWeekdayIndexMonday0(this._dateParts));
  }

  getMonthLeapMonthLeapDays(): [number, number, number] {
    let leapMonth = 0;
    let leapDay = 0;
    let monthDay = 0;
    const tmp = pyIndex(lunarMonthData, this.lunarYear - START_YEAR);
    if (tmp & (1 << (this.lunarMonth - 1))) {
      monthDay = 30;
    } else {
      monthDay = 29;
    }
    leapMonth = (tmp >> LEAPMONTH_NUM_BIT) & 0xf;
    if (leapMonth) {
      if (tmp & (1 << MONTH_DAY_BIT)) leapDay = 30;
      else leapDay = 29;
    }
    this.monthDaysList = [monthDay, leapMonth, leapDay];
    return [monthDay, leapMonth, leapDay];
  }

  get_lunarDateNum(): [number, number, number] {
    this.lunarYear = this._dateParts.year;
    this.lunarMonth = 1;
    this.lunarDay = 1;

    const codeYear = pyIndex(lunarNewYearList, this.lunarYear - START_YEAR);
    const springFestivalMonth = (codeYear >> 5) & 0x3;
    const springFestivalDay = (codeYear >> 0) & 0x1f;

    const spanDays = diffDays(this._dateParts, {
      year: this.lunarYear,
      month: springFestivalMonth,
      day: springFestivalDay,
      hour: 0,
      minute: 0,
      second: 0,
    });
    this.spanDays = spanDays;

    if (spanDays >= 0) {
      let tmpSpanDays = spanDays;
      let [monthDays, leapMonth, leapDay] = this.getMonthLeapMonthLeapDays();
      while (tmpSpanDays >= monthDays) {
        tmpSpanDays -= monthDays;
        if (this.lunarMonth === leapMonth) {
          monthDays = leapDay;
          if (tmpSpanDays < monthDays) {
            this.isLunarLeapMonth = true;
            break;
          }
          tmpSpanDays -= monthDays;
        }
        this.lunarMonth += 1;
        monthDays = this.getMonthLeapMonthLeapDays()[0];
      }
      this.lunarDay += tmpSpanDays;
      return [this.lunarYear, this.lunarMonth, this.lunarDay];
    }

    let tmpSpanDays = spanDays;
    this.lunarMonth = 12;
    this.lunarYear -= 1;
    let [monthDays, leapMonth, leapDay] = this.getMonthLeapMonthLeapDays();
    while (Math.abs(tmpSpanDays) > monthDays) {
      tmpSpanDays += monthDays;
      this.lunarMonth -= 1;
      if (this.lunarMonth === leapMonth) {
        monthDays = leapDay;
        if (Math.abs(tmpSpanDays) <= monthDays) {
          this.isLunarLeapMonth = true;
          break;
        }
        tmpSpanDays += monthDays;
      }
      monthDays = this.getMonthLeapMonthLeapDays()[0];
    }
    this.lunarDay += monthDays + tmpSpanDays;
    return [this.lunarYear, this.lunarMonth, this.lunarDay];
  }

  getSolarTermsDateList(year: number): Array<[number, number]> {
    const solarTermsList = getTheYearAllSolarTermsList(year);
    const solarTermsDateList: Array<[number, number]> = [];
    for (let i = 0; i < solarTermsList.length; i += 1) {
      const day = solarTermsList[i]!;
      const month = Math.floor(i / 2) + 1;
      solarTermsDateList.push([month, day]);
    }
    return solarTermsDateList;
  }

  getNextNum(findDate: [number, number], solarTermsDateList: Array<[number, number]>): number {
    const count = solarTermsDateList.filter((y) => tupleLE(y, findDate)).length;
    return count % 24;
  }

  get_todaySolarTerms(): string {
    let year = this._dateParts.year;
    let solarTermsDateList = this.getSolarTermsDateList(year);
    this.thisYearSolarTermsDateList = solarTermsDateList;

    const findDate: [number, number] = [this._dateParts.month, this._dateParts.day];
    this.nextSolarNum = this.getNextNum(findDate, solarTermsDateList);

    let todaySolarTerm = "无";
    const idx = solarTermsDateList.findIndex((d) => d[0] === findDate[0] && d[1] === findDate[1]);
    if (idx >= 0) {
      todaySolarTerm = pyIndex(SOLAR_TERMS_NAME_LIST, idx);
    }

    const last = solarTermsDateList[solarTermsDateList.length - 1]!;
    if (findDate[0] === last[0] && findDate[1] >= last[1]) {
      year += 1;
      solarTermsDateList = this.getSolarTermsDateList(year);
    }

    this.nextSolarTerm = pyIndex(SOLAR_TERMS_NAME_LIST, this.nextSolarNum);
    this.nextSolarTermDate = pyIndex(solarTermsDateList, this.nextSolarNum);
    this.nextSolarTermYear = year;
    return todaySolarTerm;
  }

  get_eastZodiac(): string {
    const idx = SOLAR_TERMS_NAME_LIST.indexOf(this.nextSolarTerm as SolarTermName);
    const todayEastZodiac = pyIndex(EAST_ZODIAC_LIST, Math.floor(pyMod(idx - 1, 24) / 2));
    return todayEastZodiac;
  }

  get_year8Char(): string {
    const base = pyMod(this.lunarYear - 4, 60);
    return pyIndex(the60HeavenlyEarth, base - this._x);
  }

  get_month8Char(): string {
    let nextNum = this.nextSolarNum;
    if (nextNum === 0 && this._dateParts.month === 12) nextNum = 24;
    const apartNum = Math.floor((nextNum + 1) / 2);
    return pyIndex(the60HeavenlyEarth, pyMod((this._dateParts.year - 2019) * 12 + apartNum, 60));
  }

  get_day8Char(): string {
    const apartDays = diffDays(this._dateParts, { year: 2019, month: 1, day: 29, hour: 0, minute: 0, second: 0 });
    let baseNum = the60HeavenlyEarth.indexOf("丙寅");
    if (this.twohourNum === 12) baseNum += 1;
    this.dayHeavenlyEarthNum = pyMod(apartDays + baseNum, 60);
    return pyIndex(the60HeavenlyEarth, this.dayHeavenlyEarthNum);
  }

  get_twohour8CharList(): string[] {
    const begin = pyMod(the60HeavenlyEarth.indexOf(this.day8Char as HeavenlyEarth) * 12, 60);
    const doubled = [...the60HeavenlyEarth, ...the60HeavenlyEarth];
    return doubled.slice(begin, begin + 13);
  }

  get_twohour8Char(): string {
    return pyIndex(this.twohour8CharList, pyMod(this.twohourNum, 12));
  }

  get_the8char(): [string, string, string] {
    return [this.get_year8Char(), this.get_month8Char(), this.get_day8Char()];
  }

  get_earthNum(): [number, number, number] {
    this.yearEarthNum = the12EarthlyBranches.indexOf(this.year8Char[1]! as EarthlyBranch);
    this.monthEarthNum = the12EarthlyBranches.indexOf(this.month8Char[1]! as EarthlyBranch);
    this.dayEarthNum = the12EarthlyBranches.indexOf(this.day8Char[1]! as EarthlyBranch);
    return [this.yearEarthNum, this.monthEarthNum, this.dayEarthNum];
  }

  get_heavenNum(): [number, number, number] {
    this.yearHeavenNum = the10HeavenlyStems.indexOf(this.year8Char[0]! as HeavenlyStem);
    this.monthHeavenNum = the10HeavenlyStems.indexOf(this.month8Char[0]! as HeavenlyStem);
    this.dayHeavenNum = the10HeavenlyStems.indexOf(this.day8Char[0]! as HeavenlyStem);
    return [this.yearHeavenNum, this.monthHeavenNum, this.dayHeavenNum];
  }

  get_season(): void {
    this.seasonType = pyMod(this.monthEarthNum, 3);
    this.seasonNum = Math.floor(pyMod(this.monthEarthNum - 2, 12) / 3);
    this.lunarSeason = ["仲", "季", "孟"][this.seasonType]! + ["春", "夏", "秋", "冬"][this.seasonNum]!;
  }

  get_starZodiac(): string {
    const findDate: [number, number] = [this._dateParts.month, this._dateParts.day];
    const count = STAR_ZODIAC_DATE.filter((y) => tupleLE(y as [number, number], findDate)).length % 12;
    return pyIndex(STAR_ZODIAC_NAME, count);
  }

  get_legalHolidays(): string {
    let temp = "";
    if (this.todaySolarTerms in legalSolarTermsHoliday) {
      temp += `${legalSolarTermsHoliday[this.todaySolarTerms]!} `;
    }
    const solarKey = `${this._dateParts.month}-${this._dateParts.day}`;
    if (solarKey in legalHolidays) {
      temp += `${legalHolidays[solarKey]!} `;
    }
    if (!(this.lunarMonth > 12)) {
      const lunarKey = `${this.lunarMonth}-${this.lunarDay}`;
      if (lunarKey in legalLunarHolidays) {
        temp += legalLunarHolidays[lunarKey]!;
      }
    }
    return temp.trim().replaceAll(" ", ",");
  }

  get_otherHolidays(): string {
    const tempList: string[] = [];
    const y = this._dateParts.year;
    const m = this._dateParts.month;
    const d = this._dateParts.day;
    const { isoWeek: wn, isoWeekday: w } = getIsoWeekInfo({ year: y, month: m, day: d });
    const eastHolidays: Record<number, [number, number, string]> = { 5: [2, 7, "母亲节"], 6: [3, 7, "父亲节"] };
    if (m in eastHolidays) {
      const t1dwn = getIsoWeekInfo({ year: y, month: m, day: 1 }).isoWeek;
      const [wantNth, wantWeekday, name] = eastHolidays[m]!;
      if (wn - t1dwn + 1 === wantNth && w === wantWeekday) {
        tempList.push(name);
      }
    }
    const holidayDic = otherHolidaysByMonth[m - 1] ?? {};
    if (d in holidayDic) {
      tempList.push(holidayDic[d]!);
    }
    return tempList.length ? tempList.join(",") : "";
  }

  get_otherLunarHolidays(): string {
    if (!(this.lunarMonth > 12)) {
      const holidayDic = otherLunarHolidaysByMonth[this.lunarMonth - 1] ?? {};
      if (this.lunarDay in holidayDic) return holidayDic[this.lunarDay]!;
    }
    return "";
  }

  get_pengTaboo(long = 9, delimit = ","): string {
    return pengTatooList[this.dayHeavenNum]!.slice(0, long) + delimit + pengTatooList[this.dayEarthNum + 10]!.slice(0, long);
  }

  get_today12DayOfficer(): [string, string, string] {
    let men: number;
    if (this.godType === "cnlunar") {
      const lmn = this.lunarMonth;
      men = pyMod(lmn - 1 + 2, 12);
    } else {
      men = this.monthEarthNum;
    }

    const thisMonthStartGodNum = pyMod(men, 12);
    const apartNum = this.dayEarthNum - thisMonthStartGodNum;
    this.today12DayOfficer = chinese12DayOfficers[pyMod(apartNum, 12)]!;

    const eclipticGodNum = pyMod(this.dayEarthNum - [8, 10, 0, 2, 4, 6, 8, 10, 0, 2, 4, 6][men]!, 12);
    this.today12DayGod = pyIndex(chinese12DayGods, pyMod(eclipticGodNum, 12));
    const dayName = [0, 1, 4, 5, 7, 10].includes(eclipticGodNum) ? "黄道日" : "黑道日";
    return [this.today12DayOfficer, this.today12DayGod, dayName];
  }

  get_the28Stars(): string {
    const apartDays = diffDays(this._dateParts, { year: 2019, month: 1, day: 17, hour: 0, minute: 0, second: 0 });
    return pyIndex(the28StarsList, pyMod(apartDays, 28));
  }

  get_nayin(): string {
    return pyIndex(theHalf60HeavenlyEarth5ElementsList, Math.floor(the60HeavenlyEarth.indexOf(this.day8Char as HeavenlyEarth) / 2));
  }

  get_today5Elements(): string[] {
    const nayin = this.get_nayin();
    return [
      "天干",
      this.day8Char[0]!,
      `属${pyIndex(the10HeavenlyStems5ElementsList, this.dayHeavenNum)}`,
      "地支",
      this.day8Char[1]!,
      `属${pyIndex(the12EarthlyBranches5ElementsList, this.dayEarthNum)}`,
      "纳音",
      nayin[nayin.length - 1]!,
      `属${nayin[nayin.length - 1]!}`,
      "廿八宿",
      this.today28Star[0]!,
      "宿",
      "十二神",
      this.today12DayOfficer,
      "日",
    ];
  }

  get_the9FlyStar(): string {
    const apartNum = diffDays(this._dateParts, { year: 2019, month: 1, day: 17, hour: 0, minute: 0, second: 0 });
    const startNumList = [7, 3, 5, 6, 8, 1, 2, 4, 9];
    const flyStarList = startNumList.map((i) => String(pyMod(i - 1 - apartNum, 9) + 1));
    return flyStarList.join("");
  }

  get_luckyGodsDirection(): string[] {
    const todayNum = this.dayHeavenNum;
    const getDir = (dirStr: string): string => {
      const trigram = dirStr[todayNum]!;
      const idx = chinese8Trigrams.indexOf(trigram);
      return pyIndex(directionList, idx);
    };
    return [
      `喜神${getDir(luckyGodDirection)}`,
      `财神${getDir(wealthGodDirection)}`,
      `福神${getDir(mascotGodDirection)}`,
      `阳贵${getDir(sunNobleDirection)}`,
      `阴贵${getDir(moonNobleDirection)}`,
    ];
  }

  get_fetalGod(): string {
    return pyIndex(fetalGodList, the60HeavenlyEarth.indexOf(this.day8Char as HeavenlyEarth));
  }

  get_twohourLuckyList(): string[] {
    const tmp2List = (tmp: number): string[] => {
      const out: string[] = [];
      for (let i = 1; i <= 12; i += 1) {
        out.push(tmp & 2 ** (12 - i) ? "凶" : "吉");
      }
      return out;
    };
    const todayNum = this.dayHeavenlyEarthNum;
    const tomorrowNum = pyMod(this.dayHeavenlyEarthNum + 1, 60);
    const outputList = [...tmp2List(pyIndex(twohourLuckyTimeList, todayNum)), ...tmp2List(pyIndex(twohourLuckyTimeList, tomorrowNum))];
    return outputList.slice(0, 13);
  }

  getTodayThingLevel(): number {
    const badGodDic: Record<string, Array<[string, string[], number]>> = {
      平日: [
        ["亥", ["相日", "时德", "六合"], 0],
        ["巳", ["相日", "六合", "月刑"], 1],
        ["申", ["相日", "月害"], 2],
        ["寅", ["相日", "月害", "月刑"], 3],
        ["卯午酉", ["天吏"], 3],
        ["辰戌丑未", ["月煞"], 4],
        ["子", ["天吏", "月刑"], 4],
      ],
      收日: [
        ["寅申", ["长生", "六合", "劫煞"], 0],
        ["巳亥", ["长生", "劫煞"], 2],
        ["辰未", ["月害"], 2],
        ["子午酉", ["大时"], 3],
        ["丑戌", ["月刑"], 3],
        ["卯", ["大时"], 4],
      ],
      闭日: [
        ["子午卯酉", ["王日"], 3],
        ["辰戌丑未", ["官日", "天吏"], 3],
        ["寅申巳亥", ["月煞"], 4],
      ],
      劫煞: [
        ["寅申", ["长生", "六合"], 0],
        ["辰戌丑未", ["除日", "相日"], 1],
        ["巳亥", ["长生", "月害"], 2],
        ["子午卯酉", ["执日"], 3],
      ],
      灾煞: [
        ["寅申巳亥", ["开日"], 1],
        ["辰戌丑未", ["满日", "民日"], 2],
        ["子午", ["月破"], 4],
        ["卯酉", ["月破", "月厌"], 5],
      ],
      月煞: [
        ["卯酉", ["六合", "危日"], 1],
        ["子午", ["月害", "危日"], 3],
      ],
      月刑: [
        ["巳", ["平日", "六合", "相日"], 1],
        ["寅", ["相日", "月害", "平日"], 3],
        ["辰酉亥", ["建日"], 3],
        ["子", ["平日", "天吏"], 4],
        ["卯", ["收日", "大时", "天破"], 4],
        ["未申", ["月破"], 4],
        ["午", ["月建", "月厌", "德大会"], 4],
      ],
      月害: [
        ["卯酉", ["守日", "除日"], 2],
        ["丑未", ["执日", "大时"], 2],
        ["巳亥", ["长生", "劫煞"], 2],
        ["申", ["相日", "平日"], 2],
        ["子午", ["月煞"], 3],
        ["辰戌", ["官日", "闭日", "天吏"], 3],
        ["寅", ["相日", "平日", "月刑"], 3],
      ],
      月厌: [
        ["寅申", ["成日"], 2],
        ["丑未", ["开日"], 2],
        ["辰戌", ["定日"], 3],
        ["已亥", ["满日"], 3],
        ["子", ["月建", "德大会"], 4],
        ["午", ["月建", "月刑", "德大会"], 4],
        ["卯酉", ["月破", "灾煞"], 5],
      ],
      大时: [
        ["寅申已亥", ["除日", "官日"], 0],
        ["辰戌", ["执日", "六合"], 0],
        ["丑未", ["执日", "月害"], 2],
        ["子午酉", ["收日"], 3],
        ["卯", ["收日", "月刑"], 4],
      ],
      天吏: [
        ["寅申已亥", ["危日"], 2],
        ["辰戌丑未", ["闭日"], 3],
        ["卯午酉", ["平日"], 3],
        ["子", ["平日", "月刑"], 4],
      ],
    };

    const todayAllGodName = [...this.goodGodName, ...this.badGodName, `${this.today12DayOfficer}日`];
    let l = -1;
    for (const gnoItem of todayAllGodName) {
      if (!(gnoItem in badGodDic)) continue;
      for (const item of badGodDic[gnoItem]!) {
        if (!item[0].includes(this.month8Char[1]!)) continue;
        for (const godname of item[1]) {
          if (todayAllGodName.includes(godname) && item[2] > l) {
            l = item[2];
            break;
          }
        }
      }
    }

    const levelDic: Record<number, string> = {
      0: "上：吉足胜凶，从宜不从忌。",
      1: "上次：吉足抵凶，遇德从宜不从忌，不遇从宜亦从忌。",
      2: "中：吉不抵凶，遇德从宜不从忌，不遇从忌不从宜。",
      3: "中次：凶胜于吉，遇德从宜亦从忌，不遇从忌不从宜。",
      4: "下:凶又逢凶，遇德从忌不从宜，不遇诸事皆忌。",
      5: "下下：凶叠大凶，遇德亦诸事皆忌。（卯酉月，灾煞遇月破、月厌，月厌遇灾煞、月破）",
      [-1]: "无",
    };
    this.todayLevel = l;
    this.todayLevelName = levelDic[l] ?? "无";
    const thingLevelDic: Record<number, string> = { 0: "从宜不从忌", 1: "从宜亦从忌", 2: "从忌不从宜", 3: "诸事皆忌" };

    this.isDe = false;
    for (const i of this.goodGodName) {
      if (["岁德", "岁德合", "月德", "月德合", "天德", "天德合"].includes(i)) {
        this.isDe = true;
        break;
      }
    }

    let thingLevel: number;
    if (l === 5) {
      thingLevel = 3;
    } else if (l === 4) {
      thingLevel = this.isDe ? 2 : 3;
    } else if (l === 3) {
      thingLevel = this.isDe ? 1 : 2;
    } else if (l === 2) {
      thingLevel = this.isDe ? 0 : 2;
    } else if (l === 1) {
      thingLevel = this.isDe ? 0 : 1;
    } else if (l === 0) {
      thingLevel = 0;
    } else {
      thingLevel = 1;
    }
    this.thingLevelName = thingLevelDic[thingLevel]!;
    return thingLevel;
  }

  get_AngelDemon(): [[string[], string[]], [string[], string[]]] {
    let gbDic: {
      goodName: string[];
      badName: string[];
      goodThing: string[];
      badThing: string[];
    } = {
      goodName: [],
      badName: [],
      goodThing: [...(officerThings as any)[this.today12DayOfficer][0]],
      badThing: [...(officerThings as any)[this.today12DayOfficer][1]],
    };

    const mrY13: Array<[number, number]> = [
      [1, 13],
      [2, 11],
      [3, 9],
      [4, 7],
      [5, 5],
      [6, 2],
      [7, 1],
      [7, 29],
      [8, 27],
      [9, 25],
      [10, 23],
      [11, 21],
      [12, 19],
    ];

    const tomorrow = addDays(this._dateParts, 1);
    const tmd: [number, number] = [tomorrow.month, tomorrow.day];
    const t4l = ["春分", "夏至", "秋分", "冬至"].map((k) => this.thisYearSolarTermsDic[k]!);
    const t4j = ["立春", "立夏", "立秋", "立冬"].map((k) => this.thisYearSolarTermsDic[k]!);
    const twys = t4j.filter((y) => tupleLT(y, tmd)).length % 4;
    const twysDate = t4j[twys]!;

    const s = this.today28Star;
    const o = this.today12DayOfficer;
    const d = this.day8Char;
    const den = this.dayEarthNum;
    const dhen = this.dayHeavenlyEarthNum;
    const sn = this.seasonNum;
    const yhn = this.yearHeavenNum;
    const yen = this.yearEarthNum;
    const ldn = this.lunarDay;
    const lmn = this.lunarMonth;

    let men: number;
    if (this.godType === "cnlunar") {
      men = pyMod(lmn - 1 + 2, 12);
    } else {
      men = this.monthEarthNum;
    }

    for (const k of Object.keys(day8CharThing)) {
      if (!d.includes(k)) continue;
      const [good, bad] = (day8CharThing as any)[k] as [string[], string[]];
      gbDic.goodThing.push(...good);
      gbDic.badThing.push(...bad);
    }

    // 雨水后立夏前执日、危日、收日 宜 取鱼
    if (this.nextSolarNum >= 4 && this.nextSolarNum <= 8 && ["执", "危", "收"].includes(o)) {
      gbDic.goodThing = rfAdd(gbDic.goodThing, ["取鱼"]);
    }
    // 霜降后立春前执日、危日、收日 宜 畋猎
    if (((this.nextSolarNum >= 20 && this.nextSolarNum <= 23) || this.nextSolarNum <= 2) && ["执", "危", "收"].includes(o)) {
      gbDic.goodThing = rfAdd(gbDic.goodThing, ["畋猎"]);
    }
    // 立冬后立春前危日 午日 申日 宜 伐木
    if (((this.nextSolarNum >= 21 && this.nextSolarNum <= 23) || this.nextSolarNum <= 2) && (["危"].includes(o) || ["午", "申"].includes(d))) {
      gbDic.goodThing = rfAdd(gbDic.goodThing, ["伐木"]);
    }
    // 每月一日 六日 十五 十九日 二十一日 二十三日 忌 整手足甲
    if ([1, 6, 15, 19, 21, 23].includes(ldn)) {
      gbDic.badThing = rfAdd(gbDic.badThing, ["整手足甲"]);
    }
    // 每月十二日 十五日 忌 整容剃头
    if ([12, 15].includes(ldn)) {
      gbDic.badThing = rfAdd(gbDic.badThing, ["整容", "剃头"]);
    }
    // 每月十五日 朔弦望月 忌 求医疗病
    if ([15].includes(ldn) || this.phaseOfMoon !== "") {
      gbDic.badThing = rfAdd(gbDic.badThing, ["求医疗病"]);
    }

    const angel: Array<[string, unknown, unknown, string[], string[]]> = [
      ["岁德", "甲庚丙壬戊甲庚丙壬戊"[yhn]!, d, ["修造", "嫁娶", "纳采", "搬移", "入宅"], []],
      ["岁德合", "己乙辛丁癸己乙辛丁癸"[yhn]!, d, ["修造", "赴任", "嫁娶", "纳采", "搬移", "入宅", "出行"], []],
      [
        "月德",
        "壬庚丙甲壬庚丙甲壬庚丙甲"[men]!,
        d[0]!,
        [
          "祭祀",
          "祈福",
          "求嗣",
          "上册",
          "上表章",
          "颁诏",
          "覃恩",
          "施恩",
          "招贤",
          "举正直",
          "恤孤茕",
          "宣政事",
          "雪冤",
          "庆赐",
          "宴会",
          "出行",
          "安抚边境",
          "选将",
          "出师",
          "上官",
          "临政",
          "结婚姻",
          "纳采",
          "嫁娶",
          "搬移",
          "解除",
          "求医疗病",
          "裁制",
          "营建",
          "缮城郭",
          "修造",
          "竖柱上梁",
          "修仓库",
          "栽种",
          "牧养",
          "纳畜",
          "安葬",
        ],
        ["畋猎", "取鱼"],
      ],
      [
        "月德合",
        "丁乙辛己丁乙辛己丁乙辛己"[men]!,
        d[0]!,
        [
          "祭祀",
          "祈福",
          "求嗣",
          "上册",
          "上表章",
          "颁诏",
          "覃恩",
          "施恩",
          "招贤",
          "举正直",
          "恤孤茕",
          "宣政事",
          "雪冤",
          "庆赐",
          "宴会",
          "出行",
          "安抚边境",
          "选将",
          "出师",
          "上官",
          "临政",
          "结婚姻",
          "纳采",
          "嫁娶",
          "搬移",
          "解除",
          "求医疗病",
          "裁制",
          "营建",
          "缮城郭",
          "修造",
          "竖柱上梁",
          "修仓库",
          "栽种",
          "牧养",
          "纳畜",
          "安葬",
        ],
        ["畋猎", "取鱼"],
      ],
      [
        "天德",
        "巳庚丁申壬辛亥甲癸寅丙乙"[men]!,
        d,
        [
          "祭祀",
          "祈福",
          "求嗣",
          "上册",
          "上表章",
          "颁诏",
          "覃恩",
          "施恩",
          "招贤",
          "举正直",
          "恤孤茕",
          "宣政事",
          "雪冤",
          "庆赐",
          "宴会",
          "出行",
          "安抚边境",
          "选将",
          "出师",
          "上官",
          "临政",
          "结婚姻",
          "纳采",
          "嫁娶",
          "搬移",
          "解除",
          "求医疗病",
          "裁制",
          "营建",
          "缮城郭",
          "修造",
          "竖柱上梁",
          "修仓库",
          "栽种",
          "牧养",
          "纳畜",
          "安葬",
        ],
        ["畋猎", "取鱼"],
      ],
      [
        "天德合",
        "空乙壬空丁丙空己戊空辛庚"[men]!,
        d,
        [
          "祭祀",
          "祈福",
          "求嗣",
          "上册",
          "上表章",
          "颁诏",
          "覃恩",
          "施恩",
          "招贤",
          "举正直",
          "恤孤茕",
          "宣政事",
          "雪冤",
          "庆赐",
          "宴会",
          "出行",
          "安抚边境",
          "选将",
          "出师",
          "上官",
          "临政",
          "结婚姻",
          "纳采",
          "嫁娶",
          "搬移",
          "解除",
          "求医疗病",
          "裁制",
          "营建",
          "缮城郭",
          "修造",
          "竖柱上梁",
          "修仓库",
          "栽种",
          "牧养",
          "纳畜",
          "安葬",
        ],
        ["畋猎", "取鱼"],
      ],
      ["凤凰日", s[0]!, "危昴胃毕"[sn]!, ["嫁娶"], []],
      ["麒麟日", s[0]!, "井尾牛壁"[sn]!, ["嫁娶"], []],
      [
        "三合",
        (den - men) % 4 === 0,
        [true],
        [
          "庆赐",
          "宴会",
          "结婚姻",
          "纳采",
          "嫁娶",
          "进人口",
          "裁制",
          "修宫室",
          "缮城郭",
          "修造",
          "竖柱上梁",
          "修仓库",
          "经络",
          "酝酿",
          "立券交易",
          "纳财",
          "安碓硙",
          "纳畜",
        ],
        [],
      ],
      ["四相", d[0]!, ["丙丁", "戊己", "壬癸", "甲乙"][sn]!, ["祭祀", "祈福", "求嗣", "施恩", "举正直", "庆赐", "宴会", "出行", "上官", "临政", "结婚姻", "纳采", "搬移", "解除", "求医疗病", "裁制", "修宫室", "缮城郭", "修造", "竖柱上梁", "纳财", "开仓", "栽种", "牧养"], []],
      ["五合", d[1]!, "寅卯", ["宴会", "结婚姻", "立券交易"], []],
      ["五富", "巳申亥寅巳申亥寅巳申亥寅"[men]!, d, ["经络", "酝酿", "开市", "立券交易", "纳财", "开仓", "栽种", "牧养", "纳畜"], []],
      ["六合", "丑子亥戌酉申未午巳辰卯寅"[men]!, d, ["宴会", "结婚姻", "嫁娶", "进人口", "经络", "酝酿", "立券交易", "纳财", "纳畜", "安葬"], []],
      ["六仪", "午巳辰卯寅丑子亥戌酉申未"[men]!, d, ["临政"], []],
      ["不将", d, (bujiang as any)[men], ["嫁娶"], []],
      [
        "时德",
        "午辰子寅"[sn]!,
        d[1]!,
        ["祭祀", "祈福", "求嗣", "施恩", "举正直", "庆赐", "宴会", "出行", "上官", "临政", "结婚姻", "纳采", "搬移", "解除", "求医疗病", "裁制", "修宫室", "缮城郭", "修造", "竖柱上梁", "纳财", "开仓", "栽种", "牧养"],
        [],
      ],
      ["大葬", d, "壬申癸酉壬午甲申乙酉丙申丁酉壬寅丙午己酉庚申辛酉", ["安葬"], []],
      ["鸣吠", d, "庚午壬申癸酉壬午甲申乙酉己酉丙申丁酉壬寅丙午庚寅庚申辛酉", ["破土", "安葬"], []],
      ["小葬", d, "庚午壬辰甲辰乙巳甲寅丙辰庚寅", ["安葬"], []],
      ["鸣吠对", d, "丙寅丁卯丙子辛卯甲午庚子癸卯壬子甲寅乙卯", ["破土", "启攒"], []],
      ["不守塚", d, "庚午辛未壬申癸酉戊寅己卯壬午癸未甲申乙酉丁未甲午乙未丙申丁酉壬寅癸卯丙午戊申己酉庚申辛酉", ["破土"], []],
      ["王日", "寅巳申亥"[sn]!, d[1]!, ["颁诏", "覃恩", "施恩", "招贤", "举正直", "恤孤茕", "宣政事", "雪冤", "庆赐", "宴会", "出行", "安抚边境", "选将", "上官", "临政", "裁制"], []],
      ["官日", "卯午酉子"[sn]!, d[1]!, ["上官", "临政"], []],
      ["守日", "酉子卯午"[sn]!, d[1]!, ["安抚边境", "上官", "临政"], []],
      ["相日", "巳申亥寅"[sn]!, d[1]!, ["上官", "临政"], []],
      ["民日", "午酉子卯"[sn]!, d[1]!, ["宴会", "结婚姻", "纳采", "进人口", "搬移", "开市", "立券交易", "纳财", "栽种", "牧养", "纳畜"], []],
      ["临日", "辰酉午亥申丑戌卯子巳寅未"[men]!, d, ["上册", "上表章", "上官", "临政"], []],
      ["天贵", d[0]!, ["甲乙", "丙丁", "庚辛", "壬癸"][sn]!, [], []],
      ["天喜", "申酉戌亥子丑寅卯辰巳午未"[men]!, d[1]!, ["施恩", "举正直", "庆赐", "宴会", "出行", "上官", "临政", "结婚姻", "纳采", "嫁娶"], []],
      ["天富", "寅卯辰巳午未申酉戌亥子丑"[men]!, d, ["安葬", "修仓库"], []],
      ["天恩", dhen % 15 < 5 && Math.floor(dhen / 15) !== 2, [true], ["覃恩", "恤孤茕", "布政事", "雪冤", "庆赐", "宴会"], []],
      [
        "月恩",
        "甲辛丙丁庚己戊辛壬癸庚乙"[men]!,
        d,
        ["祭祀", "祈福", "求嗣", "施恩", "举正直", "庆赐", "宴会", "出行", "上官", "临政", "结婚姻", "纳采", "搬移", "解除", "求医疗病", "裁制", "修宫室", "缮城郭", "修造", "竖柱上梁", "纳财", "开仓", "栽种", "牧养"],
        [],
      ],
      [
        "天赦",
        (["甲子", "甲子", "戊寅", "戊寅", "戊寅", "甲午", "甲午", "甲午", "戊申", "戊申", "戊申", "甲子"] as const)[men]!,
        d,
        [
          "祭祀",
          "祈福",
          "求嗣",
          "上册",
          "上表章",
          "颁诏",
          "覃恩",
          "施恩",
          "招贤",
          "举正直",
          "恤孤茕",
          "宣政事",
          "雪冤",
          "庆赐",
          "宴会",
          "出行",
          "安抚边境",
          "选将",
          "上官",
          "临政",
          "结婚姻",
          "纳采",
          "嫁娶",
          "搬移",
          "解除",
          "求医疗病",
          "裁制",
          "营建",
          "缮城郭",
          "修造",
          "竖柱上梁",
          "修仓库",
          "栽种",
          "牧养",
          "纳畜",
          "安葬",
        ],
        ["畋猎", "取鱼"],
      ],
      [
        "天愿",
        (["甲子", "癸未", "甲午", "甲戌", "乙酉", "丙子", "丁丑", "戊午", "甲寅", "丙辰", "辛卯", "戊辰"] as const)[men]!,
        d,
        [
          "祭祀",
          "祈福",
          "求嗣",
          "上册",
          "上表章",
          "颁诏",
          "覃恩",
          "施恩",
          "招贤",
          "举正直",
          "恤孤茕",
          "宣政事",
          "雪冤",
          "庆赐",
          "宴会",
          "出行",
          "安抚边境",
          "选将",
          "上官",
          "临政",
          "结婚姻",
          "纳采",
          "嫁娶",
          "进人口",
          "搬移",
          "裁制",
          "营建",
          "缮城郭",
          "修造",
          "竖柱上梁",
          "修仓库",
          "经络",
          "酝酿",
          "开市",
          "立券交易",
          "纳财",
          "栽种",
          "牧养",
          "纳畜",
          "安葬",
        ],
        [],
      ],
      ["天成", "卯巳未酉亥丑卯巳未酉亥丑"[men]!, d, [], []],
      ["天官", "午申戌子寅辰午申戌子寅辰"[men]!, d, [], []],
      ["天医", "亥子丑寅卯辰巳午未申酉戌"[men]!, d, ["求医疗病"], []],
      ["天马", "寅辰午申戌子寅辰午申戌子"[men]!, d, ["出行", "搬移"], []],
      ["驿马", "寅亥申巳寅亥申巳寅亥申巳"[men]!, d, ["出行", "搬移"], []],
      ["天财", "子寅辰午申戌子寅辰午申戌"[men]!, d, [], []],
      ["福生", "寅申酉卯戌辰亥巳子午丑未"[men]!, d, ["祭祀", "祈福"], []],
      ["福厚", "寅巳申亥"[sn]!, d, [], []],
      ["福德", "寅卯辰巳午未申酉戌亥子丑"[men]!, d, ["上册", "上表章", "庆赐", "宴会", "修宫室", "缮城郭"], []],
      ["天巫", "寅卯辰巳午未申酉戌亥子丑"[men]!, d, ["求医疗病"], []],
      ["地财", "丑卯巳未酉亥丑卯巳未酉亥"[men]!, d, [], []],
      ["月财", "酉亥午巳巳未酉亥午巳巳未"[men]!, d, [], []],
      ["月空", "丙甲壬庚丙甲壬庚丙甲壬庚"[men]!, d, ["上表章"], []],
      ["母仓", d[1]!, ["亥子", "寅卯", "辰丑戌未", "申酉"][sn]!, ["纳财", "栽种", "牧养", "纳畜"], []],
      ["明星", "辰午甲戌子寅辰午甲戌子寅"[men]!, d, ["赴任", "诉讼", "安葬"], []],
      ["圣心", "辰戌亥巳子午丑未寅申卯酉"[men]!, d, ["祭祀", "祈福"], []],
      ["禄库", "寅卯辰巳午未申酉戌亥子丑"[men]!, d, ["纳财"], []],
      ["吉庆", "未子酉寅亥辰丑午卯申巳戌"[men]!, d, [], []],
      ["阴德", "丑亥酉未巳卯丑亥酉未巳卯"[men]!, d, ["恤孤茕", "雪冤"], []],
      ["活曜", "卯申巳戌未子酉寅亥辰丑午"[men]!, d, [], []],
      ["除神", d[1]!, "申酉", ["解除", "沐浴", "整容", "剃头", "整手足甲", "求医疗病", "扫舍宇"], []],
      ["解神", "午午申申戌戌子子寅寅辰辰"[men]!, d, ["上表章", "解除", "沐浴", "整容", "剃头", "整手足甲", "求医疗病"], []],
      ["生气", "戌亥子丑寅卯辰巳午未申酉"[men]!, d, [], ["伐木", "畋猎", "取鱼"]],
      ["普护", "丑卯申寅酉卯戌辰亥巳子午"[men]!, d, ["祭祀", "祈福"], []],
      ["益后", "巳亥子午丑未寅申卯酉辰戌"[men]!, d, ["祭祀", "祈福", "求嗣"], []],
      ["续世", "午子丑未寅申卯酉辰戌巳亥"[men]!, d, ["祭祀", "祈福", "求嗣"], []],
      ["要安", "未丑寅申卯酉辰戌巳亥午子"[men]!, d, [], []],
      ["天后", "寅亥申巳寅亥申巳寅亥申巳"[men]!, d, ["求医疗病"], []],
      ["天仓", "辰卯寅丑子亥戌酉申未午巳"[men]!, d, ["进人口", "纳财", "纳畜"], []],
      ["敬安", "子午未丑申寅酉卯戌辰亥巳"[men]!, d, [], []],
      ["玉宇", "申寅卯酉辰戌巳亥午子未丑"[men]!, d, [], []],
      ["金堂", "酉卯辰戌巳亥午子未丑申寅"[men]!, d, [], []],
      ["吉期", "丑寅卯辰巳午未申酉戌亥子"[men]!, d, ["施恩", "举正直", "出行", "上官", "临政"], []],
      ["小时", "子丑寅卯辰巳午未申酉戌亥"[men]!, d, [], []],
      ["兵福", "子丑寅卯辰巳午未申酉戌亥"[men]!, d, ["安抚边境", "选将", "出师"], []],
      ["兵宝", "丑寅卯辰巳午未申酉戌亥子"[men]!, d, ["安抚边境", "选将", "出师"], []],
      [
        "兵吉",
        d[1]!,
        (["寅卯辰巳", "丑寅卯辰", "子丑寅卯", "亥子丑寅", "戌亥子丑", "酉戌亥子", "申酉戌亥", "未申酉戌", "午未申酉", "巳午未申", "辰巳午未", "卯辰巳午"] as const)[men]!,
        ["安抚边境", "选将", "出师"],
        [],
      ],
    ];

    const daysUntilSoilKing = diffDays(
      { year: this.nextSolarTermYear, month: twysDate[0], day: twysDate[1], hour: 0, minute: 0, second: 0 },
      this._dateParts,
    );

    const demon: Array<[string, unknown, unknown, string[], string[]]> = [
      ["岁破", den === pyMod(yen + 6, 12), [true], [], ["修造", "搬移", "嫁娶", "出行"]],
      ["天罡", "卯戌巳子未寅酉辰亥午丑申"[men]!, d, [], ["安葬"]],
      ["河魁", "酉辰亥午丑申卯戌巳子未寅"[men]!, d, [], ["安葬"]],
      ["死神", "卯辰巳午未申酉戌亥子丑寅"[men]!, d, [], ["安抚边境", "选将", "出师", "进人口", "解除", "求医疗病", "修置产室", "栽种", "牧养", "纳畜"]],
      ["死气", "辰巳午未申酉戌亥子丑寅卯"[men]!, d, [], ["安抚边境", "选将", "出师", "解除", "求医疗病", "修置产室", "栽种"]],
      ["官符", "辰巳午未申酉戌亥子丑寅卯"[men]!, d, [], ["上表章", "上册"]],
      [
        "月建",
        "子丑寅卯辰巳午未申酉戌亥"[men]!,
        d,
        [],
        [
          "祈福",
          "求嗣",
          "上册",
          "上表章",
          "结婚姻",
          "纳采",
          "解除",
          "整容",
          "剃头",
          "整手足甲",
          "求医疗病",
          "营建",
          "修宫室",
          "缮城郭",
          "修造",
          "竖柱上梁",
          "修仓库",
          "开仓",
          "修置产室",
          "破屋坏垣",
          "伐木",
          "栽种",
          "破土",
          "安葬",
          "启攒",
        ],
      ],
      [
        "月破",
        "午未申酉戌亥子丑寅卯辰巳"[men]!,
        d,
        ["破屋坏垣"],
        [
          "祈福",
          "求嗣",
          "上册",
          "上表章",
          "颁诏",
          "施恩",
          "招贤",
          "举正直",
          "宣政事",
          "布政事",
          "庆赐",
          "宴会",
          "冠带",
          "出行",
          "安抚边境",
          "选将",
          "出师",
          "上官",
          "临政",
          "结婚姻",
          "纳采",
          "嫁娶",
          "进人口",
          "搬移",
          "安床",
          "整容",
          "剃头",
          "整手足甲",
          "裁制",
          "营建",
          "修宫室",
          "缮城郭",
          "筑堤防",
          "修造",
          "竖柱上梁",
          "修仓库",
          "鼓铸",
          "经络",
          "酝酿",
          "开市",
          "立券交易",
          "纳财",
          "开仓",
          "修置产室",
          "开渠",
          "穿井",
          "安碓硙",
          "塞穴",
          "补垣",
          "修饰垣墙",
          "伐木",
          "栽种",
          "牧养",
          "纳畜",
          "破土",
          "安葬",
          "启攒",
        ],
      ],
      [
        "月煞",
        "未辰丑戌未辰丑戌未辰丑戌"[men]!,
        d,
        [],
        [
          "祈福",
          "求嗣",
          "上册",
          "上表章",
          "颁诏",
          "施恩",
          "招贤",
          "举正直",
          "宣政事",
          "布政事",
          "庆赐",
          "宴会",
          "冠带",
          "出行",
          "安抚边境",
          "选将",
          "出师",
          "上官",
          "临政",
          "结婚姻",
          "纳采",
          "嫁娶",
          "进人口",
          "搬移",
          "安床",
          "解除",
          "整容",
          "剃头",
          "整手足甲",
          "求医疗病",
          "裁制",
          "营建",
          "修宫室",
          "缮城郭",
          "筑堤防",
          "修造",
          "竖柱上梁",
          "修仓库",
          "鼓铸",
          "经络",
          "酝酿",
          "开市",
          "立券交易",
          "纳财",
          "开仓",
          "修置产室",
          "开渠",
          "穿井",
          "安碓硙",
          "塞穴",
          "补垣",
          "修饰垣墙",
          "破屋坏垣",
          "栽种",
          "牧养",
          "纳畜",
          "安葬",
        ],
      ],
      [
        "月害",
        "未午巳辰卯寅丑子亥戌酉申"[men]!,
        d,
        [],
        [
          "祈福",
          "求嗣",
          "上册",
          "上表章",
          "庆赐",
          "宴会",
          "安抚边境",
          "选将",
          "出师",
          "上官",
          "纳采",
          "嫁娶",
          "进人口",
          "求医疗病",
          "修仓库",
          "经络",
          "酝酿",
          "开市",
          "立券交易",
          "纳财",
          "开仓",
          "修置产室",
          "牧养",
          "纳畜",
          "破土",
          "安葬",
          "启攒",
        ],
      ],
      [
        "月刑",
        "卯戌巳子辰申午丑寅酉未亥"[men]!,
        d,
        [],
        [
          "祈福",
          "求嗣",
          "上册",
          "上表章",
          "颁诏",
          "施恩",
          "招贤",
          "举正直",
          "宣政事",
          "布政事",
          "庆赐",
          "宴会",
          "冠带",
          "出行",
          "安抚边境",
          "选将",
          "出师",
          "上官",
          "临政",
          "结婚姻",
          "纳采",
          "嫁娶",
          "进人口",
          "搬移",
          "安床",
          "解除",
          "整容",
          "剃头",
          "整手足甲",
          "求医疗病",
          "裁制",
          "营建",
          "修宫室",
          "缮城郭",
          "筑堤防",
          "修造",
          "竖柱上梁",
          "修仓库",
          "鼓铸",
          "经络",
          "酝酿",
          "开市",
          "立券交易",
          "纳财",
          "开仓",
          "修置产室",
          "开渠",
          "穿井",
          "安碓硙",
          "塞穴",
          "补垣",
          "修饰垣墙",
          "破屋坏垣",
          "栽种",
          "牧养",
          "纳畜",
          "破土",
          "安葬",
          "启攒",
        ],
      ],
      [
        "月厌",
        "子亥戌酉申未午巳辰卯寅丑"[men]!,
        d,
        [],
        [
          "祈福",
          "求嗣",
          "上册",
          "上表章",
          "颁诏",
          "施恩",
          "招贤",
          "举正直",
          "宣政事",
          "布政事",
          "庆赐",
          "宴会",
          "冠带",
          "出行",
          "安抚边境",
          "选将",
          "出师",
          "上官",
          "临政",
          "结婚姻",
          "纳采",
          "嫁娶",
          "进人口",
          "搬移",
          "远回",
          "安床",
          "解除",
          "整容",
          "剃头",
          "整手足甲",
          "求医疗病",
          "裁制",
          "营建",
          "修宫室",
          "缮城郭",
          "筑堤防",
          "修造",
          "竖柱上梁",
          "修仓库",
          "鼓铸",
          "经络",
          "酝酿",
          "开市",
          "立券交易",
          "纳财",
          "开仓",
          "修置产室",
          "开渠",
          "穿井",
          "安碓硙",
          "塞穴",
          "补垣",
          "修饰垣墙",
          "平治道涂",
          "破屋坏垣",
          "伐木",
          "栽种",
          "牧养",
          "纳畜",
          "破土",
          "安葬",
          "启攒",
        ],
      ],
      ["月忌", ldn, [5, 14, 23], [], ["出行", "乘船渡水"]],
      ["月虚", "未辰丑戌未辰丑戌未辰丑戌"[men]!, d, [], ["修仓库", "纳财", "开仓"]],
      [
        "灾煞",
        "午卯子酉午卯子酉午卯子酉"[men]!,
        d,
        [],
        [
          "祈福",
          "求嗣",
          "上册",
          "上表章",
          "颁诏",
          "施恩",
          "招贤",
          "举正直",
          "宣政事",
          "布政事",
          "庆赐",
          "宴会",
          "冠带",
          "出行",
          "安抚边境",
          "选将",
          "出师",
          "上官",
          "临政",
          "结婚姻",
          "纳采",
          "嫁娶",
          "进人口",
          "搬移",
          "安床",
          "解除",
          "整容",
          "剃头",
          "整手足甲",
          "求医疗病",
          "裁制",
          "营建",
          "修宫室",
          "缮城郭",
          "筑堤防",
          "修造",
          "竖柱上梁",
          "修仓库",
          "鼓铸",
          "经络",
          "酝酿",
          "开市",
          "立券交易",
          "纳财",
          "开仓",
          "修置产室",
          "开渠",
          "穿井",
          "安碓硙",
          "塞穴",
          "补垣",
          "修饰垣墙",
          "破屋坏垣",
          "栽种",
          "牧养",
          "纳畜",
          "破土",
          "安葬",
          "启攒",
        ],
      ],
      [
        "劫煞",
        "巳寅亥申巳寅亥申巳寅亥申"[men]!,
        d,
        [],
        [
          "祈福",
          "求嗣",
          "上册",
          "上表章",
          "颁诏",
          "施恩",
          "招贤",
          "举正直",
          "宣政事",
          "布政事",
          "庆赐",
          "宴会",
          "冠带",
          "出行",
          "安抚边境",
          "选将",
          "出师",
          "上官",
          "临政",
          "结婚姻",
          "纳采",
          "嫁娶",
          "进人口",
          "搬移",
          "安床",
          "解除",
          "整容",
          "剃头",
          "整手足甲",
          "求医疗病",
          "裁制",
          "营建",
          "修宫室",
          "缮城郭",
          "筑堤防",
          "修造",
          "竖柱上梁",
          "修仓库",
          "鼓铸",
          "经络",
          "酝酿",
          "开市",
          "立券交易",
          "纳财",
          "开仓",
          "修置产室",
          "开渠",
          "穿井",
          "安碓硙",
          "塞穴",
          "补垣",
          "修饰垣墙",
          "破屋坏垣",
          "栽种",
          "牧养",
          "纳畜",
          "破土",
          "安葬",
          "启攒",
        ],
      ],
      ["厌对", "午巳辰卯寅丑子亥戌酉申未"[men]!, d, [], ["嫁娶"]],
      ["招摇", "午巳辰卯寅丑子亥戌酉申未"[men]!, d, [], ["取鱼", "乘船渡水"]],
      ["小红砂", "酉丑巳酉丑巳酉丑巳酉丑巳"[men]!, d, [], ["嫁娶"]],
      ["往亡", "戌丑寅巳申亥卯午酉子辰未"[men]!, d, [], ["上册", "上表章", "颁诏", "招贤", "宣政事", "出行", "安抚边境", "选将", "出师", "上官", "临政", "嫁娶", "进人口", "搬移", "求医疗病", "捕捉", "畋猎", "取鱼"]],
      ["重丧", "癸己甲乙己丙丁己庚辛己壬"[men]!, d, [], ["嫁娶", "安葬"]],
      ["重复", "癸己庚辛己壬癸戊甲乙己壬"[men]!, d, [], ["嫁娶", "安葬"]],
      ["杨公忌", [lmn, ldn], mrY13, [], ["开张", "修造", "嫁娶", "立券"]],
      ["神号", "申酉戌亥子丑寅卯辰巳午未"[men]!, d, [], []],
      ["妨择", "辰辰午午申申戌戌子子寅寅"[men]!, d, [], []],
      ["披麻", "午卯子酉午卯子酉午卯子酉"[men]!, d, [], ["嫁娶", "入宅"]],
      ["大耗", "辰巳午未申酉戌亥子丑寅卯"[men]!, d, [], ["修仓库", "开市", "立券交易", "纳财", "开仓"]],
      ["伏兵", "丙甲壬庚"[pyMod(yen, 4)]!, d[0]!, [], ["修仓库", "修造", "出师"]],
      ["大祸", "丁乙癸辛"[pyMod(yen, 4)]!, d[0]!, [], ["修仓库", "修造", "出师"]],
      [
        "天吏",
        "卯子酉午卯子酉午卯子酉午"[men]!,
        d,
        [],
        [
          "祈福",
          "求嗣",
          "上册",
          "上表章",
          "施恩",
          "招贤",
          "举正直",
          "冠带",
          "出行",
          "安抚边境",
          "选将",
          "出师",
          "上官",
          "临政",
          "结婚姻",
          "纳采",
          "嫁娶",
          "进人口",
          "搬移",
          "安床",
          "解除",
          "求医疗病",
          "营建",
          "修宫室",
          "缮城郭",
          "筑堤防",
          "修造",
          "竖柱上梁",
          "修仓库",
          "开市",
          "立券交易",
          "纳财",
          "开仓",
          "修置产室",
          "栽种",
          "牧养",
          "纳畜",
        ],
      ],
      ["天瘟", "丑卯未戌辰寅午子酉申巳亥"[men]!, d, [], ["修造", "求医疗病", "纳畜"]],
      ["天狱", "午酉子卯午酉子卯午酉子卯"[men]!, d, [], []],
      ["天火", "午酉子卯午酉子卯午酉子卯"[men]!, d, [], ["苫盖"]],
      ["天棒", "寅辰午申戌子寅辰午申戌子"[men]!, d, [], []],
      ["天狗", "寅卯辰巳午未申酉戌亥子丑"[men]!, d, [], ["祭祀"]],
      ["天狗下食", "戌亥子丑寅卯辰巳午未申酉"[men]!, d, [], ["祭祀"]],
      ["天贼", "卯寅丑子亥戌酉申未午巳辰"[men]!, d, [], ["出行", "修仓库", "开仓"]],
      [
        "地囊",
        d,
        (["辛未辛酉", "乙酉乙未", "庚子庚午", "癸未癸丑", "甲子甲寅", "己卯己丑", "戊辰戊午", "癸未癸巳", "丙寅丙申", "丁卯丁巳", "戊辰戊子", "庚戌庚子"] as const)[men]!,
        [],
        ["营建", "修宫室", "缮城郭", "筑堤防", "修造", "修仓库", "修置产室", "开渠", "穿井", "安碓硙", "补垣", "修饰垣墙", "平治道涂", "破屋坏垣", "栽种", "破土"],
      ],
      ["地火", "子亥戌酉申未午巳辰卯寅丑"[men]!, d, [], ["栽种"]],
      ["独火", "未午巳辰卯寅丑子亥戌酉申"[men]!, d, [], ["修造"]],
      ["受死", "卯酉戌辰亥巳子午丑未寅申"[men]!, d, [], ["畋猎"]],
      ["黄沙", "寅子午寅子午寅子午寅子午"[men]!, d, [], ["出行"]],
      ["六不成", "卯未寅午戌巳酉丑申子辰亥"[men]!, d, [], ["修造"]],
      ["小耗", "卯辰巳午未申酉戌亥子丑寅"[men]!, d, [], ["修仓库", "开市", "立券交易", "纳财", "开仓"]],
      ["神隔", "酉未巳卯丑亥酉未巳卯丑亥"[men]!, d, [], ["祭祀", "祈福"]],
      ["朱雀", "亥丑卯巳未酉亥丑卯巳未酉"[men]!, d, [], ["嫁娶"]],
      ["白虎", "寅辰午申戌子寅辰午申戌子"[men]!, d, [], ["安葬"]],
      ["玄武", "巳未酉亥丑卯巳未酉亥丑卯"[men]!, d, [], ["安葬"]],
      ["勾陈", "未酉亥丑卯巳未酉亥丑卯巳"[men]!, d, [], []],
      ["木马", "辰午巳未酉申戌子亥丑卯寅"[men]!, d, [], []],
      ["破败", "辰午申戌子寅辰午申戌子寅"[men]!, d, [], []],
      ["殃败", "巳辰卯寅丑子亥戌酉申未午"[men]!, d, [], []],
      ["雷公", "巳申寅亥巳申寅亥巳申寅亥"[men]!, d, [], []],
      ["飞廉", "申酉戌巳午未寅卯辰亥子丑"[men]!, d, [], ["纳畜", "修造", "搬移", "嫁娶"]],
      ["大煞", "申酉戌巳午未寅卯辰亥子丑"[men]!, d, [], ["安抚边境", "选将", "出师"]],
      ["枯鱼", "申巳辰丑戌未卯子酉午寅亥"[men]!, d, [], ["栽种"]],
      ["九空", "申巳辰丑戌未卯子酉午寅亥"[men]!, d, [], ["进人口", "修仓库", "开市", "立券交易", "纳财", "开仓"]],
      ["八座", "酉戌亥子丑寅卯辰巳午未申"[men]!, d, [], []],
      ["八风触水龙", d, (["丁丑己酉", "甲申甲辰", "辛未丁未", "甲戌甲寅"] as const)[sn]!, [], ["取鱼", "乘船渡水"]],
      ["血忌", "午子丑未寅申卯酉辰戌巳亥"[men]!, d, [], ["针刺"]],
      ["阴错", "壬子癸丑庚寅辛卯庚辰丁巳丙午丁未甲申乙酉甲戌癸亥".slice(men * 2, men * 2 + 2), d, [], []],
      ["三娘煞", ldn, [3, 7, 13, 18, 22, 27], [], ["嫁娶", "结婚姻"]],
      ["四绝", tmd, t4j, [], ["出行", "上官", "嫁娶", "进人口", "搬移", "开市", "立券交易", "祭祀"]],
      ["四离", tmd, t4l, [], ["出行", "嫁娶"]],
      ["四击", "未未戌戌戌丑丑丑辰辰辰未"[men]!, d, [], ["安抚边境", "选将", "出师"]],
      ["四耗", d, (["壬子", "乙卯", "戊午", "辛酉"] as const)[sn]!, [], ["安抚边境", "选将", "出师", "修仓库", "开市", "立券交易", "纳财", "开仓"]],
      ["四穷", d, (["乙亥", "丁亥", "辛亥", "癸亥"] as const)[sn]!, [], ["安抚边境", "选将", "出师", "结婚姻", "纳采", "嫁娶", "进人口", "修仓库", "开市", "立券交易", "纳财", "开仓", "安葬"]],
      ["四忌", d, (["甲子", "丙子", "庚子", "壬子"] as const)[sn]!, [], ["安抚边境", "选将", "出师", "结婚姻", "纳采", "嫁娶", "安葬"]],
      [
        "四废",
        d,
        (["庚申辛酉", "壬子癸亥", "甲寅乙卯", "丁巳丙午"] as const)[sn]!,
        [],
        [
          "祈福",
          "求嗣",
          "上册",
          "上表章",
          "颁诏",
          "施恩",
          "招贤",
          "举正直",
          "宣政事",
          "布政事",
          "庆赐",
          "宴会",
          "冠带",
          "出行",
          "安抚边境",
          "选将",
          "出师",
          "上官",
          "临政",
          "结婚姻",
          "纳采",
          "嫁娶",
          "进人口",
          "搬移",
          "安床",
          "解除",
          "求医疗病",
          "裁制",
          "营建",
          "修宫室",
          "缮城郭",
          "筑堤防",
          "修造",
          "竖柱上梁",
          "修仓库",
          "鼓铸",
          "经络",
          "酝酿",
          "开市",
          "立券交易",
          "纳财",
          "开仓",
          "修置产室",
          "开渠",
          "穿井",
          "安碓硙",
          "塞穴",
          "补垣",
          "修饰垣墙",
          "栽种",
          "牧养",
          "纳畜",
          "破土",
          "安葬",
          "启攒",
        ],
      ],
      ["五墓", (["壬辰", "戊辰", "乙未", "乙未", "戊辰", "丙戌", "丙戌", "戊辰", "辛丑", "辛丑", "戊辰", "壬辰"] as const)[men]!, d, [], ["冠带", "出行", "安抚边境", "选将", "出师", "上官", "临政", "结婚姻", "纳采", "嫁娶", "进人口", "搬移", "安床", "解除", "求医疗病", "营建", "修宫室", "缮城郭", "筑堤防", "修造", "竖柱上梁", "开市", "立券交易", "修置产室", "栽种", "牧养", "纳畜", "破土", "安葬", "启攒"]],
      ["五虚", d[1]!, (["巳酉丑", "申子辰", "亥卯未", "寅午戌"] as const)[sn]!, [], ["修仓库", "开仓"]],
      ["五离", d[1]!, "申酉", ["沐浴"], ["庆赐", "宴会", "结婚姻", "纳采", "立券交易"]],
      ["五鬼", "未戌午寅辰酉卯申丑巳子亥"[men]!, d, [], ["出行"]],
      ["八专", d, ["丁未", "己未", "庚申", "甲寅", "癸丑"], [], ["安抚边境", "选将", "出师", "结婚姻", "纳采", "嫁娶"]],
      ["九坎", "申巳辰丑戌未卯子酉午寅亥"[men]!, d, [], ["塞穴", "补垣", "取鱼", "乘船渡水"]],
      ["九焦", "申巳辰丑戌未卯子酉午寅亥"[men]!, d, [], ["鼓铸", "栽种"]],
      ["天转", "乙卯丙午辛酉壬子".slice(sn * 2, sn * 2 + 2), d, [], ["修造", "搬移", "嫁娶"]],
      ["地转", "辛卯戊午癸酉丙子".slice(sn * 2, sn * 2 + 2), d, [], ["修造", "搬移", "嫁娶"]],
      ["月建转杀", "卯午酉子"[sn]!, d, [], ["修造"]],
      ["荒芜", d[1]!, "巳酉丑申子辰亥卯未寅午戌".slice(sn * 3, sn * 3 + 3), [], []],
      ["蚩尤", "戌子寅辰午申"[pyMod(men, 6)]!, d, [], []],
      [
        "大时",
        "酉午卯子酉午卯子酉午卯子"[men]!,
        d,
        [],
        [
          "祈福",
          "求嗣",
          "上册",
          "上表章",
          "施恩",
          "招贤",
          "举正直",
          "冠带",
          "出行",
          "安抚边境",
          "选将",
          "出师",
          "上官",
          "临政",
          "结婚姻",
          "纳采",
          "嫁娶",
          "进人口",
          "搬移",
          "安床",
          "解除",
          "求医疗病",
          "营建",
          "修宫室",
          "缮城郭",
          "筑堤防",
          "修造",
          "竖柱上梁",
          "修仓库",
          "开市",
          "立券交易",
          "纳财",
          "开仓",
          "修置产室",
          "栽种",
          "牧养",
          "纳畜",
        ],
      ],
      ["大败", "酉午卯子酉午卯子酉午卯子"[men]!, d, [], []],
      ["咸池", "酉午卯子酉午卯子酉午卯子"[men]!, d, [], ["嫁娶", "取鱼", "乘船渡水"]],
      ["土符", "申子丑巳酉寅午戌卯未亥辰"[men]!, d, [], ["营建", "修宫室", "缮城郭", "筑堤防", "修造", "修仓库", "修置产室", "开渠", "穿井", "安碓硙", "补垣", "修饰垣墙", "平治道涂", "破屋坏垣", "栽种", "破土"]],
      ["土府", "子丑寅卯辰巳午未申酉戌亥"[men]!, d, [], ["营建", "修宫室", "缮城郭", "筑堤防", "修造", "修仓库", "修置产室", "开渠", "穿井", "安碓硙", "补垣", "修饰垣墙", "平治道涂", "破屋坏垣", "栽种", "破土"]],
      ["土王用事", daysUntilSoilKing, Array.from({ length: 18 }, (_, i) => i), [], ["营建", "修宫室", "缮城郭", "筑堤防", "修造", "修仓库", "修置产室", "开渠", "穿井", "安碓硙", "补垣", "修饰垣墙", "平治道涂", "破屋坏垣", "栽种", "破土"]],
      ["血支", "亥子丑寅卯辰巳午未申酉戌"[men]!, d, [], ["针刺"]],
      ["游祸", "亥申巳寅亥申巳寅亥申巳寅"[men]!, d, [], ["祈福", "求嗣", "解除", "求医疗病"]],
      ["归忌", "寅子丑寅子丑寅子丑寅子丑"[men]!, d, [], ["搬移", "远回"]],
      ["岁薄", [lmn, d], [[4, "戊午"], [4, "丙午"], [10, "壬子"], [10, "戊子"]], [], []],
      ["逐阵", [lmn, d], [[6, "戊午"], [6, "丙午"], [12, "壬子"], [12, "戊子"]], [], []],
      ["阴阳交破", [lmn, d], [[10, "丁巳"]], [], []],
      ["宝日", d, ["丁未", "丁丑", "丙戌", "甲午", "庚子", "壬寅", "癸卯", "乙巳", "戊申", "己酉", "辛亥", "丙辰"], [], []],
      ["义日", d, ["甲子", "丙寅", "丁卯", "己巳", "辛未", "壬申", "癸酉", "乙亥", "庚辰", "辛丑", "庚戌", "戊午"], [], []],
      ["制日", d, ["乙丑", "甲戌", "壬午", "戊子", "庚寅", "辛卯", "癸巳", "乙未", "丙申", "丁酉", "己亥", "甲辰"], [], []],
      ["伐日", d, ["庚午", "辛巳", "丙子", "戊寅", "己卯", "癸未", "癸丑", "甲申", "乙酉", "丁亥", "壬辰", "壬戌"], [], ["安抚边境", "选将", "出师"]],
      ["专日", d, ["甲寅", "乙卯", "丁巳", "丙午", "庚申", "辛酉", "癸亥", "壬子", "戊辰", "戊戌", "己丑", "己未"], [], ["安抚边境", "选将", "出师"]],
      ["重日", d[1]!, "巳亥", [], ["破土", "安葬", "启攒"]],
      ["复日", "癸巳甲乙戊丙丁巳庚辛戊壬"[men]!, d, ["裁制"], ["破土", "安葬", "启攒"]],
    ];

    const getTodayGoodBadThing = (dic: typeof gbDic): typeof gbDic => {
      const groups: Array<[Array<[string, unknown, unknown, string[], string[]]>, "goodName" | "badName", "goodThing" | "badThing", "goodThing" | "badThing"]> = [
        [angel, "goodName", "goodThing", "badThing"],
        [demon, "badName", "goodThing", "badThing"],
      ];
      for (const [godDb, godNameKey, goodThingKey, badThingKey] of groups) {
        for (const godItem of godDb) {
          if (includesDeep(godItem[2], godItem[1])) {
            dic[godNameKey].push(godItem[0]);
            dic[goodThingKey].push(...godItem[3]);
            dic[badThingKey].push(...godItem[4]);
          }
        }
        dic[goodThingKey] = uniqueStrings(dic[goodThingKey]);
        dic[badThingKey] = uniqueStrings(dic[badThingKey]);
      }
      return dic;
    };

    const gb = getTodayGoodBadThing(gbDic);
    this.goodGodName = gb.goodName;
    this.badGodName = gb.badName;

    const badDrewGood = (dic: typeof gbDic): typeof gbDic => {
      const goodSet = new Set(dic.goodThing);
      const badSet = new Set(dic.badThing);
      const both = [...goodSet].filter((x) => badSet.has(x));
      dic.goodThing = dic.goodThing.filter((x) => !both.includes(x));
      dic.badThing = dic.badThing.filter((x) => !both.includes(x));
      return dic;
    };

    const badOppressGood = (dic: typeof gbDic): typeof gbDic => {
      const badSet = new Set(dic.badThing);
      dic.goodThing = dic.goodThing.filter((x) => !badSet.has(x));
      return dic;
    };

    const goodOppressBad = (dic: typeof gbDic): typeof gbDic => {
      const goodSet = new Set(dic.goodThing);
      dic.badThing = dic.badThing.filter((x) => !goodSet.has(x));
      return dic;
    };

    const nothingGood = (dic: typeof gbDic): typeof gbDic => {
      dic.goodThing = ["诸事不宜"];
      dic.badThing = ["诸事不宜"];
      return dic;
    };

    const thingLevel = this.getTodayThingLevel();
    if (thingLevel === 3) gbDic = nothingGood(gbDic);
    else if (thingLevel === 2) gbDic = badOppressGood(gbDic);
    else if (thingLevel === 1) gbDic = badDrewGood(gbDic);
    else gbDic = goodOppressBad(gbDic);

    this.goodThing = gbDic.goodThing;
    this.badThing = gbDic.badThing;

    const deIsBadThingDic: Record<string, string[]> = {};
    for (const i of angel.slice(0, 6)) {
      deIsBadThingDic[i[0]] = i[4];
    }
    let deIsBadThing: string[] = [];
    if (this.isDe) {
      for (const i of this.goodGodName) {
        if (i in deIsBadThingDic) deIsBadThing = deIsBadThing.concat(deIsBadThingDic[i]!);
      }
    }
    deIsBadThing = uniqueStrings(deIsBadThing);

    if (thingLevel !== 3) {
      if (this.goodThing.includes("宣政事") && this.goodThing.includes("布政事")) {
        this.goodThing = this.goodThing.filter((x) => x !== "布政事");
      }
      if (this.goodThing.includes("营建宫室") && this.goodThing.includes("修宫室")) {
        this.goodThing = this.goodThing.filter((x) => x !== "修宫室");
      }

      let isDeSheEnSixiang = false;
      for (const i of this.goodGodName) {
        if (["岁德合", "月德合", "天德合", "天赦", "天愿", "月恩", "四相", "时德"].includes(i)) {
          isDeSheEnSixiang = true;
          break;
        }
      }
      if (isDeSheEnSixiang && thingLevel !== 2) {
        this.badThing = rfRemove(this.badThing, ["进人口", "安床", "经络", "酝酿", "开市", "立券交易", "纳财", "开仓库", "出货财"]);
        this.badThing = rfAdd(this.badThing, deIsBadThing);
      }

      if (this.badGodName.includes("天狗") || d.includes("寅")) {
        this.badThing = rfAdd(this.badThing, ["祭祀"]);
        this.goodThing = rfRemove(this.goodThing, ["祭祀"]);
        this.goodThing = rfRemove(this.goodThing, ["求福", "祈嗣"]);
      }
      if (d.includes("卯")) {
        this.badThing = rfAdd(this.badThing, ["穿井"]);
        this.goodThing = rfRemove(this.goodThing, ["穿井"]);
        this.goodThing = rfRemove(this.goodThing, ["开渠"]);
      }
      if (d.includes("壬")) {
        this.badThing = rfAdd(this.badThing, ["开渠"]);
        this.goodThing = rfRemove(this.goodThing, ["开渠"]);
        this.goodThing = rfRemove(this.goodThing, ["穿井"]);
      }
      if (d.includes("巳")) {
        this.badThing = rfAdd(this.badThing, ["出行"]);
        this.goodThing = rfRemove(this.goodThing, ["出行"]);
        this.goodThing = rfRemove(this.goodThing, ["出师", "遣使"]);
      }
      if (d.includes("酉")) {
        this.badThing = rfAdd(this.badThing, ["宴会"]);
        this.goodThing = rfRemove(this.goodThing, ["宴会"]);
        this.goodThing = rfRemove(this.goodThing, ["庆赐", "赏贺"]);
      }
      if (d.includes("丁")) {
        this.badThing = rfAdd(this.badThing, ["剃头"]);
        this.goodThing = rfRemove(this.goodThing, ["剃头"]);
        this.goodThing = rfRemove(this.goodThing, ["整容"]);
      }
      if (this.todayLevel === 0 && thingLevel === 0) {
        this.badThing = rfAdd(this.badThing, deIsBadThing);
      }
      if (this.todayLevel === 1) {
        this.badThing = rfAdd(this.badThing, deIsBadThing);
        if (!this.badThing.includes("祈福")) {
          this.badThing = rfRemove(this.badThing, ["求嗣"]);
        }
        if (!this.badThing.includes("结婚姻") && !this.isDe) {
          this.badThing = rfRemove(this.badThing, ["冠带", "纳采问名", "嫁娶", "进人口"]);
        }
        if (!this.badThing.includes("嫁娶") && !this.isDe) {
          if (this.goodGodName.includes("不将")) {
            // pass
          } else {
            this.badThing = rfRemove(this.badThing, ["冠带", "纳采问名", "结婚姻", "进人口", "搬移", "安床"]);
          }
        }
      }
      if (d.includes("亥")) {
        this.badThing = rfAdd(this.badThing, ["嫁娶"]);
      }
      if (this.todayLevel === 1 && !this.isDe) {
        if (!this.badThing.includes("搬移")) this.badThing = rfRemove(this.badThing, ["安床"]);
        if (!this.badThing.includes("安床")) this.badThing = rfRemove(this.badThing, ["搬移"]);
        if (!this.badThing.includes("解除")) this.badThing = rfRemove(this.badThing, ["整容", "剃头", "整手足甲"]);
        if (!this.badThing.includes("修造") || !this.badThing.includes("竖柱上梁")) {
          this.badThing = rfRemove(this.badThing, ["修宫室", "缮城郭", "整手足甲", "筑提", "修仓库", "鼓铸", "苫盖", "修置产室", "开渠穿井", "安碓硙", "补垣塞穴", "修饰垣墙", "平治道涂", "破屋坏垣"]);
        }
      }
      if (this.todayLevel === 1) {
        if (!this.badThing.includes("开市")) this.badThing = rfRemove(this.badThing, ["立券交易", "纳财", "开仓库", "出货财"]);
        if (!this.badThing.includes("纳财")) this.badThing = rfRemove(this.badThing, ["立券交易", "开市"]);
        if (!this.badThing.includes("立券交易")) this.badThing = rfRemove(this.badThing, ["纳财", "开市", "开仓库", "出货财"]);
      }
      if (this.todayLevel === 1) {
        if (!this.badThing.includes("牧养")) this.badThing = rfRemove(this.badThing, ["纳畜"]);
        if (!this.badThing.includes("纳畜")) this.badThing = rfRemove(this.badThing, ["牧养"]);
        if (this.goodThing.includes("安葬")) this.badThing = rfRemove(this.badThing, ["启攒"]);
        if (this.goodThing.includes("启攒")) this.badThing = rfRemove(this.badThing, ["安葬"]);
      }
      if (this.badThing.includes("诏命公卿") || this.badThing.includes("招贤")) {
        this.goodThing = rfRemove(this.goodThing, ["施恩", "举正直"]);
      }
      if (this.badThing.includes("施恩") || this.badThing.includes("举正直")) {
        this.goodThing = rfRemove(this.goodThing, ["诏命公卿", "招贤"]);
      }
      if (this.goodThing.includes("宣政事") && this.badGodName.includes("往亡")) {
        this.goodThing = this.goodThing.filter((x) => x !== "宣政事");
        this.goodThing = rfAdd(this.goodThing, ["布政事"]);
      }
      if (this.badGodName.includes("月厌")) {
        this.goodThing = rfRemove(this.goodThing, ["颁诏", "施恩", "招贤", "举正直", "宣政事"]);
        this.goodThing = rfAdd(this.goodThing, ["布政事"]);
        this.badThing = rfAdd(this.badThing, ["补垣"]);
        if (this.badGodName.includes("土府") || this.badGodName.includes("土符") || this.badGodName.includes("地囊")) {
          this.goodThing = rfRemove(this.goodThing, ["塞穴"]);
        }
      }
      if (this.today12DayOfficer.includes("开")) {
        this.goodThing = rfRemove(this.goodThing, ["破土", "安葬", "启攒"]);
      }
      if (this.badGodName.includes("四忌") || this.badGodName.includes("四穷")) {
        this.badThing = rfAdd(this.badThing, ["安葬"]);
        this.goodThing = rfRemove(this.goodThing, ["破土", "启攒"]);
      }
      if (this.goodGodName.includes("鸣吠") || this.goodGodName.includes("鸣吠对")) {
        this.goodThing = rfRemove(this.goodThing, ["破土", "启攒"]);
      }
      if (["空", "甲戌", "空", "丙申", "空", "甲子", "戊申", "庚辰", "辛卯", "甲子", "空", "甲子"][lmn - 1] && d.includes(["空", "甲戌", "空", "丙申", "空", "甲子", "戊申", "庚辰", "辛卯", "甲子", "空", "甲子"][lmn - 1]!)) {
        this.badThing = ["诸事不忌"];
      }
      const hasDeHe = this.goodGodName.some((x) => ["岁德合", "月德合", "天德合"].includes(x));
      const hasSheYuan = this.goodGodName.some((x) => ["天赦", "天愿"].includes(x));
      if (hasDeHe && hasSheYuan) {
        this.badThing = ["诸事不忌"];
      }
    }

    const rmThing: string[] = [];
    for (const thing of this.badThing) {
      if (this.goodThing.includes(thing)) rmThing.push(thing);
    }
    if (rmThing.length === 1 && rmThing[0]!.includes("诸事")) {
      // pass
    } else {
      this.goodThing = rfRemove(this.goodThing, rmThing);
    }

    if (this.badThing.length === 0) this.badThing = ["诸事不忌"];
    if (this.goodThing.length === 0) this.goodThing = ["诸事不宜"];

    this.badThing.sort((a, b) => sortCollation(a) - sortCollation(b));
    this.goodThing.sort((a, b) => sortCollation(a) - sortCollation(b));
    return [[this.goodGodName, this.badGodName], [this.goodThing, this.badThing]];
  }
}
