import React, { memo, useState } from 'react'
import { Tooltip } from '@mui/material'
import { useDispatch } from 'react-redux'
import { fetchJobDescription, fetchJobSummary, openJobDetailsDialog } from '../../redux/actions/uiActions'
import { useTheme } from '@emotion/react'

// TODO: split this, maybe have the details be an iconbutton in its own column
const CustomCell = ({crawlDate, value, handleClick, theme}) => {
  return <>
    {crawlDate ?
      <Tooltip
        title={value}
        onClick={handleClick}
      >
        <span style={{
          color: theme.palette.primary.main,
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
}

const RenderRoleCell = ({row}) => {
  const { id, role, crawlDate } = row || { role: '', crawlDate: '' }

  const dispatch = useDispatch()
  const [value] = useState(role)


  const handleClick = () => {
    dispatch(fetchJobDescription(row))
    dispatch(fetchJobSummary(id))
    dispatch(openJobDetailsDialog())
  }

  const theme = useTheme()

  const MemoizedCustomCell = memo(CustomCell)

  return (
    <MemoizedCustomCell {...{crawlDate, value, handleClick, theme}} />
  )
}

export default RenderRoleCell