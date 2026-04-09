/**
 * farmLog.js
 * Local farm activity log using AsyncStorage.
 * Used by Pathologist and SoilLab to record events,
 * and by FarmPassport to display history.
 */
import AsyncStorage from '@react-native-async-storage/async-storage'

const LOGS_KEY = 'ZYCROP_FARM_LOGS'
const MAX_LOGS = 50   // keep latest 50 entries

/**
 * Save a new farm log entry.
 * @param {{ event_type: string, note: string, icon_color?: string }} entry
 */
export async function saveLog(entry) {
  try {
    const existing = await getLogs()
    const newLog = {
      _id: Date.now().toString(),
      event_type: entry.event_type,
      date: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      note: entry.note,
      icon_color: entry.icon_color || '#1b5e20',
      timestamp: new Date().toISOString(),
    }
    const updated = [newLog, ...existing].slice(0, MAX_LOGS)
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updated))
    return newLog
  } catch {
    // Silently fail — logs are non-critical
  }
}

/**
 * Retrieve all farm logs, newest first.
 * @returns {Promise<Array>}
 */
export async function getLogs() {
  try {
    const raw = await AsyncStorage.getItem(LOGS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Delete a log by its _id.
 * @param {string} logId
 */
export async function deleteLog(logId) {
  try {
    const existing = await getLogs()
    const updated = existing.filter(l => l._id !== logId)
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updated))
  } catch {
    // Silently fail
  }
}

/**
 * Clear all logs.
 */
export async function clearLogs() {
  try {
    await AsyncStorage.removeItem(LOGS_KEY)
  } catch {}
}
