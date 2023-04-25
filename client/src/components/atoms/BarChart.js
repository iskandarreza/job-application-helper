import { Chart as ChartJS, registerables } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import randomColor from 'randomcolor'
ChartJS.register(...registerables)

const BarChart = ({ data }) => {
  const chartData = {
    labels: data.slice(0, 12).map((item) => item.x),
    datasets: [
      {
        label: 'Value',
        data: data.slice(0, 12).map((item) => item.value),
        backgroundColor: data.slice(0, 12).map(() => randomColor()),
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  }

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItem) => {
            const dataIndex = tooltipItem[0].dataIndex;
            return `${data[dataIndex].x}: ${data[dataIndex].value}`;
          },
          label: (tooltipItem) => {
            const dataIndex = tooltipItem.dataIndex
            const originalKeywords = data[dataIndex].originalKeywords
            return originalKeywords
          },
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white', 
        },
      },
      y: {
        ticks: {
          beginAtZero: true,
          color: 'white'
        }
      },
    },
  }


  return <Bar data={chartData} options={options} />
}

export default BarChart
