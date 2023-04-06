
const meta = (records) => records.map((doc) => {
  const { 
    _id, id, url, org, role, positionStatus, 
    dateModified, crawlDate, externalSource,
    redirected,
   } = doc
  return { 
    _id, id: id.toString(), url, org, role, 
    positionStatus, dateModified, crawlDate, 
    externalSource: externalSource?.toString(),
    redirected: redirected?.toString(),
  } 
})

module.exports = meta