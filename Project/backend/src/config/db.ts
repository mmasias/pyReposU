// config/db.ts
import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  username: 'tu_usuario',
  password: 'tu_contraseña',
  database: 'nombre_de_tu_db',
  logging: false,
});
