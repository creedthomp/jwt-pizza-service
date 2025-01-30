const request = require('supertest');
const app = require('../service');
const { register } = require('module');
const { Role, DB } = require('../database/database.js');
const testUser = {name:'pizza diner', email: 'reg@test.com', password: 'a'}
let testUserAuthToken;
let adminAuthToken;
let registerRes;
let franchiseid;
let store;

// Registers a random user every time the test run
beforeAll(async () => {
    testUser.email = Math.random().toString(36).substring(2,12) + '@test.com';
    registerRes = await request(app).post('/api/auth').send(testUser);
    testUserAuthToken = registerRes.body.token;
    expectValidJwt(testUserAuthToken);
});
test('Get the franchises', async() => {
    const response = await request(app).get('/api/franchise');
    expect(response.status).toBe(200);
});

test('Get user franchises', async() => {
    const response = await request(app).get(`/api/franchise/${registerRes.body.user.id}`).set('Authorization', `Bearer ${testUserAuthToken}`);
    expect(response.status).toBe(200);
    // write another expect
});