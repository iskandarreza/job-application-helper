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
  const [value, setValue] = useState(JSON.parse(data?.response?.result))

  useEffect(() => {
    const {
      summary,
      responsibilities,
      skills,
      qualifications,
      salary,
      workType,
      note,
    } = JSON.parse(data?.response?.result)

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
      {value ?
        <>
          <p>{value.summary}</p>
          <br />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>

            <div>
              <p>
                <strong>Skills</strong>
                <ul>
                  <em><small>Minimum</small></em>
                  {value.skills.minimum.map(({ keyword, type }) => <li>{keyword}</li>)}
                </ul>
                <ul>
                  <em><small>Extras</small></em>
                  {value.skills.extras.map((item) => <li>{item}</li>)}
                </ul>
              </p>
            </div>

            <div>
              <p>
                <strong>Responsibilities</strong>
                <ul>
                  {value.responsibilities.map((item) => <li>{item}</li>)}
                </ul>
              </p>
            </div>

          </Box>
        </>
        : ''}
    </div>
  )
}

export default RoleSummaryContainer