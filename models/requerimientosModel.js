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

  buscarPendientesPorDepartamento: (id_departamento, callback) => {
    const sql = `
      SELECT * 
      FROM requerimientos 
      WHERE estado_actual = 'Iniciado' 
        AND id_departamento = ?
    `;
    db.query(sql, [id_departamento], callback);
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
  },

  buscarPorUsuario: (id_usuario, callback) => {
    const sql = `
      SELECT DISTINCT r.*
      FROM requerimientos r
      LEFT JOIN aprobaciones a ON r.id_requerimiento = a.id_requerimiento
      LEFT JOIN seguimiento_requerimientos s ON r.id_requerimiento = s.id_requerimiento
      WHERE r.id_analista = ? OR a.id_usuario = ? OR s.id_usuario = ?
      ORDER BY r.fecha_creacion DESC
    `;
    db.query(sql, [id_usuario, id_usuario, id_usuario], callback);
  },

  obtenerDetalle: (id_requerimiento, callback) => {
    const sql = `
      SELECT r.*, d.nombre AS departamento
      FROM requerimientos r
      JOIN departamentos d ON r.id_departamento = d.id_departamento
      WHERE r.id_requerimiento = ?
    `;
    db.query(sql, [id_requerimiento], callback);
  },
  
  obtenerHistorial: (id_requerimiento, callback) => {
    const sql = `
      SELECT estado, observaciones, fecha_cambio
      FROM historial_estados
      WHERE id_requerimiento = ?
      ORDER BY fecha_cambio ASC
    `;
    db.query(sql, [id_requerimiento], callback);
  },
  
  obtenerSeguimiento: (id_requerimiento, callback) => {
    const sql = `
      SELECT u.nombre AS usuario, s.accion, s.observaciones, s.fecha_hora
      FROM seguimiento_requerimientos s
      JOIN usuarios u ON s.id_usuario = u.id_usuario
      WHERE s.id_requerimiento = ?
      ORDER BY s.fecha_hora ASC
    `;
    db.query(sql, [id_requerimiento], callback);
  },
  
  obtenerAprobaciones: (id_requerimiento, callback) => {
    const sql = `
      SELECT u.nombre AS usuario, a.estado, a.observaciones, a.fecha_aprobacion
      FROM aprobaciones a
      JOIN usuarios u ON a.id_usuario = u.id_usuario
      WHERE a.id_requerimiento = ?
      ORDER BY a.fecha_aprobacion ASC
    `;
    db.query(sql, [id_requerimiento], callback);
  },

  buscarPublicados: (callback) => {
    const sql = `SELECT * FROM requerimientos WHERE estado_actual = 'Publicado'`;
    db.query(sql, callback);
  }
  
};


module.exports = Requerimiento;
