const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db")

// Returns list of companies
router.get("/", async (req, res, next) => {
    try {
        const companyRes = await db.query("SELECT * FROM companies ")
        return res.json({ compaines: companyRes.rows })
    } catch (err) {
        return next(err)
    }

});

//  Return obj of company
router.get("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const companyRes = await db.query(`SELECT 
            c.code AS company_code,
            c.name AS company_name,
            c.description AS company_description,
            i.industry AS industry_name
            FROM companies c 
            LEFT JOIN 
            company_industries ci ON c.code = ci.company_code
            LEFT JOIN 
            industries i ON ci.industry_code = i.code
            WHERE 
            c.code = $1`, [code])

        const invResult = await db.query(
            `SELECT id
           FROM invoices
           WHERE comp_code = $1`,
            [code]
        )

        if (companyRes.rows.length === 0) {
            throw new ExpressError(`Could not find companies with ${code}`, 400);
        }
        const company = companyRes.rows[0];
        const invoices = invResult.rows;
        // console.log(invoices)

        company.invoices = invoices.map(inv => inv.id);
        return res.json({ "company": company });

    } catch (err) {
        return (err);
    }

})

// Adds a company. 
router.post("/", async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const code = name.toLowerCase();

        const result = await db.query(
            `INSERT INTO companies (code, name, description) 
           VALUES ($1, $2, $3) 
           RETURNING code, name, description`,
            [code, name, description]);

        return res.status(201).json({ "company": result.rows[0] });

    } catch (error) {
        return next(error);
    }
})

// Edit existing company. Should return 404 if company cannot be found.
router.put("/:code", async function (req, res, next) {
    try {
        let { name, description } = req.body;
        let code = req.params.code;

        const result = await db.query(
            `UPDATE companies
           SET name=$1, description=$2
           WHERE code = $3
           RETURNING code, name, description`,
            [name, description, code]);

        if (result.rows.length === 0) {
            throw new ExpressError(`No such company: ${code}`, 404)
        } else {
            return res.json({ "company": result.rows[0] });
        }
    }

    catch (err) {
        return next(err);
    }

});

// Deletes a company
router.delete("/:code", async function (req, res, next) {
    try {
        let code = req.params.code;

        const result = await db.query(
            `DELETE FROM companies
           WHERE code=$1
           RETURNING code`,
            [code]);

        if (result.rows.length == 0) {
            throw new ExpressError(`No such company: ${code}`, 404)
        } else {
            return res.json({ "status": "deleted" });
        }
    }

    catch (err) {
        return next(err);
    }
});

module.exports = router;