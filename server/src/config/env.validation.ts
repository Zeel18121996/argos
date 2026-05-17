import * as Joi from 'joi'

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  PORT: Joi.number().integer().min(1).max(65535).default(4000),

  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required(),

  // Required from Phase 3 (basket). Optional in Phase 1 / 2 so devs can run without Redis.
  REDIS_URL: Joi.string()
    .uri({ scheme: ['redis', 'rediss'] })
    .optional(),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),

  JWT_REFRESH_SECRET: Joi.string().min(32).required(),

  CLIENT_URL: Joi.string().uri().default('http://localhost:3000'),

  // SMTP (MailHog locally). Optional — defaults work for the docker-compose setup.
  SMTP_HOST: Joi.string().default('mailhog'),
  SMTP_PORT: Joi.number().integer().min(1).max(65535).default(1025),
  SMTP_SECURE: Joi.string().valid('true', 'false').default('false'),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),
  SMTP_FROM_NAME: Joi.string().default('Argos Clone'),
  SMTP_FROM_EMAIL: Joi.string().default('no-reply@argos.local'),

  // Local upload destination (Phase 2 introduces Multer + sharp).
  UPLOAD_DIR: Joi.string().default('./uploads'),
  STATIC_PREFIX: Joi.string().default('/static'),

  // When false, NestJS won't auto-sync model schema — rely on sequelize-cli migrations.
  SEQUELIZE_SYNC: Joi.string().valid('true', 'false').default('true'),

  // Razorpay (test or live mode). Get from https://dashboard.razorpay.com/app/keys
  RAZORPAY_KEY_ID: Joi.string().required(),
  RAZORPAY_KEY_SECRET: Joi.string().required(),
})
