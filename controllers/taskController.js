const Task = require("../models/Task");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description } = req.body;

  try {
    const newTask = new Task({
      title,
      description,
      user: req.user.id,
    });

    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const getTasks = async (req, res) => {
  const { completed } = req.query;

  try {
    const tasks = await Task.find({
      user: req.user.id,
      ...(completed && { completed }),
    });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const updateTask = async (req, res) => {
  const { title, description, completed } = req.body;

  const taskFields = {};
  if (title) taskFields.title = title;
  if (description) taskFields.description = description;
  if (typeof completed !== "undefined") taskFields.completed = completed;

  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: taskFields },
      { new: true }
    );

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid ID" });
    }

    const task = await Task.findById(id)
    if (!task) {
      console.error("Task not found for ID:", id);
      return res.status(404).json({ msg: "Task not found" });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await Task.findByIdAndDelete(id)
    res.json({ msg: "Task removed" });
  } catch (err) {
    console.error("Server error in deleteTask:", err.message);
    res.status(500).send("Server error");
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask };
