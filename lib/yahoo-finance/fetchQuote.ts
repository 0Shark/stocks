import { unstable_noStore as noStore } from "next/cache"
import yahooFinance from "yahoo-finance2"

export async function fetchQuote(ticker: string) {
  noStore()

  try {
    console.log(`Fetching quote for ticker: ${ticker}`)
    const response = await yahooFinance.quote(ticker)

    if (!response) {
      console.error(`No data returned for ticker: ${ticker}`)
      throw new Error("No data returned from Yahoo Finance API")
    }

    // console.log(`Quote data received:`, response)
    return response
  } catch (error) {
    console.error("Failed to fetch stock quote", error)
    if (error instanceof Error) {
      throw new Error(
        `Failed to fetch stock quote for ${ticker}: ${error.message}`
      )
    } else {
      throw new Error(`Failed to fetch stock quote for ${ticker}: Unknown error`)
    }
  }
}