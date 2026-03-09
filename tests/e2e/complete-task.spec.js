const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('Complete task workflow', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('completes a task via the parent-complete prompt', async ({ page }) => {
    await todoPage.addTask({ name: 'Project milestone' });
    await todoPage.addSubTask('Project milestone', 'Design');
    await todoPage.addSubTask('Project milestone', 'Development');

    await todoPage.completeSubTask('Project milestone', 'Design');
    await todoPage.completeSubTask('Project milestone', 'Development');

    await expect(page.getByText(/All sub-tasks are done/)).toBeVisible();

    await page.getByRole('button', { name: 'Yes, mark complete' }).click();

    await expect(page.locator('li.task-item.completed', { hasText: 'Project milestone' })).toBeVisible();
  });

  test('dismisses the parent-complete prompt with Not yet', async ({ page }) => {
    await todoPage.addTask({ name: 'Ongoing project' });
    await todoPage.addSubTask('Ongoing project', 'Single step');
    await todoPage.completeSubTask('Ongoing project', 'Single step');

    await expect(page.getByText(/All sub-tasks are done/)).toBeVisible();

    await page.getByRole('button', { name: 'Not yet' }).click();

    await expect(page.getByText(/All sub-tasks are done/)).not.toBeVisible();
    await expect(page.locator('li.task-item.completed', { hasText: 'Ongoing project' })).not.toBeVisible();
  });
});
