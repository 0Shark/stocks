import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { customAlphabet } from "nanoid"
import type { Interval } from "@/types/yahoo-finance"

export const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7
) // 7-character random string

import { toZonedTime } from "date-fns-tz"

const NY_TIMEZONE = "America/New_York"

export function isMarketOpen(): boolean {
  const now = new Date()
  const nyTime = toZonedTime(now, NY_TIMEZONE)
  const day = nyTime.getDay()
  const hour = nyTime.getHours()
  const minute = nyTime.getMinutes()

  // Check if it's a weekday and between 9:30 AM and 4:00 PM NY time
  return (
    day > 0 &&
    day < 6 &&
    (hour > 9 || (hour === 9 && minute >= 30)) &&
    hour < 16
  )
}

export function getLastMarketCloseDate(): Date {
  let date = new Date()
  date = toZonedTime(date, NY_TIMEZONE)

  // If it's before market open (9:30 AM), we need to look at the previous day
  if (
    date.getHours() < 9 ||
    (date.getHours() === 9 && date.getMinutes() < 30)
  ) {
    date.setDate(date.getDate() - 1)
  }

  // Set the time to 4:00 PM (market close)
  date.setHours(16, 0, 0, 0)

  // Go back until we find a weekday
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() - 1)
  }

  // Convert back to UTC
  return new Date(date.toUTCString())
}

export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init)

  if (!res.ok) {
    const json = await res.json()
    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number
      }
      error.status = res.status
      throw error
    } else {
      throw new Error("An unexpected error occurred")
    }
  }

  return res.json()
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)

export const runAsyncFnWithoutBlocking = (
  fn: (...args: any) => Promise<any>
) => {
  fn()
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const getStringFromBuffer = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

export enum ResultCode {
  InvalidCredentials = "INVALID_CREDENTIALS",
  InvalidSubmission = "INVALID_SUBMISSION",
  UserAlreadyExists = "USER_ALREADY_EXISTS",
  UnknownError = "UNKNOWN_ERROR",
  UserCreated = "USER_CREATED",
  UserLoggedIn = "USER_LOGGED_IN",
}

export const getMessageFromCode = (resultCode: string) => {
  switch (resultCode) {
    case ResultCode.InvalidCredentials:
      return "Invalid credentials!"
    case ResultCode.InvalidSubmission:
      return "Invalid submission, please try again!"
    case ResultCode.UserAlreadyExists:
      return "User already exists, please log in!"
    case ResultCode.UserCreated:
      return "User created, welcome!"
    case ResultCode.UnknownError:
      return "Something went wrong, please try again!"
    case ResultCode.UserLoggedIn:
      return "Logged in!"
  }
}


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStartDate(interval: Interval) {
  const today = new Date()
  let subtractDays

  switch (interval) {
    case "1d":
    case "1m":
    case "2m":
    case "5m":
    case "15m":
    case "30m":
    case "60m":
    case "90m":
    case "1h":
      subtractDays = 1
      break
    case "5d":
      subtractDays = 5
      break
    case "1wk":
      subtractDays = 7
      break
    case "1mo":
      subtractDays = 30
      break
    case "3mo":
      subtractDays = 90
      break
    default:
      subtractDays = 0
  }

  today.setDate(today.getDate() - subtractDays)

  // Format the date in the 'YYYY-MM-DD' format
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}


export function CalculateRange(range: string): number {
  const lastMarketClose = getLastMarketCloseDate()
  let from = new Date(lastMarketClose)

  switch (range) {
    case "1d":
      from.setDate(from.getDate() - 1)
      break
    case "5d":
      from.setDate(from.getDate() - 5)
      break
    case "1w":
      from.setDate(from.getDate() - 7)
      break
    case "1m":
      from.setMonth(from.getMonth() - 1)
      break
    case "3m":
      from.setMonth(from.getMonth() - 3)
      break
    case "6m":
      from.setMonth(from.getMonth() - 6)
      break
    case "1y":
      from.setFullYear(from.getFullYear() - 1)
      break
    case "2y":
      from.setFullYear(from.getFullYear() - 2)
      break
    case "5y":
      from.setFullYear(from.getFullYear() - 5)
      break
    case "max":
      from = new Date(0) // Start from the earliest possible date
      break
    default:
      throw new Error(`Invalid range: ${range}`)
  }

  return Math.floor(from.getTime() / 1000) // Convert to Unix timestamp
}

export function calculateInterval(range: string) {
  let interval

  switch (range) {
    case "1d":
      interval = "15m" // 15 minutes
      break
    case "1w":
    case "1m":
      interval = "1h" // 1 hour
      break
    case "3m":
    case "1y":
      interval = "1d" // 1 day
      break
    default:
      throw new Error(`Invalid range: ${range}`)
  }

  return interval
}
