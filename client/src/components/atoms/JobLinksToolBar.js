import {
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { useDispatch } from 'react-redux'
import { showQueryDrawer } from '../../redux/actions/uiActions'

const CustomToolbar = () => {
  const dispatch = useDispatch()

  const handleClick = () => {
    dispatch(showQueryDrawer())
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
    </GridToolbarContainer>
  )
}

export default CustomToolbar