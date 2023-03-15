import React from "react"
import { IconButton } from "@mui/material"
import { Link } from "@material-ui/icons"

export const JobLinkButtonRenderer = (params) => {
  const isIndeed = params.row.url?.includes("indeed.com")
  const handleClickLink = () => {
    window.open(params.row.url, "_blank")
  }
  const handleClickSource = () => {
    window.open(
      `${"https://www.indeed.com/rc/clk/dl?jk=" + params.row.id}`,
      "_blank"
    )
  }

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <IconButton
          onClick={handleClickLink}
          size="small"
          color="primary"
        >
          <Link />
        </IconButton>
        {isIndeed ? (
          <IconButton
            onClick={handleClickSource}
            size="small"
            color="secondary"
          >
            <Link>Source</Link>
          </IconButton>
        ) : (
          ""
        )}
      </div>
    </div>
  )
}