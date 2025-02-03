const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');
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
    const franchise =  {name: "creedspizzaria", admins: [{email: admin.email}]}
    const createRes = await request(app).post('/api/franchise').set('Authorization', `Bearer ${adminAuthToken}`).send(franchise);
    expect(createRes.status).toBe(200);

    //console.log("the body of the franchise created is:", createRes) // need to figure out how to get the id this is the bodybody: [ { id: 1, name: 'pizzaPocket', admins: [Array], stores: [Array] } ],
    // delete 
    const deleteRes = await request(app).delete(`/api/franchise/${createRes.body.id}`).set('Authorization', `Bearer ${adminAuthToken}`);
    expect(deleteRes.body.message).toBe('franchise deleted');
})


test('create a store and delete a store', async() =>{
    let admin  = await createAdminUser();
    let adminRes = await request(app).put('/api/auth').send({
        email: admin.email,
        password: 'toomanysecrets' // Using the same password set in createAdminUser
    });
    let adminAuthToken = adminRes.body.token;

    // craete a franchise
    const franchise =  {name: "creedspizzaria", admins: [{email: admin.email}]}
    const createRes = await request(app).post('/api/franchise').set('Authorization', `Bearer ${adminAuthToken}`).send(franchise);
    const response = await request(app).get('/api/franchise');
    //let franchiseid = response.body[0].id; // the first franchise in the list
    

    let createStore = {franchiseId: response.body[0].id, name: "newstore" }
    const storeRes = await request(app).post(`/api/franchise/${response.body[0].id}/store`).set('Authorization', `Bearer ${adminAuthToken}`).send(createStore);
    expect(storeRes.status).toBe(200)

    let storeid = storeRes.body.id
    const deleteRes = request(app).delete(`/api/franchise/${response.body[0].id}/store/${storeid}`).set('Authorization', `Bearer ${adminAuthToken}`)
    expect((await deleteRes).body.message).toBe('store deleted')

    // delete franchise
    const deleted = await request(app).delete(`/api/franchise/${createRes.body.id}`).set('Authorization', `Bearer ${adminAuthToken}`);
    expect(deleted.body.message).toBe('franchise deleted');

})



function expectValidJwt(potentialJwt) {
    expect(potentialJwt).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
}
async function createAdminUser() {
    let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
    user.name = randomName();
    user.email = user.name + '@admin.com';
  
    user = await DB.addUser(user);
    return { ...user, password: 'toomanysecrets' };
  }

function randomName() {
    return Math.random().toString(36).substring(2, 12);
  }