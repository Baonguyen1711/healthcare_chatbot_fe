import {CreateReminderRequestProps} from '../types/Request';
import {createItem, deleteItem, getById, updateItem} from './base';

const REMINDER_BASE_URL = import.meta.env.VITE_REMINDER_BASE_URL;

export const createReminder = async (data: CreateReminderRequestProps) => {
    return createItem(REMINDER_BASE_URL, '/reminders', data);
};

export const getReminder = async (id: string) => {
    return getById(REMINDER_BASE_URL, '/reminders', id);
};

export const updateReminder = async (id: string, data: CreateReminderRequestProps) => {
    return updateItem(REMINDER_BASE_URL, '/reminders', id, data);
};

export const deleteReminder = async (id: string) => {
    return deleteItem(REMINDER_BASE_URL, '/reminders', id);
};
