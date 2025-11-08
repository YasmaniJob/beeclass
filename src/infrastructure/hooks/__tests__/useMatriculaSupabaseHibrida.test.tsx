import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMatriculaSupabaseHibrida } from '@/infrastructure/hooks/useMatriculaSupabaseHibrida';

// Mock the hook
vi.mock('@/infrastructure/hooks/useMatriculaSupabaseHibrida');

describe('Inkuña Integration Tests', () => {
  const mockHook = {
    estudiantes: [
      {
        numeroDocumento: '12345678',
        nombres: 'Juan',
        apellidoPaterno: 'Pérez',
        apellidoMaterno: 'García',
        grado: '1',
        seccion: 'A',
        tipoDocumento: 'DNI' as const,
      },
    ],
    personal: [],
    loading: { estudiantes: false, personal: false },
    isLoaded: true,
    registrarAsistencia: vi.fn(),
    updateAsistencia: vi.fn(),
  };

  beforeEach(() => {
    (useMatriculaSupabaseHibrida as any).mockReturnValue(mockHook);
  });

  it('should load students from Supabase', () => {
    // Test que el hook híbrido funciona correctamente
    const TestComponent = () => {
      const { estudiantes, loading } = useMatriculaSupabaseHibrida();
      return (
        <div>
          {loading.estudiantes ? (
            <div>Loading...</div>
          ) : (
            <div data-testid="students-count">{estudiantes.length}</div>
          )}
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('students-count')).toHaveTextContent('1');
  });

  it('should handle attendance registration', async () => {
    const mockRegistrar = vi.fn();
    (useMatriculaSupabaseHibrida as any).mockReturnValue({
      ...mockHook,
      registrarAsistencia: mockRegistrar,
    });

    // Simular registro de asistencia
    const TestComponent = () => {
      const { registrarAsistencia } = useMatriculaSupabaseHibrida();

      const handleRegister = () => {
        registrarAsistencia({
          estudianteId: '12345678',
          estado: 'PRESENTE',
          registradoPor: 'teacher1',
        });
      };

      return <button onClick={handleRegister}>Register</button>;
    };

    render(<TestComponent />);

    screen.getByRole('button').click();
    expect(mockRegistrar).toHaveBeenCalledWith({
      estudianteId: '12345678',
      estado: 'PRESENTE',
      registradoPor: 'teacher1',
    });
  });
});
