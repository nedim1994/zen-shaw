import React, { useState, useEffect } from "react";
import "./index.css";

type Reservation = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  name: string;
  size: number;
  phone: string;
  section: string;
  notes: string;
};

const months = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

// Generate 15-minute timeslots from 08:00 to 22:00
function getTimeSlots() {
  const slots: string[] = [];
  const start = 8 * 60;
  const end = 22 * 60;
  for (let m = start; m <= end; m += 15) {
    const h = String(Math.floor(m / 60)).padStart(2, "0");
    const min = String(m % 60).padStart(2, "0");
    slots.push(`${h}:${min}`);
  }
  return slots;
}
const timeSlots = getTimeSlots();

export default function App() {
  // Inject print-specific CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        .fixed, button, .no-print { display: none !important; }
        body { -webkit-print-color-adjust: exact; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // authentication state
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginName, setLoginName] = useState("");
  const [pw, setPw] = useState("");

  // calendar state
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(
    now.toISOString().slice(0, 10)
  );

  // reservations persisted in localStorage
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem("reservations");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem("reservations", JSON.stringify(reservations));
  }, [reservations]);

  // form modal state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Reservation, "id">>({
    date: selectedDate,
    time: "08:00",
    name: "",
    size: 1,
    phone: "",
    section: "",
    notes: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName.trim()) {
      alert("Bitte Name eingeben.");
      return;
    }
    if (pw !== "eliffurkan2001") {
      alert("Falsches Passwort.");
      setPw("");
      return;
    }
    setLoggedIn(true);
  };

  // open new form
  const openForm = (time: string) => {
    setIsEditing(false);
    setEditingId(null);
    setForm({
      date: selectedDate,
      time,
      name: "",
      size: 1,
      phone: "",
      section: "",
      notes: "",
    });
    setShowForm(true);
  };

  // open edit form
  const openEditForm = (res: Reservation) => {
    setIsEditing(true);
    setEditingId(res.id);
    setForm({
      date: res.date,
      time: res.time,
      name: res.name,
      size: res.size,
      phone: res.phone,
      section: res.section,
      notes: res.notes,
    });
    setShowForm(true);
  };

  // submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editingId) {
      setReservations((rs) =>
        rs.map((r) => (r.id === editingId ? { id: editingId, ...form } : r))
      );
    } else {
      setReservations((rs) => [...rs, { id: crypto.randomUUID(), ...form }]);
    }
    setShowForm(false);
  };

  // delete reservation
  const handleDelete = (id: string) => {
    if (window.confirm("Reservierung wirklich löschen?")) {
      setReservations((rs) => rs.filter((r) => r.id !== id));
    }
  };

  // filter by selectedDate
  const daily = reservations.filter((r) => r.date === selectedDate);

  // compute total people for this day
  const totalPeople = daily.reduce((sum, r) => sum + r.size, 0);

  // generate date list for selected month/year
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(selectedYear, selectedMonth, i + 1);
    return d.toISOString().slice(0, 10);
  });

  // LOGIN SCREEN
  if (!loggedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-100">
        <form
          onSubmit={handleLogin}
          className="bg-blue-600 p-6 rounded shadow-md w-full max-w-sm"
        >
          <h1 className="text-2xl font-bold mb-4 text-white">Anmeldebereich</h1>
          <input
            type="text"
            placeholder="Name"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            className="border p-2 w-full mb-3 rounded"
          />
          <input
            type="password"
            placeholder="Passwort"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="border p-2 w-full mb-4 rounded"
          />
          <button
            type="submit"
            className="bg-white no-print text-blue-600 w-full py-2 rounded font-semibold"
          >
            Anmelden
          </button>
        </form>
      </div>
    );
  }

  // MAIN APP
  return (
    <div>
      <header className="bg-blue-600 text-white text-2xl font-bold p-4 rounded flex justify-between items-center no-print">
        <span>Restaurant Meram</span>
        <button
          onClick={() => window.print()}
          className="bg-white text-blue-600 px-3 py-1 rounded"
        >
          Ausdrucken
        </button>
      </header>

      <div className="p-4 space-y-4">
        {/* YEAR SELECTION */}
        <div className="flex items-center space-x-2 no-print">
          <button
            onClick={() => setSelectedYear((y) => y - 1)}
            className="px-2 py-1 bg-gray-200 rounded"
          >
            «
          </button>
          <span className="font-semibold">{selectedYear}</span>
          <button
            onClick={() => setSelectedYear((y) => y + 1)}
            className="px-2 py-1 bg-gray-200 rounded"
          >
            »
          </button>
        </div>

        {/* MONTH SELECTION */}
        <div className="flex overflow-x-auto space-x-2 no-print">
          {months.map((m, idx) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(idx)}
              className={`${
                idx === selectedMonth
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              } px-4 py-2 rounded`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* DATE SELECTION */}
        <div className="flex overflow-x-auto space-x-2 no-print">
          {dates.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`${
                d === selectedDate
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              } p-2 rounded`}
            >
              {d.slice(8)}
            </button>
          ))}
        </div>

        {/* SCHEDULE GRID */}
        <div className="border rounded">
          <div className="grid grid-cols-[80px_1fr] bg-blue-200 font-semibold">
            <div className="p-2">Uhrzeit</div>
            <div className="p-2">
              Reservierungen{" "}
              <span className="text-blue-600">({totalPeople})</span>
            </div>
          </div>

          {timeSlots.map((t) => (
            <div
              key={t}
              className="grid grid-cols-[80px_1fr] border-t hover:bg-gray-50"
            >
              <div className="p-2">{t}</div>
              <div className="p-2 space-y-2">
                {daily
                  .filter((r) => r.time === t)
                  .map((r) => (
                    <div
                      key={r.id}
                      className="bg-white rounded-lg px-3 py-2 shadow space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">
                          {r.name} ({r.size})
                        </span>
                        <div className="flex space-x-2 no-print">
                          <button onClick={() => openEditForm(r)}>✏️</button>
                          <button onClick={() => handleDelete(r.id)}>🗑️</button>
                        </div>
                      </div>
                      <div className="text-sm">
                        <p>
                          <strong>Telefon:</strong> {r.phone}
                        </p>
                        <p>
                          <strong>Bereich:</strong> {r.section}
                        </p>
                        {r.notes && (
                          <p>
                            <strong>Notizen:</strong> {r.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                <button
                  onClick={() => openForm(t)}
                  className="bg-blue-600 text-white px-2 py-1 rounded no-print"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FORM MODAL */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center no-print">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-lg w-80 space-y-3"
            >
              <h2 className="text-xl font-bold">
                {isEditing ? "Reservierung bearbeiten" : "Neue Reservierung"}
              </h2>
              <p>
                <strong>Datum:</strong> {form.date}
              </p>
              <p>
                <strong>Zeit:</strong> {form.time}
              </p>
              <input
                required
                placeholder="Name"
                className="w-full border p-2 rounded"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                required
                type="number"
                min={1}
                placeholder="Anzahl Personen"
                className="w-full border p-2 rounded"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: +e.target.value })}
              />
              <input
                required
                placeholder="Telefon"
                className="w-full border p-2 rounded"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <select
                className="w-full border p-2 rounded"
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
              >
                <option value="Vorderbereich">Vorderbereich</option>
                <option value="Hinterbereich">Hinterbereich</option>
                <option value="Garten">Garten</option>
              </select>
              <textarea
                placeholder="Notizen"
                className="w-full border p-2 rounded"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
