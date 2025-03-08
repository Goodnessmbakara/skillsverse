import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getLoggedInAddress = () => {
  const address = sessionStorage.getItem('walletAddress');
  if (address) {
    const prefix = address.substring(0, 6);
    const suffix = address.substring(address.length - 6);

    return `${prefix}.....${suffix}`;
  }
  return null;
};

export const uploadToWalrus = async (data: string): Promise<Uint8Array> => {
  // Mock implementation
  return new TextEncoder().encode(`https://walrus.storage/${encodeURIComponent(data)}`);
  // Real implementation (future):
  // const response = await fetch('https://walrus-api/storage', { method: 'POST', body: data });
  // return new TextEncoder().encode(response.url);
};