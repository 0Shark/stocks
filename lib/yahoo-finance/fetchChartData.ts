import { unstable_noStore as noStore } from "next/cache"
import yahooFinance from "yahoo-finance2"
import { isMarketOpen, getLastMarketCloseDate } from "@/lib/utils"
import type {
  ChartOptions,
  ChartResultArray,
} from "@/node_modules/yahoo-finance2/dist/esm/src/modules/chart"
import type { Interval, Range } from "@/types/yahoo-finance"
import { DEFAULT_RANGE, INTERVALS_FOR_RANGE, VALID_RANGES } from "./constants"
import { CalculateRange } from "@/lib/utils"

export const validateRange = (range: string): Range =>
  VALID_RANGES.includes(range as Range) ? (range as Range) : DEFAULT_RANGE

export const validateInterval = (range: Range, interval: Interval): Interval =>
  INTERVALS_FOR_RANGE[range].includes(interval)
    ? interval
    : INTERVALS_FOR_RANGE[range][0]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchChartData(
  ticker: string,
  range: Range,
  interval: Interval,
  retries = 3
) {
  noStore()

  const lastMarketClose = getLastMarketCloseDate()
  const period1 = CalculateRange(range)
  const period2 = Math.floor(lastMarketClose.getTime() / 1000) // Convert to Unix timestamp

  const queryOptions: ChartOptions = {
    period1,
    period2,
    interval,
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(
        `Attempt ${attempt}: Fetching chart data for ticker: ${ticker}, range: ${range}, interval: ${interval}`
      )
      console.log("Query options:", queryOptions)

      const chartData: ChartResultArray = await yahooFinance.chart(
        ticker,
        queryOptions
      )

      //console.log("Full API response:", JSON.stringify(chartData, null, 2))

      if (!chartData || !chartData.quotes || chartData.quotes.length === 0) {
        console.warn(`No chart data returned for ticker: ${ticker}`)
        //console.log("Chart metadata:", JSON.stringify(chartData.meta, null, 2))

        // If no data, try extending the range
        if (attempt === retries) {
          console.log("Attempting to extend date range to find data...")
          const extendedRange = extendRange(range)
          queryOptions.period1 = CalculateRange(extendedRange)
          attempt = 0 // Reset attempt to try again with new range
          continue
        }

        return { quotes: [], meta: chartData.meta }
      }

      console.log(
        `Chart data received. Number of quotes: ${chartData.quotes.length}`
      )
      //console.log("First quote:", JSON.stringify(chartData.quotes[0], null, 2))
      // console.log(
      //   "Last quote:",
      //   JSON.stringify(chartData.quotes[chartData.quotes.length - 1], null, 2)
      // )
      return chartData
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error)
      if (attempt < retries) {
        console.log(`Retrying in 2 seconds...`)
        await delay(2000)
      } else {
        console.error("All attempts failed to fetch chart data", error)
        return { quotes: [], meta: {} }
      }
    }
  }
}

// Helper function to extend the range if no data is found
function extendRange(range: Range): Range {
  const rangeOrder = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "max"]
  const currentIndex = rangeOrder.indexOf(range)
  return rangeOrder[Math.min(currentIndex + 1, rangeOrder.length - 1)] as Range
}
