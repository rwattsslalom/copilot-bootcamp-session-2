const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('Sort tasks', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.addTask({ name: 'Alpha Task' });
    await todoPage.addTask({ name: 'Beta Task' });
    await todoPage.addTask({ name: 'Gamma Task' });
  });

  test('sorts tasks by title A–Z', async ({ page }) => {
    await todoPage.sortBy('name_asc');
    const names = await page.locator('li.task-item .task-name').allTextContents();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  test('sorts tasks by title Z–A', async ({ page }) => {
    await todoPage.sortBy('name_desc');
    const names = await page.locator('li.task-item .task-name').allTextContents();
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sorted);
  });

  test('sort dropdown shows all options', async ({ page }) => {
    const options = await todoPage.sortSelect.locator('option').allTextContents();
    expect(options).toContain('Newest first');
    expect(options).toContain('Oldest first');
    expect(options).toContain('Due date (soonest)');
    expect(options).toContain('Due date (latest)');
    expect(options).toContain('Title A–Z');
    expect(options).toContain('Title Z–A');
  });
});
