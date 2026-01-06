const request = require('supertest');
const app = require('../app');


test("First API test", async ()=>{
    let res = await request(app).get("/test"); //supertest
    expect(res.statusCode).toBe(200); //jest
    expect(res.body.msg).toBe("this is a test route") //jest
})