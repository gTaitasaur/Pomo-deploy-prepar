import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para incluir el token en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        success: false,
        error: {
          message: 'Error de conexión con el servidor',
          code: 'NETWORK_ERROR'
        }
      });
    }
    
    const errorData = error.response.data || {};
    return Promise.reject({
      success: false,
      error: {
        message: errorData.error?.message || error.response.data?.message || 'Error desconocido',
        code: errorData.error?.code || 'UNKNOWN_ERROR',
        details: errorData.error?.details
      }
    });
  }
);

class AuthService {
  static async login(username, password) {
    try {
      const response = await api.post('/auth/login', {
        username,
        password
      });

      return response.data;
    } catch (error) {
      if (error.success === false) {
        return error;
      }
      
      return {
        success: false,
        error: {
          message: 'Error al iniciar sesión',
          code: 'LOGIN_ERROR'
        }
      };
    }
  }

  static async register(userData) {
    console.log('🚀 Iniciando registro con datos:', userData);
    
    try {
      const response = await api.post('/auth/register', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        telefono: userData.telefono && userData.telefono.trim() !== '' ? userData.telefono : null
      });

      console.log('✅ Registro exitoso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      
      if (error.success === false) {
        return error;
      }
      
      return {
        success: false,
        error: {
          message: 'Error al registrar usuario',
          code: 'REGISTER_ERROR'
        }
      };
    }
  }

  // Verificar token
  static async verifyToken(token) {
    try {
      const response = await api.get('/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      if (error.success === false) {
        return error;
      }

      return {
        success: false,
        error: {
          message: 'Token inválido',
          code: 'TOKEN_ERROR'
        }
      };
    }
  }

  // Refresh token
  static async refreshToken(refreshToken) {
    try {
      const response = await api.post('/auth/refresh', {
        refresh_token: refreshToken
      });

      return response.data;
    } catch (error) {
      if (error.success === false) {
        return error;
      }
      
      return {
        success: false,
        error: {
          message: 'Error al refrescar token',
          code: 'REFRESH_ERROR'
        }
      };
    }
  }

  // Logout
  static async logout(refreshToken) {
    try {
      const response = await api.post('/auth/logout', {
        refresh_token: refreshToken
      });

      return response.data;
    } catch (error) {
      return {
        success: true,
        data: {
          message: 'Sesión cerrada'
        }
      };
    }
  }

  // Cambiar contraseña
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      const response = await api.post(`/users/${userId}/change-password`, {
        current_password: currentPassword,
        new_password: newPassword
      });

      return response.data;
    } catch (error) {
      if (error.success === false) {
        return error;
      }
      
      return {
        success: false,
        error: {
          message: 'Error al cambiar contraseña',
          code: 'PASSWORD_CHANGE_ERROR'
        }
      };
    }
  }
}

export { api };
export default AuthService;