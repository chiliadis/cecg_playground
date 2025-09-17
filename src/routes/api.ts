import { Router } from 'express';
import { runQuery, getQuery, allQuery } from '../database';

export const apiRoutes = Router();

apiRoutes.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Chubb Insurance API is running', timestamp: new Date().toISOString() });
});

// Reset Database Endpoint - for testing purposes
apiRoutes.post('/admin/reset-database', async (req, res) => {
  try {
    console.log('🔄 Database reset requested...');

    // Clear all data from tables in correct order (respecting foreign keys)
    await runQuery('DELETE FROM coverage_details');
    await runQuery('DELETE FROM claims');
    await runQuery('DELETE FROM policies');
    await runQuery('DELETE FROM customers');
    await runQuery('DELETE FROM agents');
    await runQuery('DELETE FROM brokers');
    await runQuery('DELETE FROM admins');

    // Reset auto-increment counters
    await runQuery('DELETE FROM sqlite_sequence');

    // Re-seed the database
    const { seedDatabase } = await import('../seedData');
    await seedDatabase();

    res.json({
      success: true,
      message: 'Database has been reset and reseeded with fresh test data',
      timestamp: new Date().toISOString()
    });

    console.log('✅ Database reset and reseeded successfully!');
  } catch (error: any) {
    console.error('❌ Error resetting database:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset database',
      error: error.message
    });
  }
});

// Customer Management Endpoints
apiRoutes.get('/customers', async (req, res) => {
  try {
    const {
      customer_number, first_name, last_name, email, phone, agent_id,
      income_min, income_max, age_min, age_max, credit_min, registration_from,
      customer_status, customer_type
    } = req.query;

    let query = `
      SELECT c.*, a.first_name as agent_first_name, a.last_name as agent_last_name
      FROM customers c
      LEFT JOIN agents a ON c.agent_id = a.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (customer_number) {
      query += ' AND c.customer_number LIKE ?';
      params.push(`%${customer_number}%`);
    }

    if (first_name) {
      query += ' AND c.first_name LIKE ?';
      params.push(`%${first_name}%`);
    }

    if (last_name) {
      query += ' AND c.last_name LIKE ?';
      params.push(`%${last_name}%`);
    }

    if (email) {
      query += ' AND c.email LIKE ?';
      params.push(`%${email}%`);
    }

    if (phone) {
      query += ' AND c.phone LIKE ?';
      params.push(`%${phone}%`);
    }

    if (agent_id) {
      query += ' AND c.agent_id = ?';
      params.push(agent_id);
    }

    if (income_min) {
      query += ' AND c.annual_income >= ?';
      params.push(parseFloat(income_min as string));
    }

    if (income_max) {
      query += ' AND c.annual_income <= ?';
      params.push(parseFloat(income_max as string));
    }

    if (age_min || age_max) {
      // Calculate age from date_of_birth
      if (age_min) {
        query += ' AND (julianday("now") - julianday(c.date_of_birth)) / 365.25 >= ?';
        params.push(parseInt(age_min as string));
      }
      if (age_max) {
        query += ' AND (julianday("now") - julianday(c.date_of_birth)) / 365.25 <= ?';
        params.push(parseInt(age_max as string));
      }
    }

    if (credit_min) {
      query += ' AND c.credit_score >= ?';
      params.push(parseInt(credit_min as string));
    }

    if (registration_from) {
      query += ' AND c.created_at >= ?';
      params.push(registration_from);
    }

    if (customer_status) {
      query += ' AND c.kyc_status = ?';
      params.push(customer_status);
    }

    if (customer_type) {
      query += ' AND c.customer_type = ?';
      params.push(customer_type);
    }

    query += ' ORDER BY c.created_at DESC';

    const customers = await allQuery(query, params);
    res.json({ success: true, data: customers, count: customers.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch customers', error: error.message });
  }
});

apiRoutes.get('/customers/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const customers = await allQuery(`
      SELECT c.*, a.first_name as agent_first_name, a.last_name as agent_last_name
      FROM customers c
      LEFT JOIN agents a ON c.agent_id = a.id
      WHERE (c.customer_number LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ? OR
             c.email LIKE ? OR c.phone LIKE ? OR CONCAT(c.first_name, " ", c.last_name) LIKE ?)
      ORDER BY c.customer_number
    `, [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]);

    res.json({ success: true, data: customers, count: customers.length, query: q });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Customer search failed', error: error.message });
  }
});

apiRoutes.get('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await getQuery(`
      SELECT c.*, a.first_name as agent_first_name, a.last_name as agent_last_name
      FROM customers c
      LEFT JOIN agents a ON c.agent_id = a.id
      WHERE c.id = ?
    `, [id]);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const policies = await allQuery('SELECT * FROM policies WHERE customer_id = ?', [id]);
    const claims = await allQuery('SELECT * FROM claims WHERE customer_id = ?', [id]);

    customer.policies = policies;
    customer.claims = claims;

    res.json({ success: true, data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer', error: error.message });
  }
});

apiRoutes.post('/customers', async (req, res) => {
  try {
    const {
      email, password, first_name, last_name, date_of_birth,
      phone, address, city, state, zip_code, ssn,
      employment_status, annual_income, customer_type = 'individual'
    } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name, and last name are required'
      });
    }

    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const customer_number = `CUST${Date.now()}`;

    const result = await runQuery(`
      INSERT INTO customers (
        customer_number, email, password, first_name, last_name,
        date_of_birth, phone, address, city, state, zip_code, ssn,
        employment_status, annual_income, customer_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      customer_number, email, password, first_name, last_name,
      date_of_birth, phone, address, city, state, zip_code, ssn,
      employment_status, annual_income, customer_type
    ]);

    const newCustomer = await getQuery('SELECT * FROM customers WHERE id = ?', [result.id]);

    res.status(201).json({ success: true, data: newCustomer, message: 'Customer registered successfully' });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(409).json({ success: false, message: 'Email already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to register customer', error: error.message });
    }
  }
});

