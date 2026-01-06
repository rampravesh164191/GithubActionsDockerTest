const request = require('supertest');
const app = require('../app');


describe("todo routes test", () => {
    let token;
    //Signup test
    test("register user", async () => {
        await request(app).post("/users/signup").send(
            { email: "bob@gmail.com", password: "pass123" }
        )
    })

    //login test
        test("Login User", async () => {
            let res = await request(app).post("/users/login").send(
                { email: "bob@gmail.com", password: "pass123" }
            )
            console.log("token",res.body.accessToken)
            token = res.body.accessToken;
        })
    
    //test add todo
    test("Add todo", async ()=>{
        let res = await request(app).post("/todos/add-todo").set({authorization : `bearer ${token}`}).send({title : "todo from testing"})
        expect(res.statusCode).toBe(200);
        expect(res.body.todo.title).toBe("todo from testing")
        console.log("response",res.body.todo)
    })
})