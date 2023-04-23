import { Box, Paper } from '@mui/material'
import WordCloud from 'react-wordcloud'

const WordCloudContainer = ({ jobDataSkillsList }) => {
  const words = jobDataSkillsList.map(({x, value}) => { return { text: x, value } })
  return (
    <Box sx={{ height: '100%' }}>
      <Paper sx={{ backgroundColor: 'white', height: '50vh' }}>
        <WordCloud
          words={words}
          options={{
            fontSizes: [15, 60],
            rotations: 0,
          }}
        />
      </Paper>
    </Box>

  )
}

export default WordCloudContainer