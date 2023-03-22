import React, { useState } from 'react'
import { Tooltip } from '@mui/material'
import { useDispatch } from 'react-redux'
import { fetchJobDescriptionDialogContent, openJobDescriptionDialog } from '../../redux/actions/uiActions'

export const RenderRoleCell = (params) => {
  const dispatch = useDispatch()
  const [value] = useState(params.row.role ?? '')

  const { row } = params
  const { extraData, crawlDate } = row
  const jobDescriptionText = extraData?.jobDescriptionText

  const handleClick = () => {
    dispatch(fetchJobDescriptionDialogContent({ ...extraData, crawlDate, rowData: row }))
    dispatch(openJobDescriptionDialog())
  }

  return (
    <>
      {jobDescriptionText ?
        <Tooltip
          title={value}
          onClick={handleClick}
          >
          <span style={{
            color: 'darkblue',
            cursor: 'pointer'
          }}
            >
            {value}
          </span>
        </Tooltip>
        :
        <Tooltip
          title={value}
          onClick={handleClick}
          >
          <span>{value}</span>
        </Tooltip>}
    </>
    )    
  
}