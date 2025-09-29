# GESTIONGYM

Sistema de gestión para gimnasios desarrollado en **Node.js** con un enfoque modular, aplicando principios **SOLID**, patrones de diseño y buenas prácticas.

---

## 🚀 Descripción del Proyecto

Este proyecto es una **CLI interactiva** que permite administrar clientes, contratos, planes, finanzas y nutrición de un gimnasio.  
Se ha desarrollado bajo arquitectura limpia, aplicando repositorios, servicios y modelos para garantizar **escalabilidad, mantenibilidad y robustez**.

---

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tuusuario/gestiongym.git

# Entrar en el directorio
cd gestiongym

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar la CLI
node index.js
```

---

## 🛠️ Uso

Al ejecutar `node index.js`, se despliega un menú interactivo con las siguientes opciones:

- Registrar cliente
- Listar clientes
- Editar / Eliminar cliente
- Registrar contrato o plan
- Registrar progreso
- Registrar ingreso (transacciones con control de consistencia)
- Registrar egreso
- Consultar balance financiero
- Gestión de nutrición y alimentos

---

## 📂 Estructura del Proyecto

```
GESTIONGYM/
│── commands/
│   └── cli.js
│── config/
│   ├── db.js
│   └── withTransaction.js
│── models/
│   ├── BaseModel.js
│   ├── Client.js
│   ├── Contract.js
│   ├── FinanceRecord.js
│   ├── FoodEntry.js
│   ├── NutritionPlan.js
│   ├── Plan.js
│   └── Progress.js
│── repositories/
│   ├── ClientRepository.js
│   ├── GenericRepository.js
│   ├── NutritionRepository.js
│   └── PlanRepository.js
│── services/
│   ├── ClientService.js
│   ├── FinanceService.js
│   ├── NutritionService.js
│   └── PlanService.js
│── utils/
│   └── validators.js
│── .env.example
│── .gitignore
│── index.js
│── package.json
│── package-lock.json
```

---

## 📐 Principios SOLID Aplicados

- **S (Single Responsibility):** Cada servicio maneja solo una responsabilidad (ej: `FinanceService` solo lógica financiera).
- **O (Open/Closed):** Nuevos tipos de registros (ingresos/egresos) se agregan sin modificar lo existente.
- **L (Liskov Substitution):** Los repositorios pueden intercambiarse sin romper la lógica de los servicios.
- **I (Interface Segregation):** Las clases solo implementan lo que realmente necesitan.
- **D (Dependency Inversion):** Los servicios dependen de abstracciones (`repositories`) y no de implementaciones concretas.

---

## 🎨 Patrones de Diseño Usados

- **Repository Pattern:** Capa intermedia entre la base de datos y los servicios.
- **Factory Pattern (implícito):** Modelos para crear entidades como `Client`, `Plan`, `Contract`.
- **Transaction Script:** En `withTransaction.js` para garantizar consistencia en ingresos/egresos.
- **CLI Pattern:** Implementación de un menú interactivo con `inquirer` para la interacción con el usuario.

---

## ⚙️ Consideraciones Técnicas

- Base de datos: **MongoDB**
- Lenguaje: **Node.js**
- Librerías clave: `inquirer`, `chalk`, `mongodb`
- Arquitectura: **Capas (Models, Repositories, Services, CLI)**
- Validaciones: Definidas en `utils/validators.js`
- Manejo de transacciones: Implementado en `withTransaction.js` para operaciones financieras.

 ---

## 📽️ Link del video explicativo

👉 [**Clic aquí para ver el video en YouTube**](https://youtu.be/0W5vnnIiLls)



---

## 👥 Créditos

Desarrollado por: **Carlos Mario y Fabian Pertuz**  



---
