import { SOLAR_TERMS_DATA_LIST, START_YEAR } from "./config";
import { abListMerge } from "./tools";

export function unZipSolarTermsList(data: bigint | number | string, rangeEndNum = 24, charCountLen = 2): number[] {
  let value: bigint;
  if (typeof data === "string") {
    value = BigInt(data);
  } else if (typeof data === "number") {
    value = BigInt(data);
  } else {
    value = data;
  }

  const list2: number[] = [];
  const c = BigInt(2 ** charCountLen);
  for (let i = 1; i <= rangeEndNum; i += 1) {
    const right = BigInt(charCountLen * (rangeEndNum - i));
    const x = value >> right;
    list2.unshift(Number(x % c));
  }
  return abListMerge(list2);
}

export function zipSolarTermsList(inputList: ReadonlyArray<number>, charCountLen = 2): [string, number] {
  const tempList = abListMerge(inputList, undefined, -1);
  let data = 0n;
  let num = 0n;
  const shiftWidth = BigInt(charCountLen);
  for (const item of tempList) {
    data += BigInt(item) << (shiftWidth * num);
    num += 1n;
  }
  return [`0x${data.toString(16)}`, tempList.length];
}

export function getTheYearAllSolarTermsList(year: number): number[] {
  return unZipSolarTermsList(SOLAR_TERMS_DATA_LIST[year - START_YEAR]!);
}

