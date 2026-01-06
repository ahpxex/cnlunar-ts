/**
 * i18n type definitions for cnlunar-bun
 */

export type Locale = "zh" | "en";

export interface TranslationLabels {
  // Basic labels
  none: string;
  large: string; // Month size: 大/Long (30 days)
  small: string; // Month size: 小/Short (29 days)
  leap: string; // Leap month prefix: 闰

  // Moon phases
  fullMoon: string; // 望
  newMoon: string; // 朔
  firstQuarter: string; // 上弦
  lastQuarter: string; // 下弦

  // Seasons
  earlySeason: string; // 孟
  midSeason: string; // 仲
  lateSeason: string; // 季
  spring: string; // 春
  summer: string; // 夏
  autumn: string; // 秋
  winter: string; // 冬

  // God direction labels
  luckyGod: string; // 喜神
  wealthGod: string; // 财神
  mascotGod: string; // 福神
  sunNoble: string; // 阳贵
  moonNoble: string; // 阴贵

  // Day clash
  dayClash: string; // 日冲

  // Level descriptions
  auspicious: string; // 吉
  inauspicious: string; // 凶

  // Day type
  yellowRoadDay: string; // 黄道日
  blackRoadDay: string; // 黑道日
}

export interface TranslationData {
  // Western zodiac signs (12)
  starZodiacNames: readonly string[];

  // Solar terms (24)
  solarTermsNames: readonly string[];

  // Eastern zodiac (12) - 玄枵, 娵訾, etc.
  eastZodiacList: readonly string[];

  // 10 Heavenly Stems - 甲乙丙丁戊己庚辛壬癸
  heavenlyStems: readonly string[];

  // 10 Heavenly Stems with 5 elements
  heavenlyStems5Elements: readonly string[];

  // 12 Earthly Branches - 子丑寅卯辰巳午未申酉戌亥
  earthlyBranches: readonly string[];

  // 12 Earthly Branches with 5 elements
  earthlyBranches5Elements: readonly string[];

  // 60 Heavenly-Earthly combinations (Jiazi cycle)
  heavenlyEarth60: readonly string[];

  // 30 Nayin 5 elements (海中金, 炉中火, etc.)
  nayin5Elements: readonly string[];

  // 28 Lunar mansions
  stars28: readonly string[];

  // Peng Zu taboos (22 items)
  pengTaboo: readonly string[];

  // Chinese zodiac animals (12)
  chineseZodiacNames: readonly string[];

  // 12 Day officers - 建除满平定执破危成收开闭
  dayOfficers12: string;

  // 12 Day gods - 青龙, 明堂, etc.
  dayGods12: readonly string[];

  // 8 Directions
  directions: readonly string[];

  // 8 Trigrams - 坎艮震巽离坤兑乾
  trigrams8: string;

  // 60 Fetal god positions
  fetalGodPositions: readonly string[];

  // 12 Meridians
  meridians: readonly string[];

  // Lunar month names (12)
  lunarMonthNames: readonly string[];

  // Lunar day names (30)
  lunarDayNames: readonly string[];

  // Upper numerals (0-9)
  upperNumerals: readonly string[];

  // Weekday names (7)
  weekDays: readonly string[];

  // 5 Elements
  elements5: readonly string[];

  // Labels
  labels: TranslationLabels;

  // Activities/things translation map
  activities: Record<string, string>;

  // Holiday translations
  holidays: {
    legalSolarTerms: Record<string, string>;
    legalSolar: Record<string, string>;
    legalLunar: Record<string, string>;
    otherSolar: Record<string, string>;
    otherLunar: Record<string, string>;
  };

  // Level descriptions
  thingLevels: Record<number, string>;
  todayLevels: Record<number, string>;
}
