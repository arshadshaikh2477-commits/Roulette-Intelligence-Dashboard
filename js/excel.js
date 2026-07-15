window.RIDExcel = (() => {
  function isBlankRow(row) {
    return !row || row.every(value => value === null || value === undefined || String(value).trim() === "");
  }

  function normalizedText(value) {
    return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function isRepeatedHeader(row) {
    const cells = row.map(normalizedText);
    const joined = cells.join("|");
    return (
      joined.includes("srno") && joined.includes("drawno") && joined.includes("drawtime")
    ) || (
      cells.some(cell => cell === "drawno") && cells.some(cell => cell === "drawtime")
    );
  }

  function findColumns(rows) {
    for (let i = 0; i < Math.min(rows.length, 100); i += 1) {
      const row = rows[i] || [];
      const cells = row.map(normalizedText);
      const numberIndex = cells.findIndex(cell =>
        ["drawno", "number", "result", "drawnumber"].includes(cell)
      );
      const timeIndex = cells.findIndex(cell =>
        ["drawtime", "time", "datetime", "date"].includes(cell)
      );
      const serialIndex = cells.findIndex(cell =>
        ["srno", "serial", "serialno", "no"].includes(cell)
      );

      if (numberIndex >= 0 && timeIndex >= 0) {
        return { headerRow: i, numberIndex, timeIndex, serialIndex };
      }
    }

    // Fallback for sheets where the first header was deleted.
    return { headerRow: -1, serialIndex: 0, numberIndex: 1, timeIndex: 2 };
  }

  function excelSerialToDate(value) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    return new Date(parsed.y, parsed.m - 1, parsed.d, parsed.H, parsed.M, parsed.S || 0);
  }

  function validDateParts(year, month, day, hour, minute, second) {
    const date = new Date(year, month - 1, day, hour, minute, second);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) ? date : null;
  }

  function dateDistanceDays(a, b) {
    const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
    const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
    return Math.abs(aa - bb) / 86400000;
  }

  function parseTextTimestamp(value, state, report) {
    const text = String(value ?? "").trim();
    if (!text) return null;

    const match = text.match(
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i
    );

    if (!match) {
      const native = new Date(text);
      return isNaN(native) ? null : native;
    }

    let [, first, second, year, hour = "0", minute = "0", sec = "0", meridiem] = match;
    first = Number(first);
    second = Number(second);
    year = Number(year);
    hour = Number(hour);
    minute = Number(minute);
    sec = Number(sec);

    if (year < 100) year += 2000;
    if (meridiem) {
      const upper = meridiem.toUpperCase();
      if (upper === "PM" && hour < 12) hour += 12;
      if (upper === "AM" && hour === 12) hour = 0;
    }

    const dmy = validDateParts(year, second, first, hour, minute, sec);
    const mdy = validDateParts(year, first, second, hour, minute, sec);

    if (!dmy && !mdy) return null;
    if (dmy && !mdy) {
      state.preference = "DMY";
      return dmy;
    }
    if (mdy && !dmy) {
      state.preference = "MDY";
      return mdy;
    }

    // Both interpretations are valid. Choose the one that preserves chronology.
    let chosen;
    if (state.previousDate) {
      const dmyDistance = dateDistanceDays(dmy, state.previousDate);
      const mdyDistance = dateDistanceDays(mdy, state.previousDate);

      if (dmyDistance !== mdyDistance) {
        chosen = dmyDistance < mdyDistance ? dmy : mdy;
      } else {
        chosen = state.preference === "MDY" ? mdy : dmy;
      }
    } else {
      chosen = state.preference === "MDY" ? mdy : dmy;
    }

    const usedFormat = chosen === mdy ? "MDY" : "DMY";
    if (usedFormat !== state.preference) {
      report.dateFormatsRepaired += 1;
      state.preference = usedFormat;
    } else {
      report.ambiguousDatesResolved += 1;
    }

    return chosen;
  }

  function parseTimestamp(value, state, report) {
    let parsed = null;

    if (value instanceof Date && !isNaN(value)) {
      parsed = new Date(value.getTime());
    } else if (typeof value === "number") {
      parsed = excelSerialToDate(value);
    } else {
      parsed = parseTextTimestamp(value, state, report);
    }

    if (parsed && !isNaN(parsed)) {
      state.previousDate = parsed;
      return parsed;
    }

    return null;
  }

  function cleanWorkbook(workbook) {
    const report = {
      sheetsScanned: workbook.SheetNames.length,
      rawRowsScanned: 0,
      blankRowsRemoved: 0,
      repeatedHeadersRemoved: 0,
      invalidDrawNumbersRemoved: 0,
      invalidDatesRemoved: 0,
      duplicateRowsRemoved: 0,
      dateFormatsRepaired: 0,
      ambiguousDatesResolved: 0,
      usableSpins: 0
    };

    const cleaned = [];
    const duplicateKeys = new Set();

    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: null,
        raw: true,
        blankrows: true
      });

      const columns = findColumns(rows);
      const state = { previousDate: null, preference: "DMY" };

      rows.forEach((row, rowIndex) => {
        report.rawRowsScanned += 1;

        if (rowIndex === columns.headerRow || isRepeatedHeader(row)) {
          report.repeatedHeadersRemoved += 1;
          return;
        }

        if (isBlankRow(row)) {
          report.blankRowsRemoved += 1;
          return;
        }

        const drawNumber = Number(row[columns.numberIndex]);
        if (!Number.isInteger(drawNumber) || drawNumber < 0 || drawNumber > 36) {
          report.invalidDrawNumbersRemoved += 1;
          return;
        }

        const timestamp = parseTimestamp(row[columns.timeIndex], state, report);
        if (!timestamp) {
          report.invalidDatesRemoved += 1;
          return;
        }

        const serial = columns.serialIndex >= 0
          ? Number(row[columns.serialIndex])
          : cleaned.length + 1;

        const duplicateKey = `${timestamp.getTime()}|${drawNumber}`;
        if (duplicateKeys.has(duplicateKey)) {
          report.duplicateRowsRemoved += 1;
          return;
        }

        duplicateKeys.add(duplicateKey);
        cleaned.push({
          sr: Number.isFinite(serial) ? serial : cleaned.length + 1,
          number: drawNumber,
          time: timestamp,
          sourceSheet: sheetName
        });
      });
    });

    cleaned.sort((a, b) => a.time - b.time || a.sr - b.sr);
    report.usableSpins = cleaned.length;

    return { rows: cleaned, report };
  }

  async function readFile(file) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, {
      type: "array",
      cellDates: true,
      dense: false
    });

    return cleanWorkbook(workbook);
  }

  return { readFile, cleanWorkbook };
})();
