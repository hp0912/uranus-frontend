import Icon from '@ant-design/icons';
import { IconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React, { ForwardRefRenderFunction } from 'react';

const MusicSvg = () => (
  <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10076" width="36" height="36">
    <path d="M0 0h1024v1024H0z" fill="#FFFFFF" p-id="10077" />
    <path d="M892.5 43.3H152.7c-44.9 0-81.6 36.7-81.6 81.6v739.8c0 44.9 36.7 81.6 81.6 81.6h739.8c44.9 0 81.6-36.7 81.6-81.6V124.9c0-44.9-36.7-81.6-81.6-81.6z" fill="#F0575B" p-id="10078" />
    <path d="M522.6 868.5c-50.4 0-99.4-9.9-145.5-29.4-44.5-18.8-84.5-45.8-118.8-80.1s-61.3-74.3-80.1-118.8c-19.5-46.1-29.4-95-29.4-145.5 0-50.4 9.9-99.4 29.4-145.5 18.8-44.5 45.8-84.5 80.1-118.8s74.3-61.3 118.8-80.1c46.1-19.5 95-29.4 145.5-29.4 50.4 0 99.4 9.9 145.5 29.4 44.5 18.8 84.5 45.8 118.8 80.1s61.3 74.3 80.1 118.8c19.5 46.1 29.4 95 29.4 145.5 0 50.4-9.9 99.4-29.4 145.5-18.8 44.5-45.8 84.5-80.1 118.8s-74.3 61.3-118.8 80.1c-46.1 19.5-95 29.4-145.5 29.4z m0-727.5c-195 0-353.7 158.7-353.7 353.7s158.7 353.7 353.7 353.7 353.7-158.7 353.7-353.7S717.7 141 522.6 141z" fill="#FFFFFF" p-id="10079" />
    <path d="M703.7 476.2c-6-94.1-84.5-168.9-180.1-168.9-95.3 0-173.5 74.2-180 167.8-36.5 17.6-61.7 54.9-61.7 98.2 0 60.1 48.8 108.9 108.9 108.9V487.8h0.1c0-73.2 59.6-132.7 132.7-132.7 65.5 0 120 47.6 130.8 110.1v217.1c60.1 0 108.9-48.8 108.9-108.9 0-42.5-24.2-79.2-59.6-97.2z" fill="#FFFFFF" p-id="10080" />
  </svg>
);

const InternalMusicIcon: ForwardRefRenderFunction<any, IconComponentProps> = (props, ref) => {
  return (
    <Icon ref={ref as any} component={MusicSvg} {...props} />
  );
};

export const MusicIcon = React.forwardRef<any, IconComponentProps>(InternalMusicIcon);
MusicIcon.displayName = 'MusicIcon';