import { Box, Container } from '@mui/system'
import Parser from 'html-react-parser'
import { useSelector } from 'react-redux'

const RoleDescriptionContainer = () => {
  const {
    crawlDate, 
    jobDescriptionText, 
    salaryInfoAndJobType, 
    qualificationsSection 
  } = useSelector((state) => state.uiStates.jobDescriptionDialogContent)

  return (
    <Container>
      <Box sx={{ margin: '15px 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>

        <div>
          {`Last crawled: ${crawlDate ? new Date(crawlDate).toLocaleDateString("en-US", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
          }) : 'N/A'}`}
        </div>
        <div className='salaryInfoAndJobType'>
          {salaryInfoAndJobType ? Parser(salaryInfoAndJobType) : ''}
        </div>
      </Box>
      <Box>
        {qualificationsSection ? Parser(qualificationsSection) : ''}
      </Box>
      <Box sx={{ marginTop: '15px' }}>
        {jobDescriptionText ? Parser(jobDescriptionText) : ''}
      </Box>

    </Container>
  )
}

export default RoleDescriptionContainer