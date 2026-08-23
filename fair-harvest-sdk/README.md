# Fair Harvest SDK

Small JavaScript client for the Fair Harvest REST API.

## Usage

```js
import { FairHarvestClient } from "@fair-harvest/sdk";

const client = new FairHarvestClient({ baseUrl: "http://localhost:4000" });
const health = await client.health();
const plan = await client.recommendNutrition({
  age: 35,
  weight: 72,
  conditions: ["diabetes"],
  goal: "weight_loss"
});
```

Every method returns the standard Fair Harvest response envelope.
