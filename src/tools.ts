import { ENC_VECTOR_LIST, thingsSort } from "./config";

export function rfRemove(list: string[], removeList: string[]): string[] {
  if (removeList.length === 0 || list.length === 0) return list;
  const removeSet = new Set(removeList);
  return list.filter((item) => !removeSet.has(item));
}

export function rfAdd(list: string[], addList: string[]): string[] {
  if (addList.length === 0) return [...new Set(list)];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of list) {
    if (seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  for (const item of addList) {
    if (seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}

export function abListMerge(a: ReadonlyArray<number>, b: ReadonlyArray<number> = ENC_VECTOR_LIST, type: 1 | -1 = 1): number[] {
  const out: number[] = [];
  for (let i = 0; i < a.length; i += 1) {
    out.push(a[i]! + b[i]! * type);
  }
  return out;
}

export function sortCollation(item: string, sortList: ReadonlyArray<string> = thingsSort): number {
  const idx = sortList.indexOf(item);
  if (idx >= 0) return idx;
  return sortList.length + 1;
}

