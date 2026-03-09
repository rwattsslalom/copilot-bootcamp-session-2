const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('Sub-tasks', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.addTask({ name: 'Parent Task' });
    await expect(page.getByText('Parent Task', { exact: true })).toBeVisible();
  });

  test('adds a sub-task to a task', async ({ page }) => {
    await todoPage.addSubTask('Parent Task', 'Child Step 1');
    await expect(page.getByText('Child Step 1', { exact: true })).toBeVisible();
  });

  test('adds multiple sub-tasks', async ({ page }) => {
    await todoPage.addSubTask('Parent Task', 'Step A');
    await todoPage.addSubTask('Parent Task', 'Step B');
    await expect(page.getByText('Step A', { exact: true })).toBeVisible();
    await expect(page.getByText('Step B', { exact: true })).toBeVisible();
  });

  test('marks a sub-task as complete', async ({ page }) => {
    await todoPage.addSubTask('Parent Task', 'Completable step');
    await todoPage.completeSubTask('Parent Task', 'Completable step');

    const taskLi = page.locator('li.task-item', { hasText: 'Parent Task' });
    const subTaskLi = taskLi.locator('li.sub-task-item', { hasText: 'Completable step' });
    await expect(subTaskLi).toHaveClass(/completed/);
  });

  test('deletes a sub-task', async ({ page }) => {
    await todoPage.addSubTask('Parent Task', 'Step to delete');
    await expect(page.getByText('Step to delete', { exact: true })).toBeVisible();

    await todoPage.deleteSubTask('Parent Task', 'Step to delete');
    await expect(page.getByText('Step to delete', { exact: true })).not.toBeVisible();
  });

  test('prompts to complete parent when all sub-tasks are done', async ({ page }) => {
    await todoPage.addSubTask('Parent Task', 'Only step');
    await todoPage.completeSubTask('Parent Task', 'Only step');
    await expect(page.getByText(/All sub-tasks are done/)).toBeVisible();
  });
});