apiRoutes.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const customer = await getQuery(`
      SELECT id, customer_number, email, first_name, last_name, kyc_status
      FROM customers WHERE email = ? AND password = ?
    `, [email, password]);

    if (!customer) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      data: { customer, token: 'insurance-jwt-token-' + Date.now() },
      message: 'Login successful'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

// Policy Management Endpoints
apiRoutes.get('/policies', async (req, res) => {
  try {
    const {
      customer_id, policy_type, status, policy_number, customer_name,
      product_name, date_from, date_to, coverage_min, coverage_max
    } = req.query;

    let query = `
      SELECT p.*, c.first_name, c.last_name, c.customer_number,
             b.first_name as broker_first_name, b.last_name as broker_last_name,
             b.company_name as broker_company
      FROM policies p
      JOIN customers c ON p.customer_id = c.id
      LEFT JOIN brokers b ON p.broker_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (customer_id) {
      query += ' AND p.customer_id = ?';
      params.push(customer_id);
    }

    if (policy_type) {
      query += ' AND p.policy_type = ?';
      params.push(policy_type);
    }

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (policy_number) {
      query += ' AND p.policy_number LIKE ?';
      params.push(`%${policy_number}%`);
    }

    if (customer_name) {
      query += ' AND (c.first_name LIKE ? OR c.last_name LIKE ? OR CONCAT(c.first_name, " ", c.last_name) LIKE ?)';
      params.push(`%${customer_name}%`, `%${customer_name}%`, `%${customer_name}%`);
    }

    if (product_name) {
      query += ' AND p.product_name LIKE ?';
      params.push(`%${product_name}%`);
    }

    if (date_from) {
      query += ' AND p.start_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND p.start_date <= ?';
      params.push(date_to);
    }

    if (coverage_min) {
      query += ' AND p.coverage_amount >= ?';
      params.push(parseFloat(coverage_min as string));
    }

    if (coverage_max) {
      query += ' AND p.coverage_amount <= ?';
      params.push(parseFloat(coverage_max as string));
    }

    query += ' ORDER BY p.created_at DESC';

    const policies = await allQuery(query, params);
    res.json({ success: true, data: policies, count: policies.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch policies', error: error.message });
  }
});

apiRoutes.get('/policies/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const policies = await allQuery(`
      SELECT p.*, c.first_name, c.last_name, c.customer_number
      FROM policies p
      JOIN customers c ON p.customer_id = c.id
      WHERE (p.policy_number LIKE ? OR p.product_name LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)
      ORDER BY p.policy_number
    `, [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]);

    res.json({ success: true, data: policies, count: policies.length, query: q });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Policy search failed', error: error.message });
  }
});

apiRoutes.get('/policies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await getQuery(`
      SELECT p.*, c.first_name, c.last_name, c.customer_number, c.email
      FROM policies p
      JOIN customers c ON p.customer_id = c.id
      WHERE p.id = ?
    `, [id]);

    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    const coverageDetails = await allQuery('SELECT * FROM coverage_details WHERE policy_id = ?', [id]);
    policy.coverage_details = coverageDetails;

    res.json({ success: true, data: policy });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch policy', error: error.message });
  }
});

apiRoutes.post('/policies', async (req, res) => {
  try {
    const {
      customer_id, broker_id, policy_type, product_name, coverage_amount, premium_amount,
      deductible, policy_term, start_date, end_date, coverage_details = []
    } = req.body;

    if (!customer_id || !broker_id || !policy_type || !product_name || !coverage_amount || !premium_amount || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID, Broker ID, policy type, product name, coverage amount, premium amount, start date, and end date are required'
      });
    }

    const policy_number = `POL${Date.now()}`;

    const result = await runQuery(`
      INSERT INTO policies (
        policy_number, customer_id, broker_id, policy_type, product_name,
        coverage_amount, premium_amount, deductible, policy_term,
        start_date, end_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      policy_number, customer_id, broker_id, policy_type, product_name,
      coverage_amount, premium_amount, deductible, policy_term,
      start_date, end_date
    ]);

    for (const coverage of coverage_details) {
      await runQuery(`
        INSERT INTO coverage_details (policy_id, coverage_type, coverage_limit, deductible, premium_portion)
        VALUES (?, ?, ?, ?, ?)
      `, [result.id, coverage.coverage_type, coverage.coverage_limit, coverage.deductible, coverage.premium_portion]);
    }

    const newPolicy = await getQuery('SELECT * FROM policies WHERE id = ?', [result.id]);

    res.status(201).json({ success: true, data: newPolicy, message: 'Policy created successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create policy', error: error.message });
  }
});

