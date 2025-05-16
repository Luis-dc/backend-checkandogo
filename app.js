const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const requerimientosRoutes = require('./routes/requerimientosRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Rutas de prueba
app.use('/api/auth', authRoutes);
app.use('/api/requerimientos', requerimientosRoutes);
app.use('/uploads', express.static('uploads'));
app.get('/', (req, res) => {
  res.send('Check&Go Backend funcionando 🚀');
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Servidor corriendo en http://localhost:${PORT}`);
});
