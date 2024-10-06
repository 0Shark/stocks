import { cn } from "@/lib/utils"
import { fetchChartData } from "@/lib/yahoo-finance/fetchChartData"
import type { Interval, Range } from "@/types/yahoo-finance"
import AreaClosedChart from "./AreaClosedChart"
import { fetchQuote } from "@/lib/yahoo-finance/fetchQuote"

interface StockGraphProps {
  ticker: string
  range: Range
  interval: Interval
}

const rangeTextMapping: { [key in Range]: string } = {
  "1d": "",
  "5d": "Past 5 Days",
  "1m": "Past Month",
  "3m": "Past 3 Months",
  "6m": "Past 6 Months",
  "1y": "Past Year",
  "2y": "Past 2 Years",
  "5y": "Past 5 Years",
  "10y": "Past 10 Years",
  ytd: "Year to Date",
  max: "Max",
}

function calculatePriceChange(quoteClose: number, currentPrice: number) {
  const firstItemPrice = quoteClose || 0
  return ((currentPrice - firstItemPrice) / firstItemPrice) * 100
}

export default async function StockChart({
  ticker,
  range,
  interval,
}: StockGraphProps) {
  const chartData = await fetchChartData(ticker, range, interval)
  const quoteData = await fetchQuote(ticker)

  const [chart, quote] = await Promise.all([chartData, quoteData])

  // Use a type assertion for chart.meta
  const chartMeta = chart.meta as any

  const priceChange =
    chart.quotes.length &&
    calculatePriceChange(
      Number(chart.quotes[0].close),
      Number(chartMeta.regularMarketPrice)
    )

  const ChartQuotes = chart.quotes
    .map((quote) => ({
      date: quote.date,
      close: quote.close?.toFixed(2),
    }))
    .filter((quote) => quote.close !== undefined && quote.date !== null)
  return (
    <div className="h-[27.5rem] w-full">
      <div>
        <div className="space-x-1 text-muted-foreground">
          <span className="font-bold text-primary">{quoteData.symbol}</span>
          <span>·</span>
          <span>
            {quoteData.fullExchangeName === "NasdaqGS"
              ? "NASDAQ"
              : quoteData.fullExchangeName}
          </span>
          <span>{quoteData.shortName}</span>
        </div>

        <div className="flex flex-row items-end justify-between">
          <div className="space-x-1">
            <span className="text-nowrap">
              <span className="text-xl font-bold">
                {quote.currency === "USD" ? "$" : ""}
                {quote.regularMarketPrice?.toFixed(2)}
              </span>
              <span className="font-semibold">
                {quote.regularMarketChange !== undefined &&
                quote.regularMarketChangePercent !== undefined ? (
                  quote.regularMarketChange > 0 ? (
                    <span className="text-green-800 dark:text-green-400">
                      +{quote.regularMarketChange.toFixed(2)} (+
                      {quote.regularMarketChangePercent.toFixed(2)}%)
                    </span>
                  ) : (
                    <span className="text-red-800 dark:text-red-500">
                      {quote.regularMarketChange.toFixed(2)} (
                      {quote.regularMarketChangePercent.toFixed(2)}%)
                    </span>
                  )
                ) : null}
              </span>
            </span>
            <span className="inline space-x-1 font-semibold text-muted-foreground">
              {quote.postMarketPrice !== undefined && (
                <>
                  <span>·</span>
                  <span>
                    Post-Market: {quote.currency === "USD" ? "$" : ""}
                    {quote.postMarketPrice.toFixed(2)}
                  </span>
                  <span>
                    {quote.postMarketChange !== undefined &&
                    quote.postMarketChangePercent !== undefined ? (
                      quote.postMarketChange > 0 ? (
                        <span className="text-green-800 dark:text-green-400">
                          +{quote.postMarketChange.toFixed(2)} (+
                          {quote.postMarketChangePercent.toFixed(2)}%)
                        </span>
                      ) : (
                        <span className="text-red-800 dark:text-red-500">
                          {quote.postMarketChange.toFixed(2)} (
                          {quote.postMarketChangePercent.toFixed(2)}%)
                        </span>
                      )
                    ) : null}
                  </span>
                </>
              )}
              {quote.preMarketPrice !== undefined && (
                <>
                  <span>·</span>
                  <span>
                    Pre-Market: {quote.currency === "USD" ? "$" : ""}
                    {quote.preMarketPrice.toFixed(2)}
                  </span>
                  <span>
                    {quote.preMarketChange !== undefined &&
                    quote.preMarketChangePercent !== undefined ? (
                      quote.preMarketChange > 0 ? (
                        <span className="text-green-800 dark:text-green-400">
                          +{quote.preMarketChange.toFixed(2)} (+
                          {quote.preMarketChangePercent.toFixed(2)}%)
                        </span>
                      ) : (
                        <span className="text-red-800 dark:text-red-500">
                          {quote.preMarketChange.toFixed(2)} (
                          {quote.preMarketChangePercent.toFixed(2)}%)
                        </span>
                      )
                    ) : null}
                  </span>
                </>
              )}
            </span>
          </div>
          <span className="space-x-1 whitespace-nowrap font-semibold">
            {priceChange !== 0 && rangeTextMapping[range] !== "" && (
              <span
                className={cn(
                  priceChange > 0
                    ? "text-green-800 dark:text-green-400"
                    : "text-red-800 dark:text-red-500"
                )}
              >
                {priceChange > 0
                  ? `+${priceChange.toFixed(2)}%`
                  : `${priceChange.toFixed(2)}%`}
              </span>
            )}
            <span className="text-muted-foreground">
              {rangeTextMapping[range]}
            </span>
          </span>
        </div>
      </div>
      {chart.quotes.length === 0 && (
        <div className="flex h-full items-center justify-center text-center text-neutral-500">
          No data available
        </div>
      )}
      {chart.quotes.length > 0 && (
        <AreaClosedChart chartQuotes={ChartQuotes} range={range} />
      )}
    </div>
  )
}
