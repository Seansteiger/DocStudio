# DocStudio — Command Line Interface (CLI)

Agent-native CLI generated and maintained by the **cli-anything** standard for **DocStudio**.

## 🚀 How to Run

### From PowerShell / Terminal:
```powershell
# CV Generation (Modern Dual & Clean Minimal 1-page A4 PDFs)
.\bin\cli.ps1 cv:generate

# CV ATS Audit
.\bin\cli.ps1 cv:audit

# Commercial Billing Hub: List all documents
.\bin\cli.ps1 billing:list

# Commercial Billing Hub: Create Invoice or Quote
.\bin\cli.ps1 billing:create --type invoice --client "BlueHorizon Logistics Group (Pty) Ltd" --desc "Cloud Architecture Sprint" --price 35000

# Commercial Billing Hub: 1-Click Quote-to-Invoice Conversion
.\bin\cli.ps1 billing:convert QUO-0104

# Commercial Billing Hub: Record Payment and Issue Receipt
.\bin\cli.ps1 billing:pay INV-0219 --amount 45080 --method EFT

# Doctor diagnostics & health check
.\bin\cli.ps1 doctor

# JSON mode (machine-readable for agents and CI)
.\bin\cli.ps1 billing:list --json
```

### From Node.js:
```bash
node bin/cli.cjs cv:generate
node bin/cli.cjs billing:list
node bin/cli.cjs billing:create --type quote --client "Vanguard Wealth Management"
node bin/cli.cjs billing:convert QUO-0104
node bin/cli.cjs billing:pay INV-0218 --amount 50000 --method Card
node bin/cli.cjs doctor --json
```

---

## 📋 Available Commands

### 📄 CV & Career Commands
- `cv:generate`: Automatically compiles candidate resume data into two distinct layouts:
  1. **Modern Dual (`modern-tech`)**: Dual-column layout with silicon styling, prominent Languages proficiency card, and direct GitHub links.
  2. **Clean Minimal (`minimal-ats`)**: Single-column ATS-standard layout with GitHub link (no LinkedIn) and compact language grid.
  - Outputs HTML and headless Chrome vector PDF into `exports/`, project root, and brain artifact directories, strictly verified for 1-page A4 fit.
- `cv:audit`: Runs deterministic ATS scoring (0-100), section-by-section breakdown (contact info, summary length, action verbs, metrics density, education, EE compliance).

### 💼 Commercial Billing Hub Commands (Zoho-Style Relational Engine)
- `billing:list`: Lists all active commercial billing documents (Quotations, Tax Invoices, Payment Receipts) with financial totals (invoiced, collected, outstanding, and active quotes). Supports `--type <quote|invoice|receipt>`, `--status <status>`, and `--client <name>`.
- `billing:create`: Creates a new Quotation, Tax Invoice, or Payment Receipt with automatic VAT computation (15%), sequential numbering (`QUO-XXXX`, `INV-XXXX`, `REC-XXXX`), and DocStudio cloud share URL.
- `billing:convert`: Performs a 1-click Quote-to-Invoice workflow. Updates quote status to `converted`, locks in client snapshot and line items, creates linked `INV-XXXX` with 14-day terms, and returns share URL.
- `billing:pay`: Records an EFT, Card, Cash, PayFast, Yoco, or Ozow payment against an outstanding invoice. Decrements balance due, marks status as `paid` or `partial`, synthesizes an official payment receipt (`REC-XXXX`), and generates cloud URLs.

### ⚙️ System & Development Commands
- `doctor`: Health & environment check (Node version, package.json, environment secrets, and backend status).
- `status`: Project metadata, dependencies count, and build scripts.
- `dev`: Launch the local development server via `npm run dev`.
- `build`: Compile production assets via `npm run build`.
- `list-files`: List directory contents excluding build artifacts.
- `help`: Display help and usage instructions.
