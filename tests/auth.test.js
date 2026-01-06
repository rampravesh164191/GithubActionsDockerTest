const request = require('supertest');
const app = require('../app');


//Signup and login - integration test
//describe means group of linked test : Integration test
describe("User Auth Tests", () => {
    //Signup test
    test("Signup test", async () => {
        let res = await request(app).post("/users/signup").send(
            { email: "alice@gmail.com", password: "pass123" }
        )
        expect(res.statusCode).toBe(201)
        expect(res.body.msg).toBe("Signup Success")
    })

    //login test
    test("Login test", async () => {
        let res = await request(app).post("/users/login").send(
            { email: "alice@gmail.com", password: "pass123" }
        )
        expect(res.statusCode).toBe(200)
        expect(res.body.msg).toBe("login success")
        //access token
        expect(res.body.accessToken).toBeDefined();
    })
})

