'use client';

import { useEffect, useRef } from 'react';
import 'swagger-ui-dist/swagger-ui.css';

export default function DocPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Dynamically import SwaggerUI bundle
    import('swagger-ui-dist').then((module) => {
      const { SwaggerUIBundle, SwaggerUIStandalonePreset } = module;
      SwaggerUIBundle({
        domNode: containerRef.current,
        url: '/api/doc',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset,
        ],
        layout: 'StandaloneLayout',
      });
    });
  }, []);

  return <div ref={containerRef} style={{ width: '100%', minHeight: '100vh' }} />;
}