// Claims Management Endpoints
apiRoutes.get('/claims', async (req, res) => {
  try {
    const { customer_id, policy_id, status, priority } = req.query;
    let query = `
      SELECT cl.*, c.first_name, c.last_name, c.customer_number, p.policy_number, p.product_name
      FROM claims cl
      JOIN customers c ON cl.customer_id = c.id
      JOIN policies p ON cl.policy_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (customer_id) {
      query += ' AND cl.customer_id = ?';
      params.push(customer_id);
    }

    if (policy_id) {
      query += ' AND cl.policy_id = ?';
      params.push(policy_id);
    }

    if (status) {
      query += ' AND cl.status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND cl.priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY cl.created_at DESC';

    const claims = await allQuery(query, params);
    res.json({ success: true, data: claims, count: claims.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch claims', error: error.message });
  }
});

apiRoutes.get('/claims/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const claim = await getQuery(`
      SELECT cl.*, c.first_name, c.last_name, c.customer_number, c.email,
             p.policy_number, p.product_name, p.coverage_amount
      FROM claims cl
      JOIN customers c ON cl.customer_id = c.id
      JOIN policies p ON cl.policy_id = p.id
      WHERE cl.id = ?
    `, [id]);

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    const documents = await allQuery('SELECT * FROM claim_documents WHERE claim_id = ?', [id]);
    claim.documents = documents;

    res.json({ success: true, data: claim });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch claim', error: error.message });
  }
});

apiRoutes.post('/claims', async (req, res) => {
  try {
    const {
      policy_id, customer_id, claim_type, incident_date, claim_amount,
      description, incident_location, police_report_number, witness_info
    } = req.body;

    if (!policy_id || !customer_id || !claim_type || !incident_date || !claim_amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Policy ID, customer ID, claim type, incident date, claim amount, and description are required'
      });
    }

    const policy = await getQuery('SELECT * FROM policies WHERE id = ? AND customer_id = ?', [policy_id, customer_id]);
    if (!policy) {
      return res.status(400).json({
        success: false,
        message: 'Policy not found or does not belong to customer'
      });
    }

    const claim_number = `CLM${Date.now()}`;

    const result = await runQuery(`
      INSERT INTO claims (
        claim_number, policy_id, customer_id, claim_type, incident_date,
        claim_amount, description, incident_location, police_report_number, witness_info
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      claim_number, policy_id, customer_id, claim_type, incident_date,
      claim_amount, description, incident_location, police_report_number, witness_info
    ]);

    const newClaim = await getQuery(`
      SELECT cl.*, c.first_name, c.last_name, p.policy_number
      FROM claims cl
      JOIN customers c ON cl.customer_id = c.id
      JOIN policies p ON cl.policy_id = p.id
      WHERE cl.id = ?
    `, [result.id]);

    res.status(201).json({ success: true, data: newClaim, message: 'Claim submitted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to submit claim', error: error.message });
  }
});

