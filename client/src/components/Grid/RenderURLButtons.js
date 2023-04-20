import React, { memo } from 'react'
import { IconButton } from '@mui/material'
import { BusinessCenter, OpenInBrowser, PeopleOutline } from '@mui/icons-material'

const CustomCell = ({ isIndeed, handleClickLink, handleClickSource, externalSource }) => {
  return <div
    style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
    }}
  >
    <div>

      {isIndeed ? (
        <IconButton onClick={handleClickLink} size="small" color="primary">
          <BusinessCenter />
        </IconButton>
      ) : (
        <IconButton onClick={handleClickLink} size="small" color={'secondary'} >
          <PeopleOutline />
        </IconButton>
      )}

      {!!externalSource &&
        <IconButton onClick={handleClickSource} size="small" color={'warning'} >
          <OpenInBrowser />
        </IconButton>
      }
    </div>
  </div>
}

const RenderURLButtons = ({ id, url, externalSource }) => {
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

  const MemoizedCustomCell = memo(CustomCell)

  return (
    <MemoizedCustomCell {...{ isIndeed, handleClickLink, handleClickSource, externalSource }} />
  )
}

export default RenderURLButtons