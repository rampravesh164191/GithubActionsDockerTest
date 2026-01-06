const express = require("express");
const TodoModel = require("../models/todo.model");
const authMiddleware = require("../middlewares/auth.middleware");
const TodoRouter = express.Router();

//protected swagger test
//use the authorize button on the UI and only paste the key in the authorize
//do the add todo - done
/**
 * @swagger
 * /todos/add-todo:
 *   post:
 *     summary: Add todos
 *     tags:
 *       - Todos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Buy groceries"
 *               status:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Todo added successfully
 *       500:
 *         description: failed adding todo
 */


//make it protected : only valid user can see
//  TodoRouter.post("/add-todo", authMiddleware("user")
TodoRouter.post("/add-todo", authMiddleware(["user","admin"]), async (req, res)=>{
    //this route is protected route  
    //only authenticated or logged in user are allowed  
    console.log(req.user, "i am req.user");
    try{
        //attached the userId from authmiddleware
        let todo = await TodoModel.create({...req.body, userId:req.user});
        res.status(200).json({msg : "Todo added", todo})
    }catch(err){
        res.status(500).json({mag: "failed adding todo",err})
    }
})

//all todo
/**
 * @swagger
 * /todos/allTodos:
 *   post:
 *     summary: get all the logged in user todos
 *     tags:
 *       - Todos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: fetched all the todos successfully
 *       500:
 *         description: failed adding todo
 */

TodoRouter.get("/allTodos", authMiddleware(["user","admin"]), async (req, res)=>{
    try{
        let todos = await TodoModel.find({userId:req.user});
        res.status(200).json({msg : "Todos list", todos})
    }catch(err){
        res.status(500).json({mag: "failed adding todo",err})
    }
})

TodoRouter.delete("/delete-todo/:id", authMiddleware(["user", "admin"]), async (req, res)=>{
    try{
        const {id} = req.params;
        await TodoModel.findByIdAndDelete(id);
        res.status(200).json({msg : "todo deleted"})
    }catch(err){
        res.status(500).json({msg : "Couldn't delete todo", err})
    }
})

TodoRouter.patch("/update-todo/:id", authMiddleware(["user", "admin"]), async (req, res)=>{
    try{
        const {id} = req.params;
        await TodoModel.findByIdAndUpdate(id, req.body);
        res.status(200).json({msg : "todo updated"})
    }catch(err){
        res.status(500).json({msg : "Error updating todo", err})
    }
})

module.exports = TodoRouter; 