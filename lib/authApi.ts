import {
  authApiBaseUrl,
  clearAuthSession,
  getRefreshToken,
  isDemoMode,
  secureFetch,
  setAuthSession,
} from './apiClient';
import { handleDemoRequest } from './demoBackend';

export type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  status?: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn?: number;
};

export interface RegisterResultResponse {
  requiresVerification: boolean;
  email: string;
  message: string;
}

export type RegisterResponse = AuthResponse | RegisterResultResponse;

export type LoginDto = {
  email: string;
  password: string;
};

export type RegisterDto = {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
};

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'VALIDATION_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'SERVER_ERROR'
  | 'CONNECTION_ERROR'
  | 'UNKNOWN_ERROR';

export interface AuthApiErrorOptions {
  status?: number;
  code?: AuthErrorCode;
  field?: 'email' | 'password' | 'all';
  cause?: unknown;
}

export class AuthApiError extends Error {
  readonly status?: number;
  readonly code: AuthErrorCode;
  readonly field?: 'email' | 'password' | 'all';

  constructor(message: string, options?: AuthApiErrorOptions) {
    super(message);
    this.name = 'AuthApiError';
    this.status = options?.status;
    this.code =
      options?.code ??
      (options?.status === 401
        ? 'INVALID_CREDENTIALS'
        : options?.status === 400
          ? 'VALIDATION_ERROR'
          : options?.status &&
              (options.status === 503 || options.status === 502 || options.status === 504)
            ? 'SERVICE_UNAVAILABLE'
            : options?.status && options.status >= 500
              ? 'SERVER_ERROR'
              : 'UNKNOWN_ERROR');
    this.field = options?.field;
  }
}

async function parseErrorMessage(response: Response, defaultMessage: string): Promise<string> {
  try {
    const errorData = await response.json();
    if (typeof errorData.message === 'string' && errorData.message.trim()) {
      return errorData.message;
    }
    if (typeof errorData.error === 'string' && errorData.error.trim()) {
      return errorData.error;
    }
  } catch {
    // Non-JSON response
  }
  return defaultMessage;
}

export async function login(dto: LoginDto): Promise<AuthResponse> {
  if (isDemoMode()) {
    const res = await handleDemoRequest(`${authApiBaseUrl}/login`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    const data = (await res.json()) as AuthResponse;
    setAuthSession(data.accessToken, data.refreshToken);
    return data;
  }

  let response: Response;
  try {
    response = await fetch(`${authApiBaseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });
  } catch (error) {
    throw new AuthApiError(
      'Não foi possível conectar ao servidor. Verifique sua conexão com a internet ou use o Modo Demonstração.',
      { code: 'CONNECTION_ERROR', cause: error }
    );
  }

  if (!response.ok) {
    const message = await parseErrorMessage(
      response,
      response.status === 401
        ? 'Credenciais inválidas. Verifique seu e-mail e senha.'
        : 'Não foi possível realizar o login. Tente novamente.'
    );
    throw new AuthApiError(message, {
      status: response.status,
      field: response.status === 401 ? 'all' : undefined,
    });
  }

  const data = (await response.json()) as AuthResponse;
  setAuthSession(data.accessToken, data.refreshToken);
  return data;
}

export async function register(dto: RegisterDto): Promise<RegisterResponse> {
  if (!dto.acceptTerms) {
    throw new AuthApiError(
      'Você deve aceitar os Termos de Uso e a Política de Privacidade para criar sua conta.',
      { code: 'VALIDATION_ERROR' }
    );
  }

  if (isDemoMode()) {
    const res = await handleDemoRequest(`${authApiBaseUrl}/register`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    const data = (await res.json()) as AuthResponse;
    setAuthSession(data.accessToken, data.refreshToken);
    return data;
  }

  let response: Response;
  try {
    response = await fetch(`${authApiBaseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...dto, acceptTerms: true }),
    });
  } catch (error) {
    throw new AuthApiError(
      'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
      { code: 'CONNECTION_ERROR', cause: error }
    );
  }

  if (!response.ok) {
    const message = await parseErrorMessage(
      response,
      'Não foi possível concluir o cadastro. Verifique os dados informados.'
    );
    throw new AuthApiError(message, { status: response.status });
  }

  const data = (await response.json()) as RegisterResponse;
  if ('requiresVerification' in data && data.requiresVerification) {
    return data;
  }
  const authData = data as AuthResponse;
  if (authData.accessToken) {
    setAuthSession(authData.accessToken, authData.refreshToken);
  }
  return data;
}

