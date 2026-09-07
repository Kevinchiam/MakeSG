export type AdminAuthConfig = {
  username?: string;
  password?: string;
  sessionToken?: string;
};

export function adminAuthConfig(): AdminAuthConfig {
  return {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
    sessionToken: process.env.ADMIN_SESSION_TOKEN,
  };
}

export function adminLoginConfigured(config: AdminAuthConfig = adminAuthConfig()) {
  return Boolean(config.username && config.password && config.sessionToken);
}

export function validAdminCredentials(username: string, password: string, config: AdminAuthConfig = adminAuthConfig()) {
  if (!adminLoginConfigured(config)) return false;
  return username === config.username && password === config.password;
}
