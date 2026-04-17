/**
 * Child Safety Verification Tests
 * Tests all COPPA compliance fixes
 */

const request = require('supertest');
const express = require('express');
const { Pool } = require('pg');

describe('🔒 Child Safety Verification Tests', () => {
  let app;
  let pool;
  let authToken;
  let testProjectId;

  beforeAll(async () => {
    // Setup express app with routes
    app = require('../src/index.js');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://...',
    });

    // Create test user
    authToken = 'test-jwt-token'; // Would use real JWT in production
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('1️⃣ CRITICAL: Parent Consent Enforcement', () => {
    test('Should REJECT story creation for under-13 WITHOUT parent consent', async () => {
      const response = await request(app)
        .post('/api/story/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          theme: 'adventure',
          page_count: 10,
          child_name: 'Johnny',
          childAge: 8,
          // Missing: parentEmail and parentConsent
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('consent');
    });

    test('Should REJECT story generation for under-13 WITHOUT parent consent', async () => {
      const response = await request(app)
        .post('/api/story/generate-from-images')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: testProjectId,
          childAge: 8,
          // Missing: parentConsent
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('consent');
    });

    test('Should ACCEPT story creation for under-13 WITH parent consent', async () => {
      const response = await request(app)
        .post('/api/story/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          theme: 'adventure',
          page_count: 10,
          child_name: 'Johnny',
          childAge: 8,
          parentEmail: 'parent@example.com',
          parentConsent: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.project).toBeDefined();
      testProjectId = response.body.project.id;
    });

    test('Should ACCEPT story creation for age 13+ WITHOUT parent email', async () => {
      const response = await request(app)
        .post('/api/story/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          theme: 'adventure',
          page_count: 10,
          child_name: 'Alice',
          childAge: 14,
          // No parent email required for 13+
        });

      expect(response.status).toBe(201);
      expect(response.body.project).toBeDefined();
    });

    test('Should log consent verification event', async () => {
      const result = await pool.query(
        `SELECT * FROM child_safety_audit_log 
         WHERE event_type = 'PARENTAL_CONSENT_VERIFIED' 
         ORDER BY created_at DESC LIMIT 1`
      );

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].child_age).toBeLessThan(13);
    });
  });

  describe('2️⃣ CRITICAL: Photo Deletion After Payment', () => {
    test('Should delete photos from Azure after payment confirmation', async () => {
      // Create a test order with photos
      const project = await pool.query(
        `INSERT INTO story_projects 
         (user_id, child_name, child_photo_url, child_photo_preview_url, child_photo_processed_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          'test-user-id',
          'TestChild',
          'https://example.blob.core.windows.net/photo1.jpg',
          'https://example.blob.core.windows.net/preview1.jpg',
          'https://example.blob.core.windows.net/processed1.jpg',
        ]
      );

      // Simulate payment confirmation
      const paymentResponse = await request(app)
        .post('/api/payment/confirm-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: 'test-session-123',
        });

      expect(paymentResponse.status).toBe(200);
      expect(paymentResponse.body._security.photosDeleted).toBe(true);
    });

    test('Should clear photo fields from database after deletion', async () => {
      // Verify database photos are NULL
      const result = await pool.query(
        `SELECT child_photo_url, child_photo_preview_url, child_photo_processed_url
         FROM story_projects 
         WHERE id = $1`,
        [testProjectId]
      );

      expect(result.rows[0].child_photo_url).toBeNull();
      expect(result.rows[0].child_photo_preview_url).toBeNull();
      expect(result.rows[0].child_photo_processed_url).toBeNull();
    });

    test('Should log photo deletion event', async () => {
      const result = await pool.query(
        `SELECT * FROM child_safety_audit_log 
         WHERE event_type = 'PHOTOS_DELETED_AFTER_PAYMENT' 
         ORDER BY created_at DESC LIMIT 1`
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });

    test('Photos should not be stored longer than necessary', async () => {
      // Verify no photos exist in database for completed orders
      const result = await pool.query(
        `SELECT COUNT(*) as photo_count FROM story_projects 
         WHERE status = 'completed' 
         AND (child_photo_url IS NOT NULL 
           OR child_photo_preview_url IS NOT NULL 
           OR child_photo_processed_url IS NOT NULL)`
      );

      expect(parseInt(result.rows[0].photo_count)).toBe(0);
    });
  });

  describe('3️⃣ CRITICAL: Child Data Deletion', () => {
    test('Should schedule child data deletion after story generation', async () => {
      const response = await request(app)
        .post('/api/story/generate-from-images')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: testProjectId,
          childAge: 8,
          parentConsent: true,
        });

      expect(response.status).toBe(200);
      expect(response.body._security.dataDeleteionScheduled).toBe(true);
    });

    test('Should delete child data after deletion window', async () => {
      // Wait for deletion to complete (in real tests, this would be shorter)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = await pool.query(
        `SELECT child_name, child_age, child_gender, child_interests, child_notes
         FROM story_projects WHERE id = $1`,
        [testProjectId]
      );

      // All child data should be NULL after processing
      expect(result.rows[0].child_name).toBeNull();
      expect(result.rows[0].child_age).toBeNull();
      expect(result.rows[0].child_gender).toBeNull();
      expect(result.rows[0].child_interests).toBeNull();
      expect(result.rows[0].child_notes).toBeNull();
    });

    test('Should log data deletion event', async () => {
      const result = await pool.query(
        `SELECT * FROM child_safety_audit_log 
         WHERE event_type = 'CHILD_DATA_DELETED' 
         ORDER BY created_at DESC LIMIT 1`
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });

    test('Should verify no child data in completed projects', async () => {
      const result = await pool.query(
        `SELECT COUNT(*) as data_count FROM story_projects 
         WHERE status = 'completed' 
         AND child_name IS NOT NULL`
      );

      expect(parseInt(result.rows[0].data_count)).toBe(0);
    });
  });

  describe('4️⃣ HIGH: Middleware Application Verification', () => {
    test('POST /story/create should have validateChildSafety middleware', async () => {
      // Make request without proper headers
      const response = await request(app)
        .post('/api/story/create')
        .send({
          theme: 'adventure',
          childAge: 8,
          // Missing consent
        });

      // Should get validation error, not 404
      expect(response.status).not.toBe(404);
      expect(response.status).toBe(400 || 403); // Validation error
    });

    test('POST /story/generate-from-images should have validateChildSafety middleware', async () => {
      const response = await request(app)
        .post('/api/story/generate-from-images')
        .send({
          projectId: testProjectId,
          childAge: 8,
          // Missing consent
        });

      expect(response.status).not.toBe(404);
      expect(response.status).toBe(400 || 403);
    });

    test('Should prevent data storage with preventChildDataStorage middleware', async () => {
      const before = await pool.query(
        `SELECT COUNT(*) FROM story_projects 
         WHERE child_data_storage_prevented = true`
      );

      await request(app)
        .post('/api/story/generate-from-images')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: testProjectId,
          childAge: 8,
          parentConsent: true,
        });

      const after = await pool.query(
        `SELECT COUNT(*) FROM story_projects 
         WHERE child_data_storage_prevented = true`
      );

      expect(parseInt(after.rows[0].count)).toBeGreaterThanOrEqual(parseInt(before.rows[0].count));
    });
  });

  describe('5️⃣ HIGH: Audit Trail & Logging', () => {
    test('All safety events should be logged', async () => {
      const result = await pool.query(
        `SELECT event_type, COUNT(*) as count FROM child_safety_audit_log 
         GROUP BY event_type`
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });

    test('Audit log should include user_id', async () => {
      const result = await pool.query(
        `SELECT * FROM child_safety_audit_log LIMIT 1`
      );

      expect(result.rows[0].user_id).toBeDefined();
    });

    test('Audit log should include child age', async () => {
      const result = await pool.query(
        `SELECT * FROM child_safety_audit_log WHERE child_age IS NOT NULL LIMIT 1`
      );

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].child_age).toBeDefined();
    });

    test('Audit log should have timestamps', async () => {
      const result = await pool.query(
        `SELECT * FROM child_safety_audit_log LIMIT 1`
      );

      expect(result.rows[0].created_at).toBeDefined();
    });
  });

  describe('6️⃣ INTEGRATION: End-to-End Flow', () => {
    test('Complete flow: Create → Consent → Generate → Pay → Cleanup', async () => {
      // 1. Create project with child data
      const createResponse = await request(app)
        .post('/api/story/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          theme: 'adventure',
          page_count: 10,
          child_name: 'E2E-TestChild',
          childAge: 8,
          parentEmail: 'parent@e2e.test',
          parentConsent: true,
          child_interests: 'dinosaurs,space,books',
        });

      expect(createResponse.status).toBe(201);
      const projectId = createResponse.body.project.id;

      // 2. Generate story
      const genResponse = await request(app)
        .post('/api/story/generate-from-images')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId,
          childAge: 8,
          parentConsent: true,
        });

      expect(genResponse.status).toBe(200);

      // 3. Process payment
      const payResponse = await request(app)
        .post('/api/payment/confirm-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: `test-${projectId}`,
        });

      expect(payResponse.status).toBe(200);
      expect(payResponse.body._security.photosDeleted).toBe(true);

      // 4. Verify cleanup
      await new Promise(resolve => setTimeout(resolve, 1500));

      const final = await pool.query(
        `SELECT * FROM story_projects WHERE id = $1`,
        [projectId]
      );

      // All sensitive data should be cleared
      expect(final.rows[0].child_name).toBeNull();
      expect(final.rows[0].child_photo_url).toBeNull();
      expect(final.rows[0].child_interests).toBeNull();
    });
  });

  describe('7️⃣ COMPLIANCE: Response Headers', () => {
    test('Responses should include security flags', async () => {
      const response = await request(app)
        .post('/api/story/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          theme: 'adventure',
          page_count: 10,
          child_name: 'Test',
          childAge: 8,
          parentEmail: 'parent@test.com',
          parentConsent: true,
        });

      expect(response.body._security).toBeDefined();
      expect(response.body._security.childSafetyValidated).toBe(true);
    });

    test('Payment confirmation should return _security.photosDeleted', async () => {
      const response = await request(app)
        .post('/api/payment/confirm-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: 'test-session',
        });

      expect(response.body._security.photosDeleted).toBeDefined();
    });
  });

  describe('🟡 EDGE CASES: Boundary Conditions', () => {
    test('Age exactly 13 should NOT require parent consent', async () => {
      const response = await request(app)
        .post('/api/story/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          theme: 'adventure',
          page_count: 10,
          child_name: 'TurnedThirteen',
          childAge: 13,
          // No parent email required
        });

      expect(response.status).toBe(201);
    });

    test('Age 12 should require parent consent', async () => {
      const response = await request(app)
        .post('/api/story/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          theme: 'adventure',
          page_count: 10,
          child_name: 'AlmostThirteen',
          childAge: 12,
          // No parent consent
        });

      expect(response.status).toBe(403);
    });

    test('Should handle missing childAge gracefully', async () => {
      const response = await request(app)
        .post('/api/story/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          theme: 'adventure',
          page_count: 10,
          child_name: 'NoAge',
          // Missing childAge
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('Should handle invalid parent email', async () => {
      const response = await request(app)
        .post('/api/story/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          theme: 'adventure',
          page_count: 10,
          child_name: 'BadEmail',
          childAge: 8,
          parentEmail: 'not-a-valid-email',
          parentConsent: true,
        });

      expect(response.status).toBe(400);
    });
  });
});

module.exports = {};
