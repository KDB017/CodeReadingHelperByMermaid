
/*
 * This code is based on Mermaid  preview
 * Copyright (c) 2023 Mermaid preview
 * Licensed under MIT License
 */

/**
 * Debounces a function by a specified wait time.
 * @param func The function to debounce.
 * @param wait The wait time in milliseconds.
 * @returns A debounced version of the function.
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}