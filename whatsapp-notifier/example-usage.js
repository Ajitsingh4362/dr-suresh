// example-usage.js
// This shows how your friend's task-management app (or any app) would
// call the notifier server whenever a task is assigned or rejected.
// This is just a reference — you'd put similar calls inside the actual
// task app's backend, right where the task status changes.

async function notify(number, message) {
  const res = await fetch('http://localhost:3001/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ number, message }),
  })
  return res.json()
}

// ── Example 1: Task assigned ──
async function onTaskAssigned(task) {
  const testNumber = '917255049328' // testing number — swap for the real assignee's number later
  await notify(
    testNumber,
    `📋 New Task Assigned\n\n*${task.title}*\n${task.description}\n\nDue: ${task.dueDate}`
  )
}

// ── Example 2: Task rejected ──
async function onTaskRejected(task, reason) {
  const testNumber = '917255049328'
  await notify(
    testNumber,
    `❌ Task Rejected\n\n*${task.title}*\nReason: ${reason || 'No reason given'}`
  )
}

// ── Example 3: Task completed ──
async function onTaskCompleted(task) {
  const testNumber = '917255049328'
  await notify(
    testNumber,
    `✅ Task Completed\n\n*${task.title}* has been marked done.`
  )
}

// Demo run (uncomment to test manually):
// onTaskAssigned({ title: 'Fix login bug', description: 'Users cannot log in on mobile', dueDate: '28 July' })
