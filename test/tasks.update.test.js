const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { app } = require("../src/app");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

function patchTask(id, body) {
  return fetch(`${baseUrl}/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body)
  });
}

async function createTask(title) {
  const res = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title })
  });
  return res.json();
}

test("PATCH /tasks/:id marks an existing task as completed", async () => {
  const created = await createTask("Task to complete");

  const res = await patchTask(created.id, { completed: true });
  assert.equal(res.status, 200);

  const task = await res.json();
  assert.equal(task.id, created.id);
  assert.equal(task.title, "Task to complete");
  assert.equal(task.completed, true);
});

test("PATCH /tasks/:id can mark a task as not completed again", async () => {
  const created = await createTask("Task to reopen");
  await patchTask(created.id, { completed: true });

  const res = await patchTask(created.id, { completed: false });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).completed, false);
});

test("updated task is returned by GET /tasks", async () => {
  const created = await createTask("Persisted task");
  await patchTask(created.id, { completed: true });

  const tasks = await (await fetch(`${baseUrl}/tasks`)).json();
  const task = tasks.find((t) => t.id === created.id);
  assert.equal(task.completed, true);
});

test("PATCH /tasks/:id returns 404 for an unknown task", async () => {
  const res = await patchTask(999999, { completed: true });
  assert.equal(res.status, 404);
});

test("PATCH /tasks/:id returns 400 when completed is not a boolean", async () => {
  const created = await createTask("Task with invalid update");

  for (const body of [{}, { completed: "true" }, { completed: 1 }, { completed: null }]) {
    const res = await patchTask(created.id, body);
    assert.equal(res.status, 400, `expected 400 for ${JSON.stringify(body)}`);
  }
});

test("PATCH /tasks/:id returns 400 for a non-numeric id", async () => {
  const res = await patchTask("abc", { completed: true });
  assert.equal(res.status, 400);
});

test("PATCH /tasks/:id returns 400 for malformed JSON", async () => {
  const created = await createTask("Task with malformed body");

  const res = await patchTask(created.id, "{ completed: true");
  assert.equal(res.status, 400);
});
