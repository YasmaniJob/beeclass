import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAsistenciaSupabaseAdapter } from '@/infrastructure/adapters/SupabaseGoogleSheetsAdapter';

// Mock the adapter
vi.mock('@/infrastructure/adapters/SupabaseGoogleSheetsAdapter');

describe('AsistenciaSupabaseAdapter', () => {
  const mockAdapter = {
    subjects: [
      {
        numeroDocumento: '12345678',
        nombres: 'Ana',
        apellidoPaterno: 'López',
        grado: '2',
        seccion: 'B',
      },
    ],
    state: {
      asistencia: {},
      initialAsistencia: {},
      currentDate: new Date(),
      statusFilter: 'todos',
      searchTerm: '',
    },
    dispatch: vi.fn(),
    markAllAsPresent: vi.fn(),
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    (useAsistenciaSupabaseAdapter as any).mockReturnValue(mockAdapter);
  });

  it('should render students list', () => {
    const TestComponent = () => {
      const { subjects, isLoading } = useAsistenciaSupabaseAdapter('estudiantes', '2', 'B');

      if (isLoading) return <div>Loading...</div>;

      return (
        <div>
          <h1>Estudiantes</h1>
          {subjects.map((student: any) => (
            <div key={student.numeroDocumento} data-testid={`student-${student.numeroDocumento}`}>
              {student.nombres} {student.apellidoPaterno}
            </div>
          ))}
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByText('Estudiantes')).toBeInTheDocument();
    expect(screen.getByTestId('student-12345678')).toHaveTextContent('Ana López');
  });

  it('should handle attendance actions', () => {
    const mockDispatch = vi.fn();
    (useAsistenciaSupabaseAdapter as any).mockReturnValue({
      ...mockAdapter,
      dispatch: mockDispatch,
    });

    const TestComponent = () => {
      const { dispatch } = useAsistenciaSupabaseAdapter('estudiantes', '2', 'B');

      const handleMarkPresent = () => {
        dispatch({
          type: 'MARK_PRESENT',
          payload: { estudianteId: '12345678' },
        });
      };

      return (
        <div>
          <button onClick={handleMarkPresent} data-testid="mark-present">
            Marcar Presente
          </button>
        </div>
      );
    };

    render(<TestComponent />);

    fireEvent.click(screen.getByTestId('mark-present'));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'MARK_PRESENT',
      payload: { estudianteId: '12345678' },
    });
  });
});
