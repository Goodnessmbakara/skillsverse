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