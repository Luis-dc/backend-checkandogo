const Requerimiento = require('../models/requerimientosModel');

exports.subirRequerimiento = (req, res) => {
  const { id_analista, id_departamento, titulo, descripcion } = req.body;
  const archivo_pdf = req.file?.filename;

  if (!archivo_pdf) {
    return res.status(400).json({ error: 'Archivo PDF requerido' });
  }

  const data = { id_analista, id_departamento, titulo, descripcion, archivo_pdf };

  Requerimiento.crear(data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al guardar requerimiento' });
    res.status(201).json({ mensaje: 'Requerimiento subido correctamente' });
  });
};

exports.listarPendientes = (req, res) => {
  const id_departamento = req.query.departamento;   // p.ej. ?departamento=3

  if (!id_departamento) {
    return res.status(400).json({ error: 'Departamento requerido' });
  }

  Requerimiento.buscarPendientesPorDepartamento(
    id_departamento,
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al obtener requerimientos' });
      res.json(results);
    }
  );
};

exports.aprobarRechazar = (req, res) => {
  const { id_requerimiento, estado, observaciones, id_usuario } = req.body;

  if (!['Aprobado', 'Rechazado'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  Requerimiento.actualizarEstado(id_requerimiento, estado, observaciones, id_usuario, (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar estado' });
  
    // Historial
    Requerimiento.registrarHistorial(id_requerimiento, estado, observaciones, () => {});
  
    // Seguimiento
    const accion = estado === 'Aprobado' ? 'Aprobado por Dueño del Proceso' : 'Rechazado por Dueño del Proceso';
    Requerimiento.registrarSeguimiento(id_requerimiento, id_usuario, accion, observaciones, () => {});
  
    res.json({ mensaje: `Requerimiento ${estado.toLowerCase()} correctamente` });
  });
  
};

exports.listarAprobados = (req, res) => {
  Requerimiento.buscarAprobados((err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener requerimientos aprobados' });
    res.json(results);
  });
};

exports.revisionFinal = (req, res) => {
  const { id_requerimiento, estado, observaciones, id_usuario } = req.body;

  if (!['Aprobado', 'Rechazado'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  const nuevoEstado = estado === 'Aprobado' ? 'Publicado' : 'Rechazado';
  const accion = estado === 'Aprobado' 
    ? 'Aprobado por Gerente General (Publicado)' 
    : 'Rechazado por Gerente General';

  Requerimiento.revisarFinal(id_requerimiento, estado, observaciones, id_usuario, (err) => {
    if (err) return res.status(500).json({ error: 'Error al registrar revisión final' });

    // Solo se ejecutan después de confirmar el cambio
    Requerimiento.registrarHistorial(id_requerimiento, nuevoEstado, observaciones, () => {});
    Requerimiento.registrarSeguimiento(id_requerimiento, id_usuario, accion, observaciones, () => {});

    const texto = estado === 'Aprobado' ? 'publicado' : 'rechazado';
    res.json({ mensaje: `Requerimiento ${texto} correctamente` });
  });
};


exports.obtenerTodos = (req, res) => {
  Requerimiento.obtenerTodos((err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener requerimientos' });
    res.json(results);
  });
};


exports.verHistorial = (req, res) => {
  const { id } = req.params;
  Requerimiento.obtenerHistorialPorRequerimiento(id, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener historial' });
    res.json(results);
  });
};

exports.verSeguimiento = (req, res) => {
  const { id } = req.params;
  Requerimiento.obtenerSeguimientoPorRequerimiento(id, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener seguimiento' });
    res.json(results);
  });
};

exports.listarPorUsuario = (req, res) => {
  const id_usuario = req.query.id_usuario;

  if (!id_usuario) {
    return res.status(400).json({ error: 'ID de usuario requerido' });
  }

  Requerimiento.buscarPorUsuario(id_usuario, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener requerimientos' });
    res.json(results);
  });
};

exports.obtenerDetalleCompleto = (req, res) => {
  const id = req.params.id;

  Requerimiento.obtenerDetalle(id, (err, detalle) => {
    if (err) return res.status(500).json({ error: 'Error al obtener detalle' });

    Requerimiento.obtenerHistorial(id, (errHist, historial) => {
      if (errHist) return res.status(500).json({ error: 'Error al obtener historial' });

      Requerimiento.obtenerSeguimiento(id, (errSeg, seguimiento) => {
        if (errSeg) return res.status(500).json({ error: 'Error al obtener seguimiento' });

        Requerimiento.obtenerAprobaciones(id, (errAprob, aprobaciones) => {
          if (errAprob) return res.status(500).json({ error: 'Error al obtener aprobaciones' });

          res.json({
            detalle: detalle[0],
            historial,
            seguimiento,
            aprobaciones
          });
        });
      });
    });
  });
};

exports.obtenerPublicados = (req, res) => {
  Requerimiento.buscarPublicados((err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener publicados' });
    res.json(results);
  });
};
