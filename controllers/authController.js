// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuariosModel');

const JWT_SECRET = 'checkandgo_superclave'; // puedes moverlo a .env

exports.login = (req, res) => {
  const { correo, contrasena } = req.body;

  Usuario.buscarPorCorreo(correo, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en el servidor' });
    if (results.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

    const usuario = results[0];

    bcrypt.compare(contrasena, usuario.contrasena, (err, resultado) => {
      if (!resultado) return res.status(401).json({ error: 'Contraseña incorrecta' });

      const token = jwt.sign({
        id: usuario.id_usuario,
        rol: usuario.rol,
        nombre: usuario.nombre
      }, JWT_SECRET, { expiresIn: '1h' });

      res.json({
        mensaje: 'Login exitoso',
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          rol: usuario.rol,
          id_departamento: usuario.id_departamento
        }
      });
      
      
    });
  });
};

exports.register = (req, res) => {
  const { nombre, correo, contrasena, rol, id_departamento } = req.body;

  if (!nombre || !correo || !contrasena || !rol || !id_departamento) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  Usuario.buscarPorCorreo(correo, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en el servidor' });
    if (results.length > 0) return res.status(400).json({ error: 'El correo ya está registrado' });

    bcrypt.hash(contrasena, 10, (err, hash) => {
      if (err) return res.status(500).json({ error: 'Error al encriptar la contraseña' });

      Usuario.crearUsuario({ nombre, correo, contrasena: hash, rol, id_departamento }, (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al crear el usuario' });
        res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
      });
    });
  });
};

