const db = require('../config/db');

const Requerimiento = {
  crear: (data, callback) => {
    const sql = `INSERT INTO requerimientos 
      (id_analista, id_departamento, titulo, descripcion, archivo_pdf) 
      VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [
      data.id_analista,
      data.id_departamento,
      data.titulo,
      data.descripcion,
      data.archivo_pdf
    ], callback);
  },

  buscarPendientes: (callback) => {
    const sql = `SELECT * FROM requerimientos WHERE estado_actual = 'Iniciado'`;
    db.query(sql, callback);
  },

  actualizarEstado: (id, estado, observaciones, id_usuario, callback) => {
    const sql1 = `UPDATE requerimientos SET estado_actual = ? WHERE id_requerimiento = ?`;
    const sql2 = `INSERT INTO aprobaciones (id_requerimiento, id_usuario, estado, observaciones) VALUES (?, ?, ?, ?)`;

    db.query(sql1, [estado, id], (err) => {
      if (err) return callback(err);
      db.query(sql2, [id, id_usuario, estado, observaciones], callback);
    });
  },

  buscarAprobados: (callback) => {
    const sql = `SELECT * FROM requerimientos WHERE estado_actual = 'Aprobado'`;
    db.query(sql, callback);
  },

  revisarFinal: (id, estado, observaciones, id_usuario, callback) => {
    const nuevoEstado = estado === 'Aprobado' ? 'Publicado' : 'Rechazado';
  
    const sql1 = `UPDATE requerimientos SET estado_actual = ? WHERE id_requerimiento = ?`;
    const sql2 = `INSERT INTO aprobaciones (id_requerimiento, id_usuario, estado, observaciones) VALUES (?, ?, ?, ?)`;
  
    db.query(sql1, [nuevoEstado, id], (err) => {
      if (err) return callback(err);
      db.query(sql2, [id, id_usuario, estado, observaciones], callback);
    });
  },
  
  obtenerTodos: (callback) => {
    const sql = `
      SELECT 
        r.id_requerimiento,
        r.titulo,
        r.descripcion,
        r.estado_actual,
        r.archivo_pdf,
        r.fecha_creacion,
        u.nombre AS analista,
        d.nombre AS departamento
      FROM requerimientos r
      JOIN usuarios u ON r.id_analista = u.id_usuario
      JOIN departamentos d ON r.id_departamento = d.id_departamento
      ORDER BY r.fecha_creacion DESC
    `;
    db.query(sql, callback);
  },

  registrarHistorial: (id_requerimiento, estado, observaciones, callback) => {
    const sql = `
      INSERT INTO historial_estados (id_requerimiento, estado, observaciones) 
      VALUES (?, ?, ?)
    `;
    db.query(sql, [id_requerimiento, estado, observaciones], callback);
  },
  
  registrarSeguimiento: (id_requerimiento, id_usuario, accion, observaciones, callback) => {
    const sql = `
      INSERT INTO seguimiento_requerimientos (id_requerimiento, id_usuario, accion, observaciones) 
      VALUES (?, ?, ?, ?)
    `;
    db.query(sql, [id_requerimiento, id_usuario, accion, observaciones], callback);
  },

  obtenerHistorialPorRequerimiento: (id_requerimiento, callback) => {
    const sql = `
      SELECT estado, fecha_cambio, observaciones
      FROM historial_estados
      WHERE id_requerimiento = ?
      ORDER BY fecha_cambio ASC
    `;
    db.query(sql, [id_requerimiento], callback);
  },
  
  obtenerSeguimientoPorRequerimiento: (id_requerimiento, callback) => {
    const sql = `
      SELECT u.nombre AS usuario, s.accion, s.observaciones, s.fecha_hora
      FROM seguimiento_requerimientos s
      JOIN usuarios u ON s.id_usuario = u.id_usuario
      WHERE s.id_requerimiento = ?
      ORDER BY s.fecha_hora ASC
    `;
    db.query(sql, [id_requerimiento], callback);
  }
  
};

module.exports = Requerimiento;
