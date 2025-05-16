const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const requerimientosController = require('../controllers/requerimientosController');

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // carpeta donde se guardan los archivos
  },
  filename: (req, file, cb) => {
    const nombreUnico = Date.now() + '-' + file.originalname;
    cb(null, nombreUnico);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (ext === '.pdf') cb(null, true);
  else cb(new Error('Solo se permiten archivos PDF'));
};

const upload = multer({ storage, fileFilter });

// Ruta para subir requerimientos
router.post('/subir', upload.single('archivo_pdf'), requerimientosController.subirRequerimiento);
router.get('/pendientes', requerimientosController.listarPendientes);
router.post('/aprobar-rechazar', requerimientosController.aprobarRechazar);
router.get('/aprobados', requerimientosController.listarAprobados);
router.post('/revision-final', requerimientosController.revisionFinal);
router.get('/todos', requerimientosController.obtenerTodos);

router.get('/historial/:id', requerimientosController.verHistorial);
router.get('/seguimiento/:id', requerimientosController.verSeguimiento);

module.exports = router;
