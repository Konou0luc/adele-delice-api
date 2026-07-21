'use client';

import { useEffect } from 'react';

export default function DocPage() {
  useEffect(() => {
    // Load Swagger UI from CDN
    const loadSwaggerUI = () => {
      const ui = (window as any).SwaggerUIBundle;
      if (ui) {
        ui({
          dom_id: '#swagger-ui',
          url: '/swagger.json',
          deepLinking: true,
          presets: [
            ui.presets.apis,
            (window as any).SwaggerUIStandalonePreset,
          ],
          layout: 'StandaloneLayout',
        });
      }
    };

    // Check if scripts are already loaded
    if (!(window as any).SwaggerUIBundle) {
      // Load Swagger UI CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css';
      document.head.appendChild(link);

      // Load Swagger UI JS bundle
      const script1 = document.createElement('script');
      script1.src = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js';
      script1.onload = () => {
        const script2 = document.createElement('script');
        script2.src = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js';
        script2.onload = loadSwaggerUI;
        document.body.appendChild(script2);
      };
      document.body.appendChild(script1);
    } else {
      loadSwaggerUI();
    }
  }, []);

  return <div id="swagger-ui" style={{ width: '100%', minHeight: '100vh' }} />;
}
