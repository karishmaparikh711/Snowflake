import { Account, Transaction, FlaggedAmlEvent, CreditRiskMetric, RegulatoryCitation } from '../types';

export const INITIAL_ACCOUNTS: Account[] = [
  {
    account_id: 'ACC-8921-CORP',
    entity_name: 'Apex Global Trading FZE',
    account_type: 'CORPORATE',
    risk_tier: 'CRITICAL',
    jurisdiction: 'VG',
    current_balance: 4850000.00,
    kyc_status: 'FLAGGED_FOR_RE_KYC',
    opened_at: '2022-04-14',
    pep_exposed: true,
    lcr_pct: 112.5,
    crar_pct: 18.2,
    active_alerts_count: 14,
  },
  {
    account_id: 'ACC-7741-NBFC',
    entity_name: 'Vanguard Finserve NBFC Ltd',
    account_type: 'NBFC_LENDER',
    risk_tier: 'HIGH',
    jurisdiction: 'IN',
    current_balance: 12400000.00,
    kyc_status: 'PERIODIC_REVIEW_DUE',
    opened_at: '2020-01-20',
    pep_exposed: false,
    lcr_pct: 88.4, // Breaching Basel III & RBI min 100%
    crar_pct: 13.8, // Breaching RBI min 15%
    active_alerts_count: 8,
  },
  {
    account_id: 'ACC-9901-OFFSHORE',
    entity_name: 'Caspian Maritime Logistics LLC',
    account_type: 'SHIPPING',
    risk_tier: 'CRITICAL',
    jurisdiction: 'CY',
    current_balance: 7900000.00,
    kyc_status: 'FLAGGED_FOR_RE_KYC',
    opened_at: '2021-08-05',
    pep_exposed: true,
    lcr_pct: 104.2,
    crar_pct: 16.5,
    active_alerts_count: 19,
  },
  {
    account_id: 'ACC-1002-RETAIL',
    entity_name: 'Domestic Retail Enterprise Entity',
    account_type: 'SME_COMMERCE',
    risk_tier: 'LOW',
    jurisdiction: 'IN',
    current_balance: 340000.00,
    kyc_status: 'VERIFIED',
    opened_at: '2023-02-11',
    pep_exposed: false,
    lcr_pct: 142.0,
    crar_pct: 21.0,
    active_alerts_count: 0,
  },
  {
    account_id: 'ACC-4412-CORP',
    entity_name: 'Zenith Infrastructure Holdings',
    account_type: 'INFRASTRUCTURE',
    risk_tier: 'MEDIUM',
    jurisdiction: 'AE',
    current_balance: 18900000.00,
    kyc_status: 'VERIFIED',
    opened_at: '2019-11-28',
    pep_exposed: false,
    lcr_pct: 129.4,
    crar_pct: 19.8,
    active_alerts_count: 2,
  },
  {
    account_id: 'ACC-3120-WEALTH',
    entity_name: 'Helios Private Capital Partners',
    account_type: 'WEALTH',
    risk_tier: 'MEDIUM',
    jurisdiction: 'SG',
    current_balance: 24500000.00,
    kyc_status: 'VERIFIED',
    opened_at: '2021-03-17',
    pep_exposed: false,
    lcr_pct: 155.0,
    crar_pct: 22.4,
    active_alerts_count: 1,
  },
  {
    account_id: 'ACC-6045-CORP',
    entity_name: 'Orion Metals & Commodities DMCC',
    account_type: 'COMMODITIES',
    risk_tier: 'HIGH',
    jurisdiction: 'AE',
    current_balance: 9340000.00,
    kyc_status: 'PERIODIC_REVIEW_DUE',
    opened_at: '2022-09-19',
    pep_exposed: false,
    lcr_pct: 109.1,
    crar_pct: 17.0,
    active_alerts_count: 5,
  }
];

