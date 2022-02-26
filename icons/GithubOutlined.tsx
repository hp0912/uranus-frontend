import React from 'react';
import { IconGenerator } from '../utils/IconGenerator';

const SVG = (props) => (
  <svg
    width="1em"
    height="1em"
    fill="currentColor"
    viewBox="0 0 1024 1024"
    {...props}
  >
    <path
      d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
      fill="#161614"
      p-id="5240"
    />
    <path
      d="M411.306667 831.146667c3.413333-5.12 6.826667-10.24 6.826666-11.946667v-69.973333c-105.813333 22.186667-128-44.373333-128-44.373334-17.066667-44.373333-42.666667-56.32-42.666666-56.32-34.133333-23.893333 3.413333-23.893333 3.413333-23.893333 37.546667 3.413333 58.026667 39.253333 58.026667 39.253333 34.133333 58.026667 88.746667 40.96 110.933333 32.426667 3.413333-23.893333 13.653333-40.96 23.893333-51.2-85.333333-10.24-174.08-42.666667-174.08-187.733333 0-40.96 15.36-75.093333 39.253334-102.4-3.413333-10.24-17.066667-47.786667 3.413333-100.693334 0 0 32.426667-10.24 104.106667 39.253334 30.72-8.533333 63.146667-11.946667 95.573333-11.946667 32.426667 0 64.853333 5.12 95.573333 11.946667 73.386667-49.493333 104.106667-39.253333 104.106667-39.253334 20.48 52.906667 8.533333 90.453333 3.413333 100.693334 23.893333 27.306667 39.253333 59.733333 39.253334 102.4 0 145.066667-88.746667 177.493333-174.08 187.733333 13.653333 11.946667 25.6 34.133333 25.6 69.973333v104.106667c0 3.413333 1.706667 6.826667 6.826666 11.946667 5.12 6.826667 3.413333 18.773333-3.413333 23.893333-3.413333 1.706667-6.826667 3.413333-10.24 3.413333h-174.08c-10.24 0-17.066667-6.826667-17.066667-17.066666 0-5.12 1.706667-8.533333 3.413334-10.24z"
      fill="#FFFFFF"
      p-id="5241"
    />
  </svg>
);

export default IconGenerator('GithubOutlined', SVG);
