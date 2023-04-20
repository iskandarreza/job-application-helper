import * as React from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import RoleDescriptionContainer from './RoleDescriptionContainer'
import RoleSummaryContainer from './RoleSummaryContainer'
import { useDispatch, useSelector } from 'react-redux'
import RoleExtraDataContainer from './RoleExtraDataContainer'
import { setNewTabState } from '../../redux/actions/uiActions'

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`role-tabpanel-${index}`}
      aria-labelledby={`role-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `role-details-tab-${index}`,
    'aria-controls': `role-details-tabpanel-${index}`,
  };
}

function CustomTabs(props) {
  const summary = useSelector((state) => state.uiStates.jobSummaryDialog.content)
  const tabValue = useSelector((state) => state.uiStates.roleDetailsTab.tabValue)
  const { tabLabel, notes } = props
  
  const dispatch = useDispatch()
  
  const handleChange = (event, newValue) => {
    dispatch(setNewTabState({tabValue: newValue}))
  }

  let currentIndex = 0;

  const tabItems = [];
  const tabPanels = [];

  if (summary) {
    tabItems.push(
      <Tab label="Summary" {...a11yProps(currentIndex)} key={currentIndex} />
    )
    tabPanels.push(
      <TabPanel value={tabValue} index={currentIndex} key={currentIndex}>
        <RoleSummaryContainer />
      </TabPanel>
    )
    currentIndex++;
  }

  tabItems.push(
    <Tab label="Full Description" {...a11yProps(currentIndex)} key={currentIndex} />
  )
  tabPanels.push(
    <TabPanel value={tabValue} index={currentIndex} key={currentIndex}>
      {<RoleDescriptionContainer />}
    </TabPanel>
  )
  currentIndex++;

  if (!!tabLabel) {
    tabItems.push(
      <Tab label={tabLabel} {...a11yProps(currentIndex)} key={currentIndex} />
    )
    tabPanels.push(
      <TabPanel value={tabValue} index={currentIndex} key={currentIndex}>
        <Box>
          {Object.entries(notes).map(([key, value]) => (
            <div key={`${key}`} style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
              <strong style={{ textTransform: 'capitalize' }}>{key}</strong>
              <span>{value}</span>
            </div>
          ))}
        </Box>
      </TabPanel>
    )
    currentIndex++;
  }

  summary && tabItems.push(
    <Tab label="Misc Data" {...a11yProps(currentIndex)} key={currentIndex} />
  ) && tabPanels.push(
    <TabPanel value={tabValue} index={currentIndex} key={currentIndex}>
      <RoleExtraDataContainer />
    </TabPanel>
  )
  currentIndex++;

  return (
    <>
      <Tabs value={tabValue} onChange={handleChange} aria-label="role details tabs">
        {tabItems}
      </Tabs>
      
      <Box sx={{ height: '90%', overflowY: 'auto' }}>
        {tabPanels}
      </Box>
    </>
  )
}



const RoleDetailsTabs = () => {
  const activeRow = useSelector((state) => state.uiStates.activeRow)
  const [tabLabel, setTabLabel] = React.useState('')
  const [notes, setNotes] = React.useState({})

  React.useEffect(() => {
    const propsToCheck = ['status2', 'status3', 'notes']
    if (!!activeRow.status2 || !!activeRow.status3 || !!activeRow.notes) {
      const notesObj = Object.keys(activeRow)
        .filter(key => propsToCheck.includes(key))
        .reduce((obj, key) => {
          if (!!activeRow[key]) {
            obj[key] = activeRow[key]
          }
          return obj  
        }, {})

      setTabLabel('Notes')
      setNotes(notesObj)
    } else {
      setTabLabel('')
      setNotes({})
    }
  }, [activeRow])

  return (
    <Box sx={{ width: '100%', height: '60vh', overflow: 'auto' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <CustomTabs {...{tabLabel, notes}} />
      </Box>
    </Box>
  )
}

export default RoleDetailsTabs