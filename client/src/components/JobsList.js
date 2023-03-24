import React, { useState, useEffect, useCallback } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Tooltip } from '@mui/material'

import { JobLinkButtonRenderer } from './atoms/JobLinkButtonRenderer'
import { RenderSelectMenu } from './atoms/RenderSelectMenu'
import { CustomToolbar } from './atoms/JobLinksToolBar'
import { AddRowForm } from './atoms/JobRecordInsert'

import '../index.scss'

import { useDispatch, useSelector } from 'react-redux'
import {
  fetchJobs,
  fetchNewJobs,
  updateRecord,
} from '../redux/actions/jobActions'
import { RenderLastModifiedText } from './atoms/RenderLastModifiedText'
import { RenderRoleCell } from './atoms/RenderRoleCell'
import { JobDescriptionDialog } from './atoms/JobDescriptionDialog'

const columns = [
  { field: '_id', flex: 1 },
  { field: 'id', flex: 1 },
  {
    field: 'dateModified',
    flex: 1,
    renderCell: RenderLastModifiedText,
  },
  {
    field: 'org',
    flex: 1,
    renderCell: (params) => {
      const details = async () => {
        const { row } = params
        console.info({ row })
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
    renderCell: RenderRoleCell,
  },
  {
    field: 'location',
    flex: 1,
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
    renderCell: JobLinkButtonRenderer,
  },
  {
    field: 'positionStatus',
    headerAlign: 'center',
    align: 'left',
    width: 140,
    renderCell: (params) => (
      <RenderSelectMenu
        params={params}
        menuOptions={[
          'open',
          'closed',
        ]}
      />
    ),
    editable: true,
  },
  {
    field: 'status1',
    headerAlign: 'center',
    align: 'left',
    width: 140,
    renderCell: (params) => (
      <RenderSelectMenu
        params={params}
        menuOptions={[
          'pending',
          'applied',
          'uncertain',
          'declined',
        ]}
      />
    ),
    editable: true,
  },
  {
    field: 'status2',
    headerAlign: 'center',
    align: 'left',
    width: 200,
    renderCell: (params) => (
      <RenderSelectMenu
        params={params}
        menuOptions={[
          'app viewed',
          'test requested',
          'test taken',
          'rejected',
        ]}
      />
    ),
    editable: true,
  },
  {
    field: 'status3',
    headerAlign: 'center',
    flex: 1,
    editable: true,
  },
  {
    field: 'notes',
    headerAlign: 'center',
    flex: 1,
    editable: true,
  },
]

const JobsDataGrid = () => {
  const jobs = useSelector((state) => state.jobRecords.jobs)
  const jobsLoading = useSelector((state) => state.jobRecords.loading)
  const dispatch = useDispatch()

  const openJobsFilterModel = {
    items: [{ id: 1, field: 'positionStatus', operator: 'isAnyOf', value: ['open'] }],
  }
  const [filterModel, setFilterModel] = useState(openJobsFilterModel)
  const [isFiltering, setIsFiltering] = useState(true)
  const [filterAction, setFilterAction] = useState('open')

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  })

  const resetFilters = () => {
    setFilterModel({ items: [] })
    setIsFiltering(false)
  }

  const handleShowAppliedJobsClick = () => {
    const model = {
      items: [
        { id: 1, field: 'status1', operator: 'isAnyOf', value: ['applied', 'uncertain'] },
      ],
    }

    if (!isFiltering) {
      setFilterModel(model)
      setIsFiltering(true)
    } else {
      if (filterAction === 'open') {
        setFilterModel(model)
        setFilterAction('applied')
      } else {
        resetFilters()
      }
    }
  }

  const handleShowOpenJobsClick = () => {
    if (!isFiltering) {
      setFilterModel(openJobsFilterModel)
      setIsFiltering(true)
    } else {
      if (filterAction === 'applied') {
        setFilterModel(openJobsFilterModel)
        setFilterAction('open')
        console.log(filterModel.items)
      } else {
        resetFilters()
      }
    }
  }

  const fetchData = useCallback(async () => {
    if (!jobsLoading) {
      dispatch(fetchJobs())
    }
  }, [jobsLoading, dispatch])

  const fetchNewJobsFromAPI = useCallback(async () => {
    if (!jobsLoading) {
      dispatch(fetchNewJobs())
    }
  }, [jobsLoading, dispatch])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    console.log('DataGrid HOC mounted')
  }, [])

  return (
    <DataGrid
      getRowId={(row) => row._id}
      filterModel={filterModel}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      rows={jobs}
      columns={columns}
      components={{
        Toolbar: () => (
          <CustomToolbar
            isFiltering={isFiltering}
            filterAction={filterAction}
            handleShowOpenJobsClick={handleShowOpenJobsClick}
            handleShowAppliedJobsClick={handleShowAppliedJobsClick}
            fetchNewJobs={fetchNewJobsFromAPI}
          />
        ),
      }}
      initialState={{
        columns: {
          columnVisibilityModel: {
            _id: false,
            id: false,
          },
        },
        sorting: {
          sortModel: [{ field: 'dateModified', sort: 'asc' }],
        },
      }}
      onCellEditStop={(params, event) => {
        const { row, field } = params
        const value = event?.target?.value
        const newValue = { [field]: value }

        dispatch(updateRecord(row, newValue))
      }}
      onFilterModelChange={(model) => {
        if (model.quickFilterValues) {
          setFilterModel({
            items: [],
            quickFilterValues: model.quickFilterValues
          })
        } else {
          setFilterModel({
            items: model.items
          })
        }
      }}
    />
  )
}

export const JobsList = () => {

  return (
    <div style={{ padding: '5px 20px' }}>
      <h1>Job Postings</h1>
      <Box sx={{ height: '75vh', width: 'auto' }}>
        <JobsDataGrid />
      </Box>
      <Box>
        <AddRowForm />
      </Box>
      <JobDescriptionDialog />
    </div>
  )
}
