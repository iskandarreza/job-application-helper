import makeStyles from "@mui/styles/makeStyles/makeStyles"
import { Box } from "@mui/system"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

const useStyles = makeStyles((theme) => ({
  roleSummary: {
    '& ul em small': {
      marginLeft: theme.spacing(-2),
    },
  }
}))

const RoleSummaryContainer = () => {
  const data = useSelector((state) => state.uiStates.jobSummaryDialogContent) || ''
  const [value, setValue] = useState(data?.response?.result)
  const { _id } = data

  useEffect(() => {
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
  }, [data])

  const classes = useStyles()

  return (
    <div className={classes.roleSummary}>
      {value && value.summary !== '' ?
        <>
          <p>{value.summary}</p>
          <br />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>

            <div>
              <strong>Skills</strong>
              <ul>
                <em><small>Minimum</small></em>
                {value.skills.minimum.map(({ keyword, type }, i) => <li key={`sm-${_id}-${i}`}>{keyword}</li>)}
              </ul>
              <ul>
                <em><small>Extras</small></em>
                {value.skills.extras.map((item, i) => <li key={`sx-${_id}-${i}`}>{item}</li>)}
              </ul>
            </div>

            <div>
              <strong>Responsibilities</strong>
              <ul>
                {value.responsibilities.map((item, i) => <li key={`r-${_id}-${i}`}>{item}</li>)}
              </ul>
            </div>

          </Box>
        </>
        : `Failed to generate summary, prompt token cost exceeded limit: ${data.response?.prompt_tokens} tokens`}
    </div>
  )
}

export default RoleSummaryContainer