import makeStyles from "@mui/styles/makeStyles/makeStyles"
import { Box } from "@mui/system"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

const useStyles = makeStyles((theme) => ({
  roleSummary: {
    '& ul, ol':  {
      marginLeft: theme.spacing(2),
    },

    '& .data-box:not(:nth-child(1))': {
      marginTop: theme.spacing(2),
    },
  }
}))

const RoleSummaryContainer = () => {
  const isLoading = useSelector((state) => state.uiStates.jobSummaryDialog.isLoading) || true
  const data = useSelector((state) => state.uiStates.jobSummaryDialog.content) || ''
  const [value, setValue] = useState(data?.response?.result)
  const { _id } = data

  useEffect(() => {
    if(!isLoading) {
      const {
        summary,
        responsibilities,
        skills,
        qualifications,
        salary,
        workType,
        note,
      } = data?.response?.result
  
      setValue({
        summary,
        responsibilities,
        skills,
        qualifications,
        salary,
        workType,
        note,
      })  
    }
  }, [isLoading, data])

  const classes = useStyles()

  return (
    <div className={classes.roleSummary}>
      {value && value.summary !== '' ?
        <>
          <p>{value.summary}</p>
          <br />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>

            <div className={'data-box'}>
              {value.skills ?
                <>
                  <strong>Skills</strong>
                  {value.skills?.minimum && value.skills?.minimum.length > 0 ?
                    <ul>
                      <em><small>Minimum</small></em>
                      {value.skills.minimum.map(({ keyword, type }, i) => <li key={`sm-${_id}-${i}`}>{keyword}</li>)}
                    </ul> : ''
                  }
                  {value.skills?.extras && value.skills?.extras.length > 0 ?
                    <ul>
                      <em><small>Extras</small></em>
                      {value.skills.extras.map((item, i) => <li key={`sx-${_id}-${i}`}>{item}</li>)}
                    </ul> : ''
                  }
                </> : ''
              }
            </div>

            <div>
              { value.responsibilities && value.responsibilities.length > 0 ?
                <div>
                  <strong>Responsibilities</strong>
                  <ul>
                    {value.responsibilities.map((item, i) => <li key={`r-${_id}-${i}`}>{item}</li>)}
                  </ul>
                </div> : ''
              }

              <div className={'data-box'}>
                {value.qualifications && (value.qualifications.minimum.length > 0 || value.qualifications.extras.length > 0) ?
                  <>
                    <strong>Qualifications</strong>
                    {value.qualifications.minimum.length ?
                      <ul>
                        <em><small>Minimum</small></em>
                        {value.qualifications.minimum.map((item, i) => <li key={`qm-${_id}-${i}`}>{item}</li>)}
                      </ul> : ''
                    }
                    {value.qualifications.extras ?
                      <ul>
                        <em><small>Extras</small></em>
                        {value.qualifications.extras.map((item, i) => <li key={`qx-${_id}-${i}`}>{item}</li>)}
                      </ul> : ''
                    }
                  </> : ''
                }
              </div>

            </div>

          </Box>

          <Box sx={{ display: 'flex',  justifyContent: 'flex-end', gap: '16px', marginTop: '24px' }}>

            {value.workType ?
              <div>
                {(value.workType).charAt(0).toUpperCase() + (value.workType).slice(1)}
              </div> : ''
            }

            {value.salary?.hourly && (!isNaN(value.salary.hourly) && parseInt(value.salary.hourly) !== 0)  ? 
              <div>
                Hourly: {isNaN(value.salary.hourly) ? value.salary.hourly : parseInt(value.salary.hourly).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </div> : ''
            }

            {value.salary?.estimate ?
              <div>
                Estimate: {isNaN(value.salary.estimate) ? value.salary.estimate : parseInt(value.salary.estimate).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </div> : ''
            }

          </Box>

          <Box>
            <div>
              {value.notes}
            </div>
          </Box>
        </>
        : `Failed to generate summary, prompt token cost exceeded limit: ${data.response?.prompt_tokens} tokens`}
    </div>
  )
}

export default RoleSummaryContainer