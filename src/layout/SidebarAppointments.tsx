import React, { useEffect, useState } from "react";

type Doctor = {
  id: string;
  first_name: string;
  last_name?: string;
  specialization?: string;
};

type Appointment = {
  id?: string;
  patient_id?: string;
  doctor_id?: string;
  doctorId?: string;
  appointment_date?: string;
  appointmentDate?: string;
  appointment_time?: string;
  appointmentTime?: string;
  status?: string;
  appointment_type?: string;
  appointmentType?: string;
  video_call_link?: string;
  reason: string;
  created_at?: string;
  updated_at?: string;
  doctor_first_name?: string;
  doctor_last_name?: string;
  doctor_specialization?: string;
  doctorName?: string;
};

export default function SidebarAppointments({
  showBookButton = true,
  showForm = true,
  showTable = true,
  inlineForm = false,
}: {
  showBookButton?: boolean;
  showForm?: boolean;
  showTable?: boolean;
  inlineForm?: boolean;
}) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  // loadingAppointments state removed (not used visually)
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const res = await fetch("http://localhost:3000/api/doctors/getallDoctors");
        if (!res.ok) throw new Error("Failed to fetch doctors");
        const data = await res.json();
        setDoctors(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };

    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/patients/appointments", {
          headers: {
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error("Failed to fetch appointments");
        const data = await res.json();
        setAppointments(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        setAppointments([]);
      }
    };

    fetchDoctors();
    fetchAppointments();
  }, []);

  const [form, setForm] = useState<Partial<Appointment>>({
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    appointmentType: "video",
    reason: "",
  });

  const openForm = () => setIsOpen(true);
  const closeForm = () => setIsOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.doctorId || !form.appointmentDate || !form.appointmentTime) {
      alert("Please fill doctor, date and time");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        doctorId: form.doctorId,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        appointmentType: form.appointmentType || "video",
        reason: form.reason || "",
      };

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/appointments/createAppointment", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to create appointment");
      }

      closeForm();
      setForm({ doctorId: "", appointmentDate: "", appointmentTime: "", appointmentType: "video", reason: "" });
      alert("Appointment created successfully");
      
      // Refresh appointments list
      const token2 = localStorage.getItem("token");
      const res2 = await fetch("http://localhost:3000/api/patients/appointments", {
        headers: {
          ...(token2 ? { "Authorization": `Bearer ${token2}` } : {}),
        },
      });
      if (res2.ok) {
        const data = await res2.json();
        setAppointments(Array.isArray(data.data) ? data.data : []);
      }
    } catch (err: any) {
      alert("Could not create appointment: " + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-2 py-4 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Appointments</h3>
        {showBookButton && showForm && !inlineForm ? (
          <button
            onClick={openForm}
            className="text-theme-sm bg-brand-600 text-white px-3 py-1 rounded-md hover:bg-brand-700"
          >
            Book an appointment
          </button>
        ) : null}
      </div>

      {/* Inline form (used on the full Appointments page) */}
      {showForm && inlineForm ? (
        <div className="mb-4">
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div>
              <label className="text-xs">Doctor</label>
              <select name="doctorId" value={form.doctorId} onChange={handleChange} className="w-full mt-1 p-2 border rounded">
                <option value="">{loadingDoctors ? "Loading doctors..." : "Select a doctor"}</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.first_name} {d.last_name ? d.last_name : ""} {d.specialization ? ` - ${d.specialization}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs">Date</label>
                <input name="appointmentDate" value={form.appointmentDate} onChange={handleChange} type="date" className="w-full mt-1 p-2 border rounded" />
              </div>
              <div className="w-28">
                <label className="text-xs">Time</label>
                <input name="appointmentTime" value={form.appointmentTime} onChange={handleChange} type="time" className="w-full mt-1 p-2 border rounded" />
              </div>
            </div>

            <div>
              <label className="text-xs">Type</label>
              <select name="appointmentType" value={form.appointmentType} onChange={handleChange} className="w-full mt-1 p-2 border rounded">
                <option value="video">Video</option>
                <option value="in-person">In-person</option>
              </select>
            </div>

            <div>
              <label className="text-xs">Reason</label>
              <textarea name="reason" value={form.reason} onChange={handleChange} className="w-full mt-1 p-2 border rounded" rows={3} />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setForm({ doctorId: "", appointmentDate: "", appointmentTime: "", appointmentType: "video", reason: "" })} className="px-3 py-1 border rounded">Reset</button>
              <button type="submit" disabled={submitting} className="px-3 py-1 bg-brand-600 text-white rounded">
                {submitting ? "Booking..." : "Book"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Table */}
      {showTable ? (
        <div className="max-h-48 overflow-auto">
          {appointments.length === 0 ? (
            <div className="text-xs text-gray-400">No appointments yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Doctor</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a, idx) => {
                  const date = a.appointment_date ? new Date(a.appointment_date).toLocaleDateString() : a.appointmentDate;
                  const time = a.appointment_time || a.appointmentTime;
                  const doctor = a.doctor_first_name ? `${a.doctor_first_name} ${a.doctor_last_name || ""}`.trim() : a.doctorName || "";
                  const status = a.status || "scheduled";
                  return (
                    <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="py-2 text-theme-sm">{date}</td>
                      <td className="py-2 text-theme-sm">{time}</td>
                      <td className="py-2 text-theme-sm">{doctor}</td>
                      <td className="py-2 text-theme-sm">{status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : null}

      {/* Modal form (when not inline) */}
      {isOpen && !inlineForm && showForm && (
        <div className="fixed inset-0 z-50 flex items-start p-6">
          <div className="fixed inset-0 bg-black/40" onClick={closeForm} />
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 w-full max-w-md mx-auto shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Book an appointment</h4>
              <button onClick={closeForm} className="text-gray-500">Close</button>
            </div>

            <form onSubmit={(e) => handleSubmit(e)} className="space-y-3">
              <div>
                <label className="text-xs">Doctor</label>
                <select name="doctorId" value={form.doctorId} onChange={handleChange} className="w-full mt-1 p-2 border rounded">
                  <option value="">{loadingDoctors ? "Loading doctors..." : "Select a doctor"}</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.first_name} {d.last_name ? d.last_name : ""} {d.specialization ? ` - ${d.specialization}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs">Date</label>
                  <input name="appointmentDate" value={form.appointmentDate} onChange={handleChange} type="date" className="w-full mt-1 p-2 border rounded" />
                </div>
                <div className="w-28">
                  <label className="text-xs">Time</label>
                  <input name="appointmentTime" value={form.appointmentTime} onChange={handleChange} type="time" className="w-full mt-1 p-2 border rounded" />
                </div>
              </div>

              <div>
                <label className="text-xs">Type</label>
                <select name="appointmentType" value={form.appointmentType} onChange={handleChange} className="w-full mt-1 p-2 border rounded">
                  <option value="video">Video</option>
                  <option value="in-person">In-person</option>
                </select>
              </div>

              <div>
                <label className="text-xs">Reason</label>
                <textarea name="reason" value={form.reason} onChange={handleChange} className="w-full mt-1 p-2 border rounded" rows={3} />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={closeForm} className="px-3 py-1 border rounded">Cancel</button>
                <button type="submit" disabled={submitting} className="px-3 py-1 bg-brand-600 text-white rounded">
                  {submitting ? "Booking..." : "Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