apiRoutes.put('/claims/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approved_amount, notes } = req.body;

    const validStatuses = ['submitted', 'under_review', 'approved', 'denied', 'paid', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    let updateQuery = 'UPDATE claims SET status = ?, updated_at = CURRENT_TIMESTAMP';
    const params = [status];

    if (approved_amount !== undefined) {
      updateQuery += ', approved_amount = ?';
      params.push(approved_amount);
    }

    if (notes !== undefined) {
      updateQuery += ', notes = ?';
      params.push(notes);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    const result = await runQuery(updateQuery, params);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    const updatedClaim = await getQuery('SELECT * FROM claims WHERE id = ?', [id]);
    res.json({ success: true, data: updatedClaim, message: 'Claim status updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update claim status', error: error.message });
  }
});

// Additional endpoints for insurance workflows
apiRoutes.get('/agents', async (req, res) => {
  try {
    const agents = await allQuery('SELECT * FROM agents WHERE status = "active" ORDER BY last_name, first_name');
    res.json({ success: true, data: agents, count: agents.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch agents', error: error.message });
  }
});

// Brokers Management Endpoints
apiRoutes.get('/brokers', async (req, res) => {
  try {
    const {
      broker_code, first_name, last_name, email, phone, company_name,
      territory, specialization, status
    } = req.query;

    let query = `
      SELECT * FROM brokers WHERE 1=1
    `;
    const params: any[] = [];

    if (broker_code) {
      query += ' AND broker_code LIKE ?';
      params.push(`%${broker_code}%`);
    }

    if (first_name) {
      query += ' AND first_name LIKE ?';
      params.push(`%${first_name}%`);
    }

    if (last_name) {
      query += ' AND last_name LIKE ?';
      params.push(`%${last_name}%`);
    }

    if (email) {
      query += ' AND email LIKE ?';
      params.push(`%${email}%`);
    }

    if (phone) {
      query += ' AND phone LIKE ?';
      params.push(`%${phone}%`);
    }

    if (company_name) {
      query += ' AND company_name LIKE ?';
      params.push(`%${company_name}%`);
    }

    if (territory) {
      query += ' AND territory LIKE ?';
      params.push(`%${territory}%`);
    }

    if (specialization) {
      query += ' AND specialization LIKE ?';
      params.push(`%${specialization}%`);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY last_name, first_name';

    const brokers = await allQuery(query, params);
    res.json({ success: true, data: brokers, count: brokers.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch brokers', error: error.message });
  }
});

apiRoutes.get('/brokers/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const searchQuery = `%${q}%`;
    const query = `
      SELECT * FROM brokers
      WHERE broker_code LIKE ? OR first_name LIKE ? OR last_name LIKE ?
      OR email LIKE ? OR company_name LIKE ? OR territory LIKE ?
      ORDER BY last_name, first_name
    `;

    const brokers = await allQuery(query, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery]);
    res.json({ success: true, data: brokers, count: brokers.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to search brokers', error: error.message });
  }
});

apiRoutes.get('/brokers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const broker = await getQuery('SELECT * FROM brokers WHERE id = ?', [id]);

    if (!broker) {
      return res.status(404).json({ success: false, message: 'Broker not found' });
    }

    res.json({ success: true, data: broker });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch broker', error: error.message });
  }
});

apiRoutes.post('/brokers', async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, license_number, company_name,
      commission_rate, territory, specialization
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !company_name) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and company name are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Generate unique broker code
    const brokerCode = `BRK${Date.now().toString().slice(-6)}`;

    const result = await runQuery(`
      INSERT INTO brokers (
        broker_code, first_name, last_name, email, phone, license_number,
        company_name, commission_rate, territory, specialization
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      brokerCode, first_name, last_name, email, phone, license_number,
      company_name, commission_rate || 0.05, territory, specialization
    ]);

    const newBroker = await getQuery('SELECT * FROM brokers WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, data: newBroker, message: 'Broker created successfully' });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ success: false, message: 'Email already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to create broker', error: error.message });
    }
  }
});

apiRoutes.put('/brokers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name, last_name, email, phone, license_number, company_name,
      commission_rate, territory, specialization, status
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !company_name) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and company name are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    await runQuery(`
      UPDATE brokers SET
        first_name = ?, last_name = ?, email = ?, phone = ?, license_number = ?,
        company_name = ?, commission_rate = ?, territory = ?, specialization = ?,
        status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      first_name, last_name, email, phone, license_number,
      company_name, commission_rate || 0.05, territory, specialization,
      status || 'active', id
    ]);

    const updatedBroker = await getQuery('SELECT * FROM brokers WHERE id = ?', [id]);
    res.json({ success: true, data: updatedBroker, message: 'Broker updated successfully' });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ success: false, message: 'Email already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update broker', error: error.message });
    }
  }
});

