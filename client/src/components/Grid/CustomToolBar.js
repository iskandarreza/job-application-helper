import {
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { useDispatch } from 'react-redux'
import { showQueryDrawer } from '../../redux/actions/uiActions'

const CustomToolbar = () => {
  const dispatch = useDispatch()

  const handleQueryButtonClick = () => {
    dispatch(showQueryDrawer())
  }

  const handleCheckAppliedRecordsClick = () => {
    dispatch(sendToServiceWorker({ action: 'CHECK_APPLIED' }))
  }

  const handleCheckOldRecordsClick = () => {
    dispatch(sendToServiceWorker({ action: 'CHECK_OLDEST_24' }))
  }

  const handleFetchNewButtonClick = () => {
    dispatch(checkNewRecords())

  }

  return (
    <GridToolbarContainer
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
    >
      <div>
        <GridToolbarQuickFilter />
      </div>
      <div
        style={{
          display: 'flex',
          gap: '10px',
        }}
      >
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleFetchNewButtonClick}
        >
          Fetch New Records
        </Button>


        <Button
          variant="outlined"
          color="secondary"
          onClick={handleCheckAppliedRecordsClick}
        >
          Check Applied
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={handleCheckOldRecordsClick}
        >
          Check Older Records
        </Button>

        <Button
          variant="contained"
          color="warning"
          onClick={handleQueryButtonClick}
        >
          Advanced Query
        </Button>
      </div>
    </GridToolbarContainer>
  )
}

export default CustomToolbar