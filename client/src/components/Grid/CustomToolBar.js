import {
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { useDispatch } from 'react-redux'
import { showQueryDrawer } from '../../redux/actions/uiActions'
import { sendToServiceWorker } from '../../redux/actions/serviceWorkerActions'

const CustomToolbar = () => {
  const dispatch = useDispatch()

  const handleClick = () => {
    dispatch(showQueryDrawer())
  }

  const handleCheckAppliedRecordsClick = () => {
    dispatch(sendToServiceWorker({action: 'CHECK_APPLIED'}))
  }

  const handleCheckOldRecordsClick = () => {
    dispatch(sendToServiceWorker({action: 'CHECK_OLDEST_24'}))
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
          variant="contained"
          color="primary"
          onClick={handleCheckAppliedRecordsClick}
        >
          Check Applied
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCheckOldRecordsClick}
        >
          Check Oldest 24
        </Button>        
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleClick()}
        >
          Advanced Query
        </Button>
      </div>
    </GridToolbarContainer>
  )
}

export default CustomToolbar