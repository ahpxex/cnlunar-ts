/**
 * Chinese (zh) locale - default locale
 * Re-exports Chinese strings from config.ts
 */

import type { TranslationData } from "../types";
import {
  STAR_ZODIAC_NAME,
  SOLAR_TERMS_NAME_LIST,
  EAST_ZODIAC_LIST,
  the10HeavenlyStems,
  the10HeavenlyStems5ElementsList,
  the12EarthlyBranches,
  the12EarthlyBranches5ElementsList,
  the60HeavenlyEarth,
  theHalf60HeavenlyEarth5ElementsList,
  the28StarsList,
  pengTatooList,
  chineseZodiacNameList,
  chinese12DayOfficers,
  chinese12DayGods,
  directionList,
  chinese8Trigrams,
  fetalGodList,
  meridiansName,
  lunarMonthNameList,
  lunarDayNameList,
  upperNum,
  weekDay,
} from "../../config";

import {
  legalSolarTermsHoliday,
  legalHolidays,
  legalLunarHolidays,
  otherHolidaysByMonth,
  otherLunarHolidaysByMonth,
} from "../../holidays";

// Build other solar holidays map
const otherSolarHolidays: Record<string, string> = {};
otherHolidaysByMonth.forEach((monthHolidays, monthIdx) => {
  for (const [day, name] of Object.entries(monthHolidays)) {
    otherSolarHolidays[`${monthIdx + 1}-${day}`] = name;
  }
});

// Build other lunar holidays map
const otherLunarHolidays: Record<string, string> = {};
otherLunarHolidaysByMonth.forEach((monthHolidays, monthIdx) => {
  for (const [day, name] of Object.entries(monthHolidays)) {
    otherLunarHolidays[`${monthIdx + 1}-${day}`] = name;
  }
});

// Activities translation (Chinese to Chinese - identity mapping for zh locale)
const activities: Record<string, string> = {
  // Common activities from thingsSort and officerThings
  "祭祀": "祭祀",
  "出行": "出行",
  "移徙": "移徙",
  "结婚姻": "结婚姻",
  "宴会": "宴会",
  "嫁娶": "嫁娶",
  "安床": "安床",
  "沐浴": "沐浴",
  "剃头": "剃头",
  "修造": "修造",
  "求医疗病": "求医疗病",
  "上表章": "上表章",
  "上官": "上官",
  "入学": "入学",
  "冠带": "冠带",
  "进人口": "进人口",
  "裁衣": "裁衣",
  "竖柱上梁": "竖柱上梁",
  "经络": "经络",
  "开市": "开市",
  "立券": "立券",
  "交易": "交易",
  "纳财": "纳财",
  "修置产室": "修置产室",
  "开渠": "开渠",
  "穿井": "穿井",
  "安碓硙": "安碓硙",
  "扫舍宇": "扫舍宇",
  "平治道涂": "平治道涂",
  "破屋坏垣": "破屋坏垣",
  "伐木": "伐木",
  "捕捉": "捕捉",
  "畋猎": "畋猎",
  "栽种": "栽种",
  "牧养": "牧养",
  "破土": "破土",
  "安葬": "安葬",
  "启攒": "启攒",
  "施恩": "施恩",
  "招贤": "招贤",
  "举正直": "举正直",
  "临政": "临政",
  "解除": "解除",
  "整容": "整容",
  "整手足甲": "整手足甲",
  "裁制": "裁制",
  "立券交易": "立券交易",
  "开仓": "开仓",
  "塞穴": "塞穴",
  "补垣": "补垣",
  "纳采": "纳采",
  "修饰垣墙": "修饰垣墙",
  "祈福": "祈福",
  "求嗣": "求嗣",
  "上册": "上册",
  "颁诏": "颁诏",
  "宣政事": "宣政事",
  "布政事": "布政事",
  "庆赐": "庆赐",
  "安抚边境": "安抚边境",
  "选将": "选将",
  "出师": "出师",
  "搬移": "搬移",
  "营建": "营建",
  "修宫室": "修宫室",
  "缮城郭": "缮城郭",
  "筑堤防": "筑堤防",
  "修仓库": "修仓库",
  "鼓铸": "鼓铸",
  "酝酿": "酝酿",
  "纳畜": "纳畜",
  "覃恩": "覃恩",
  "恤孤茕": "恤孤茕",
  "雪冤": "雪冤",
  "疗目": "疗目",
};

export const zh: TranslationData = {
  // Western zodiac signs
  starZodiacNames: STAR_ZODIAC_NAME,

  // Solar terms
  solarTermsNames: SOLAR_TERMS_NAME_LIST,

  // Eastern zodiac
  eastZodiacList: EAST_ZODIAC_LIST,

  // Heavenly stems
  heavenlyStems: the10HeavenlyStems,
  heavenlyStems5Elements: the10HeavenlyStems5ElementsList,

  // Earthly branches
  earthlyBranches: the12EarthlyBranches,
  earthlyBranches5Elements: the12EarthlyBranches5ElementsList,

  // 60 Jiazi cycle
  heavenlyEarth60: the60HeavenlyEarth,

  // Nayin 5 elements
  nayin5Elements: theHalf60HeavenlyEarth5ElementsList,

  // 28 Lunar mansions
  stars28: the28StarsList,

  // Peng Zu taboos
  pengTaboo: pengTatooList,

  // Chinese zodiac
  chineseZodiacNames: chineseZodiacNameList,

  // Day officers
  dayOfficers12: chinese12DayOfficers,

  // Day gods
  dayGods12: chinese12DayGods,

  // Directions
  directions: directionList,

  // Trigrams
  trigrams8: chinese8Trigrams,

  // Fetal god positions
  fetalGodPositions: fetalGodList,

  // Meridians
  meridians: meridiansName,

  // Lunar month names
  lunarMonthNames: lunarMonthNameList,

  // Lunar day names
  lunarDayNames: lunarDayNameList,

  // Upper numerals
  upperNumerals: upperNum,

  // Weekdays
  weekDays: weekDay,

  // 5 Elements
  elements5: ["木", "火", "土", "金", "水"],

  // Labels
  labels: {
    none: "无",
    large: "大",
    small: "小",
    leap: "闰",
    fullMoon: "望",
    newMoon: "朔",
    firstQuarter: "上弦",
    lastQuarter: "下弦",
    earlySeason: "孟",
    midSeason: "仲",
    lateSeason: "季",
    spring: "春",
    summer: "夏",
    autumn: "秋",
    winter: "冬",
    luckyGod: "喜神",
    wealthGod: "财神",
    mascotGod: "福神",
    sunNoble: "阳贵",
    moonNoble: "阴贵",
    dayClash: "日冲",
    auspicious: "吉",
    inauspicious: "凶",
    yellowRoadDay: "黄道日",
    blackRoadDay: "黑道日",
  },

  // Activities
  activities,

  // Holidays
  holidays: {
    legalSolarTerms: legalSolarTermsHoliday,
    legalSolar: legalHolidays,
    legalLunar: legalLunarHolidays,
    otherSolar: otherSolarHolidays,
    otherLunar: otherLunarHolidays,
  },

  // Level descriptions
  thingLevels: {
    0: "大凶",
    1: "凶",
    2: "次凶",
    3: "平",
    4: "次吉",
    5: "吉",
    6: "大吉",
  },
  todayLevels: {
    0: "大凶",
    1: "凶",
    2: "次凶",
    3: "平",
    4: "次吉",
    5: "吉",
    6: "大吉",
  },
};
