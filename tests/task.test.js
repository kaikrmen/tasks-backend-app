const request = require("supertest");
const mongoose = require('mongoose');
const User = require("../models/User");
const Task = require("../models/Task");
const jwt = require("jsonwebtoken");
const app = require("../app");
const { MONGODB_URI, JWT_SECRET } = require("../config");

describe("Task Routes", () => {
  let token;
  let userId;

  // Conexión a MongoDB antes de todas las pruebas
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // Eliminar cualquier usuario duplicado con el mismo email
    await User.deleteMany({ email: "test4@example.com" });
    const user = await new User({
      email: "test4@example.com",
      password: "password123",
    }).save();
    userId = user._id;
    token = jwt.sign({ user: { id: user._id } }, JWT_SECRET, {
      expiresIn: "1h",
    });
  });

  // Limpiar datos entre pruebas
  beforeEach(async () => {
    await Task.deleteMany({});
    await User.deleteMany({ email: { $ne: "test4@example.com" } }); // Mantener solo el usuario de prueba
    await new Task({ title: "Test Task", user: userId }).save(); // Crear una tarea de ejemplo
  });

  // Cerrar la conexión a MongoDB al finalizar todas las pruebas
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Pruebas para POST /api/tasks
  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .set("x-auth-token", token)
        .send({
          title: "New Task",
          description: "New Description",
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("title", "New Task");
    });

    it("should not create a task without a title", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .set("x-auth-token", token)
        .send({
          description: "Test Description",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors[0].msg).toEqual("Title is required");
    });
  });

  // Pruebas para GET /api/tasks
  describe("GET /api/tasks", () => {
    it("should get all tasks", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("x-auth-token", token);
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  // Pruebas para GET /api/tasks/:id
  describe("GET /api/tasks/:id", () => {
    it("should get task by id", async () => {
      const task = await new Task({ title: "Test Task", user: userId }).save();
      const res = await request(app)
        .get(`/api/tasks/${task._id}`)
        .set("x-auth-token", token);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("title", "Test Task");
    });

    it("should return 404 if task not found", async () => {
      const res = await request(app)
        .get(`/api/tasks/${new mongoose.Types.ObjectId()}`)
        .set("x-auth-token", token);
      expect(res.statusCode).toEqual(404);
      expect(res.body.msg).toEqual("Task not found");
    });
  });

  // Pruebas para PUT /api/tasks/:id
  describe("PUT /api/tasks/:id", () => {
    it("should update task by id", async () => {
      const task = await new Task({ title: "Test Task", user: userId }).save();
      const res = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set("x-auth-token", token)
        .send({
          title: "Updated Task",
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("title", "Updated Task");
    });
  });

  // Pruebas para DELETE /api/tasks/:id
  describe('DELETE /api/tasks/:id', () => {
    it('should delete task by id', async () => {
      // Crear tarea con el mismo userId que el token
      const task = await new Task({ title: 'Test Task', user: userId }).save();
  
      // Eliminar la tarea
      const res = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('x-auth-token', token);
  
      // Verificar que la respuesta es correcta
      expect(res.statusCode).toEqual(200);
      expect(res.body.msg).toEqual('Task removed');
  
      // Verificar que la tarea ha sido eliminada
      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });
  });
  
});
