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

test('Create a franchise and delete a franchise', async() => {
    let admin  = await createAdminUser();
    let adminRes = await request(app).put('/api/auth').send({
        email: admin.email,
        password: 'toomanysecrets' // Using the same password set in createAdminUser
    });
    let adminAuthToken = adminRes.body.token;
    // create
    const createRes = await request(app).get('/api/franchise').set('Authorization', `Bearer ${adminAuthToken}`).send('{"name": "pizzaPocket", "admins": [{"email": "f@jwt.com"}]}');
    expect(createRes.status).toBe(200);
    //console.log("the body of the franchise created is:", createRes) // need to figure out how to get the id this is the bodybody: [ { id: 1, name: 'pizzaPocket', admins: [Array], stores: [Array] } ],
    // delete 
    const deleteRes = await request(app).delete(`/api/franchise/${createRes.body.id}`)
    expect(deleteRes.body.message).toBe('franchise deleted');
})