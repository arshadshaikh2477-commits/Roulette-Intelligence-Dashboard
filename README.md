# Roulette Intelligence Dashboard (RID)

Open `index.html` with VS Code Live Server. Upload an Excel file with columns `Sr. No.`, `Draw No.`, and `Draw Time`.

## v1.2 changes
- Hourly chart order: 24:00, 01:00, ... 23:00.
- Graph stays empty until numbers are selected.
- Graph displays only the selected custom numbers; default and Combined lines are removed from the chart.
- Point labels are always visible with percentage and hit count.
- Top Numbers section now shows 21 numbers, excludes zero, and marks the top 16 with a fire icon.


## v1.3.2
- Tooltip now shows only hourly hit percentage and hit count.

## v1.5
- Highlights the six strongest custom hours in red.
- Adds a Best Six Hours profit section.
- Adds bankroll-aware profit simulation with separate preset account balances.
- Adds configurable custom strategy bet per number and starting balance.
- Stops simulation when the next complete stake cannot be afforded.

## v1.5.1
- Replaces six separate best hours with the best consecutive six-hour session.
- Compares four fixed blocks: 00:00–06:00, 06:00–12:00, 12:00–18:00, and 18:00–00:01.
- Chooses the block with the highest total custom hits, using hit rate as the tiebreaker.
- Highlights the complete winning six-hour graph section in red.

## v1.6
- Adds a Suggested Top 16 for the Next Six Hours section.
- Uses a transparent historical scoring model: 75% recent six-hour frequency and 25% full-session frequency.
- Excludes 0 and clearly labels the result as historical analysis, not a guaranteed prediction.

## v1.7
- Restores red highlighting for the six highest-performing individual hours.
- Adds a 37-number transition section showing the most common immediately-following number.


## v1.7.1
- Fixed the next-number section container reference and ensured the section is visible.

## Historical Engine v0.1
- Imports every worksheet in a workbook.
- Removes repeated headers, blank rows, invalid roulette results, invalid timestamps, and exact duplicates.
- Repairs mixed DD/MM/YYYY and MM/DD/YYYY date sequences using neighboring chronology.
- Produces a Data Health Report before analysis.
- The original Excel workbook is never modified.

## Historical Engine v0.1.1
- Fixed Maximum call stack size exceeded for large historical datasets.
- The session range and recommendation engine now use memory-safe reductions.
- Restores the What Usually Comes Next transition section after import.

## Historical Engine v0.1.2 Mobile
- Adds a dedicated responsive layout for iPhone, Android, and tablets.
- Makes the 24-hour chart horizontally swipeable instead of compressing it.
- Hides permanent graph labels on phones and uses tap tooltips.
- Enlarges touch targets and stacks dashboard panels on narrow screens.
- Makes tables horizontally scrollable.
