class TodoPage {
  constructor(page) {
    this.page = page;
  }

  // ── Navigation ─────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/');
  }

  // ── Add task form ──────────────────────────────────────────────

  get nameInput() {
    return this.page.getByPlaceholder('Task name');
  }

  get descriptionInput() {
    return this.page.getByPlaceholder('Description (optional)');
  }

  get dueDateInput() {
    return this.page.getByTitle('Due date (optional)');
  }

  get addTaskButton() {
    return this.page.getByRole('button', { name: 'Add Task' });
  }

  async addTask({ name, description = '', dueDate = '' } = {}) {
    await this.nameInput.fill(name);
    if (description) await this.descriptionInput.fill(description);
    if (dueDate) await this.dueDateInput.fill(dueDate);
    await this.addTaskButton.click();
  }

  // ── Task list ──────────────────────────────────────────────────

  get sortSelect() {
    return this.page.getByRole('combobox');
  }

  async sortBy(value) {
    await this.sortSelect.selectOption(value);
  }

  taskItem(name) {
    return this.page.getByText(name, { exact: true });
  }

  // ── Task actions ───────────────────────────────────────────────

  async clickEditOnTask(name) {
    const taskLi = this.page.locator('li.task-item', { hasText: name });
    await taskLi.getByRole('button', { name: 'Edit' }).first().click();
  }

  async clickDeleteOnTask(name) {
    const taskLi = this.page.locator('li.task-item', { hasText: name });
    await taskLi.getByRole('button', { name: 'Delete' }).first().click();
  }

  async saveEdit(newName) {
    await this.page.getByPlaceholder('Task name').fill(newName);
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async cancelEdit() {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }

  // ── Sub-tasks ──────────────────────────────────────────────────

  async openSubTasks(taskName) {
    const taskLi = this.page.locator('li.task-item', { hasText: taskName });
    const toggleBtn = taskLi.getByRole('button', { name: /Sub-tasks/ });
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
    }
  }

  async addSubTask(parentName, subTaskName) {
    const taskLi = this.page.locator('li.task-item', { hasText: parentName });
    await taskLi.getByRole('button', { name: '+ Add sub-task' }).click();
    await taskLi.getByPlaceholder('Sub-task name').fill(subTaskName);
    await taskLi.getByRole('button', { name: 'Add' }).click();
  }

  async completeSubTask(parentName, subTaskName) {
    const taskLi = this.page.locator('li.task-item', { hasText: parentName });
    const subTaskLi = taskLi.locator('li.sub-task-item', { hasText: subTaskName });
    await subTaskLi.getByRole('checkbox').check();
  }

  async deleteSubTask(parentName, subTaskName) {
    const taskLi = this.page.locator('li.task-item', { hasText: parentName });
    const subTaskLi = taskLi.locator('li.sub-task-item', { hasText: subTaskName });
    await subTaskLi.getByRole('button', { name: 'Delete' }).click();
  }
}

module.exports = { TodoPage };
