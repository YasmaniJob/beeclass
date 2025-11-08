
export const initialGrados = [
  '1er Grado',
  '2do Grado',
  '3er Grado',
  '4to Grado',
  '5to Grado',
];

export const initialSeccionesPorGrado: { [key: string]: string[] } = {
  '1er Grado': ['Sección A', 'Sección B', 'Sección C'],
  '2do Grado': ['Sección A', 'Sección B'],
  '3er Grado': ['Sección Única'],
  '4to Grado': ['Sección A'],
  '5to Grado': ['Sección A', 'Sección B'],
};

export const initialEstudiantesPorSeccion: { [key: string]: { [key: string]: number } } = {
    '1er Grado': { 'Sección A': 2, 'Sección B': 2, 'Sección C': 1 },
    '2do Grado': { 'Sección A': 2, 'Sección B': 1 },
    '3er Grado': { 'Sección Única': 2 },
    '4to Grado': { 'Sección A': 1 },
    '5to Grado': { 'Sección A': 1, 'Sección B': 0 },
};