apiRoutes.delete('/brokers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if broker has associated policies
    const policies = await allQuery('SELECT id FROM policies WHERE broker_id = ?', [id]);
    if (policies.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete broker. They have ${policies.length} associated policies. Please reassign policies first.`
      });
    }

    await runQuery('DELETE FROM brokers WHERE id = ?', [id]);
    res.json({ success: true, message: 'Broker deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete broker', error: error.message });
  }
});

// Policy editing and management endpoints
apiRoutes.put('/policies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      policy_type, product_name, coverage_amount, premium_amount,
      deductible, policy_term, start_date, end_date, notes
    } = req.body;

    if (!policy_type || !product_name || !coverage_amount || !premium_amount || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Policy type, product name, coverage amount, premium amount, start date, and end date are required'
      });
    }

    const result = await runQuery(`
      UPDATE policies
      SET policy_type = ?, product_name = ?, coverage_amount = ?, premium_amount = ?,
          deductible = ?, policy_term = ?, start_date = ?, end_date = ?, notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [policy_type, product_name, coverage_amount, premium_amount, deductible, policy_term, start_date, end_date, notes, id]);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    const updatedPolicy = await getQuery(`
      SELECT p.*, c.first_name, c.last_name, c.customer_number
      FROM policies p
      JOIN customers c ON p.customer_id = c.id
      WHERE p.id = ?
    `, [id]);

    res.json({ success: true, data: updatedPolicy, message: 'Policy updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update policy', error: error.message });
  }
});

apiRoutes.put('/policies/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['submission', 'quoted', 'booked', 'declined', 'cancelled', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const result = await runQuery(`
      UPDATE policies
      SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, notes || '', id]);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    const updatedPolicy = await getQuery(`
      SELECT p.*, c.first_name, c.last_name, c.customer_number
      FROM policies p
      JOIN customers c ON p.customer_id = c.id
      WHERE p.id = ?
    `, [id]);

    res.json({ success: true, data: updatedPolicy, message: 'Policy status updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update policy status', error: error.message });
  }
});

apiRoutes.delete('/policies/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if policy has claims
    const claims = await allQuery('SELECT id FROM claims WHERE policy_id = ?', [id]);
    if (claims.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete policy with existing claims. Please handle claims first.'
      });
    }

    // Delete coverage details first (foreign key constraint)
    await runQuery('DELETE FROM coverage_details WHERE policy_id = ?', [id]);

    // Delete the policy
    const result = await runQuery('DELETE FROM policies WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    res.json({ success: true, message: 'Policy deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete policy', error: error.message });
  }
});

