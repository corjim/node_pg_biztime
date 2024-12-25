const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db")


// Returns list of industries
router.get("/", async (req, res, next) => {
    try {
        const industriesRes = await db.query(`
            SELECT 
                i.code AS industry_code,
                i.industry AS industry_name,
                STRING_AGG(ci.company_code, ',') AS associated_companies
            FROM 
                industries i
            LEFT JOIN 
                company_industries ci ON i.code = ci.industry_code
            GROUP BY 
                i.code, i.industry;
        `);

        return res.json({ Industries: industriesRes.rows });
    } catch (err) {
        return next(err);
    }
});

// Add an industry
router.post('/', async (req, res, next) => {
    const { code, industry } = req.body;
    console.log(code, industry)
    try {
        if (!code || !industry) return res.status(400).json({ error: 'Both code and industry are required.' });

        let results = await db.query('INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING  code, industry', [code, industry])

        return res.status(201).json({ "Industries": results.rows[0] })
    }
    catch (error) {
        return next(error)
    }
});

// Associate an industry with a company
router.post('/:companyCode/industries', async (req, res, next) => {
    const { companyCode } = req.params;
    const { industry_code } = req.body;
    try {
        if (!industry_code) return res.status(400).json({ error: 'Industry code is required.' });

        await db.query('INSERT INTO company_industries (company_code, industry_code) VALUES ($1, $2) RETURNING company_code, industry_code', [companyCode, industry_code], (err, result) => {
            if (err) return res.status(500).json({ error: 'Failed to associate industry to company.', details: err });
            res.status(201).json({ message: 'Industry successfully associated with company.' });
        });
    } catch (error) {

    }
});







module.exports = router;