
export const openPositions = {
  "combinator": "and",
  "rules": [
    {
      "field": "positionStatus",
      "operator": "=",
      "valueSource": "value",
      "value": "open",
    },
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

export const applied = {
  "combinator": "or",
  "rules": [
      {
          "field": "status1",
          "operator": "=",
          "valueSource": "value",
          "value": "applied"
      },
      {
          "field": "status1",
          "operator": "=",
          "valueSource": "value",
          "value": "uncertain"
      }
  ],
}