# Sports Odds Discord Bot

A Discord bot designed to deliver structured sports betting picks with built-in bankroll management and stake sizing logic. The bot consolidates moneyline, spread, and player prop recommendations into a single command flow, providing actionable picks alongside calculated bet amounts.

## Core Commands

### /bankroll
- Sets the user’s total bankroll
- Calculates recommended wager sizes
- Adjusts stake amounts dynamically based on bankroll changes

### /pick
- Returns curated picks across:
  - Moneyline
  - Spread
  - Player props
- Outputs:
  - Suggested wager amount
  - Confidence-based allocation
  - Bankroll-adjusted sizing

### /parlay
- Generates correlated and non-correlated parlay options
- Adjusts risk exposure based on bankroll settings

### Underdog Picks
- Special underdog selection logic
- Filters for:
  - Rational price inefficiencies
  - Historical and statistical edge
  - Minimum 70% projected win probability
- Avoids high-variance or irrational underdog plays

## Features
- Unified command interface for all pick types
- Dynamic bankroll-based bet sizing
- Risk-aware allocation logic
- Supports multiple betting markets in a single workflow
- Designed to minimize emotional or impulsive wagering

## Technologies
- Node.js
- Discord.js
- External sports odds APIs
- Linux-based deployment environment

## Design Philosophy
This bot prioritizes disciplined bankroll management and structured decision-making. Picks are presented with explicit stake sizing to reduce variance and enforce consistency over time.

## Status
Actively developed and tested. Command logic and bankroll calculations are under continuous refinement.

## Disclaimer
This project is for educational and research purposes only. It does not constitute financial or gambling advice. Users are responsible for complying with local laws and regulations.
