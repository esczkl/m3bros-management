import React, { useState } from 'react';
import { UserCheck } from 'lucide-react';
import { BRANCHES } from '../../config/constants';
import { getCalendarDays, getMonthName } from '../../utils/helpers';
import { addDoc, deleteDoc, collection, doc } from 'firebase/firestore';
import { db } from '../../firebase';

export function AttendanceTracker({ attendance, user, canManage }) {
  const [attendanceTimeframe, setAttendanceTimeframe] = useState('daily');
  const [calendarMonth, setCalendarMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth()
  });
  const [newAttendance, setNewAttendance] = useState({
    staff: 'Lito', // Default
    branch: 'elite',
    status: 'present',
    date: new Date().toISOString().split('T')[0]
  });

  const navigateMonth = (dir) => {
    setCalendarMonth(prev => {
      let nm = prev.month + dir;
      let ny = prev.year;
      if (nm > 11) { nm = 0; ny++; }
      if (nm < 0) { nm = 11; ny--; }
      return { year: ny, month: nm };
    });
  };

  const handleAddAttendance = async () => {
    if (!canManage) {
      alert('Permission denied');
      return;
    }
    if (!newAttendance.staff) {
      alert('Please select a staff member');
      return;
    }
    const exists = attendance.find(a => a.staff === newAttendance.staff && a.date === newAttendance.date);
    if (exists) {
      alert('This staff member already has an attendance entry for this date');
      return;
    }

    try {
      await addDoc(collection(db, 'attendance'), {
        ...newAttendance,
        timestamp: new Date().toISOString(),
        createdBy: user.uid
      });
      setNewAttendance({
        staff: newAttendance.staff, // Keep same staff for ease
        branch: newAttendance.branch,
        status: 'present',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      alert('Error logging attendance: ' + error.message);
    }
  };

  const handleDeleteAttendance = async (id) => {
    if (!canManage) {
      alert('Permission denied');
      return;
    }
    if (window.confirm('Remove this attendance record?')) {
      try {
        await deleteDoc(doc(db, 'attendance', id));
      } catch (error) {
        alert('Error removing: ' + error.message);
      }
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const { start, end } = attendanceTimeframe === 'daily'
    ? { start: today, end: today }
    : attendanceTimeframe === 'weekly'
      ? { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], end: today }
      : { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], end: today };

  const filtered = attendance.filter(a => a.date >= start && a.date <= end);
  const calendarDays = getCalendarDays(calendarMonth.year, calendarMonth.month);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayStr = new Date().toISOString().split('T')[0];
  const getAttendanceForDate = (d) => attendance.filter(a => a.date === d);
  const monthPrefix = `${calendarMonth.year}-${String(calendarMonth.month + 1).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Attendance Tracking</h2>

      {canManage && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Log Attendance / Day Off</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={newAttendance.branch}
              onChange={(e) => {
                const branchKey = e.target.value;
                const branchStaff = Object.values(BRANCHES[branchKey].staff).flat();
                setNewAttendance({ ...newAttendance, branch: branchKey, staff: branchStaff[0] || '' });
              }}
              className="px-3 py-2 border rounded-lg"
            >
              {Object.entries(BRANCHES).map(([key, branch]) => (
                <option key={key} value={key}>{branch.name}</option>
              ))}
            </select>
            <select
              value={newAttendance.staff}
              onChange={(e) => setNewAttendance({ ...newAttendance, staff: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            >
              {Object.values(BRANCHES[newAttendance.branch].staff).flat().map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={newAttendance.status}
              onChange={(e) => setNewAttendance({ ...newAttendance, status: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="off">Day Off / Leave</option>
            </select>
            <input
              type="date"
              value={newAttendance.date}
              onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
          <button
            onClick={handleAddAttendance}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" /> Log Entry
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h3 className="text-lg font-semibold">Attendance View</h3>
          <select
            value={attendanceTimeframe}
            onChange={(e) => setAttendanceTimeframe(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="daily">Today</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Monthly Calendar</option>
          </select>
        </div>

        <div className="flex gap-4 mb-4 text-sm">
          <span className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Present</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full"></span> Absent</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-full"></span> Day Off</span>
        </div>

        {attendanceTimeframe === 'monthly' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
              <button onClick={() => navigateMonth(-1)} className="px-4 py-2 bg-white rounded shadow hover:bg-gray-50">← Prev</button>
              <span className="font-bold text-lg">{getMonthName(calendarMonth.month)} {calendarMonth.year}</span>
              <button onClick={() => navigateMonth(1)} className="px-4 py-2 bg-white rounded shadow hover:bg-gray-50">Next →</button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {dayNames.map(d => <div key={d} className="text-center text-sm font-semibold text-gray-50 py-2">{d}</div>)}
              {calendarDays.map((dateStr, idx) => {
                if (!dateStr) return <div key={`e-${idx}`} className="min-h-24 bg-gray-50 rounded"></div>;
                const dayNum = parseInt(dateStr.split('-')[2]);
                const dayAtt = getAttendanceForDate(dateStr);
                const isToday = dateStr === todayStr;
                return (
                  <div key={dateStr} className={`min-h-24 border rounded p-2 ${isToday ? 'border-blue-500 border-2 bg-blue-50' : 'border-gray-200'}`}>
                    <div className={`text-sm font-bold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>{dayNum}</div>
                    <div className="space-y-1">
                      {dayAtt.map((a, i) => (
                        <div
                          key={i}
                          onClick={() => canManage && handleDeleteAttendance(a.id)}
                          className={`text-white text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 ${a.status === 'present' ? 'bg-green-500' : a.status === 'absent' ? 'bg-red-500' : 'bg-blue-500'}`}
                          title={`${a.staff} - ${a.status}`}
                        >
                          {a.staff}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-100 rounded-lg p-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="block text-2xl font-bold text-green-600">
                  {attendance.filter(a => a.date.startsWith(monthPrefix) && a.status === 'present').length}
                </span>
                <span className="text-sm text-gray-600">Present</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-red-600">
                  {attendance.filter(a => a.date.startsWith(monthPrefix) && a.status === 'absent').length}
                </span>
                <span className="text-sm text-gray-600">Absent</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-blue-600">
                  {attendance.filter(a => a.date.startsWith(monthPrefix) && a.status === 'off').length}
                </span>
                <span className="text-sm text-gray-600">Leaves</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.length > 0 ? filtered.map((a) => (
              <div
                key={a.id}
                onClick={() => canManage && handleDeleteAttendance(a.id)}
                className={`px-4 py-3 rounded-lg text-white cursor-pointer hover:opacity-90 flex justify-between items-center ${a.status === 'present' ? 'bg-green-500' : a.status === 'absent' ? 'bg-red-500' : 'bg-blue-500'}`}
              >
                <span className="font-medium">{a.staff}</span>
                <span className="text-sm opacity-90">{a.date} • {BRANCHES[a.branch].name}</span>
              </div>
            )) : (
              <p className="text-center text-gray-500 py-8">No attendance records for this period</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
