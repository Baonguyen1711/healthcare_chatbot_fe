const API_URL = "http://localhost:5000/api"; 

const getHeaders = () => {
  const token = localStorage.getItem("idToken");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

export const medicationService = {
  getTodayTasks: async () => {
    const res = await fetch(`${API_URL}/medications/today`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error loading data");
    return res.json();
  },

  markStatus: async (medicationId: string, status: 'taken' | 'skipped') => {
    const res = await fetch(`${API_URL}/medications/${medicationId}/adherence`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Error updating status");
    return res.json();
  }
};