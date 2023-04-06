import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from 'react-redux';
import store from './redux/store';
import "./index.scss"
import App from "./App"
import reportWebVitals from "./reportWebVitals"
import { ThemeProvider, createTheme } from '@mui/material/styles'
const root = ReactDOM.createRoot(document.getElementById("root"))

// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.ready.then(registration => {
//     registration.unregister()
//   })
// }

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5893df',
    },
    secondary: {
      main: '#2ec5d3',
    },
    background: {
      default: '#192231',
      paper: '#24344d',
    },
  },
})

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()