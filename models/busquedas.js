const fs = require("fs");
const axios = require("axios").default;

class Busquedas {
  historial = ["Tegucigalpa", "Madrid", "San Jose"];
  dbPath = "./db/database.json";

  constructor() {
    //TODO: debemos de lleer nuestra base de datos si existe (JSON)
    this.leerBD();
  }

  get paramsMapBox() {
    return {
      access_token: process.env.MAPBOX_KEy,
      // "pk.eyJ1IjoiZ2VyYXJkb3Q0NSIsImEiOiJjbDF6eDBrNGswcXMwM2xxcjNwYWh0ejc3In0.LNEJKMSrovmi0shsSWpEFA",
      // ?proximity=ip&language=es
      limit: 5,
      language: "es",
    };
  }

  get paramsWeather() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: "metric",
      lang: "es",
    };
  }

  get historialCapitalizado() {
    return this.historial.map((lugar) => {
      let palabras = lugar.split(" ");
      palabras = palabras.map((p) => p[0].toUpperCase() + p.substring(1));
      return palabras.join(" ");
    });
  }

  async ciudad(lugar = "") {
    try {
      //Petición HTTP
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/`,
        params: this.paramsMapBox,
      });

      const respuesta = await instance.get(
        `geocoding/v5/mapbox.places/${lugar}.json`
      );
      return respuesta.data.features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }));
    } catch (error) {
      return [];
    }
  }

  async climaLugar(lat, lon) {
    try {
      //Petición HTTP
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/`,
        params: { ...this.paramsWeather, lat, lon },
      });

      const respuesta = await instance.get(`data/2.5/weather`);
      const { weather, main } = respuesta.data;
      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp,
      };
    } catch (error) {
      console.log(error);
    }
  }

  agregarHistorial(lugar = "") {
    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    }
    //TODO: prevenir duplicidad
    this.historial.unshift(lugar.toLocaleLowerCase());

    //grabar en DB
    this.guardarDB();
  }

  guardarDB() {
    const payload = {
      historial: this.historial,
    };

    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  leerBD() {
    if (!fs.existsSync(this.dbPath)) return;
    const info = fs.readFileSync(this.dbPath, { encoding: "utf-8" });
    const data = JSON.parse(info);

    this.historial = data.historial;
  }
}

module.exports = Busquedas;
