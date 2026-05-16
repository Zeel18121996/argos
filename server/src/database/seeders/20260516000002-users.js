'use strict'

const bcrypt = require('bcrypt')

const NOW = new Date()
const PASSWORD = 'Password123!' // dev only — change after first login

/**
 * Seed users:
 *   admin@argos.local    / Password123!   role=admin
 *   staff@argos.local    / Password123!   role=staff
 *   customer@argos.local / Password123!   role=customer
 *   alice@example.com    / Password123!   role=customer
 *   bob@example.com      / Password123!   role=customer
 *
 * Fixed UUIDs for idempotency.
 */
const USERS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@argos.local',
    first_name: 'Admin',
    last_name: 'Argos',
    role: 'admin',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'staff@argos.local',
    first_name: 'Staff',
    last_name: 'Argos',
    role: 'staff',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'customer@argos.local',
    first_name: 'Demo',
    last_name: 'Customer',
    role: 'customer',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'alice@example.com',
    first_name: 'Alice',
    last_name: 'Walker',
    role: 'customer',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'bob@example.com',
    first_name: 'Bob',
    last_name: 'Stone',
    role: 'customer',
  },
]

module.exports = {
  async up(queryInterface) {
    const hash = await bcrypt.hash(PASSWORD, 12)
    await queryInterface.bulkInsert(
      'users',
      USERS.map((u) => ({
        ...u,
        password_hash: hash,
        is_active: true,
        email_verified: true,
        marketing_opt_in: false,
        created_at: NOW,
        updated_at: NOW,
      })),
      {},
    )
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { id: USERS.map((u) => u.id) }, {})
  },
}
