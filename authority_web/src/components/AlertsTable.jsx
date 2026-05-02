import { useEffect, useState } from "react";
import axios from "axios";

export default function AlertsTable() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/alerts").then(res => setAlerts(res.data));
  }, []);

  return (
    <table className="min-w-full border border-gray-300">
      <thead>
        <tr className="bg-gray-200">
          <th className="px-4 py-2">Tourist ID</th>
          <th className="px-4 py-2">Message</th>
          <th className="px-4 py-2">Location</th>
        </tr>
      </thead>
      <tbody>
        {alerts.map((a, i) => (
          <tr key={i} className="border-t">
            <td className="px-4 py-2">{a.touristId}</td>
            <td className="px-4 py-2">{a.message}</td>
            <td className="px-4 py-2">
              {a.location.lat}, {a.location.lng}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
