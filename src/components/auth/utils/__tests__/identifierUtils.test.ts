
import { describe, it, expect, vi } from 'vitest';
import { generateIdentifier, DEFAULT_EVENT_ID } from '../identifierUtils';
import { supabase } from '@/lib/supabase';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          head: vi.fn().mockResolvedValue({ count: 42 })
        }))
      }))
    }))
  }
}));

describe('generateIdentifier', () => {
  it('should generate padded identifier based on count', async () => {
    const identifier = await generateIdentifier();
    expect(identifier).toBe('043');
    
    expect(supabase.from).toHaveBeenCalledWith('pagamentos');
    expect(supabase.from().select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
    expect(supabase.from().select().eq).toHaveBeenCalledWith('evento_id', DEFAULT_EVENT_ID);
  });

  it('should handle zero count', async () => {
    vi.mocked(supabase.from().select().eq().head).mockResolvedValueOnce({ count: 0 });
    
    const identifier = await generateIdentifier();
    expect(identifier).toBe('001');
  });

  it('should handle large numbers', async () => {
    vi.mocked(supabase.from().select().eq().head).mockResolvedValueOnce({ count: 999 });
    
    const identifier = await generateIdentifier();
    expect(identifier).toBe('1000');
  });
});
