
import { describe, it, expect, vi } from 'vitest';
import { generateIdentifier, DEFAULT_EVENT_ID } from '../identifierUtils';
import { supabase } from '@/lib/supabase';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          head: vi.fn().mockResolvedValue({ data: null, count: 42 })
        })
      })
    })
  }
}));

describe('generateIdentifier', () => {
  it('should generate padded identifier based on count', async () => {
    const identifier = await generateIdentifier();
    expect(identifier).toBe('043');
    
    expect(supabase.from).toHaveBeenCalledWith('pagamentos');
    expect(supabase.from('pagamentos').select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
    expect(supabase.from('pagamentos').select().eq).toHaveBeenCalledWith('evento_id', DEFAULT_EVENT_ID);
  });

  it('should handle zero count', async () => {
    const mockValue = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            head: vi.fn().mockResolvedValue({ data: null, count: 0 })
          })
        })
      })
    };
    
    vi.mocked(supabase.from).mockImplementationOnce(mockValue.from);
    
    const identifier = await generateIdentifier();
    expect(identifier).toBe('001');
  });

  it('should handle large numbers', async () => {
    const mockValue = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            head: vi.fn().mockResolvedValue({ data: null, count: 999 })
          })
        })
      })
    };
    
    vi.mocked(supabase.from).mockImplementationOnce(mockValue.from);
    
    const identifier = await generateIdentifier();
    expect(identifier).toBe('1000');
  });
});
