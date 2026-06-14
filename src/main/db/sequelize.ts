import { app } from 'electron'
import path from 'path'
import { Sequelize } from 'sequelize'

export const dbPath = path.join(app.getPath('userData'), 'kiraa.db')

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
  sync: { alter: true }
})

sequelize.query('PRAGMA foreign_keys = ON')
