/**
 * @typedef {Object} Address
 * @property {string} street
 * @property {string} city
 * @property {string} state
 * @property {string} zipCode
 * @property {string} country
 */

/**
 * @typedef {Object} Preferences
 * @property {boolean} emailNotifications
 * @property {boolean} smsNotifications
 * @property {boolean} paperlessBilling
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} fullName - Virtual field (firstName + lastName)
 * @property {string} email
 * @property {string} [password] - Hidden by select:false
 * @property {string} phone
 * @property {Address} address
 * @property {string|null} accountNumber
 * @property {string|null} meterNumber
 * @property {'residential' | 'commercial'} customerType
 * @property {'customer' | 'admin'} role
 * @property {boolean} isActive
 * @property {boolean} isVerified
 * @property {Date|null} lastLogin
 * @property {Preferences} preferences
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
