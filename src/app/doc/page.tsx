'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function DocPage() {
  const [spec, setSpec] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('/api/doc')
      .then((res) => res.json())
      .then((data) => setSpec(data));
  }, []);

  if (!spec) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Chargement de la documentation...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SwaggerUI spec={spec} />
    </div>
  );
}
