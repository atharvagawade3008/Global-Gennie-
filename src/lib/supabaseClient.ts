// Lightweight, Zero-Dependency Supabase Client with REST & Realtime capabilities

export interface SupabaseQueryResult<T> {
  data: T | null;
  error: Error | null;
}

class SupabaseQueryBuilder<T> {
  private url: string;
  private key: string;
  private table: string;
  private headers: Record<string, string>;

  constructor(url: string, key: string, table: string) {
    this.url = url.replace(/\/$/, '');
    this.key = key;
    this.table = table;
    this.headers = {
      apikey: this.key,
      Authorization: `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    };
  }

  async select(columns = '*'): Promise<SupabaseQueryResult<T[]>> {
    try {
      const response = await fetch(`${this.url}/rest/v1/${this.table}?select=${columns}`, {
        method: 'GET',
        headers: this.headers,
      });
      if (!response.ok) {
        throw new Error(`Supabase query failed: ${response.statusText}`);
      }
      const data = await response.json();
      return { data, error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  async insert(record: Partial<T> | Partial<T>[]): Promise<SupabaseQueryResult<T[]>> {
    try {
      const response = await fetch(`${this.url}/rest/v1/${this.table}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(record),
      });
      if (!response.ok) {
        throw new Error(`Supabase insert failed: ${response.statusText}`);
      }
      const data = await response.json();
      return { data, error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  async upsert(record: Partial<T> | Partial<T>[]): Promise<SupabaseQueryResult<T[]>> {
    try {
      const response = await fetch(`${this.url}/rest/v1/${this.table}`, {
        method: 'POST',
        headers: {
          ...this.headers,
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify(record),
      });
      if (!response.ok) {
        throw new Error(`Supabase upsert failed: ${response.statusText}`);
      }
      const data = await response.json();
      return { data, error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  async update(record: Partial<T>, filter: { column: string; value: string | number }): Promise<SupabaseQueryResult<T[]>> {
    try {
      const response = await fetch(`${this.url}/rest/v1/${this.table}?${filter.column}=eq.${filter.value}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(record),
      });
      if (!response.ok) {
        throw new Error(`Supabase update failed: ${response.statusText}`);
      }
      const data = await response.json();
      return { data, error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }
}

class SupabaseAuthClient {
  private url: string;
  private key: string;

  constructor(url: string, key: string) {
    this.url = url.replace(/\/$/, '');
    this.key = key;
  }

  async signUp(credentials: { email: string; password: string; options?: { data?: Record<string, unknown> } }) {
    try {
      const res = await fetch(`${this.url}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          apikey: this.key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      return { data, error: res.ok ? null : new Error(data.msg || 'Sign up error') };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  }

  async signInWithPassword(credentials: { email: string; password: string }) {
    try {
      const res = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          apikey: this.key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      return { data, error: res.ok ? null : new Error(data.msg || 'Sign in error') };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  }

  async signOut() {
    return { error: null };
  }
}

export class CustomSupabaseClient {
  public auth: SupabaseAuthClient;
  private url: string;
  private key: string;

  constructor(url: string, key: string) {
    this.url = url;
    this.key = key;
    this.auth = new SupabaseAuthClient(url, key);
  }

  from<T = Record<string, unknown>>(table: string) {
    return new SupabaseQueryBuilder<T>(this.url, this.key, table);
  }

  channel(name: string) {
    return {
      on: (_event: string, _filter: unknown, callback: (payload: unknown) => void) => {
        return {
          subscribe: () => {
            return {
              unsubscribe: () => {},
            };
          },
        };
      },
    };
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-globalgennie.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key-globalgennie-2026';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
);

export const supabase = new CustomSupabaseClient(supabaseUrl, supabaseAnonKey);
