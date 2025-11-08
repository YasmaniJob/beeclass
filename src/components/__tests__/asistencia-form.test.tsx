import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AsistenciaForm } from '@/presentation/components/asistencia/AsistenciaForm';
import { EstadoAsistenciaEnum } from '@/domain/value-objects/EstadoAsistencia';

// Mock del hook de asistencia
vi.mock('@/hooks/use-asistencia', () => ({
  useAsistencia: vi.fn(() => ({
    asistencia: {},
    setAsistencia: vi.fn(),
    registrarAsistencia: vi.fn(),
    loading: false,
    error: null,
  })),
}));

// Mock del hook de estudiantes
vi.mock('@/hooks/use-estudiantes', () => ({
  useEstudiantes: vi.fn(() => ({
    estudiantes: [
      {
        id: '1',
        nombres: 'Juan',
        apellidoPaterno: 'Pérez',
        apellidoMaterno: 'García',
        grado: '1',
        seccion: 'A',
        numeroDocumento: '12345678',
      },
      {
        id: '2',
        nombres: 'María',
        apellidoPaterno: 'López',
        apellidoMaterno: 'Sánchez',
        grado: '1',
        seccion: 'A',
        numeroDocumento: '87654321',
      },
    ],
    loading: false,
    error: null,
  })),
}));

// Mock del toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

describe('AsistenciaForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form elements correctly', () => {
    const mockUseEstudiantes = vi.mocked(require('@/hooks/use-estudiantes').useEstudiantes);
    mockUseEstudiantes.mockReturnValue({
      estudiantes: [
        {
          id: '1',
          nombres: 'Juan',
          apellidoPaterno: 'Pérez',
          apellidoMaterno: 'García',
          grado: '1',
          seccion: 'A',
          numeroDocumento: '12345678',
        },
      ],
      loading: false,
      error: null,
    });

    render(<AsistenciaForm />);

    // Verificar que se renderizan los elementos del formulario
    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(screen.getByLabelText(/estudiante/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrar/i })).toBeInTheDocument();
  });

  it('should display students in select dropdown', () => {
    const mockUseEstudiantes = vi.mocked(require('@/hooks/use-estudiantes').useEstudiantes);
    const estudiantes = [
      {
        id: '1',
        nombres: 'Juan',
        apellidoPaterno: 'Pérez',
        apellidoMaterno: 'García',
        grado: '1',
        seccion: 'A',
        numeroDocumento: '12345678',
      },
      {
        id: '2',
        nombres: 'María',
        apellidoPaterno: 'López',
        apellidoMaterno: 'Sánchez',
        grado: '1',
        seccion: 'A',
        numeroDocumento: '87654321',
      },
    ];

    mockUseEstudiantes.mockReturnValue({
      estudiantes,
      loading: false,
      error: null,
    });

    render(<AsistenciaForm />);

    // Verificar que los estudiantes aparecen en el select
    expect(screen.getByText('Juan Pérez García')).toBeInTheDocument();
    expect(screen.getByText('María López Sánchez')).toBeInTheDocument();
  });

  it('should handle attendance registration', async () => {
    const mockRegistrarAsistencia = vi.fn();

    const mockUseAsistencia = vi.mocked(require('@/hooks/use-asistencia').useAsistencia);
    mockUseAsistencia.mockReturnValue({
      asistencia: {},
      setAsistencia: vi.fn(),
      registrarAsistencia: mockRegistrarAsistencia,
      loading: false,
      error: null,
    });

    const mockUseEstudiantes = vi.mocked(require('@/hooks/use-estudiantes').useEstudiantes);
    mockUseEstudiantes.mockReturnValue({
      estudiantes: [
        {
          id: '1',
          nombres: 'Juan',
          apellidoPaterno: 'Pérez',
          apellidoMaterno: 'García',
          grado: '1',
          seccion: 'A',
          numeroDocumento: '12345678',
        },
      ],
      loading: false,
      error: null,
    });

    render(<AsistenciaForm />);

    // Simular selección de estudiante
    const studentSelect = screen.getByLabelText(/estudiante/i);
    fireEvent.change(studentSelect, { target: { value: '1' } });

    // Simular selección de estado
    const statusSelect = screen.getByLabelText(/estado/i);
    fireEvent.change(statusSelect, { target: { value: EstadoAsistenciaEnum.PRESENTE } });

    // Enviar formulario
    const submitButton = screen.getByRole('button', { name: /registrar/i });
    fireEvent.click(submitButton);

    // Verificar que se llamó a registrarAsistencia
    await waitFor(() => {
      expect(mockRegistrarAsistencia).toHaveBeenCalledWith(
        expect.objectContaining({
          estudianteId: '1',
          estado: EstadoAsistenciaEnum.PRESENTE,
          estado: 'PRESENTE',
        })
      );
    });
  });

  it('should show loading state during submission', () => {
    const mockUseAsistencia = vi.mocked(require('@/hooks/use-asistencia').useAsistencia);
    mockUseAsistencia.mockReturnValue({
      asistencia: {},
      setAsistencia: vi.fn(),
      registrarAsistencia: vi.fn(),
      loading: true,
      error: null,
    });

    render(<AsistenciaForm />);

    const submitButton = screen.getByRole('button', { name: /registrar/i });
    expect(submitButton).toBeDisabled();
  });

  it('should handle errors gracefully', () => {
    const mockUseAsistencia = vi.mocked(require('@/hooks/use-asistencia').useAsistencia);
    mockUseAsistencia.mockReturnValue({
      asistencia: {},
      setAsistencia: vi.fn(),
      registrarAsistencia: vi.fn(),
      loading: false,
      error: new Error('Error al registrar asistencia'),
    });

    render(<AsistenciaForm />);

    // Verificar que se muestra el error
    expect(screen.getByText(/error al registrar asistencia/i)).toBeInTheDocument();
  });
});
