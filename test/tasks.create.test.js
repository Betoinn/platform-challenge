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

function postTask(body) {
  return fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

test("POST /tasks creates a task and returns it with 201", async () => {
  const res = await postTask({ title: "Write CI workflow" });
  assert.equal(res.status, 201);

  const task = await res.json();
  assert.equal(typeof task.id, "number");
  assert.equal(task.title, "Write CI workflow");
  assert.equal(task.completed, false);
});

test("POST /tasks generates unique ids", async () => {
  const a = await (await postTask({ title: "Task A" })).json();
  const b = await (await postTask({ title: "Task B" })).json();
  assert.notEqual(a.id, b.id);
});

test("POST /tasks returns 400 for an empty or missing title", async () => {
  for (const body of [{ title: "" }, { title: "   " }, {}]) {
    const res = await postTask(body);
    assert.equal(res.status, 400, `expected 400 for ${JSON.stringify(body)}`);
  }
});

test("created task appears in GET /tasks", async () => {
  const created = await (await postTask({ title: "Visible task" })).json();
  const tasks = await (await fetch(`${baseUrl}/tasks`)).json();
  assert.ok(tasks.some((task) => task.id === created.id));
});