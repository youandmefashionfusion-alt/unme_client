'use client';

import { useEffect } from 'react';

const DataLayerScript = () => {
  useEffect(() => {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
  }, []);

  return null;
};

export default DataLayerScript;