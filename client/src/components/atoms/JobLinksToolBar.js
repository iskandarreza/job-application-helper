import React, { useState } from 'react'
import {
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid'
import DragIndicator from '@mui/icons-material/DragIndicator';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  FormControlLabel,
  Input,
  ListSubheader,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextareaAutosize
} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles';
import { QueryBuilderMaterial } from '@react-querybuilder/material';
import { formatQuery, QueryBuilder } from 'react-querybuilder'
import { QueryBuilderDnD } from '@react-querybuilder/dnd'
import { postStatusOpts, status1Opts, status2Opts } from '../fieldOpts';
import { Container } from '@mui/system';
import { runQuery } from '../../utils/api';
import { useDispatch } from 'react-redux'
import { updateListWithQueryResults } from '../../redux/actions/jobActions';

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

const useStyles = makeStyles(() => ({
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
  }

}))

const CustomToolbar = () => {
  const dispatch = useDispatch()
  const [query, setQuery] = useState(initialQuery)
  const [previewValue, setPreviewValue] = useState('')
  const [results, setResults] = useState([])
  const [drawerState, setDrawerState] = useState(false)
  const [dialogState, setDialogState] = useState(false)

  const handleClick = () => {
    setDrawerState(true)
  }

  const handleDialogClose = () => {
    setDialogState(false)
  }

  const handleListUpdate = () => {
    setDialogState(false)
    dispatch(updateListWithQueryResults(results))
  }

  const classes = useStyles()

  return (
    <GridToolbarContainer
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
    >
      <div>
        <GridToolbarQuickFilter />
      </div>
      <div
        style={{
          display: 'grid',
          justifyItems: 'end',
          gap: '10px',
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleClick()}
        >
          Advanced Query
        </Button>
      </div>
      <Drawer
        anchor={'right'}
        open={drawerState}
        onClose={() => { setDrawerState(false) }}
      >
        <Container className={classes.queryBuilder} sx={{ margin: '30px auto', width: 'auto' }}>
          <Box marginBottom={'10px'}>
            <h2>Create an advanced query</h2>
          </Box>
          <QueryBuilderDnD>
            <QueryBuilderMaterial muiComponents={muiComponents}>
              <QueryBuilder fields={fields} query={query} onQueryChange={q => {
                setQuery(q)
                setPreviewValue(JSON.stringify(JSON.parse(formatQuery(q, 'mongodb')), null, 2))
              }}
              />
            </QueryBuilderMaterial>
          </QueryBuilderDnD>
          {
            previewValue ?
              <>
                <Paper sx={{ display: 'flex', margin: '20px auto', padding: '15px' }}>
                  <pre style={{fontSize: 'small'}}>{previewValue}</pre>
                </Paper>
                <div style={{ display: 'flex' }}>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={async () => {
                      let results = await runQuery(JSON.parse(formatQuery(query, 'mongodb')))

                      if (results?.length > 0) {
                        setResults(results)
                        setDialogState(true)
                      }
                    }}
                    style={{ marginLeft: 'auto' }}
                  >
                    Send Query
                  </Button>
                </div>

              </>
              : ''
          }
        </Container>
      </Drawer>
      <Dialog open={dialogState}>
        <DialogTitle>Update List?</DialogTitle>
        <DialogContent>
          <Container>
            <p>Query returned {results.length} rows.</p>
            <p>Update the list with data from the query?</p>
          </Container>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' onClick={handleListUpdate}>Yes</Button>
          <Button variant='outlined' onClick={handleDialogClose}>Dismiss</Button>
        </DialogActions>
      </Dialog>
    </GridToolbarContainer>
  )
}

export default CustomToolbar