import { fetchChartData } from "@/lib/yahoo-finance/fetchChartData"
import { fetchQuote } from "@/lib/yahoo-finance/fetchQuote"
import { Interval, Range } from "@/types/yahoo-finance"
import AreaClosedChart from "./AreaClosedChart"

export default async function MarketsChart({
  ticker,
  range,
  interval,
}: {
  ticker: string
  range: Range
  interval: Interval
}) {
  try {
    const [chartData, quoteData] = await Promise.all([
      fetchChartData(ticker, range, interval),
      fetchQuote(ticker),
    ])

    //console.log("Chart Data:", chartData)
    //console.log("Quote Data:", quoteData)

    if (!chartData || !quoteData) {
      throw new Error("Failed to fetch data")
    }

    const stockQuotes = chartData.quotes
      ? chartData.quotes
          .map((quote) => ({
            date: quote.date,
            close: quote.close?.toFixed(2),
          }))
          .filter((quote) => quote.close !== undefined && quote.date !== null)
      : []

    //console.log("Processed Stock Quotes:", stockQuotes)

    return (
      <>
        <div className="mb-0.5 font-medium">
          {quoteData.shortName} ({quoteData.symbol}){" "}
          {quoteData.regularMarketPrice?.toLocaleString(undefined, {
            style: "currency",
            currency: quoteData.currency,
          })}
        </div>
        {stockQuotes.length > 0 ? (
          <AreaClosedChart chartQuotes={stockQuotes} range={range} />
        ) : (
          <div className="flex h-full items-center justify-center text-center text-neutral-500">
            No data available for the selected range and interval
          </div>
        )}
      </>
    )
  } catch (error) {
    console.error("Error in MarketsChart:", error)
    return (
      <div className="flex h-full items-center justify-center text-center text-red-500">
        Error loading chart data. Please try again later.
      </div>
    )
  }
}
