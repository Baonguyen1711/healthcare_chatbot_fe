export const API_BASE = import.meta.env.VITE_APPOINTMENT_BASE_URL;
export async function getHospitals() {
  const token = (localStorage.getItem("accessToken") ?? "").trim();
  const res = await fetch(`${API_BASE}/hospitals`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Không thể lấy danh sách bệnh viện");
  return res.json();
}

export async function getDepartmentsByHospital(hospitalId: string) {
  const token = (localStorage.getItem("accessToken") ?? "").trim();
  const res = await fetch(`${API_BASE}/getDepartmentsByHospitalId`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ hospitalId: hospitalId }),
  });

  if (!res.ok) {
    throw new Error("Không thể lấy danh sách bác sĩ");
  }

  return res.json();
}

export async function getDoctorsByDepartment(departmentId: string) {
  const token = (localStorage.getItem("accessToken") ?? "").trim();
  const res = await fetch(`${API_BASE}/getDoctorByDepartment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ departmentId: departmentId }),
  });

  if (!res.ok) {
    throw new Error("Không thể lấy danh sách bác sĩ");
  }

  return res.json();
}

export async function getDoctorSchedule(doctorId: string, dateStr: string) {
  const token = (localStorage.getItem("accessToken") ?? "").trim();
  const res = await fetch(`${API_BASE}/doctor/getSchedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ doctorId: doctorId, date: dateStr }),
  });
  if (!res.ok) throw new Error("Không thể lấy lịch của bác sĩ");
  return res.json();
}

export async function bookAppointment(data: any) {
  const token = (localStorage.getItem("accessToken") ?? "").trim();
  const res = await fetch(`${API_BASE}/appointment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  console.log(res);
  if (!res.ok) throw new Error("Không thể đặt lịch hẹn");
  return res.json();
}

export async function getAppointmentsByUser() {
  const token = (localStorage.getItem("accessToken") ?? "").trim();
  if (!token) {
    throw new Error("Vui lòng đăng nhập để xem lịch đã đặt");
  }

  const res = await fetch(`${API_BASE}/appointments/user`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Không thể lấy danh sách lịch hẹn của bạn");
  }
  console.log(res.body);
  return res.json();
}

export async function getDoctorById(doctorId: string) {
  const token = (localStorage.getItem("accessToken") ?? "").trim();
  const res = await fetch(`${API_BASE}/doctor/getById`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ doctorId }),
  });

  if (!res.ok) {
    throw new Error("Không thể lấy thông tin bác sĩ");
  }

  return res.json();
}

export async function getHospitalById(hospitalId: string) {
  const token = (localStorage.getItem("accessToken") ?? "").trim();
  const res = await fetch(`${API_BASE}/hospitals/getById`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ hospitalId }),
  });

  if (!res.ok) {
    throw new Error("Không thể lấy thông tin bệnh viện");
  }

  return res.json();
}
