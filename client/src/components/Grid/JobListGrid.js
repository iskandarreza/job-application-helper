import React, { useState, useEffect, useCallback, memo } from 'react'
import { DataGrid, GridCell, GridRow } from '@mui/x-data-grid'
import { Tooltip } from '@mui/material'

import RenderRoleCell from './RenderRoleCell'
import RenderURLButtons from './RenderURLButtons'
import CustomToolbar from './CustomToolBar'

import '../../index.scss'

import { useDispatch, useSelector } from 'react-redux'
import {
  fetchJobs,
} from '../../redux/actions/jobActions'

import { postStatusOpts, status1Opts, status2Opts } from './fieldOpts'
import formatDate from './formatDate'
import lastUpdatedField from './lastUpdatedField'
import { configureStore } from '../../redux/store'
import RenderSelectMenu from './RenderSelectMenu'
import { getRecordById } from '../../utils/api'

const MemoizedRow = memo(GridRow)
const MemoizedCell = memo(GridCell)

const columns = [
  { field: '_id', flex: 0 },
  { field: 'id', flex: 0 },
  {
    field: 'dateAdded',
    headerName: 'received',
    flex: 0,
    valueFormatter: formatDate
  },
  {
    field: 'dateModified',
    headerName: 'modified',
    flex: 0,
    valueFormatter: formatDate
  },
  {
    field: 'org',
    flex: 1,
    renderCell: (params) => {
      const details = () => {
        const { row } = params
        console.info('row data: ', row)
      }

      return (
        <Tooltip onClick={() => details()} title={params.row.org}>
          <span>{params.row.org}</span>
        </Tooltip>
      )
    }
  },
  {
    field: 'role',
    flex: 1,
    renderCell: (params) => <RenderRoleCell {...{ row: params.row }} />,
  },
  {
    field: 'location',
    flex: 0,
    renderCell: (params) => {
      return (
        <Tooltip title={params.row.location}>
          <span>{params.row.location}</span>
        </Tooltip>
      )
    }
  },
  {
    field: 'link',
    flex: 0,
    renderCell: (params) => <RenderURLButtons {...{
      id: params.row.id,
      url: params.row.url,
      externalSource: params.row.externalSource
    }} />
  },
  {
    field: 'positionStatus',
    headerAlign: 'center',
    align: 'center',
    flex: 0,
    editable: true,
    renderEditCell: (params) => (
      <RenderSelectMenu {...{
        cellValue: params.value,
        row: params.row,
        field: params.field,
        menuOptions: postStatusOpts,
      }} />
    ),
  },
  { field: 'keywords', flex: 1 },
  {
    field: 'status1',
    headerAlign: 'center',
    align: 'center',
    flex: 0,
    editable: true,
    renderEditCell: (params) => (
      <RenderSelectMenu {...{
        cellValue: params.value,
        row: params.row,
        field: params.field,
        menuOptions: status1Opts,
      }} />
    ),
  },
  {
    field: 'status2',
    headerAlign: 'center',
    align: 'center',
    flex: 0,
    editable: true,
    renderEditCell: (params) => (
      <RenderSelectMenu {...{
        cellValue: params.value,
        row: params.row,
        field: params.field,
        menuOptions: status2Opts,
      }} />
    ),
  },
  {
    field: 'status3',
    flex: 1,
    editable: true,
  },
  {
    field: 'notes',
    flex: 1,
    editable: true,
  },
  {
    field: 'fieldsModified',
    headerName: 'last update',
    flex: 1,
    valueFormatter: lastUpdatedField
  },
  { 
    field: 'applicants', 
    flex: 0,
    headerAlign: 'right',
    align: 'right'
   },

]

const JobsDataGrid = () => {
  const jobs = useSelector((state) => state.jobRecords.jobs)
  const jobsLoading = useSelector((state) => state.jobRecords.loading)
  const [rows, setRows] = useState([])
  const dispatch = useDispatch()

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  })

  const fetchData = useCallback(async () => {
    if (!jobsLoading) {
      dispatch(fetchJobs())
    }
  }, [jobsLoading, dispatch])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    // fixes 'undefined' value causing various issues
    const normalizedRows = jobs.map((job) => { return {
      ...job,
      status1: job.status1 || '',
      status2: job.status2 || '',
    }})
    setRows(normalizedRows)
  }, [jobs])

  useEffect(() => {
    console.log('DataGrid HOC mounted')
  }, [])

  // flush the persisted store state on refresh
  useEffect(() => {
    window.onbeforeunload = function () {
      const persistor = configureStore().persistor

      persistor.pause()
      //
      persistor.flush().then(() => {
        return
      })

      return
    }

    return () => {
        window.onbeforeunload = null
    }
}, [])

  return (
    <DataGrid
      getRowId={(row) => row._id}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      rows={rows}
      columns={columns}
      slots={{
        toolbar: CustomToolbar,
        row: MemoizedRow,
        cell: MemoizedCell,
      }}
      initialState={{
        columns: {
          columnVisibilityModel: {
            _id: false,
            id: false,
            status3: false,
            notes: false,
            keywords: false,
          },
        },
        sorting: {
          sortModel: [{ field: 'dateAdded', sort: 'desc' }],
        },
      }}
      processRowUpdate={async (newRow, oldRow) => {
        // temporary workaround until `onCellEditStop` method is worked out
        // for now we have to dispatch the event in the custom cellEdit components
        // and update the grid record state with data from the server
        const row = await getRecordById(newRow._id)
        return row
      }}
      onProcessRowUpdateError={(e) => {console.log(e)}}

    />

  )
}

export default JobsDataGrid