window.RIDProfit = (() => {
  function chronological(rows) {
    return rows
      .map((row, index) => ({ row, index }))
      .sort((a, b) => {
        const at = a.row.time instanceof Date && !isNaN(a.row.time) ? a.row.time.getTime() : Number.MAX_SAFE_INTEGER;
        const bt = b.row.time instanceof Date && !isNaN(b.row.time) ? b.row.time.getTime() : Number.MAX_SAFE_INTEGER;
        return at - bt || (a.row.sr || a.index) - (b.row.sr || b.index);
      })
      .map(item => item.row);
  }

  function simulate(rows, numbers, betPerNumber, startingBalance) {
    const cleanNumbers = [...new Set(numbers)]
      .filter(number => Number.isInteger(number) && number >= 0 && number <= 36)
      .sort((a, b) => a - b);

    const set = new Set(cleanNumbers);
    const stakePerSpin = cleanNumbers.length * betPerNumber;
    let balance = startingBalance;
    let hits = 0;
    let playedSpins = 0;
    let totalStaked = 0;
    let totalReturned = 0;
    let stopped = false;
    let stoppedAt = null;

    if (!cleanNumbers.length || stakePerSpin <= 0 || startingBalance < stakePerSpin) {
      return {
        numbers: cleanNumbers, betPerNumber, startingBalance, endingBalance: startingBalance,
        stakePerSpin, playedSpins: 0, hits: 0, totalStaked: 0, totalReturned: 0,
        net: 0, roi: 0, stopped: cleanNumbers.length > 0, stoppedAt: null
      };
    }

    for (const row of chronological(rows)) {
      if (balance < stakePerSpin) {
        stopped = true;
        stoppedAt = row.time || null;
        break;
      }

      balance -= stakePerSpin;
      totalStaked += stakePerSpin;
      playedSpins += 1;

      if (set.has(row.number)) {
        hits += 1;
        const returned = betPerNumber * 36;
        balance += returned;
        totalReturned += returned;
      }
    }

    const net = balance - startingBalance;
    const roi = startingBalance ? (net / startingBalance) * 100 : 0;

    return {
      numbers: cleanNumbers, betPerNumber, startingBalance, endingBalance: balance,
      stakePerSpin, playedSpins, hits, totalStaked, totalReturned,
      net, roi, stopped, stoppedAt
    };
  }

  function rankedNumbers(rows, limit) {
    return RIDAnalysis.frequency(rows)
      .map((count, number) => ({ number, count }))
      .filter(item => item.number !== 0)
      .sort((a, b) => b.count - a.count || a.number - b.number)
      .slice(0, limit)
      .map(item => item.number);
  }

  function rowsForHours(rows, hours) {
    const selected = new Set(hours);
    return rows.filter(row => row.time && selected.has(row.time.getHours()));
  }

  function all(rows, customNumbers = [], customBet = 100, customBalance = 30000) {
    return {
      apne: simulate(rows, RID_STRATEGIES["Apne 16"], 100, 30000),
      top16: simulate(rows, RID_STRATEGIES["Top 16"], 100, 30000),
      top21: simulate(rows, RID_STRATEGIES["Top 21"], 150, 40000),
      dailyTop16: simulate(rows, rankedNumbers(rows, 16), 100, 30000),
      dailyTop21: simulate(rows, rankedNumbers(rows, 21), 150, 40000),
      custom: simulate(rows, customNumbers, customBet, customBalance)
    };
  }

  function forBestHours(rows, hours, customNumbers = [], customBet = 100, customBalance = 30000) {
    return all(rowsForHours(rows, hours), customNumbers, customBet, customBalance);
  }

  return { simulate, rankedNumbers, rowsForHours, all, forBestHours };
})();