export async function verifyEmail(email: string, code: string): Promise<AuthResponse> {
  if (isDemoMode()) {
    const res = await handleDemoRequest(`${authApiBaseUrl}/verify-email`, {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
    const data = (await res.json()) as AuthResponse;
    setAuthSession(data.accessToken, data.refreshToken);
    return data;
  }

  let response: Response;
  try {
    response = await fetch(`${authApiBaseUrl}/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });
  } catch (error) {
    throw new AuthApiError(
      'Não foi possível conectar ao servidor. Verifique sua conexão.',
      { code: 'CONNECTION_ERROR', cause: error }
    );
  }

  if (!response.ok) {
    const message = await parseErrorMessage(
      response,
      'Código de verificação inválido ou expirado.'
    );
    throw new AuthApiError(message, { status: response.status });
  }

  const data = (await response.json()) as AuthResponse;
  setAuthSession(data.accessToken, data.refreshToken);
  return data;
}

export async function resendVerificationCode(
  email: string
): Promise<{ success: boolean; message: string }> {
  if (isDemoMode()) {
    return { success: true, message: 'Código de verificação reenviado com sucesso.' };
  }

  let response: Response;
  try {
    response = await fetch(`${authApiBaseUrl}/resend-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
  } catch (error) {
    throw new AuthApiError(
      'Não foi possível conectar ao servidor. Verifique sua conexão.',
      { code: 'CONNECTION_ERROR', cause: error }
    );
  }

  if (!response.ok) {
    const message = await parseErrorMessage(
      response,
      'Não foi possível reenviar o código de verificação.'
    );
    throw new AuthApiError(message, { status: response.status });
  }

  const data = await response.json().catch(() => ({}));
  return {
    success: typeof data.success === 'boolean' ? data.success : true,
    message:
      typeof data.message === 'string' && data.message.trim()
        ? data.message
        : 'Código de verificação reenviado com sucesso.',
  };
}

export async function refreshToken(token?: string): Promise<AuthResponse> {
  if (isDemoMode()) {
    const res = await handleDemoRequest(`${authApiBaseUrl}/refresh`, { method: 'POST' });
    const data = (await res.json()) as AuthResponse;
    setAuthSession(data.accessToken, data.refreshToken);
    return data;
  }

  const tokenToSend = token ?? getRefreshToken();
  let response: Response;
  try {
    response = await fetch(`${authApiBaseUrl}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenToSend ? { refreshToken: tokenToSend } : {}),
    });
  } catch (error) {
    throw new AuthApiError(
      'Não foi possível conectar ao servidor para renovar a sessão.',
      { code: 'CONNECTION_ERROR', cause: error }
    );
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthSession();
    }
    const message = await parseErrorMessage(
      response,
      'Sua sessão expirou. Faça login novamente.'
    );
    throw new AuthApiError(message, { status: response.status });
  }

  const data = (await response.json()) as AuthResponse;
  setAuthSession(data.accessToken, data.refreshToken);
  return data;
}

export async function logout(token?: string): Promise<void> {
  const tokenToSend = token ?? getRefreshToken();
  try {
    if (!isDemoMode()) {
      await fetch(`${authApiBaseUrl}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenToSend ? { refreshToken: tokenToSend } : {}),
      });
    }
  } catch {
    // ignore network error on logout
  } finally {
    clearAuthSession();
  }
}

export async function getMe(): Promise<User> {
  const response = await secureFetch(`${authApiBaseUrl}/me`, { method: 'GET' });
  if (!response.ok) {
    const message = await parseErrorMessage(
      response,
      'Não foi possível obter dados do usuário autenticado.'
    );
    throw new Error(message);
  }
  return (await response.json()) as User;
}

export async function exportUserData(): Promise<unknown> {
  const response = await secureFetch(`${authApiBaseUrl}/export-data`, { method: 'GET' });
  if (!response.ok) {
    const message = await parseErrorMessage(
      response,
      'Não foi possível exportar seus dados. Tente novamente mais tarde.'
    );
    throw new Error(message);
  }
  return response.json();
}

export async function deleteUserAccount(
  password: string,
  confirmationPhrase: string
): Promise<void> {
  const response = await secureFetch(`${authApiBaseUrl}/delete-account`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password, confirmationPhrase }),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(
      response,
      'Não foi possível excluir sua conta. Verifique sua senha e confirmação.'
    );
    throw new Error(message);
  }

  clearAuthSession();
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const defaultSuccessMessage =
    'Se o e-mail informado estiver cadastrado, as instruções para redefinir sua senha foram enviadas.';

  if (isDemoMode()) {
    return { message: defaultSuccessMessage };
  }

  let response: Response;
  try {
    response = await fetch(`${authApiBaseUrl}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
  } catch (error) {
    throw new AuthApiError(
      'Não foi possível conectar ao servidor. Verifique sua conexão.',
      { code: 'CONNECTION_ERROR', cause: error }
    );
  }

  if (response.ok || response.status === 404 || response.status === 501) {
    const data = await response.json().catch(() => ({}));
    return {
      message:
        typeof data.message === 'string' && data.message.trim()
          ? data.message
          : defaultSuccessMessage,
    };
  }

  const message = await parseErrorMessage(
    response,
    'Não foi possível processar a solicitação de recuperação no momento.'
  );
  throw new AuthApiError(message, { status: response.status });
}
