DROP DATABASE IF EXISTS biztime;

CREATE DATABASE biztime;

\c biztime

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);


-- The industries table
CREATE TABLE industries (
    code text PRIMARY KEY,
    industry text NOT NULL UNIQUE
);

-- The company_industries table (junction table)
CREATE TABLE company_industries (
    company_code text NOT NULL,
    industry_code text NOT NULL,
    PRIMARY KEY (company_code, industry_code),
    FOREIGN KEY (company_code) REFERENCES companies(code) ON DELETE CASCADE,
    FOREIGN KEY (industry_code) REFERENCES industries(code) ON DELETE CASCADE
);




INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
  ('healthplus', 'HealthPlus', 'Healthcare services provider'),
         ('ibm', 'IBM', 'Big blue.');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

INSERT INTO industries (code, industry)
VALUES
    ('tech', 'Technology'),
    ('health', 'Healthcare'),
    ('sustain', 'Sustainability'),
    ('acct', 'Accounting');

INSERT INTO company_industries (company_code, industry_code)
VALUES
    ('apple', 'tech'), 
    ('ibm', 'health'),
    ('healthplus',"health")
    