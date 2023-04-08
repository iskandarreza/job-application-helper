
export const openPositions = {
  "combinator": "and",
  "rules": [
    {
      "field": "positionStatus",
      "operator": "=",
      "valueSource": "value",
      "value": "open",
    },
    // {
    //   "field": "externalSource",
    //   "operator": "=",
    //   "valueSource": "value",
    //   "value": "false",
    // },
    {
      "field": "status1",
      "operator": "!=",
      "valueSource": "value",
      "value": "applied"
    },
    {
      "field": "status1",
      "operator": "!=",
      "valueSource": "value",
      "value": "uncertain"
    },
    {
      "field": "status1",
      "operator": "!=",
      "valueSource": "value",
      "value": "declined"
    }
  ],
}