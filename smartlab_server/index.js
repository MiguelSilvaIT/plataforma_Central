const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");
const moment = require("moment"); // Assuming you're using moment.js for date formatting

const app = express();
const port = 3000;

// Configuração do banco de dados
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "smartlab",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to database");
});

app.use(bodyParser.json());

app.use(cors());

const queryPromise = (query, values) => {
  return new Promise((resolve, reject) => {
    db.query(query, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const convertToMySQLDateTime = (isoDate) => {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const seconds = ("0" + date.getSeconds()).slice(-2);
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

app.post("/", async (req, res) => {
  const data = req.body;
  console.log("Received data:", data); // Verifica os dados recebidos

  try {
    // Inserir ou atualizar dispositivo
    const deviceQuery = `
      INSERT INTO Dispositivos (MacAddress, Nome, Descricao, CentralIP, IPAtribuido) 
      VALUES (?, ?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE 
        Nome = VALUES(Nome), 
        Descricao = VALUES(Descricao), 
        CentralIP = VALUES(CentralIP), 
        IPAtribuido = VALUES(IPAtribuido)
    `;
    await queryPromise(deviceQuery, [
      data.MacAddress,
      data.Nome,
      data.Descricao,
      data.CentralIP,
      data.IPAtribuido,
    ]);

    // Inserir ou atualizar sensores
    if (Array.isArray(data.Sensores) && data.Sensores.length > 0) {
      const sensorQueries = data.Sensores.map((sensor) => {
        const sensorQuery = `
          INSERT INTO Sensores (SensorID, MacAddress, Nome, Tipo, Pin, ModoOperacao, Valor, DataCriacao, Unidade, isDeleted) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            MacAddress = VALUES(MacAddress),
            Nome = VALUES(Nome),
            Tipo = VALUES(Tipo),
            Pin = VALUES(Pin),
            ModoOperacao = VALUES(ModoOperacao),
            Valor = VALUES(Valor),
            DataCriacao = VALUES(DataCriacao),
            Unidade = VALUES(Unidade),
            isDeleted = VALUES(isDeleted)
        `;
        const sensorValues = [
          sensor.ID,
          data.MacAddress,
          sensor.Nome,
          sensor.Tipo,
          sensor.Pin,
          sensor.ModoOperacao,
          sensor.Valor,
          convertToMySQLDateTime(sensor.DataCriacao), // Converte a data para o formato MySQL
          sensor.Unidade || null,
          sensor.isDeleted.trim().toLowerCase() === "true" ? 1 : 0,
        ];
        return queryPromise(sensorQuery, sensorValues);
      });

      await Promise.all(sensorQueries);
    } else {
      console.log("No sensors to insert");
    }

    // Inserir ou atualizar atuadores
    if (Array.isArray(data.Atuadores) && data.Atuadores.length > 0) {
      const actuatorQueries = data.Atuadores.map((actuator) => {
        const actuatorQuery = `
          INSERT INTO Atuadores (ActuatorID, MacAddress, Nome, Tipo, Pin, ModoOperacao, Valor, DataCriacao, Unidade, isDeleted) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            MacAddress = VALUES(MacAddress),
            Nome = VALUES(Nome),
            Tipo = VALUES(Tipo),
            Pin = VALUES(Pin),
            ModoOperacao = VALUES(ModoOperacao),
            Valor = VALUES(Valor),
            DataCriacao = VALUES(DataCriacao),
            Unidade = VALUES(Unidade),
            isDeleted = VALUES(isDeleted)
        `;

        const actuatorValues = [
          actuator.ID,
          data.MacAddress,
          actuator.Nome,
          actuator.Tipo,
          actuator.Pin,
          actuator.ModoOperacao,
          actuator.Valor,
          convertToMySQLDateTime(actuator.DataCriacao), // Converte a data para o formato MySQL
          actuator.Unidade || null,
          actuator.isDeleted.trim().toLowerCase() === "true" ? 1 : 0,
        ];
        return queryPromise(actuatorQuery, actuatorValues);
      });

      await Promise.all(actuatorQueries);
    } else {
      console.log("No actuators to insert");
    }

    res.status(200).send("Data stored successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error storing data");
  }
});

app.post("/addDevice", (req, res) => {
  const data = req.body;
  console.log("Data received:", data.is_ESP_registed);
  if (data.tipoDispositivo == "sensor") {
    const actuatorQuery = `
      INSERT INTO Sensores (SensorID, MacAddress, Nome, Tipo, Pin, ModoOperacao, Valor, DataCriacao, Unidade, isDeleted, is_ESP_registed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        MacAddress = VALUES(MacAddress),
        Nome = VALUES(Nome),
        Tipo = VALUES(Tipo),
        Pin = VALUES(Pin),
        ModoOperacao = VALUES(ModoOperacao),
        Valor = VALUES(Valor),
        DataCriacao = VALUES(DataCriacao),
        Unidade = VALUES(Unidade),
        isDeleted = VALUES(isDeleted),
        is_ESP_registed = VALUES(is_ESP_registed)
    `;
    db.query(
      actuatorQuery,
      [
        -1,
        data.esp,
        data.nome,
        data.tipo,
        data.pin,
        data.modoOperacao,
        data.valor,
        convertToMySQLDateTime(data.dtCriacao),
        data.unidade,
        0,
        data.is_ESP_registed,
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error adding actuator");
        } else {
          res.status(200).send("Actuator added successfully");
        }
      }
    );
  } else {
    const actuatorQuery = `
      INSERT INTO Atuadores (ActuatorID, MacAddress, Nome, Tipo, Pin, ModoOperacao, Valor, DataCriacao, Unidade, isDeleted, is_ESP_registed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        MacAddress = VALUES(MacAddress),
        Nome = VALUES(Nome),
        Tipo = VALUES(Tipo),
        Pin = VALUES(Pin),
        ModoOperacao = VALUES(ModoOperacao),
        Valor = VALUES(Valor),
        DataCriacao = VALUES(DataCriacao),
        Unidade = VALUES(Unidade),
        isDeleted = VALUES(isDeleted),
        is_ESP_registed = VALUES(is_ESP_registed)
    `;
    db.query(
      actuatorQuery,
      [
        -1,
        data.esp,
        data.nome,
        data.tipo,
        data.pin,
        data.modoOperacao,
        data.valor,
        convertToMySQLDateTime(data.dtCriacao),
        data.unidade,
        0,
        data.is_ESP_registed,
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error adding actuator");
        } else {
          res.status(200).send("Actuator added successfully");
        }
      }
    );
  }
});

app.get('/dispositivos-nao-registados', (req, res) => {
  const querySensores = 'SELECT * FROM Sensores WHERE is_ESP_registed = 0';
  const queryAtuadores = 'SELECT * FROM Atuadores WHERE is_ESP_registed = 0';

  // Executar ambas as consultas
  Promise.all([
    new Promise((resolve, reject) => db.query(querySensores, (err, results) => err ? reject(err) : resolve(results))),
    new Promise((resolve, reject) => db.query(queryAtuadores, (err, results) => err ? reject(err) : resolve(results)))
  ]).then(([sensores, atuadores]) => {
    // Combinar os resultados e enviar
    res.json({ sensores, atuadores });
  }).catch((err) => {
    console.error('Erro ao buscar dispositivos não registrados:', err);
    res.status(500).send('Erro ao buscar dispositivos não registrados');
  });
});


// Endpoint para obter todos os dispositivos
app.get("/api/devices", async (req, res) => {
  try {
    const devices = await queryPromise("SELECT * FROM Dispositivos");
    res.status(200).json(devices);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching devices");
  }
});

// Endpoint para obter sensores de um dispositivo
app.get("/api/devices/:macAddress/sensors", async (req, res) => {
  const { macAddress } = req.params;
  try {
    const sensors = await queryPromise(
      "SELECT * FROM Sensores WHERE MacAddress = ? AND isDeleted = 0",
      [macAddress]
    );
    res.status(200).json(sensors);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching sensors");
  }
});

// Endpoint para obter atuadores de um dispositivo
app.get("/api/devices/:macAddress/actuators", async (req, res) => {
  const { macAddress } = req.params;
  try {
    const actuators = await queryPromise(
      "SELECT * FROM Atuadores WHERE MacAddress = ? AND isDeleted = 0",
      [macAddress]
    );
    res.status(200).json(actuators);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching actuators");
  }
});

app.post("/api/sensors/delete", async (req, res) => {
  const { id, macAddress } = req.body;

  try {
    const result = await queryPromise(
      "DELETE FROM Sensores WHERE SensorID = ? AND MacAddress = ?",
      [id, macAddress]
    );
    if (result.affectedRows > 0) {
      res
        .status(200)
        .send(
          `Sensor with ID ${id} and MAC address ${macAddress} deleted successfully`
        );
    } else {
      res
        .status(404)
        .send(`Sensor with ID ${id} and MAC address ${macAddress} not found`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting sensor");
  }
});

app.get("/api/devices/:macAddress", async (req, res) => {
  const { macAddress } = req.params;
  try {
    const device = await queryPromise(
      "SELECT * FROM Dispositivos WHERE MacAddress = ?",
      [macAddress]
    );
    res.status(200).json(device[0].IPAtribuido);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching device IP");
  }
});

app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
