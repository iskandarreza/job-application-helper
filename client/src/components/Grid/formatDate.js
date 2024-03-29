const formatDate = (params) => {
  const timeDifferenceFromNow = (_dateString) => {
    const date = new Date(_dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const diffInMinutes = Math.round(diff / (1000 * 60))
    const diffInHours = Math.round(diff / (1000 * 60 * 60))
    const diffInDays = Math.round(diff / (1000 * 60 * 60 * 24))
    const diffInWeeks = Math.round(diff / (1000 * 60 * 60 * 24 * 7))
  
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'}`
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'}`
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'}`
    } else {
      return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'}`
    }
  }
  
  return !!params.value && `${timeDifferenceFromNow(params.value)} ago`
}

export default formatDate