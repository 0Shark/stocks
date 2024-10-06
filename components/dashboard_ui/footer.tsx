"use client"

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="container py-6 md:px-8 md:py-0">
      <div className="flex flex-col items-end justify-between md:h-24 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          MarketTower by{" "}
          <Link
            prefetch={false}
            href="https://github.com/0Shark/"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            0Shark
          </Link>
          . A fork of{" "}
          <Link
            prefetch={false}
            href="https://github.com/DariusLukasukas/stocks"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            stocks tracking app
          </Link>{" "}
          by{" "}
          <Link
            prefetch={false}
            href="https://twitter.com/DariusLukasukas"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Darius Lukasukas
          </Link>{" "}
          extented with AI features.
        </p>
      </div>
    </footer>
  )
}
