interface ApiResponse {
  status(code: number): ApiResponse;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
}

// Temporary deployment diagnostic. Do not expose environment values or user data.
export default async function handler(_req: unknown, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    await import('@supabase/supabase-js');
    return res.status(200).json({ functionStarted: true, supabaseModuleLoaded: true });
  } catch {
    return res.status(500).json({ functionStarted: true, supabaseModuleLoaded: false });
  }
}
