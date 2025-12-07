// src/api.ts
export const API_BASE = "https://63gi6kwvl3.execute-api.us-east-1.amazonaws.com";

export async function getHospitals() {
  const res = await fetch(`${API_BASE}/hospitals`);
  if (!res.ok) throw new Error("Không thể lấy danh sách bệnh viện");
  return res.json();
}

export async function getDepartmentsByHospital(hospitalId: string) {
  const res = await fetch(`${API_BASE}/getDepartmentsByHospitalId`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ hospitalId: hospitalId }),
  });

  if (!res.ok) {
    throw new Error("Không thể lấy danh sách bác sĩ");
  }

  return res.json();
}

export async function getDoctorsByDepartment(departmentId: string) {
  const res = await fetch(`${API_BASE}/getDoctorByDepartment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ departmentId: departmentId }),
  });

  if (!res.ok) {
    throw new Error("Không thể lấy danh sách bác sĩ");
  }

  return res.json();
}

export async function getDoctorSchedule(doctorId: string, dateStr: string) {

  const res = await fetch(`${API_BASE}/doctor/getSchedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ doctorId: doctorId, date:dateStr}),
  });
  if (!res.ok) throw new Error("Không thể lấy lịch của bác sĩ");
  return res.json();
}

export async function bookAppointment(data: any) {
  const res = await fetch(`${API_BASE}/appointment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Không thể đặt lịch hẹn");
  return res.json();
}