apiRoutes.put('/policies/:id/underwriting', async (req, res) => {
  try {
    const { id } = req.params;
    const { underwriting_status, risk_score, notes } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'requires_review'];
    if (!validStatuses.includes(underwriting_status)) {
      return res.status(400).json({
        success: false,
        message: `Underwriting status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const result = await runQuery(`
      UPDATE policies
      SET underwriting_status = ?, risk_score = ?, notes = ?,
          status = CASE WHEN ? = 'approved' THEN 'active' WHEN ? = 'rejected' THEN 'rejected' ELSE status END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [underwriting_status, risk_score, notes, underwriting_status, underwriting_status, id]);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    const updatedPolicy = await getQuery('SELECT * FROM policies WHERE id = ?', [id]);
    res.json({ success: true, data: updatedPolicy, message: 'Policy underwriting updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update policy underwriting', error: error.message });
  }
});

apiRoutes.get('/quotes', async (req, res) => {
  try {
    const { policy_type, coverage_amount, customer_age, risk_factors } = req.query;

    let baseRate = 100;

    if (policy_type === 'auto') baseRate = 150;
    else if (policy_type === 'home') baseRate = 120;
    else if (policy_type === 'life') baseRate = 80;

    const coverageMultiplier = Math.sqrt(parseFloat(coverage_amount as string) / 100000);
    const ageMultiplier = customer_age ? 1 + (parseFloat(customer_age as string) - 30) * 0.01 : 1;

    const estimatedPremium = baseRate * coverageMultiplier * ageMultiplier;

    res.json({
      success: true,
      data: {
        policy_type,
        coverage_amount: parseFloat(coverage_amount as string),
        estimated_premium: Math.round(estimatedPremium * 100) / 100,
        quote_id: `QTE${Date.now()}`,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to generate quote', error: error.message });
  }
});

// Admin Authentication
apiRoutes.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const admin = await getQuery(
      'SELECT * FROM admins WHERE username = ? AND password = ? AND is_active = 1',
      [username, password]
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const adminData = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      first_name: admin.first_name,
      last_name: admin.last_name,
      role: admin.role,
      is_super_admin: admin.is_super_admin
    };

    res.json({
      success: true,
      data: {
        admin: adminData,
        token: `admin-jwt-token-${Date.now()}`
      },
      message: 'Admin login successful'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

// Admin - Create Customer
apiRoutes.post('/admin/customers', async (req, res) => {
  try {
    const {
      email, password, first_name, last_name, date_of_birth, phone, address,
      city, state, zip_code, ssn, employment_status, annual_income, credit_score,
      kyc_status = 'pending', customer_type = 'individual', agent_id
    } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name, and last name are required'
      });
    }

    const customer_number = `CUST${Date.now()}`;

    const result = await runQuery(`
      INSERT INTO customers (
        customer_number, email, password, first_name, last_name, date_of_birth,
        phone, address, city, state, zip_code, ssn, employment_status,
        annual_income, credit_score, kyc_status, customer_type, agent_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      customer_number, email, password, first_name, last_name, date_of_birth,
      phone, address, city, state, zip_code, ssn, employment_status,
      annual_income, credit_score, kyc_status, customer_type, agent_id
    ]);

    const newCustomer = await getQuery('SELECT * FROM customers WHERE id = ?', [result.id]);

    res.status(201).json({
      success: true,
      data: newCustomer,
      message: 'Customer created successfully'
    });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ success: false, message: 'Customer with this email already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to create customer', error: error.message });
    }
  }
});

// Admin - Get All Customers with enhanced details
apiRoutes.get('/admin/customers', async (req, res) => {
  try {
    const customers = await allQuery(`
      SELECT c.*, a.first_name as agent_first_name, a.last_name as agent_last_name,
             COUNT(p.id) as policy_count, COUNT(cl.id) as claim_count
      FROM customers c
      LEFT JOIN agents a ON c.agent_id = a.id
      LEFT JOIN policies p ON c.id = p.customer_id
      LEFT JOIN claims cl ON c.id = cl.customer_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    res.json({ success: true, data: customers, count: customers.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch customers', error: error.message });
  }
});

// Admin - Update Customer
apiRoutes.put('/admin/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(id);

    await runQuery(`UPDATE customers SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);

    const updatedCustomer = await getQuery('SELECT * FROM customers WHERE id = ?', [id]);

    res.json({
      success: true,
      data: updatedCustomer,
      message: 'Customer updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update customer', error: error.message });
  }
});

// Admin - Delete Customer
apiRoutes.delete('/admin/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await runQuery('DELETE FROM customers WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete customer', error: error.message });
  }
});

apiRoutes.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/customers',
      'GET /api/customers/search',
      'POST /api/customers',
      'GET /api/customers/:id',
      'POST /api/auth/login',
      'GET /api/policies',
      'GET /api/policies/search',
      'GET /api/policies/:id',
      'POST /api/policies',
      'PUT /api/policies/:id',
      'PUT /api/policies/:id/status',
      'DELETE /api/policies/:id',
      'PUT /api/policies/:id/underwriting',
      'GET /api/claims',
      'GET /api/claims/:id',
      'POST /api/claims',
      'PUT /api/claims/:id/status',
      'GET /api/agents',
      'GET /api/quotes'
    ]
  });
});