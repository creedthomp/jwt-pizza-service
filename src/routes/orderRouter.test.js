const request = require('supertest');
const app = require('../service');
const { register } = require('module');
const { Role, DB } = require('../database/database.js');

const testUser = {name:'pizza diner', email: 'reg@test.com', password: 'a'}
let testUserAuthToken;


beforeAll(async () => {
    testUser.email = Math.random().toString(36).substring(2,12) + '@test.com';
    registerRes = await request(app).post('/api/auth').send(testUser);
    testUserAuthToken = registerRes.body.token;
    expectValidJwt(testUserAuthToken);
});


test('Get menu', async() => {
    const menuRes = (await request(app).get('/api/order/menu'));
    expect(menuRes.body).toContainEqual({
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight'
      })
})

test('Add menu item', async() => {
    let admin  = await createAdminUser();
    let adminRes = await request(app).put('/api/auth').send({
        email: admin.email,
        password: 'toomanysecrets' // Using the same password set in createAdminUser
    });
    let adminAuthToken = adminRes.body.token;
    const menuRes = await request(app).put('/api/order/menu').set('Authorization', `Bearer ${adminAuthToken}`).send({ title:"Student", description: "No topping, no sauce, just carbs", image:"pizza9.png", price: 0.0001 });
    
    expect(menuRes.body).toEqual(expect.arrayContaining([expect.objectContaining({title:"Student", description: "No topping, no sauce, just carbs", image:"pizza9.png", price: 0.0001})]));
});


test('Create order ', async() => {
    const orderRes = await request(app).post('/api/order').send('{"franchiseId": 1, "storeId":1, "items":[{ "menuId": 1, "description": "Veggie", "price": 0.05 }]}').set('Authorization', `Bearer ${testUserAuthToken}`);
    expect(orderRes.body.order).toBe('{"franchiseId": 1, "storeId":1, "items":[{ "menuId": 1, "description": "Veggie", "price": 0.05 }]}');
});


function randomName() {
    return Math.random().toString(36).substring(2, 12);
  }


async function createAdminUser() {
    let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
    user.name = randomName();
    user.email = user.name + '@admin.com';
  
    user = await DB.addUser(user);
    return { ...user, password: 'toomanysecrets' };
  }

  function expectValidJwt(potentialJwt) {
    expect(potentialJwt).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
}

//   async function loginUser() {
//     testUser.email = Math.random().toString(36).substring(2,12) + '@test.com';
//     registerRes = await request(app).post('/api/auth').send(testUser);
//     testUserAuthToken = registerRes.body.token;
//     expectValidJwt(testUserAuthToken);
// }