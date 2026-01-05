# cnlunar-bun

TypeScript/Bun port of the `cnlunar` Python library in this repo.

## Usage

```ts
import { Lunar } from "cnlunar-bun";

const lunar = new Lunar(new Date(2022, 10, 14, 10, 30), { godType: "8char" });
console.log(lunar.lunarYear, lunar.lunarMonth, lunar.lunarDay);
```