export const INITIAL_ALERTS: FlaggedAmlEvent[] = [
  {
    alert_id: 'AML-5001',
    transaction_id: 'TX-100421',
    account_id: 'ACC-8921-CORP',
    anomaly_score: 0.965,
    severity_level: 'CRITICAL',
    pattern_tags: 'STRUCTURING_SMURFING',
    alert_description: '50 rapid wire transfers clustered between $9,900 and $9,980 (0.5% below $10,000 / INR 10L CTR ceiling) within 45 minutes.',
    investigation_status: 'OPEN',
    created_at: '12 mins ago',
  },
  {
    alert_id: 'AML-5002',
    transaction_id: 'TX-100488',
    account_id: 'ACC-7741-NBFC',
    anomaly_score: 0.920,
    severity_level: 'HIGH',
    pattern_tags: 'NBFC_CRAR_LCR_BREACH',
    alert_description: 'Prudential liquidity test detected LCR at 88.4% (<100% threshold) and CRAR at 13.8% (<15% Scale-Based Regulation floor).',
    investigation_status: 'OPEN',
    created_at: '28 mins ago',
  },
  {
    alert_id: 'AML-5003',
    transaction_id: 'TX-100512',
    account_id: 'ACC-9901-OFFSHORE',
    anomaly_score: 0.948,
    severity_level: 'CRITICAL',
    pattern_tags: 'VELOCITY_VOLUME_SPIKE',
    alert_description: 'Sudden single SWIFT wire of $1,450,000.00 out of Cyprus hub, representing 18.5x 30-day baseline standard deviation.',
    investigation_status: 'TRIAGED',
    created_at: '1 hour ago',
  },
  {
    alert_id: 'AML-5004',
    transaction_id: 'TX-100560',
    account_id: 'ACC-4412-CORP',
    anomaly_score: 0.785,
    severity_level: 'MEDIUM',
    pattern_tags: 'HIGH_RISK_CORRIDOR',
    alert_description: 'Cross-border routing passing through non-cooperative jurisdiction without verified ultimate beneficial ownership (UBO).',
    investigation_status: 'OPEN',
    created_at: '2 hours ago',
  },
  {
    alert_id: 'AML-5005',
    transaction_id: 'TX-100599',
    account_id: 'ACC-6045-CORP',
    anomaly_score: 0.812,
    severity_level: 'HIGH',
    pattern_tags: 'SANCTIONS_SCREENING_MATCH',
    alert_description: 'Counterparty fuzzy match on OFAC/UN consolidated sanctions advisory list.',
    investigation_status: 'OPEN',
    created_at: '3 hours ago',
  }
];

export const REGULATORY_CITATIONS_DATABASE: Record<string, RegulatoryCitation[]> = {
  smurfing: [
    {
      authority: 'Reserve Bank of India (RBI)',
      doc_title: 'Master Direction - Know Your Customer (KYC) Direction, 2016 (Updated 2024)',
      section_clause: 'Section 38 & Chapter VI (Monitoring of Transactions)',
      effective_year: 2024,
      exact_snippet: 'Regulated Entities (REs) shall put in place an automated transaction monitoring mechanism with risk-based thresholds. Any series of integrated cash or wire transactions individually below rupees ten lakhs but integrally connected exceeding threshold in a calendar month must be tagged as suspicious structuring.',
      relevance_score: 0.965,
      regulatory_mandate: 'Mandatory filing of Suspicious Transaction Report (STR) to FIU-IND within 7 working days.'
    },
    {
      authority: 'Financial Action Task Force (FATF)',
      doc_title: 'Guidance on Concealment of Beneficial Ownership and Money Laundering Typologies',
      section_clause: 'Typology 4.2: Smurfing through Layered Wire Transfers',
      effective_year: 2023,
      exact_snippet: 'Breaking a large sum of illicit money into smaller increments to circumvent mandatory cash or threshold transaction reporting regulations constitutes intentional structuring.',
      relevance_score: 0.912,
      regulatory_mandate: 'Enhanced Due Diligence (EDD) and beneficial ownership register disclosure.'
    }
  ],
  lcr: [
    {
      authority: 'Basel Committee on Banking Supervision (BCBS)',
      doc_title: 'Basel III: The Liquidity Coverage Ratio and liquidity risk monitoring tools',
      section_clause: 'Paragraph 41-45 (HQLA Buffer vs 30-Day Net Cash Outflows)',
      effective_year: 2023,
      exact_snippet: 'The Liquidity Coverage Ratio (LCR) standard requires that banks maintain an adequate stock of unencumbered High-Quality Liquid Assets (HQLA) that can be converted into cash to meet liquidity needs for a 30 calendar day liquidity stress scenario. LCR must consistently remain above 100%.',
      relevance_score: 0.978,
      regulatory_mandate: 'Immediate board escalation and contingency funding plan activation if LCR breaches 105% warning corridor.'
    },
    {
      authority: 'Reserve Bank of India (RBI)',
      doc_title: 'Master Direction - Non-Banking Financial Company – Scale Based Regulation (SBR)',
      section_clause: 'Section 12.3 (Concentration Risk and Capital Adequacy)',
      effective_year: 2024,
      exact_snippet: 'NBFCs in the Middle and Upper Layers shall maintain a minimum Capital to Risk-weighted Assets Ratio (CRAR) of 15% on an ongoing basis with Tier I capital not falling below 10%. Single entity lending exposure cannot exceed 20% of Tier I capital.',
      relevance_score: 0.941,
      regulatory_mandate: 'Monthly CRAR compliance certification and risk committee audit filing.'
    }
  ],
  fatf: [
    {
      authority: 'Financial Action Task Force (FATF)',
      doc_title: 'International Standards on Combating Money Laundering and Terrorist Financing',
      section_clause: 'Recommendation 16 (Wire Transfers / Travel Rule)',
      effective_year: 2024,
      exact_snippet: 'Countries should ensure that ordering financial institutions obtain and hold required and accurate originator information and required beneficiary information on cross-border wire transfers, and submit such data immediately and securely to counterparty institutions.',
      relevance_score: 0.952,
      regulatory_mandate: 'Freeze or reject transfers lacking verified ultimate beneficial ownership (UBO) credentials.'
    }
  ]
};
