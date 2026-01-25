import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";

export default function MonthlyTarget() {
  const [series, setSeries] = useState<number[]>([0, 0]); // [Male, Female]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const options: ApexOptions = {
    colors: ["#3C50E0", "#FF4560"], // Blue for Male, Pink/Red for Female
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "pie",
      height: 330,
    },
    labels: ["Male", "Female"],
    legend: {
      position: "bottom",
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val.toFixed(1) + "%";
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
        },
      },
    },
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/doctors/patients`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch patients");
        }

        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const patients = data.data;
          const maleCount = patients.filter((p: any) => p.gender?.toLowerCase() === 'male').length;
          const femaleCount = patients.filter((p: any) => p.gender?.toLowerCase() === 'female').length;
          setSeries([maleCount, femaleCount]);
        }
      } catch (err: any) {
        console.error("Error fetching patient demographics:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-default dark:border-gray-800 dark:bg-gray-900 h-[400px] flex items-center justify-center">
        <p className="text-gray-500">Loading demographics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-default dark:border-gray-800 dark:bg-gray-900 h-[400px] flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Patient Demographics
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Distribution of current patients by gender
            </p>
          </div>
        </div>
        <div className="relative flex justify-center">
          <div className="max-h-[330px]" id="chartDarkStyle">
            <Chart
              options={options}
              series={series}
              type="pie"
              height={330}
              width={300}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-8">
          <div className="text-center">
            <span className="block text-xl font-bold text-gray-800 dark:text-white">{series[0]}</span>
            <span className="text-sm text-gray-500">Male</span>
          </div>
          <div className="text-center">
            <span className="block text-xl font-bold text-gray-800 dark:text-white">{series[1]}</span>
            <span className="text-sm text-gray-500">Female</span>
          </div>
        </div>
      </div>
    </div>
  );
}
