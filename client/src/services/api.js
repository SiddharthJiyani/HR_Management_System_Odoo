const API_BASE_URL = 'http://localhost:4000/api';

// Get token from localStorage
const getAuthToken = () => localStorage.getItem('hrms_token');

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  signup: async (userData) => {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: userData,
    });
  },

  signin: async (credentials) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  },

  sendOTP: async (email) => {
    return apiCall('/auth/sendotp', {
      method: 'POST',
      body: { email },
    });
  },

  forgotPassword: async (email) => {
    return apiCall('/auth/forgotpassword', {
      method: 'POST',
      body: { email },
    });
  },
};

// Employee API functions
export const employeeAPI = {
  // Get all employees (HR/Admin)
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/employees${queryString ? `?${queryString}` : ''}`);
  },

  // Get single employee by ID
  getById: async (id) => {
    return apiCall(`/employees/${id}`);
  },

  // Get my profile (current logged-in employee)
  getMyProfile: async () => {
    return apiCall('/employees/me');
  },

  // Update my profile
  updateMyProfile: async (data) => {
    return apiCall('/employees/me', {
      method: 'PUT',
      body: data,
    });
  },

  // Create new employee (HR/Admin)
  create: async (data) => {
    return apiCall('/employees', {
      method: 'POST',
      body: data,
    });
  },

  // Update employee (HR/Admin)
  update: async (id, data) => {
    return apiCall(`/employees/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  // Delete/Deactivate employee (HR/Admin)
  delete: async (id) => {
    return apiCall(`/employees/${id}`, {
      method: 'DELETE',
    });
  },

  // Get employee statistics (HR/Admin)
  getStats: async () => {
    return apiCall('/employees/stats');
  },

  // Get employee salary details (role-based access)
  getSalary: async (id) => {
    return apiCall(`/employees/${id}/salary`);
  },

  // Get my salary details
  getMySalary: async () => {
    return apiCall('/employees/me/salary');
  },

  // Update employee salary (Admin only)
  updateSalary: async (id, data) => {
    return apiCall(`/employees/${id}/salary`, {
      method: 'PUT',
      body: data,
    });
  },
};

// Attendance API functions
export const attendanceAPI = {
  // Check in
  checkIn: async (data = {}) => {
    return apiCall('/attendance/check-in', {
      method: 'POST',
      body: data,
    });
  },

  // Check out
  checkOut: async (data = {}) => {
    return apiCall('/attendance/check-out', {
      method: 'POST',
      body: data,
    });
  },

  // Get my attendance
  getMyAttendance: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/attendance/my${queryString ? `?${queryString}` : ''}`);
  },

  // Get today's status
  getTodayStatus: async () => {
    return apiCall('/attendance/today');
  },

  // Get all attendance (HR/Admin) - for a single day
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/attendance/all${queryString ? `?${queryString}` : ''}`);
  },

  // Get week attendance (HR/Admin)
  getWeekAttendance: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/attendance/week${queryString ? `?${queryString}` : ''}`);
  },

  // Get month summary (HR/Admin)
  getMonthSummary: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/attendance/month-summary${queryString ? `?${queryString}` : ''}`);
  },

  // Get employee attendance
  getEmployeeAttendance: async (employeeId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/attendance/employee/${employeeId}${queryString ? `?${queryString}` : ''}`);
  },

  // Mark attendance (HR/Admin)
  mark: async (data) => {
    return apiCall('/attendance/mark', {
      method: 'POST',
      body: data,
    });
  },

  // Request attendance regularization (Employee)
  requestRegularization: async (data) => {
    return apiCall('/attendance/regularization', {
      method: 'POST',
      body: data,
    });
  },

  // Get pending regularization requests (HR/Admin)
  getPendingRegularizations: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/attendance/regularizations${queryString ? `?${queryString}` : ''}`);
  },

  // Handle regularization request (HR/Admin)
  handleRegularization: async (attendanceId, data) => {
    return apiCall(`/attendance/regularization/${attendanceId}`, {
      method: 'PUT',
      body: data,
    });
  },
};

// Leave API functions
export const leaveAPI = {
  // Apply for leave
  apply: async (data) => {
    return apiCall('/leaves/apply', {
      method: 'POST',
      body: data,
    });
  },

  // Get my leaves
  getMyLeaves: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/leaves/my${queryString ? `?${queryString}` : ''}`);
  },

  // Get leave balance
  getBalance: async () => {
    return apiCall('/leaves/balance');
  },

  // Cancel leave
  cancel: async (id, reason = '') => {
    return apiCall(`/leaves/cancel/${id}`, {
      method: 'PUT',
      body: { reason },
    });
  },

  // Get all leaves (HR/Admin)
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/leaves/all${queryString ? `?${queryString}` : ''}`);
  },

  // Get leave statistics (HR/Admin)
  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/leaves/stats${queryString ? `?${queryString}` : ''}`);
  },

  // Update leave status (HR/Admin) - approve/reject
  updateStatus: async (id, status, comments = '') => {
    return apiCall(`/leaves/status/${id}`, {
      method: 'PUT',
      body: { status, comments },
    });
  },

  // Approve leave (HR/Admin) - convenience method
  approve: async (id, comments = '') => {
    return apiCall(`/leaves/status/${id}`, {
      method: 'PUT',
      body: { status: 'approved', comments },
    });
  },

  // Reject leave (HR/Admin) - convenience method
  reject: async (id, comments = '') => {
    return apiCall(`/leaves/status/${id}`, {
      method: 'PUT',
      body: { status: 'rejected', comments },
    });
  },
};

// Payroll API functions
export const payrollAPI = {
  // Get my payroll (Employee)
  getMyPayroll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/payroll/my${queryString ? `?${queryString}` : ''}`);
  },

  // Get specific payslip (Employee)
  getPayslip: async (id) => {
    return apiCall(`/payroll/payslip/${id}`);
  },

  // Get all payrolls (HR/Admin)
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/payroll/all${queryString ? `?${queryString}` : ''}`);
  },

  // Get payroll statistics (HR/Admin)
  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/payroll/stats${queryString ? `?${queryString}` : ''}`);
  },

  // Get employee payroll (HR/Admin)
  getEmployeePayroll: async (employeeId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/payroll/employee/${employeeId}${queryString ? `?${queryString}` : ''}`);
  },

  // Generate payroll (HR/Admin)
  generate: async (month, year) => {
    return apiCall('/payroll/generate', {
      method: 'POST',
      body: { month, year },
    });
  },

  // Update payroll (HR/Admin)
  update: async (id, data) => {
    return apiCall(`/payroll/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  // Process payment (HR/Admin)
  processPayment: async (id, data) => {
    return apiCall(`/payroll/process/${id}`, {
      method: 'POST',
      body: data,
    });
  },

  // Update salary structure (HR/Admin)
  updateSalary: async (employeeId, data) => {
    return apiCall(`/payroll/salary/${employeeId}`, {
      method: 'PUT',
      body: data,
    });
  },
};

// Export all APIs
export default {
  authAPI,
  employeeAPI,
  attendanceAPI,
  leaveAPI,
  payrollAPI,
};