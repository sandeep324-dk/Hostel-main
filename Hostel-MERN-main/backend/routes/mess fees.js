// messFeeRoutes.js
// Hostel Mess Fee - Monthly Add (Model + Controller + Route)

// --------------------
// 1️⃣ Setup Express App
// --------------------
import express from "express";
const app = express();
app.use(express.json());

// --------------------
// 2️⃣ Model (MessFeeModel)
// --------------------
class MessFeeModel {
  constructor() {
    this.records = [];
    this._nextId = 1;
  }

  static normalizeMonth(input) {
    if (!input) {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      return `${y}-${m}`;
    }
    if (/^\d{4}-\d{2}$/.test(input)) return input;
    const parsed = new Date(input);
    if (!isNaN(parsed)) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, "0");
      return `${y}-${m}`;
    }
    throw new Error("Invalid month format");
  }

  addMonthlyFee({ studentId, amount, month, status = "pending" }) {
    if (!studentId) throw new Error("studentId required");
    if (amount == null || isNaN(amount)) throw new Error("valid amount required");

    const normalizedMonth = MessFeeModel.normalizeMonth(month);

    const exists = this.records.find(
      (r) => r.studentId === studentId && r.month === normalizedMonth
    );
    if (exists) throw new Error("Fee already exists for this month");

    const rec = {
      id: this._nextId++,
      studentId,
      month: normalizedMonth,
      amount: Number(amount),
      status,
      createdAt: new Date().toISOString(),
    };
    this.records.push(rec);
    return rec;
  }

  addMonthlyFeeForMany({ studentIds, amount, month }) {
    return studentIds.map((sid) => {
      try {
        return this.addMonthlyFee({ studentId: sid, amount, month });
      } catch (err) {
        return { studentId: sid, error: err.message };
      }
    });
  }
}

// --------------------
// 3️⃣ Controller Functions
// --------------------
const messFeeModel = new MessFeeModel();

function addMonthlyFee(req, res) {
  try {
    const { studentId, amount, month } = req.body;
    if (!studentId || !amount)
      return res
        .status(400)
        .json({ error: "studentId and amount are required" });

    const record = messFeeModel.addMonthlyFee({ studentId, amount, month });
    res
      .status(201)
      .json({ message: "Monthly mess fee added successfully", data: record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function addMonthlyFeeForMany(req, res) {
  try {
    const { studentIds, amount, month } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0)
      return res.status(400).json({ error: "studentIds array required" });

    const result = messFeeModel.addMonthlyFeeForMany({
      studentIds,
      amount,
      month,
    });
    res
      .status(201)
      .json({ message: "Monthly fee added for all students", data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// --------------------
// 4️⃣ Routes
// --------------------
const router = express.Router();

router.post("/add", addMonthlyFee);
router.post("/addMany", addMonthlyFeeForMany);

app.use("/api/messfee", router);

// --------------------
// 5️⃣ Start Server
// --------------------
const PORT = 4000;
app.listen(PORT, () =>
  console.log(`✅ Hostel Mess Fee API running on port ${PORT}`)
);
