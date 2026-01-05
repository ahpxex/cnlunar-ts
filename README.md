# cnlunar-bun

TypeScript/Bun 版中国农历库，移植自同仓库中的 Python 版 cnlunar。

## 项目特点

1. 不使用寿星通式 [Y*D+C]-L，而使用香港天文台数据，确保阴阳合历准确性
2. 无数据库依赖，运行快速，提供丰富的农历信息
3. 主要内容来自《钦定协纪辨方书》，每一个神煞宜忌都有依据
4. 开源免费，类型安全的 TypeScript 实现
5. 完全兼容 Python 版本的数据输出，通过严格的对比测试

## 感谢

本项目是 [cnlunar](https://github.com/OPN48/cnlunar) Python 版本的 TypeScript 移植版本。

特别感谢原项目作者及贡献者：
- @DarkmoonRabbit
- @JeremyYoungCai
- @kingsoen
- @Sonic853

原项目采用香港天文台 1901-2100 年的《公历农历对照表》数据，基于《钦定协纪辨方书》实现了中国农历的完整功能。

## 安装

```bash
bun add cnlunar-bun
```


## 快速上手

```typescript
import { Lunar } from "cnlunar-bun";

// 创建农历对象 - 常规算法
const lunar = new Lunar(new Date(2022, 10, 14, 10, 30), { godType: "8char" });

// 创建农历对象 - 八字立春切换算法
// const lunar = new Lunar(new Date(2022, 1, 3, 10, 30), {
//   godType: "8char",
//   year8Char: "beginningOfSpring"
// });

console.log({
  "日期": lunar.date,
  "农历数字": [lunar.lunarYear, lunar.lunarMonth, lunar.lunarDay, lunar.isLunarLeapMonth ? "闰" : ""],
  "农历": `${lunar.lunarYearCn} ${lunar.year8Char}[${lunar.chineseYearZodiac}]年 ${lunar.lunarMonthCn}${lunar.lunarDayCn}`,
  "星期": lunar.weekDayCn,
  "今日节日": [
    lunar.get_legalHolidays(),
    lunar.get_otherHolidays(),
    lunar.get_otherLunarHolidays()
  ],
  "八字": [lunar.year8Char, lunar.month8Char, lunar.day8Char, lunar.twohour8Char].join(" "),
  "今日节气": lunar.todaySolarTerms,
  "下一节气": [lunar.nextSolarTerm, lunar.nextSolarTermDate, lunar.nextSolarTermYear],
  "今年节气表": lunar.thisYearSolarTermsDic,
  "季节": lunar.lunarSeason,
  "今日时辰": lunar.twohour8CharList,
  "时辰凶吉": lunar.get_twohourLuckyList(),
  "生肖冲煞": lunar.chineseZodiacClash,
  "星座": lunar.starZodiac,
  "星次": lunar.todayEastZodiac,
  "彭祖百忌": lunar.get_pengTaboo(),
  "彭祖百忌精简": lunar.get_pengTaboo(4, "<br>"),
  "十二神": lunar.get_today12DayOfficer(),
  "廿八宿": lunar.get_the28Stars(),
  "今日五行": lunar.get_today5Elements(),
  "纳音": lunar.get_nayin(),
  "九宫飞星": lunar.get_the9FlyStar(),
  "吉神方位": lunar.get_luckyGodsDirection(),
  "今日胎神": lunar.get_fetalGod(),
  "今日吉神": lunar.goodGodName,
  "今日凶煞": lunar.badGodName,
  "宜忌等第": lunar.todayLevelName,
  "宜": lunar.goodThing,
  "忌": lunar.badThing,
  "时辰经络": lunar.meridians
});
```

## API 文档

### Lunar 类

#### 构造函数

```typescript
new Lunar(date?: Date, options?: LunarOptions)
```

参数：
- `date`: 日期对象，默认为当前时间
- `options`: 可选配置
  - `godType`: 神煞算法类型，`"8char"` (默认) 或 `"cnlunar"`
  - `year8Char`: 年柱切换方式，`"year"` (默认) 或 `"beginningOfSpring"` (立春切换)

#### 基本属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `date` | `Date` | 公历日期 |
| `lunarYear` | `number` | 农历年份 |
| `lunarMonth` | `number` | 农历月份 (1-12) |
| `lunarDay` | `number` | 农历日期 (1-30) |
| `isLunarLeapMonth` | `boolean` | 是否闰月 |
| `lunarYearCn` | `string` | 农历年份中文 |
| `lunarMonthCn` | `string` | 农历月份中文 |
| `lunarDayCn` | `string` | 农历日期中文 |
| `weekDayCn` | `string` | 星期中文 |

#### 节气相关

| 属性 | 类型 | 说明 |
|------|------|------|
| `todaySolarTerms` | `string` | 今日节气 |
| `nextSolarTerm` | `string` | 下一节气名称 |
| `nextSolarTermDate` | `[number, number]` | 下一节气日期 [月, 日] |
| `nextSolarTermYear` | `number` | 下一节气年份 |
| `thisYearSolarTermsDic` | `Record<string, [number, number]>` | 今年全部节气 |
| `lunarSeason` | `string` | 当前季节 |

#### 八字相关

| 属性 | 类型 | 说明 |
|------|------|------|
| `year8Char` | `string` | 年柱 |
| `month8Char` | `string` | 月柱 |
| `day8Char` | `string` | 日柱 |
| `twohour8Char` | `string` | 时柱 |
| `twohour8CharList` | `string[]` | 全天时辰列表 |

#### 生肖星座

| 属性 | 类型 | 说明 |
|------|------|------|
| `chineseYearZodiac` | `string` | 生肖 |
| `chineseZodiacClash` | `string` | 生肖冲煞 |
| `starZodiac` | `string` | 星座 |
| `todayEastZodiac` | `string` | 星次 |

#### 神煞宜忌

| 属性 | 类型 | 说明 |
|------|------|------|
| `goodGodName` | `string[]` | 今日吉神 |
| `badGodName` | `string[]` | 今日凶煞 |
| `todayLevel` | `number` | 宜忌等第数值 |
| `todayLevelName` | `string` | 宜忌等第名称 |
| `goodThing` | `Set<string>` | 今日宜做的事 |
| `badThing` | `Set<string>` | 今日忌做的事 |

#### 其他属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `phaseOfMoon` | `string` | 月相 |
| `today12DayOfficer` | `string` | 十二神 |
| `today12DayGod` | `string` | 十二值神 |
| `today28Star` | `string` | 二十八星宿 |
| `meridians` | `string` | 时辰对应经络 |

#### 方法

| 方法 | 返回类型 | 说明 |
|------|----------|------|
| `get_legalHolidays()` | `string` | 获取法定节假日 |
| `get_otherHolidays()` | `string` | 获取其他节日 |
| `get_otherLunarHolidays()` | `string` | 获取农历节日 |
| `get_pengTaboo(long?, delimit?)` | `string` | 获取彭祖百忌 |
| `get_the28Stars()` | `string` | 获取二十八星宿详情 |
| `get_nayin()` | `string` | 获取纳音 |
| `get_today5Elements()` | `string` | 获取今日五行 |
| `get_the9FlyStar()` | `string` | 获取九宫飞星 |
| `get_luckyGodsDirection()` | `string` | 获取吉神方位 |
| `get_fetalGod()` | `string` | 获取胎神方位 |
| `get_twohourLuckyList()` | `string[]` | 获取时辰吉凶 |
| `get_today12DayOfficer()` | `string` | 获取建除十二神 |

## 开发指南

### 运行测试

项目包含完整的测试套件，与 Python 版本进行对比验证：

```bash
bun test
```

测试会自动调用 Python 版本作为参照，确保 TypeScript 版本的输出与 Python 版本完全一致。

### 项目结构

```
cnlunar-bun/
├── src/
│   ├── index.ts         # 导出入口
│   ├── lunar.ts         # 核心 Lunar 类
│   ├── config.ts        # 配置数据
│   ├── solar24.ts       # 二十四节气计算
│   ├── holidays.ts      # 节日数据
│   ├── tools.ts         # 工具函数
│   └── datetime.ts      # 日期处理工具
├── test/
│   └── lunar.test.ts    # 测试文件
├── package.json
├── tsconfig.json
└── README.md
```

## 贡献指南

欢迎提交问题和拉取请求！

### 如何贡献

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的修改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个 Pull Request

### 开发规范

- 遵循 TypeScript 最佳实践
- 保持与 Python 版本的数据输出一致性
- 添加测试用例覆盖新功能
- 更新文档说明新增的 API

### 报告问题

如果你发现 Bug 或有功能建议，请在 [GitHub Issues](https://github.com/OPN48/cnlunar/issues) 中提交。

## 许可证

本项目继承原项目的 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 相关链接

- Python 原版项目: https://github.com/OPN48/cnlunar
- PyPI: https://pypi.org/project/cnlunar/
- 香港天文台公历农历对照表: https://www.hko.gov.hk/sc/gts/time/conversion.htm