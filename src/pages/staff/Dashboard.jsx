const Dashboard = () => {
  return (
    <div className="space-y-6">
      
      <h2 className="text-2xl font-semibold">
        Dashboard
      </h2>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Total Patients</p>
          <p className="text-2xl font-bold">120</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Today Appointments</p>
          <p className="text-2xl font-bold">18</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Pending Reports</p>
          <p className="text-2xl font-bold">7</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Today Revenue</p>
          <p className="text-2xl font-bold">₹12,500</p>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
