const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('Add task', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('adds a task with a name only', async ({ page }) => {
    await todoPage.addTask({ name: 'Walk the dog' });
    await expect(page.getByText('Walk the dog', { exact: true })).toBeVisible();
  });

  test('adds a task with a description and due date', async ({ page }) => {
    await todoPage.addTask({
      name: 'Send report',
      description: 'Monthly summary',
      dueDate: '2026-12-31',
    });
    await expect(page.getByText('Send report', { exact: true })).toBeVisible();
    await expect(page.getByText('Monthly summary')).toBeVisible();
    await expect(page.getByText('Due: 2026-12-31')).toBeVisible();
  });

  test('does not add a task when the name is empty', async ({ page }) => {
    const before = await page.locator('li.task-item').count();
    await todoPage.addTaskButton.click();
    const after = await page.locator('li.task-item').count();
    expect(after).toBe(before);
  });
});
