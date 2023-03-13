import React from "react"
import { Button } from "@mui/material"

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
    <>
      <Button
        variant="contained"
        size="small"
        onClick={handleClickLink}
        sx={{ marginRight: "5px" }}
      >
        Link
      </Button>
      {isIndeed ? (
        <Button variant="outlined" size="small" onClick={handleClickSource}>
          Source
        </Button>
      ) : (
        ""
      )}
    </>
  )
}