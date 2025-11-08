#!/bin/bash
# scripts/quick-optimize.sh

echo "🚀 OPTIMIZACIÓN RÁPIDA DEL STACK"
echo "================================="

# 1. Instalar optimizaciones críticas
echo ""
echo "📦 Instalando dependencias críticas..."
pnpm add --save-dev @next/bundle-analyzer sharp
pnpm add @sentry/nextjs @vercel/analytics @vercel/speed-insights

echo ""
echo "🧪 Instalando testing moderno..."
pnpm add --save-dev vitest @testing-library/react @testing-library/jest-dom
pnpm add --save-dev happy-dom

echo ""
echo "⚡ Instalando optimizaciones UI..."
pnpm add @tailwindcss/typography

# 2. Actualizar scripts en package.json
echo ""
echo "📝 Actualizando scripts..."
node -e "
const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
pkg.scripts = {
  ...pkg.scripts,
  'test': 'vitest',
  'test:ui': 'vitest --ui',
  'test:coverage': 'vitest --coverage',
  'analyze': 'ANALYZE=true pnpm build',
  'build:analyze': 'ANALYZE=true pnpm build'
};
require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('✅ Scripts actualizados');
"

# 3. Crear configuración de Vitest
echo ""
echo "🧪 Creando configuración de Vitest..."
cat > vitest.config.ts << 'EOF'
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
EOF

# 4. Crear setup de testing
echo ""
echo "🔧 Creando setup de testing..."
mkdir -p src/test
cat > src/test/setup.ts << 'EOF'
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(),
        })),
      })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
    auth: {
      signIn: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
  })),
}));

// Mock Google APIs
vi.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: vi.fn(),
    },
    sheets: vi.fn(() => ({
      spreadsheets: {
        values: {
          get: vi.fn(),
          append: vi.fn(),
          update: vi.fn(),
        },
      },
    })),
  },
}));
EOF

# 5. Actualizar next.config.ts
echo ""
echo "⚙️ Actualizando configuración de Next.js..."
node -e "
const configPath = 'next.config.ts';
const config = require('fs').readFileSync(configPath, 'utf8');

if (!config.includes('optimizePackageImports')) {
  const updated = config.replace(
    'const nextConfig: NextConfig = {',
    \`const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns'
    ],
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },\`
  );
  
  require('fs').writeFileSync(configPath, updated);
  console.log('✅ Configuración de Next.js actualizada');
}
"

# 6. Crear ejemplo de test
echo ""
echo "📝 Creando test de ejemplo..."
mkdir -p src/components/__tests__
cat > src/components/__tests__/button.test.tsx << 'EOF'
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '../ui/button';

describe('Button Component', () => {
  it('should render correctly', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
EOF

echo ""
echo "🎉 OPTIMIZACIÓN COMPLETADA!"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. pnpm test              - Ejecutar tests"
echo "2. pnpm analyze           - Analizar bundle"
echo "3. pnpm build             - Build optimizado"
echo "4. pnpm dev               - Development mejorado"
echo ""
echo "✅ Stack optimizado y listo!"
