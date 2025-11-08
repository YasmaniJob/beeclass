import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMatriculaSupabaseHibrida } from '@/infrastructure/hooks/useMatriculaSupabaseHibrida';

// Mock de Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: [
              {
                id: '1',
                numero_documento: '12345678',
                nombres: 'Juan',
                apellido_paterno: 'Pérez',
                apellido_materno: 'García',
                grado: '1',
                seccion: 'A',
                tipo_documento: 'DNI'
              }
            ],
            error: null
          })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    },
  })),
}));

// Mock de Google Sheets
vi.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: vi.fn(() => ({
        getClient: vi.fn(() => ({})),
      })),
    },
    sheets: vi.fn(() => ({
      spreadsheets: {
        values: {
          get: vi.fn(() => Promise.resolve({
            data: {
              values: [
                ['12345678', 'Juan', 'Pérez', 'García', '1', 'A', 'DNI', 'PRESENTE']
              ]
            }
          })),
          append: vi.fn(() => Promise.resolve({ data: {} })),
        },
      },
    })),
  },
}));

describe('Inkuña Hybrid Architecture', () => {
  const mockToast = vi.fn();

  beforeEach(() => {
    // Mock toast notifications
    vi.mock('@/hooks/use-toast', () => ({
      useToast: () => ({
        toast: mockToast,
      }),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should load students from Supabase', async () => {
    // Test que el hook híbrido puede cargar estudiantes de Supabase
    const TestComponent = () => {
      const { estudiantes, loading } = useMatriculaSupabaseHibrida();

      if (loading.estudiantes) {
        return <div data-testid="loading">Loading students...</div>;
      }

      return (
        <div>
          <div data-testid="students-count">{estudiantes.length}</div>
          {estudiantes.map((estudiante: any) => (
            <div key={estudiante.numeroDocumento} data-testid={`student-${estudiante.numeroDocumento}`}>
              {estudiante.nombres} {estudiante.apellidoPaterno}
            </div>
          ))}
        </div>
      );
    };

    render(<TestComponent />);

    // Debería mostrar loading inicialmente
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Después de cargar, debería mostrar estudiantes
    await waitFor(() => {
      expect(screen.getByTestId('students-count')).toHaveTextContent('1');
      expect(screen.getByTestId('student-12345678')).toHaveTextContent('Juan Pérez');
    });
  });

  it('should register attendance in Google Sheets', async () => {
    const mockRegistrarAsistencia = vi.fn();

    const TestComponent = () => {
      const { registrarAsistencia } = useMatriculaSupabaseHibrida();

      const handleRegister = () => {
        registrarAsistencia({
          estudianteId: '12345678',
          estado: 'PRESENTE',
          registradoPor: 'teacher1',
        });
      };

      return (
        <div>
          <button onClick={handleRegister} data-testid="register-button">
            Registrar Asistencia
          </button>
        </div>
      );
    };

    render(<TestComponent />);

    fireEvent.click(screen.getByTestId('register-button'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Asistencia registrada',
        description: 'La asistencia ha sido registrada correctamente.',
      });
    });
  });

  it('should handle errors gracefully', async () => {
    // Mock error en Supabase
    const supabaseMock = vi.mocked(require('@supabase/supabase-js').createClient());
    supabaseMock.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: null,
            error: new Error('Database connection failed')
          })),
        })),
      })),
    });

    const TestComponent = () => {
      const { estudiantes, loading, error } = useMatriculaSupabaseHibrida();

      if (error) {
        return <div data-testid="error">{error.message}</div>;
      }

      if (loading.estudiantes) {
        return <div data-testid="loading">Loading...</div>;
      }

      return <div data-testid="students">{estudiantes.length} students</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Database connection failed');
    });
  });
});
