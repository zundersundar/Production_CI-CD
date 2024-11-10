// LoadingSpinner.js
import React from 'react';
import { ClipLoader } from 'react-spinners';

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'auto'}}>
    <ClipLoader size={90} color="#008080" />
  </div>
);

export default LoadingSpinner;
