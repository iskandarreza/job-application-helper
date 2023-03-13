import axios from "axios"

export const getUpdatedData = async (setTableData) => {
  console.log("Getting data from Google Apps Script API...")

    axios.get("http://localhost:5000/data")
    .then((response) => setTableData(response.data))
    .catch((error) => console.error(error))
}

// export const getLocalData = async (setTableData) => {
//   console.log("getting local data from disk...")

//   axios.get("http://localhost:5000/data")
//     .then((response) => setTableData(response.data))
//     .catch((error) => console.error(error))
// }

// export const saveLocalData = async (tableData) => {
//   console.log("saving local data to disk...")

//   axios.post('http://localhost:5000/data/save', tableData)
//     .then(response => { console.log(response.data) })
//     .catch(error => { console.error(error) })
// }

export const getData = async (setTableData) => {
  console.log("Getting data from db...")

  axios.get("http://localhost:5000/record")
    .then((response) => setTableData(response.data))
    .catch((error) => console.error(error))
}

export const saveData = async (tableData) => {
  console.log("saving data to db...")

  axios.post("http://localhost:5000/record/addbulk", tableData)
    .then((response) => { console.log(response.data) })
    .catch((error) => { console.error(error) })
}

export const updateRecordByID = async (params, newValue) => {
  const updateValue = {}
  updateValue[params.field] = newValue
  axios.post("http://localhost:5000/update/" + params.row._id, updateValue)
    .then((response) => { console.log(response.data) })
    .catch((error) => { console.error(error) })
}