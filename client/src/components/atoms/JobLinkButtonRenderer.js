import React from 'react'
import { IconButton } from '@mui/material'
import { Link } from '@material-ui/icons'

export const JobLinkButtonRenderer = (params) => {
  const { id, url, externalSource} = params.row
  const isIndeed = url?.includes('indeed.com')
  const handleClickLink = () => {
    window.open(url, '_blank')
  }
  const handleClickSource = () => {
    window.open(
      `${'https://www.indeed.com/rc/clk/dl?jk=' + id}`,
      '_blank'
    )
  }

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <IconButton onClick={handleClickLink} size="small" color="primary">
          <Link />
        </IconButton>
        {isIndeed ? (
          <IconButton
            onClick={handleClickSource}
            size="small"
            color={externalSource ? 'warning' : 'secondary'}
          >
            <Link>Source</Link>
          </IconButton>
        ) : (
          ''
        )}
      </div>
    </div>
  )
}
