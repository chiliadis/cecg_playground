import sqlite3 from 'sqlite3';
import path from 'path';
import { promisify } from 'util';

const dbPath = path.join(__dirname, '../data/insurance.db');
let db: sqlite3.Database;

export const initDatabase = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Connected to SQLite database');
        createTables().then(resolve).catch(reject);
      }
    });
  });
};

const createTables = async (): Promise<void> => {
  const createCustomersTable = `
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_number TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth DATE,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      ssn TEXT,
      employment_status TEXT,
      annual_income DECIMAL(12,2),
      credit_score INTEGER,
      kyc_status TEXT DEFAULT 'pending',
      customer_type TEXT DEFAULT 'individual',
      agent_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createPoliciesTable = `
    CREATE TABLE IF NOT EXISTS policies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      policy_number TEXT UNIQUE NOT NULL,
      customer_id INTEGER NOT NULL,
      broker_id INTEGER NOT NULL,
      policy_type TEXT NOT NULL,
      product_name TEXT NOT NULL,
      coverage_amount DECIMAL(12,2) NOT NULL,
      premium_amount DECIMAL(10,2) NOT NULL,
      deductible DECIMAL(10,2),
      policy_term INTEGER,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status TEXT DEFAULT 'pending',
      underwriting_status TEXT DEFAULT 'pending',
      risk_score INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers (id),
      FOREIGN KEY (broker_id) REFERENCES brokers (id)
    )
  `;

  const createClaimsTable = `
    CREATE TABLE IF NOT EXISTS claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      claim_number TEXT UNIQUE NOT NULL,
      policy_id INTEGER NOT NULL,
      customer_id INTEGER NOT NULL,
      claim_type TEXT NOT NULL,
      incident_date DATE NOT NULL,
      reported_date DATE DEFAULT (DATE('now')),
      claim_amount DECIMAL(12,2) NOT NULL,
      approved_amount DECIMAL(12,2),
      status TEXT DEFAULT 'submitted',
      priority TEXT DEFAULT 'medium',
      adjuster_id INTEGER,
      description TEXT NOT NULL,
      incident_location TEXT,
      police_report_number TEXT,
      witness_info TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (policy_id) REFERENCES policies (id),
      FOREIGN KEY (customer_id) REFERENCES customers (id)
    )
  `;

  const createCoverageDetailsTable = `
    CREATE TABLE IF NOT EXISTS coverage_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      policy_id INTEGER NOT NULL,
      coverage_type TEXT NOT NULL,
      coverage_limit DECIMAL(12,2) NOT NULL,
      deductible DECIMAL(10,2),
      premium_portion DECIMAL(10,2),
      is_active BOOLEAN DEFAULT 1,
      FOREIGN KEY (policy_id) REFERENCES policies (id)
    )
  `;

  const createAgentsTable = `
    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_code TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      license_number TEXT,
      commission_rate DECIMAL(5,4),
      territory TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createClaimDocumentsTable = `
    CREATE TABLE IF NOT EXISTS claim_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      claim_id INTEGER NOT NULL,
      document_type TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT,
      file_size INTEGER,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (claim_id) REFERENCES claims (id)
    )
  `;

  const createBrokersTable = `
    CREATE TABLE IF NOT EXISTS brokers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      broker_code TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      license_number TEXT,
      company_name TEXT,
      commission_rate DECIMAL(5,4),
      territory TEXT,
      specialization TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createAdminsTable = `
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      is_super_admin BOOLEAN DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const runQuery = promisify(db.run.bind(db));

  try {
    await runQuery(createCustomersTable);
    await runQuery(createAgentsTable);
    await runQuery(createBrokersTable);
    await runQuery(createPoliciesTable);
    await runQuery(createClaimsTable);
    await runQuery(createCoverageDetailsTable);
    await runQuery(createClaimDocumentsTable);
    await runQuery(createAdminsTable);
    console.log('Insurance database tables created successfully');
  } catch (error) {
    throw new Error(`Failed to create tables: ${error}`);
  }
};

export const getDatabase = (): sqlite3.Database => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
};

export const runQuery = (query: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

export const getQuery = (query: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export const allQuery = (query: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};