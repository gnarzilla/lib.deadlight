// core/src/db/models/settings.js
import { BaseModel, DatabaseError } from '../base.js';

export class SettingsModel extends BaseModel {
  async get(key, defaultValue = null) {
    const setting = await this.queryFirst(
      'SELECT value, type FROM settings WHERE key = ?',
      [key]
    );
    
    if (!setting) {
      return defaultValue;
    }
    
    // Convert based on type
    switch (setting.type) {
      case 'number':
        return parseInt(setting.value);
      case 'boolean':
        return setting.value === 'true';
      case 'json':
        return JSON.parse(setting.value);
      default:
        return setting.value;
    }
  }

  async set(key, value, type = 'string') {
    let stringValue = value;
    
    // Convert to string based on type
    switch (type) {
      case 'number':
        stringValue = value.toString();
        break;
      case 'boolean':
        stringValue = value ? 'true' : 'false';
        break;
      case 'json':
        stringValue = JSON.stringify(value);
        break;
    }
    
    await this.execute(
      'INSERT OR REPLACE INTO settings (key, value, type, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      [key, stringValue, type]
    );
    
    return { key, value, type };
  }

  async getAll() {
    const settings = await this.query('SELECT * FROM settings ORDER BY key');
    const result = {};
    
    for (const setting of settings) {
      result[setting.key] = this.convertValue(setting.value, setting.type);
    }
    
    return result;
  }

  async delete(key) {
    const result = await this.execute('DELETE FROM settings WHERE key = ?', [key]);
    return result.changes > 0;
  }

  convertValue(value, type) {
    switch (type) {
      case 'number':
        return parseInt(value);
      case 'boolean':
        return value === 'true';
      case 'json':
        return JSON.parse(value);
      default:
        return value;
    }
  }
}
