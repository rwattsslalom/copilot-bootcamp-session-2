const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('Edit task', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.addTask({ name: 'Original Task Name' });
    await expect(page.getByText('Original Task Name', { exact: true })).toBeVisible();
  });

  test('edits a task name', async ({ page }) => {
    await todoPage.clickEditOnTask('Original Task Name');
    await todoPage.saveEdit('Renamed Task');
    await expect(page.getByText('Renamed Task', { exact: true })).toBeVisible();
    await expect(page.getByText('Original Task Name', { exact: true })).not.toBeVisible();
  });

  test('cancels an edit without saving changes', async ({ page }) => {
    await todoPage.clickEditOnTask('Original Task Name');
    await page.locator('.task-edit').getByPlaceholder('Task name').fill('Should Not Save');
    await todoPage.cancelEdit();
    await expect(page.getByText('Original Task Name', { exact: true })).toBeVisible();
    await expect(page.getByText('Should Not Save', { exact: true })).not.toBeVisible();
  });

  test('edits the due date of a task', async ({ page }) => {
    await todoPage.addTask({ name: 'Task with date', dueDate: '2026-06-01' });
    await expect(page.getByText('Due: 2026-06-01')).toBeVisible();

    await todoPage.clickEditOnTask('Task with date');
    await page.locator('.task-edit').getByTitle('Due date (optional)').fill('2026-09-15');
    await page.locator('.task-edit').getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Due: 2026-09-15')).toBeVisible();
  });
});
