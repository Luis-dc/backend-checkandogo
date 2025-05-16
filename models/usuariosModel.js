// models/usuariosModel.js
const db = require('../config/db');

const Usuario = {
  buscarPorCorreo: (correo, callback) => {
    const sql = 'SELECT * FROM usuarios WHERE correo = ?';
    db.query(sql, [correo], callback);
  },

  crearUsuario: (usuario, callback) => {
    const sql = `INSERT INTO usuarios (nombre, correo, contrasena, rol, id_departamento) 
                 VALUES (?, ?, ?, ?, ?)`;
    const { nombre, correo, contrasena, rol, id_departamento } = usuario;
    db.query(sql, [nombre, correo, contrasena, rol, id_departamento], callback);
  }
};

module.exports = Usuario;