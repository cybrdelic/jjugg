// Simple test script to verify reminders data service integration
const { reminderService } = require('./lib/dataService');

console.log('Testing reminder service...');

try {
    // Test getting all reminders
    const allReminders = reminderService.getAll();
    console.log('Total reminders:', allReminders.length);

    // Test getting pending reminders
    const pendingReminders = reminderService.getPending();
    console.log('Pending reminders:', pendingReminders.length);

    // Test getting completed reminders
    const completedReminders = reminderService.getCompleted();
    console.log('Completed reminders:', completedReminders.length);

    // Test creating a new reminder
    const newReminder = reminderService.create({
        title: 'Test Reminder',
        description: 'This is a test reminder',
        dueDate: new Date(),
        priority: 'medium',
        status: 'pending'
    });
    console.log('Created reminder:', newReminder.id);

    // Test updating reminder
    const updatedReminder = reminderService.update(newReminder.id, {
        title: 'Updated Test Reminder'
    });
    console.log('Updated reminder title:', updatedReminder?.title);

    // Test deleting reminder
    const deleted = reminderService.delete(newReminder.id);
    console.log('Deleted reminder:', deleted);

    console.log('All tests passed!');
} catch (error) {
    console.error('Test failed:', error);
}
