import { ReactNode } from 'react';

declare global {
  type PageProps = {
    children: ReactNode;
  };
}

export {};
