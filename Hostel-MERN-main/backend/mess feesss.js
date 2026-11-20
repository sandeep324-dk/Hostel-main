// Hostel Mess Fee - Monthly manager (Pure JavaScript)
// Usage examples are included as comments at the bottom.
// Persists data in localStorage under key "messFees_v1"

class MessFeeManager {
  constructor(storageKey = "messFees_v1") {
    this.storageKey = storageKey;
    this.fees = this._load();
  }

  // Validate month in YYYY-MM (e.g. "2025-11") or "November 2025"
  static _normalizeMonth(input) {
    if (!input) throw new Error("Month required");
    input = input.toString().trim();

    // Accept YYYY-MM
    const isoMatch = input.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
    if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}`;

    // Accept "MonthName YYYY" (e.g. "November 2025")
    const monthNames = [
      "january","february","march","april","may","june",
      "july","august","september","october","november","december"
    ];
    const words = input.toLowerCase().split(/\s+/);
    if (words.length === 2) {
      const m = monthNames.indexOf(words[0]);
      const y = words[1].match(/^\d{4}$/) ? words[1] : null;
      if (m >= 0 && y) {
        const mm = String(m + 1).padStart(2, "0");
        return `${y}-${mm}`;
      }
    }

    throw new Error("Month format invalid. Use 'YYYY-MM' or 'MonthName YYYY' (e.g. '2025-11' or 'November 2025').");
  }

  // Validate and normalize amount to a number (two decimal places)
  static _normalizeAmount(amount) {
    if (amount === null || amount === undefined || amount === "") {
      throw new Error("Amount required");
    }
    const n = typeof amount === "number" ? amount : parseFloat(String(amount).replace(/,/g, ""));
    if (!isFinite(n) || isNaN(n) || n < 0) throw new Error("Amount must be a non-negative number");
    // Avoid floating precision issues by rounding to 2 decimals
    return Math.round(n * 100) / 100;
  }

  // Load from localStorage
  _load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      // Ensure structure: { "2025-11": { amount: 9000, note: "..." }, ... }
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      console.warn("Failed to load mess fees from storage:", e);
      return {};
    }
  }

  // Save to localStorage
  _save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.fees));
  }

  // Add or update a monthly fee entry.
  // month: "YYYY-MM" or "MonthName YYYY"
  // amount: number or numeric string
  // opts: { note: string (optional) }
  addOrUpdate(month, amount, opts = {}) {
    const m = MessFeeManager._normalizeMonth(month);
    const a = MessFeeManager._normalizeAmount(amount);
    const now = new Date().toISOString();
    const existing = this.fees[m] || null;

    this.fees[m] = {
      amount: a,
      note: opts.note ? String(opts.note) : (existing ? existing.note : ""),
      updatedAt: now,
      createdAt: existing ? existing.createdAt : now
    };
    this._save();
    return this.fees[m];
  }

  // Delete a month's record. Returns true if deleted, false if not found.
  deleteMonth(month) {
    const m = MessFeeManager._normalizeMonth(month);
    if (this.fees[m]) {
      delete this.fees[m];
      this._save();
      return true;
    }
    return false;
  }

  // Get a single month's record or null
  getMonth(month) {
    const m = MessFeeManager._normalizeMonth(month);
    return this.fees[m] || null;
  }

  // Get all fees as array sorted by month ascending (earliest first)
  getAllSorted(order = "asc") {
    // keys are YYYY-MM so lexical sort works
    const keys = Object.keys(this.fees).sort();
    if (order === "desc") keys.reverse();
    return keys.map(k => ({ month: k, ...this.fees[k] }));
  }

  // Compute total of all monthly fees (safe arithmetic)
  getTotal() {
    // Sum cents as integers to avoid FP rounding issues
    let totalCents = 0;
    for (const entry of Object.values(this.fees)) {
      // entry.amount is already rounded to cents
      const cents = Math.round(Number(entry.amount) * 100);
      totalCents += cents;
    }
    return totalCents / 100; // returns number with possible decimals
  }

  // Clear all records (use with caution)
  clearAll() {
    this.fees = {};
    localStorage.removeItem(this.storageKey);
  }

  // Export data as JSON string
  exportJSON(pretty = false) {
    return JSON.stringify(this.fees, null, pretty ? 2 : 0);
  }

  // Import data from JSON string (overwrites existing data)
  importJSON(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== "object") throw new Error("Invalid JSON structure");
      // Simple validation: each key should be YYYY-MM and amount numeric
      for (const [k, v] of Object.entries(parsed)) {
        MessFeeManager._normalizeMonth(k); // will throw if invalid
        if (!v || typeof v !== "object" || !("amount" in v)) throw new Error("Each entry must contain amount");
        MessFeeManager._normalizeAmount(v.amount);
      }
      this.fees = parsed;
      this._save();
      return true;
    } catch (e) {
      throw new Error("Import failed: " + e.message);
    }
  }

  // Format a number as currency string (simple, no locale param)
  static formatCurrency(amount) {
    const n = MessFeeManager._normalizeAmount(amount);
    // show two decimals and thousands separator
    return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}

/* -------------------------
   Example usage (uncomment to run)
   ------------------------- */

// const mgr = new MessFeeManager();

// // Add monthly fees
// mgr.addOrUpdate("2025-08", 9000, { note: "August mess fee" });
// mgr.addOrUpdate("September 2025", "8500.50", { note: "Adjusted" });
// mgr.addOrUpdate("2025-10", 9000);

// // Update existing month
// mgr.addOrUpdate("2025-09", 8700);

// // Get single month
// console.log("Sep 2025 record:", mgr.getMonth("2025-09"));

// // List all months (descending)
// console.log("All fees:", mgr.getAllSorted("desc"));

// // Total
// console.log("Total mess fees:", MessFeeManager.formatCurrency(mgr.getTotal()));

// // Delete a month
// mgr.deleteMonth("2025-08");

// // Export
// const jsonDump = mgr.exportJSON(true);
// console.log(jsonDump);

// // Clear all (careful)
// // mgr.clearAll();

