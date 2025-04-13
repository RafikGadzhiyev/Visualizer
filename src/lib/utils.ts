import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRandomNumber(from: number, to: number) {
  return Math.round(Math.random() * (to - from) + from)
}

export function getMaxNumber(nums: number[]) {
  let max = -Infinity;

  for (let i = 0; i < nums.length; ++i) {
    if (nums[i] > max) {
      max = nums[i]
    }
  }

  return max;
}

export function getMinNumber(nums: number[]) {
  let max = Infinity;

  for (let i = 0; i < nums.length; ++i) {
    if (nums[i] < max) {
      max = nums[i]
    }
  }

  return max;
}