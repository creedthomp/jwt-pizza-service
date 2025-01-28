const request = require('supertest');
const app = require('../service');
const { register } = require('module');

const testUser = {name:'pizza diner', email: 'reg@test.com', password: 'a'}
let testUserAuthToken;
let registerRes;

// Registers a random user every time the test run
beforeAll(async () => {
    testUser.email = Math.random().toString(36).substring(2,12) + '@test.com';
    registerRes = await request(app).post('/api/auth').send(testUser);
    testUserAuthToken = registerRes.body.token;
    expectValidJwt(testUserAuthToken);
});

// Logs in a user and verifies an auth token is returned 
test('login', async() => {
    const loginRes = await request(app).put('/api/auth').send(testUser);
    expect(loginRes.status).toBe(200);
    expectValidJwt(loginRes.body.token);

    const expectedUser = {...testUser, roles: [{role: 'diner'}]};
    delete expectedUser.password;
    expect(loginRes.body.user).toMatchObject(expectedUser);
});


test('Update user', async() => {

    const updateRes = await request(app)
    .put(`/api/auth/${registerRes.body.user.id}`)
    .set('Authorization', `Bearer ${testUserAuthToken}`)
    .send({
      email: "new@gmail.com",
      password: 'newpassword',
    });


    expect(updateRes.status).toBe(200);
    expect(updateRes.body.email).toBe('new@gmail.com');
});


test('logout', async() => {
    const logoutRes = await request(app).delete('/api/auth').set('Authorization', `Bearer ${testUserAuthToken}`);
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.message).toBe('logout successful');
});

function expectValidJwt(potentialJwt) {
    expect(potentialJwt).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
}
