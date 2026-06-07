const express = require("express");
const Test = require("../models/Test");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// Get all tests
router.get("/", async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tests by category
router.get("/category/:category", async (req, res) => {
  try {
    const tests = await Test.find({ category: req.params.category });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get favourite tests
router.get("/favourite", async (req, res) => {
  try {
    const tests = await Test.find({ isFavourite: true });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Seed tests (admin only)
router.post("/seed", authMiddleware(["admin"]), async (req, res) => {
  try {
    const testData = [
      {
        name: "CHLORIDE, SERUM (CLED)",
        shortName: "CHLORIDE",
        category: "Chemistry",
        price: 150,
        referenceRange: "96-106 mEq/L",
        unit: "mEq/L",
      },
      {
        name: "C-REACTIVE PROTEIN (CRP)",
        shortName: "CRP",
        category: "Immunology",
        price: 200,
        referenceRange: "<3.0 mg/L",
        unit: "mg/L",
      },
      {
        name: "ELECTROLYTES (ELE)",
        shortName: "ELECTROLYTES",
        category: "Chemistry",
        price: 300,
        referenceRange: "Na: 136-145, K: 3.5-5.0, Cl: 96-106 mEq/L",
        unit: "mEq/L",
      },
      {
        name: "HEMOGLOBIN (HB)",
        shortName: "HB",
        category: "Hematology",
        price: 100,
        referenceRange: "Male: 13.5-17.5 g/dL, Female: 12.0-15.5 g/dL",
        unit: "g/dL",
      },
      {
        name: "LIPID PROFILE (LPD 1)",
        shortName: "LIPID",
        category: "Chemistry",
        price: 400,
        referenceRange: "Total: <200, LDL: <100, HDL: >40, TG: <150 mg/dL",
        unit: "mg/dL",
      },
      {
        name: "LIPID PROFILE (LPD)",
        shortName: "LIPID2",
        category: "Chemistry",
        price: 400,
        referenceRange: "Total: <200, LDL: <100, HDL: >40, TG: <150 mg/dL",
        unit: "mg/dL",
      },
      {
        name: "CALCIUM, SERUM (CAL)",
        shortName: "CALCIUM",
        category: "Chemistry",
        price: 250,
        referenceRange: "8.5-10.5 mg/dL",
        unit: "mg/dL",
      },
      {
        name: "HDL CHOLESTEROL direct (HDL)",
        shortName: "HDL",
        category: "Chemistry",
        price: 300,
        referenceRange: ">40 mg/dL (Male), >50 mg/dL (Female)",
        unit: "mg/dL",
      },
    ];

    await Test.deleteMany({});
    const created = await Test.insertMany(testData);
    res.json({ message: "Tests seeded", count: created.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
