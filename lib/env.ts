const requiredEnvKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

type RequiredEnvKey = (typeof requiredEnvKeys)[number];

function getEnv(key: RequiredEnvKey) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is not set.`);
  }

  return value;
}

export function getSupabaseEnv() {
  return {
    url: getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

