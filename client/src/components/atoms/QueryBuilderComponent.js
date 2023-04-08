import React, { useState } from 'react'
import DragIndicator from '@mui/icons-material/DragIndicator'
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Input,
  ListSubheader,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextareaAutosize,
} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import { QueryBuilderMaterial } from '@react-querybuilder/material'
import { formatQuery, QueryBuilder } from 'react-querybuilder'
import { QueryBuilderDnD } from '@react-querybuilder/dnd'
import { postStatusOpts, status1Opts, status2Opts } from '../fieldOpts'
import SubmitQueryComponent from './SubmitQueryComponent'

const fields = [
  { name: 'id', label: 'Job ID' },
  { name: 'org', label: 'Organization' },
  { name: 'role', label: 'Position' },
  { name: 'location', label: 'Location' },
  {
    name: 'positionStatus',
    label: 'Position Status',
    operators: [
      { name: '=', label: 'is' }
    ],
    valueEditorType: 'select',
    values: [
      ...postStatusOpts.map((v) => Object.create({ name: v, label: v }))
    ]
  },
  { name: 'keywords', label: 'Keywords' },
  {
    name: 'status1',
    label: 'Status 1',
    operators: [
      { name: '=', label: 'is' },
      { name: '!=', label: 'is not' },
    ],
    valueEditorType: 'select',
    values: [
      ...status1Opts.map((v) => Object.create({ name: v, label: v }))
    ]
  },
  {
    name: 'status2',
    label: 'Status 2',
    operators: [
      { name: '=', label: 'is' },
      { name: '!=', label: 'is not' },
    ],
    valueEditorType: 'select',
    values: [
      ...status2Opts.map((v) => Object.create({ name: v, label: v }))
    ]
  },
  {
    name: 'externalSource',
    label: 'isExternal',
    operators: [
      { name: '=', label: 'is' }
    ],
    valueEditorType: 'select',
    values: [
      ...['true', 'false'].map((v) => Object.create({ name: v, label: v }))
    ],
    rules: []
  },
  {
    name: 'crawlDate',
    label: 'crawledDate',
    operators: [
      { name: 'notNull', label: 'exists' }
    ],
  },
]

const initialQuery = {
  "combinator": "and",
  "rules": [
    {
      "field": "positionStatus",
      "operator": "=",
      "valueSource": "value",
      "value": "open",
    },
    {
      "field": "externalSource",
      "operator": "=",
      "valueSource": "value",
      "value": "false",
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

const muiComponents = {
  Button,
  Checkbox,
  DragIndicator,
  FormControl,
  FormControlLabel,
  Input,
  ListSubheader,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextareaAutosize,
}

const useStyles = makeStyles((theme) => ({
  queryBuilder: {
    '& .ruleGroup-header, & .rule, & .queryBuilder-dragHandle': {
      display: 'flex',
      alignItems: 'center',
    },
    '& .ruleGroup-header, & .ruleGroup-body, & .rule': {
      gap: '10px',
    },
    '& .ruleGroup:not(:nth-child(1)), & .ruleGroup-body': {
      marginTop: '10px',
    },
    '& .ruleGroup-body': {
      flexDirection: 'column',
    },
    '& .rule': {
      marginBottom: '10px',
    },
    '& .ruleGroup-remove, & .rule-remove': {
      marginLeft: 'auto',
    },
    '& [data-level]:not([data-level="0"])': {
      marginLeft: '10px',
    },
  },
  queryStringBox: {
    display: 'flex',
    margin: '20px auto',
    padding: '15px',
    position: 'relative',

    '& button': {
      position: 'absolute',
      top: theme.spacing(2),
      right: theme.spacing(2)
    }
  }

}))

const QueryBuilderComponent = ({ setResults, setDialogState }) => {
  const [query, setQuery] = useState(initialQuery)

  const [queryString, setQueryString] = useState('')

  const clipBoardCopyTooltipTitle = 'Click to copy to clipboard'
  const [tooltipTitle, setTooltipTitle] = useState(clipBoardCopyTooltipTitle)

  const classes = useStyles()

  return (
    <div className={classes.queryBuilder}>
      <QueryBuilderDnD>
        <QueryBuilderMaterial muiComponents={muiComponents}>
          <QueryBuilder fields={fields} query={query} onQueryChange={q => {
            setQuery(q)
            setQueryString(JSON.stringify(JSON.parse(formatQuery(q, 'mongodb')), null, 2))
            setTooltipTitle(clipBoardCopyTooltipTitle)
          }}
          />
        </QueryBuilderMaterial>
      </QueryBuilderDnD>
      { queryString ?
          <SubmitQueryComponent {...{query, queryString, tooltipTitle, setTooltipTitle, setResults, setDialogState}} />
          : ''
      }
    </div>
  )

}

export default QueryBuilderComponent