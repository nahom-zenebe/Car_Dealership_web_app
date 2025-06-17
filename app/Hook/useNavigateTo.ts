// lib/useNavigateTo.ts
'use client';
import { useRouter } from 'next/navigation';

export function useNavigateTo() {
  const router = useRouter();

  return (path: string) => {
    router.push(path);
  };
}
