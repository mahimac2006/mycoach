import { Line } from 'react-chartjs-2';

function ProgressChart({ data }) {
  const chartData = {
    labels: data.map(run => run.date),
    datasets: [
      {
        label: "Distance",
        data: data.map(run => run.distance),
        borderColor: "blue",
        fill: false
      }
    ]
  };

  return (
    <div>
      <h2>Your Running Progress</h2>
      <Line data={chartData} />
    </div>
  );
}

export default ProgressChart;
