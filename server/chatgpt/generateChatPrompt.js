const outpuFormat = `{
  summary: '', // summary of job description (summarize to under 200 characters)
  responsibilities: [], // array of tasks/responsibilities, summarized to up to 6 items , not more than 12 words each
  skills: { // 
    minimum: [{
    keyword: '',
    type: '', // 'tech stack', 'hard skill' or 'soft skill'
  }],
    extras: [], // nice to haves but not mandatory, list as short phrases up to 5 words
  }, 
  qualifications: { 
    minimum: [], // array of keywords of the qualifications
    extras: [], // nice to haves but not mandatory, list as short phrases up to 5 words
  },
  salary: {
    hourly: '0', // if "inputData.salaryInfoAndJobType" has the information, convert to hourly, set 0 if data unavailable in "inputData.salaryInfoAndJobType" or "inputData.jobDescriptionText", number as string
    estimate: '0' // if using an estimate because no data is available in "inputData.salaryInfoAndJobType" or "inputData.jobDescriptionText", fill this
  },
  workType: '', // labels are strictly 'remote', 'hybrid', or 'on-site'
  note: '', // additional note or context
}

JSON: Can you please provide me with the JSON object only, and exclude any other information. Output only
`

module.exports = generateChatPrompt = async(input) => {

  const fieldsToCheck = ['jobDescriptionText', 'salaryInfoAndJobType', 'qualificationsSection']

  const makeObj = (sourceObj) => {
    return Object.keys(sourceObj)
    .filter(key => fieldsToCheck.includes(key))
    .reduce((obj, key) => {
      obj[key] = sourceObj[key]
      return obj;
    }, {})
  }

  const dialogData = makeObj(input)

  const markdown = Object.keys(dialogData)
  .filter(key => fieldsToCheck.includes(key))
  .map(key => dialogData[key])
  .join('')

  return {
      prompt: [
          {"role": "system", "content": "You are a contextual data analysis engine, ready to receive a markdown input and extract relevant data and produce a JSON output."},
          {"role": "user", "content": "Consider the following markdown:"},
          {"role": "user", "content": `${markdown}`},
          {"role": "user", "content": 'Now extract the relevant information and fill in the data into the JSON object below, with the comments next to the object properties defining the limitations:'},
          {"role": "user", "content": `${outpuFormat}`}
      ],
      title: `Convert input markdown to output JSON`,
  }
}