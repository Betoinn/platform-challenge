const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { app } = require("../src/app");

test("GET /tasks returns 200 with an array of tasks", async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/tasks`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);

    for (const task of body) {
      assert.ok("id" in task);
      assert.ok("title" in task);
      assert.ok("completed" in task);
    }
  } finally {
    server.close();
  }
});