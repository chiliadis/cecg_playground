import { runQuery } from './database';

export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('Seeding insurance database with sample data...');

    // Seed admin user first
    try {
      await runQuery(`
        INSERT INTO admins (username, password, email, first_name, last_name, role, is_super_admin, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, ['admin', 'admin', 'admin@chubb.com', 'Super', 'Admin', 'superadmin', 1, 1]);
    } catch (error: any) {
      if (!error.message.includes('UNIQUE constraint failed')) {
        throw error;
      }
    }

    // Seed agents first
    const agents = [
      { agent_code: 'AGT001', first_name: 'Luna', last_name: 'Stormweaver', email: 'luna.stormweaver@chubb.com', phone: '555-0101', license_number: 'INS123456', commission_rate: 0.05, territory: 'Northeast' },
      { agent_code: 'AGT002', first_name: 'Phoenix', last_name: 'Dragonheart', email: 'phoenix.dragonheart@chubb.com', phone: '555-0102', license_number: 'INS234567', commission_rate: 0.045, territory: 'West Coast' },
      { agent_code: 'AGT003', first_name: 'Aria', last_name: 'Moonwhisper', email: 'aria.moonwhisper@chubb.com', phone: '555-0103', license_number: 'INS345678', commission_rate: 0.055, territory: 'Southeast' },
      { agent_code: 'AGT004', first_name: 'Zara', last_name: 'Brightforge', email: 'zara.brightforge@chubb.com', phone: '555-0104', license_number: 'INS456789', commission_rate: 0.048, territory: 'Midwest' },
      { agent_code: 'AGT005', first_name: 'Kai', last_name: 'Shadowbane', email: 'kai.shadowbane@chubb.com', phone: '555-0105', license_number: 'INS567890', commission_rate: 0.052, territory: 'Southwest' }
    ];

    for (const agent of agents) {
      try {
        await runQuery(`
          INSERT INTO agents (agent_code, first_name, last_name, email, phone, license_number, commission_rate, territory)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [agent.agent_code, agent.first_name, agent.last_name, agent.email, agent.phone, agent.license_number, agent.commission_rate, agent.territory]);
      } catch (error: any) {
        if (!error.message.includes('UNIQUE constraint failed')) {
          throw error;
        }
      }
    }

    // Seed brokers
    const brokers = [
      {
        broker_code: 'BRK001', first_name: 'Marcus', last_name: 'Silverstone',
        email: 'marcus.silverstone@silverstone-insurance.com', phone: '555-2001',
        license_number: 'BRK123456', company_name: 'Silverstone Insurance Brokers',
        commission_rate: 0.08, territory: 'Northeast', specialization: 'Commercial & Personal Lines'
      },
      {
        broker_code: 'BRK002', first_name: 'Victoria', last_name: 'Goldsmith',
        email: 'victoria.goldsmith@goldsmith-brokers.com', phone: '555-2002',
        license_number: 'BRK234567', company_name: 'Goldsmith Insurance Group',
        commission_rate: 0.075, territory: 'West Coast', specialization: 'High Net Worth Individuals'
      },
      {
        broker_code: 'BRK003', first_name: 'Alexander', last_name: 'Ironbridge',
        email: 'alex.ironbridge@ironbridge-insurance.com', phone: '555-2003',
        license_number: 'BRK345678', company_name: 'Ironbridge Risk Solutions',
        commission_rate: 0.07, territory: 'Southeast', specialization: 'Commercial Property & Casualty'
      },
      {
        broker_code: 'BRK004', first_name: 'Sophia', last_name: 'Diamondfield',
        email: 'sophia.diamondfield@diamondfield-brokers.com', phone: '555-2004',
        license_number: 'BRK456789', company_name: 'Diamondfield Insurance Services',
        commission_rate: 0.085, territory: 'Midwest', specialization: 'Life & Health Insurance'
      },
      {
        broker_code: 'BRK005', first_name: 'William', last_name: 'Copperhill',
        email: 'william.copperhill@copperhill-insurance.com', phone: '555-2005',
        license_number: 'BRK567890', company_name: 'Copperhill Insurance Partners',
        commission_rate: 0.078, territory: 'Southwest', specialization: 'Auto & Home Insurance'
      }
    ];

    for (const broker of brokers) {
      try {
        await runQuery(`
          INSERT INTO brokers (
            broker_code, first_name, last_name, email, phone, license_number,
            company_name, commission_rate, territory, specialization
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          broker.broker_code, broker.first_name, broker.last_name, broker.email,
          broker.phone, broker.license_number, broker.company_name, broker.commission_rate,
          broker.territory, broker.specialization
        ]);
      } catch (error: any) {
        if (!error.message.includes('UNIQUE constraint failed')) {
          throw error;
        }
      }
    }

    // Seed customers
    const customers = [
      {
        customer_number: 'CUST001', email: 'wizard.mcspellcaster@email.com', password: 'password123',
        first_name: 'Wizard', last_name: 'McSpellcaster', date_of_birth: '1985-03-15',
        phone: '555-1001', address: '123 Enchanted Lane', city: 'New York', state: 'NY', zip_code: '10001',
        ssn: '123456789', employment_status: 'employed', annual_income: 75000, credit_score: 720,
        kyc_status: 'approved', customer_type: 'individual', agent_id: 1
      },
      {
        customer_number: 'CUST002', email: 'captain.awesome@email.com', password: 'secure456',
        first_name: 'Captain', last_name: 'Awesome', date_of_birth: '1990-07-22',
        phone: '555-1002', address: '456 Victory Blvd', city: 'Los Angeles', state: 'CA', zip_code: '90210',
        ssn: '234567890', employment_status: 'employed', annual_income: 85000, credit_score: 750,
        kyc_status: 'approved', customer_type: 'individual', agent_id: 2
      },
      {
        customer_number: 'CUST003', email: 'ninja.stealthmaster@email.com', password: 'mypass789',
        first_name: 'Ninja', last_name: 'Stealthmaster', date_of_birth: '1978-12-05',
        phone: '555-1003', address: '789 Shadow Drive', city: 'Miami', state: 'FL', zip_code: '33101',
        ssn: '345678901', employment_status: 'self-employed', annual_income: 95000, credit_score: 680,
        kyc_status: 'pending', customer_type: 'individual', agent_id: 3
      },
      {
        customer_number: 'CUST004', email: 'princess.sparkles@email.com', password: 'pass2023',
        first_name: 'Princess', last_name: 'Sparkles', date_of_birth: '1992-09-18',
        phone: '555-1004', address: '321 Rainbow Street', city: 'Chicago', state: 'IL', zip_code: '60601',
        ssn: '456789012', employment_status: 'employed', annual_income: 68000, credit_score: 740,
        kyc_status: 'approved', customer_type: 'individual', agent_id: 1
      },
      {
        customer_number: 'CUST005', email: 'bob.thecoolestguy@email.com', password: 'coolpass123',
        first_name: 'Bob', last_name: 'TheCoolestGuy', date_of_birth: '1987-11-30',
        phone: '555-1005', address: '999 Rad Avenue', city: 'Portland', state: 'OR', zip_code: '97201',
        ssn: '567890123', employment_status: 'employed', annual_income: 72000, credit_score: 710,
        kyc_status: 'approved', customer_type: 'individual', agent_id: 4
      },
      {
        customer_number: 'CUST006', email: 'lady.dragonslayer@email.com', password: 'dragonfire99',
        first_name: 'Lady', last_name: 'Dragonslayer', date_of_birth: '1984-05-12',
        phone: '555-1006', address: '777 Knight Court', city: 'Denver', state: 'CO', zip_code: '80202',
        ssn: '678901234', employment_status: 'self-employed', annual_income: 120000, credit_score: 780,
        kyc_status: 'approved', customer_type: 'individual', agent_id: 5
      }
    ];

    for (const customer of customers) {
      try {
        await runQuery(`
          INSERT INTO customers (
            customer_number, email, password, first_name, last_name, date_of_birth,
            phone, address, city, state, zip_code, ssn, employment_status, annual_income,
            credit_score, kyc_status, customer_type, agent_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          customer.customer_number, customer.email, customer.password, customer.first_name,
          customer.last_name, customer.date_of_birth, customer.phone, customer.address,
          customer.city, customer.state, customer.zip_code, customer.ssn,
          customer.employment_status, customer.annual_income, customer.credit_score,
          customer.kyc_status, customer.customer_type, customer.agent_id
        ]);
      } catch (error: any) {
        if (!error.message.includes('UNIQUE constraint failed')) {
          throw error;
        }
      }
    }

    // Seed policies
    const policies = [
      {
        policy_number: 'POL001', customer_id: 1, broker_id: 1, policy_type: 'auto', product_name: 'Comprehensive Auto Insurance',
        coverage_amount: 50000, premium_amount: 1200, deductible: 500, policy_term: 12,
        start_date: '2024-01-01', end_date: '2024-12-31', status: 'active', underwriting_status: 'approved', risk_score: 3
      },
      {
        policy_number: 'POL002', customer_id: 1, broker_id: 2, policy_type: 'home', product_name: 'Homeowners Insurance Plus',
        coverage_amount: 300000, premium_amount: 1800, deductible: 1000, policy_term: 12,
        start_date: '2024-02-01', end_date: '2025-01-31', status: 'active', underwriting_status: 'approved', risk_score: 2
      },
      {
        policy_number: 'POL003', customer_id: 2, broker_id: 3, policy_type: 'auto', product_name: 'Standard Auto Coverage',
        coverage_amount: 35000, premium_amount: 950, deductible: 750, policy_term: 12,
        start_date: '2024-03-15', end_date: '2025-03-14', status: 'active', underwriting_status: 'approved', risk_score: 4
      },
      {
        policy_number: 'POL004', customer_id: 3, broker_id: 4, policy_type: 'life', product_name: 'Term Life Insurance',
        coverage_amount: 500000, premium_amount: 600, deductible: 0, policy_term: 120,
        start_date: '2024-01-15', end_date: '2034-01-14', status: 'pending', underwriting_status: 'pending', risk_score: null
      },
      {
        policy_number: 'POL005', customer_id: 4, broker_id: 5, policy_type: 'renters', product_name: 'Renters Protection Plan',
        coverage_amount: 25000, premium_amount: 300, deductible: 250, policy_term: 12,
        start_date: '2024-04-01', end_date: '2025-03-31', status: 'active', underwriting_status: 'approved', risk_score: 2
      }
    ];

    for (const policy of policies) {
      try {
        await runQuery(`
          INSERT INTO policies (
            policy_number, customer_id, broker_id, policy_type, product_name, coverage_amount,
            premium_amount, deductible, policy_term, start_date, end_date,
            status, underwriting_status, risk_score
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          policy.policy_number, policy.customer_id, policy.broker_id, policy.policy_type, policy.product_name,
          policy.coverage_amount, policy.premium_amount, policy.deductible, policy.policy_term,
          policy.start_date, policy.end_date, policy.status, policy.underwriting_status, policy.risk_score
        ]);
      } catch (error: any) {
        if (!error.message.includes('UNIQUE constraint failed')) {
          throw error;
        }
      }
    }

    // Seed coverage details
    const coverageDetails = [
      { policy_id: 1, coverage_type: 'Liability', coverage_limit: 25000, deductible: 0, premium_portion: 600 },
      { policy_id: 1, coverage_type: 'Collision', coverage_limit: 15000, deductible: 500, premium_portion: 400 },
      { policy_id: 1, coverage_type: 'Comprehensive', coverage_limit: 10000, deductible: 500, premium_portion: 200 },
      { policy_id: 2, coverage_type: 'Dwelling', coverage_limit: 250000, deductible: 1000, premium_portion: 1200 },
      { policy_id: 2, coverage_type: 'Personal Property', coverage_limit: 50000, deductible: 500, premium_portion: 600 }
    ];

    for (const coverage of coverageDetails) {
      try {
        await runQuery(`
          INSERT INTO coverage_details (policy_id, coverage_type, coverage_limit, deductible, premium_portion)
          VALUES (?, ?, ?, ?, ?)
        `, [coverage.policy_id, coverage.coverage_type, coverage.coverage_limit, coverage.deductible, coverage.premium_portion]);
      } catch (error: any) {
        if (!error.message.includes('UNIQUE constraint failed')) {
          throw error;
        }
      }
    }

    // Seed claims
    const claims = [
      {
        claim_number: 'CLM001', policy_id: 1, customer_id: 1, claim_type: 'auto_accident',
        incident_date: '2024-05-15', claim_amount: 3500, approved_amount: 3200,
        status: 'approved', priority: 'medium', description: 'Rear-end collision on Highway 95',
        incident_location: 'Highway 95, Mile Marker 42', police_report_number: 'PR2024-5501'
      },
      {
        claim_number: 'CLM002', policy_id: 2, customer_id: 1, claim_type: 'water_damage',
        incident_date: '2024-06-22', claim_amount: 8500, approved_amount: null,
        status: 'under_review', priority: 'high', description: 'Burst pipe in basement caused flooding',
        incident_location: '123 Main St, New York, NY'
      },
      {
        claim_number: 'CLM003', policy_id: 3, customer_id: 2, claim_type: 'vandalism',
        incident_date: '2024-07-03', claim_amount: 1200, approved_amount: 1200,
        status: 'paid', priority: 'low', description: 'Vehicle vandalized in parking lot',
        incident_location: 'Shopping Mall Parking Lot, Los Angeles, CA'
      }
    ];

    for (const claim of claims) {
      try {
        await runQuery(`
          INSERT INTO claims (
            claim_number, policy_id, customer_id, claim_type, incident_date,
            claim_amount, approved_amount, status, priority, description, incident_location, police_report_number
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          claim.claim_number, claim.policy_id, claim.customer_id, claim.claim_type,
          claim.incident_date, claim.claim_amount, claim.approved_amount, claim.status,
          claim.priority, claim.description, claim.incident_location, claim.police_report_number
        ]);
      } catch (error: any) {
        if (!error.message.includes('UNIQUE constraint failed')) {
          throw error;
        }
      }
    }

    console.log('Insurance database seeded successfully!');
    console.log('Sample customer credentials:');
    console.log('- Email: wizard.mcspellcaster@email.com, Password: password123');
    console.log('- Email: captain.awesome@email.com, Password: secure456');
    console.log('- Email: ninja.stealthmaster@email.com, Password: mypass789');
    console.log('- Email: princess.sparkles@email.com, Password: pass2023');
    console.log('- Email: bob.thecoolestguy@email.com, Password: coolpass123');
    console.log('- Email: lady.dragonslayer@email.com, Password: dragonfire99');

  } catch (error) {
    console.error('Error seeding insurance database:', error);
    throw error;
  }
};