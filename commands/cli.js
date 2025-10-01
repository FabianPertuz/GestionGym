// commands/cli.js
const inquirer = require('inquirer');
const chalk = require('chalk');
const dayjs = require('dayjs');

async function mainMenu(services) {
  const choices = [
    { name: '1. Crear cliente', value: 'create_client' },
    { name: '2. Eliminar cliente', value: 'delete_client' },
    { name: '3. Listar clientes', value: 'list_clients' },
    { name: '4. Crear plan', value: 'create_plan' },
    { name: '5. Crear plan nutricional', value: 'create_nutrition_plan' },
    { name: '6. Registrar alimento por dia', value: 'add_food_entry' },
    { name: '7. Reporte semanal nutricional', value: 'nutrition_weekly_report' },
    { name: '8. Renovar plan', value: 'renew_plan' },
    { name: '9. Cancelar plan', value: 'cancel_plan' },
    { name: '10. Finalizar plan', value: 'finish_plan' },
    { name: '11. Asignar plan a cliente (genera contrato)', value: 'assign_plan' },
    { name: '12. Registrar ingreso (transacción)', value: 'register_income' },
    { name: '13. Registrar egreso (transacción)', value: 'register_expense' },
    { name: '14. Cancelar contrato (rollback)', value: 'cancel_contract' },
    { name: '15. Registrar progreso', value: 'register_progress' },
    { name: '16. Ver progreso cronológico', value: 'view_progress' },
    { name: '17. Consultar balance', value: 'get_balance' },
    [ name: '18  consultar backups', value 'backups'],
    { name: '0. Salir', value: 'exit' }
  ];

  while (true) {
    console.log(chalk.green('\n=== FITNESS CLI ==='));
    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: 'Selecciona una opción',
      choices
    });

    try {
      switch (action) {
        // ================== CREAR CLIENTE ==================
        case 'create_client': {
          const answers = await inquirer.prompt([
            {
              name: 'name',
              message: 'Nombre',
              validate: v => {
                if (!v.trim()) return '❌ El nombre es obligatorio';
                if (!/^[a-zA-Z\s]+$/.test(v)) return '❌ Solo se permiten letras';
                return true;
              }
            },
            {
              name: 'age',
              message: 'Edad',
              validate: v => !isNaN(parseInt(v)) || '❌ Debe ser número'
            },
           {
              name: 'email',
              message: 'Email',
              validate: v => {
                if (!v.trim()) return '❌ El email es obligatorio';
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!regex.test(v)) return '❌ Email no válido';
                return true;
              }
            },
            {
              name: 'phone',
              message: 'Teléfono',
              validate: v => {
                if (!v.trim()) return '❌ El teléfono es obligatorio';
                if (!/^\d+$/.test(v)) return '❌ Solo se permiten números';
                if (v.length < 7) return '❌ El teléfono debe tener al menos 7 dígitos';
                if (v.length > 10) return '❌ El teléfono no puede tener más de 10 dígitos';
                return true;
              }
            }
            
          ]);
          const client = await services.clientService.createClient({
            name: answers.name,
            age: parseInt(answers.age),
            contact: { email: answers.email, phone: answers.phone }
          });

          console.log(chalk.blue('✅ Cliente creado:'), client);
          break;
        }

        // ================== ELIMINAR CLIENTE ==================
        case 'delete_client': {
          const { email } = await inquirer.prompt([
            {
              name: 'email',
              message: 'Email del cliente a eliminar',
              validate: async (v) => {
                if (!v.trim()) return '❌ El email es obligatorio';
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!regex.test(v)) return '❌ Email no válido';
                const exists = await services.clientService.findByEmail(v);
                return exists ? true : '❌ Cliente no encontrado';
              }
            }
          ]);

          const client = await services.clientService.findByEmail(email);

          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `⚠️ ¿Seguro que deseas eliminar al cliente "${client.name}"? Esta acción no se puede deshacer.`,
              default: false
            }
          ]);

          if (!confirm) {
            console.log(chalk.yellow('❌ Eliminación cancelada.'));
            break;
          }

          try {
            await services.clientService.deleteClient(client._id);
            console.log(chalk.green(`✅ Cliente "${client.name}" eliminado correctamente.`));
          } catch (err) {
            // Manejo de error cuando tiene contrato activo u otro problema
            console.log(chalk.red('❌ No se pudo eliminar al cliente:'), err.message);
          }

          break;
        }

        // ================== LISTAR CLIENTES ==================
        case 'list_clients': {
          const clients = await services.clientService.listClients();
          if (clients.length === 0) {
            console.log(chalk.yellow('⚠️ No hay clientes registrados.'));
          } else {
            console.log(chalk.green('\n=== LISTA DE CLIENTES ==='));
            clients.forEach((c, i) => {
              console.log(
                `${i + 1}. ${c.name} (${c.age} años) - Email: ${c.contact?.email || 'N/A'}`
              );
            });
          }
          break;
        }

        case 'delete_client': {
          const { email } = await inquirer.prompt([
            {
              name: 'email',
              message: 'Email del cliente a eliminar',
              validate: async (v) => {
                if (!v.trim()) return '❌ El email es obligatorio';
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!regex.test(v)) return '❌ Email no válido';
                const exists = await services.clientService.findByEmail(v);
                return exists ? true : '❌ Cliente no encontrado';
              }
            }
          ]);

          const client = await services.clientService.findByEmail(email);

          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `⚠️ ¿Seguro que deseas eliminar al cliente "${client.name}"? Esta acción no se puede deshacer.`,
              default: false
            }
          ]);

          if (!confirm) {
            console.log(chalk.yellow('❌ Eliminación cancelada.'));
            break;
          }

          try {
            await services.clientService.deleteClient(client._id);
            console.log(chalk.green(`✅ Cliente "${client.name}" eliminado correctamente.`));
          } catch (err) {
            // Manejo de error cuando tiene contrato activo u otro problema
            console.log(chalk.red('❌ No se pudo eliminar al cliente:'), err.message);
          }

          break;
        }
        // ================== CREAR PLAN ==================
        case 'create_plan': {
          const a = await inquirer.prompt([
            {
              name: 'name',
              message: 'Nombre del plan',
              validate: v => {
                if (!v.trim()) return '❌ El nombre es obligatorio';
                if (!/^[a-zA-Z\s]+$/.test(v)) return '❌ Solo se permiten letras';
                return true;
              }
            },
            { name: 'description', message: 'Descripción' },
            {
              name: 'goals',
              message: 'Metas',
              validate: v => {
                if (!v.trim()) return '❌ Las metas son obligatorias';
                if (!/^[a-zA-Z\s]+$/.test(v)) return '❌ Solo se permiten letras';
                return true
              }
            },
            {
              type: 'list',
              name: 'level',
              message: 'Nivel',
              choices: ['Principiante', 'Intermedio', 'Avanzado'],
              default: 'Principiante'
            },
            {
              name: 'durationMonths',
              message: 'Duración (meses)',
              validate: v => !isNaN(parseInt(v)) || '❌ Número requerido'
            },
            {
              name: 'price',
              message: 'Precio base',
              validate: v => !isNaN(parseFloat(v)) || '❌ Número requerido'
            }
          ]);

          const plan = await services.planService.createPlan({
            name: a.name,
            description: a.description,
            goals: a.goals,
            level: a.level,
            durationMonths: parseInt(a.durationMonths),
            price: parseFloat(a.price)
          });

          console.log(chalk.blue('✅ Plan creado:'), plan);
          break;
        }
        // ================== CREAR PLAN NUTRICIONAL ==================
        case 'create_nutrition_plan': {
          const a = await inquirer.prompt([
            {
              name: 'email',
              message: 'Email del cliente',
              validate: async (v) => {
                if (!v.trim()) return '❌ El email es obligatorio';
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!regex.test(v)) return '❌ Email no válido';
                const exists = await services.clientService.findByEmail(v);
                return exists ? true : '❌ Cliente no encontrado';
              }
            },
            {
              name: 'planName',
              message: 'Nombre del plan de entrenamiento asociado',
              validate: async (v) => {
                if (!v.trim()) return '❌ El nombre del plan es obligatorio';
                const exists = await services.planService.findByName(v);
                return exists ? true : '❌ Plan de entrenamiento no encontrado';
              }
            },
            {
              name: 'name',
              message: 'Nombre del plan de nutrición',
              validate: (v) => v.trim() ? true : '❌ El nombre es obligatorio'
            },
            {
              name: 'description',
              message: 'Descripción',
              validate: (v) => v.trim() ? true : '❌ La descripción es obligatoria'
            }
          ]);

          const client = await services.clientService.findByEmail(a.email);
          const plan = await services.planService.findByName(a.planName);

          const newPlan = await services.nutritionService.createPlan({
            name: a.name,
            description: a.description,
            clientId: client._id,
            planId: plan._id
          });

          console.log(chalk.green('✅ Plan de nutrición creado:'), newPlan);
          break;
        }

        // ================== REGISTRAR ALIMENTO POR DIA ==================
        case 'add_food_entry': {
          const a1 = await inquirer.prompt([
            { 
              name: 'email', 
              message: 'Email del cliente', 
              validate: async (v) => {
                if (!v.trim()) return 'Obligatorio';
                const c = await services.clientService.findByEmail(v);
                return c ? true : 'Cliente no encontrado';
              } 
            },
            { 
              name: 'date', 
              message: 'Fecha (YYYY-MM-DD) (enter = hoy)', 
              default: dayjs().format('YYYY-MM-DD') 
            }
          ]);

          const client = await services.clientService.findByEmail(a1.email);

          const meals = [];
          while (true) {
            const meal = await inquirer.prompt([
              { 
                name: 'mealName', 
                message: 'Nombre de la comida (ej. Desayuno)', 
                validate: v => v.trim() ? true : 'Obligatorio' 
              },
              { 
                name: 'addItems', 
                type: 'confirm', 
                message: '¿Agregar alimentos a esta comida?', 
                default: true 
              }
            ]);

            const items = [];
            if (meal.addItems) {
              while (true) {
                const it = await inquirer.prompt([
                  { 
                    name: 'itemName', 
                    message: 'Nombre del alimento', 
                    validate: v => v.trim() ? true : 'Obligatorio' 
                  },
                  { 
                    name: 'calories', 
                    message: 'Calorías (kcal)', 
                    validate: v => (!isNaN(parseFloat(v)) && Number(v) >= 0) || 'Número válido' 
                  },
                  { 
                    name: 'more', 
                    type: 'confirm', 
                    message: 'Agregar otro alimento en esta comida?', 
                    default: true 
                  }
                ]);
                items.push({ name: it.itemName, calories: parseFloat(it.calories) });
                if (!it.more) break;
              }
            }

            // 👇 CORRECTO: usamos meal.mealName y items
            meals.push({ name: meal.mealName, items });

            const { moreMeals } = await inquirer.prompt([
              { name: 'moreMeals', type: 'confirm', message: 'Agregar otra comida?', default: false }
            ]);
            if (!moreMeals) break;
          }

          const entry = await services.nutritionService.addFoodEntry({
            clientId: client._id,
            date: a1.date,
            meals
          });

          console.log(chalk.green('✅ Entrada de alimentos guardada:'), { totalCalories: entry.totalCalories });
          break;
        }

        // ================== REPORTE NUTRICIONAL SEMANAL ==================
        case 'nutrition_weekly_report': {
          const a = await inquirer.prompt([
            { name: 'email', message: 'Email del cliente', validate: async v => { if (!v.trim()) return 'Obligatorio'; const c=await services.clientService.findByEmail(v); return c? true: 'Cliente no encontrado'; } },
            { name: 'weekStart', message: 'Fecha inicio de semana (YYYY-MM-DD) (enter = lunes de esta semana)', default: () => dayjs().startOf('week').add(1,'day').format('YYYY-MM-DD') } // asume lunes
          ]);
          const client = await services.clientService.findByEmail(a.email);
          const report = await services.nutritionService.getWeeklyReport({ clientId: client._id, weekStartDate: a.weekStart });
        
          console.log(chalk.green(`\n📊 Reporte nutricional semanal de ${client.name} (semana ${a.weekStart})`));
          Object.keys(report.byDay).forEach(day => {
            const d = report.byDay[day];
            console.log(`- ${day}: ${d.totalCalories} kcal (${d.entries.length} entradas)`);
            d.entries.forEach(en => {
              console.log(`   • ${new Date(en.date).toLocaleString()} - ${en.totalCalories} kcal`);
              en.meals.forEach(m => {
                console.log(`     - ${m.name}:`);
                m.items.forEach(it => console.log(`         • ${it.name}: ${it.calories} kcal`));
              });
            });
          });
          console.log(chalk.blue(`Total semana: ${report.totalWeek} kcal`));
          break;
        }
        
        // ================== RENOVAR PLAN ==================
        case 'renew_plan': {
          const { email } = await inquirer.prompt([
            {
              name: 'email',
              message: 'Email del cliente',
              validate: async (v) => {
                if (!v.trim()) return '❌ El email es obligatorio';
                const exists = await services.clientService.findByEmail(v);
                return exists ? true : '❌ Cliente no encontrado';
              }
            }
          ]);

          const client = await services.clientService.findByEmail(email);

          // buscar contrato activo
          const activeContract = await services.db.collection('contracts')
            .findOne({ clientId: client._id, status: 'active' });

          if (!activeContract) {
            console.log(chalk.yellow('⚠️ El cliente no tiene un contrato activo.'));
            break;
          }

          // Extender contrato (ejemplo: +4 semanas)
          const newEnd = new Date(activeContract.endDate.getTime() + (4 * 7 * 24 * 60 * 60 * 1000));
          await services.db.collection('contracts')
            .updateOne({ _id: activeContract._id }, { $set: { endDate: newEnd } });

          console.log(chalk.green(`✅ Plan renovado hasta ${newEnd.toLocaleDateString()}`));
          break;
        }

        // ================== CANCELAR PLAN ==================
        case 'cancel_plan': {
          const { email, reason } = await inquirer.prompt([
            {
              name: 'email',
              message: 'Email del cliente',
              validate: async (v) => {
                if (!v.trim()) return '❌ El email es obligatorio';
                const exists = await services.clientService.findByEmail(v);
                return exists ? true : '❌ Cliente no encontrado';
              }
            },
            {
              name: 'reason',
              message: 'Motivo de cancelación',
              validate: (v) => v.trim() ? true : '❌ El motivo es obligatorio'
            }
          ]);

          const client = await services.clientService.findByEmail(email);
          const res = await services.planService.cancelContractByClient(client._id, reason);

          console.log(chalk.yellow('🚫 Contrato cancelado:'), res);
          break;
        }

        // ================== FINALIZAR PLAN ==================
        case 'finish_plan': {
          const { email } = await inquirer.prompt([
            {
              name: 'email',
              message: 'Email del cliente',
              validate: async (v) => {
                if (!v.trim()) return '❌ El email es obligatorio';
                const exists = await services.clientService.findByEmail(v);
                return exists ? true : '❌ Cliente no encontrado';
              }
            }
          ]);

          const client = await services.clientService.findByEmail(email);

          // buscar contrato activo
          const activeContract = await services.db.collection('contracts')
            .findOne({ clientId: client._id, status: 'active' });

          if (!activeContract) {
            console.log(chalk.yellow('⚠️ El cliente no tiene un contrato activo.'));
            break;
          }

          await services.db.collection('contracts')
            .updateOne(
              { _id: activeContract._id },
              { $set: { status: 'finished', finishedAt: new Date() } }
            );

          await services.db.collection('clients')
            .updateOne({ _id: client._id }, { $set: { status: 'inactive' } });

          console.log(chalk.green('✅ Plan finalizado correctamente.'));
          break;
        }
        // ================== ASIGNAR PLAN (CONTRATO) ==================
        case 'assign_plan': {
          const a = await inquirer.prompt([
            {
              name: 'email',
              message: 'Email del cliente',
              validate: async (v) => {
                if (!v.trim()) return '❌ El email es obligatorio';
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!regex.test(v)) return '❌ Email no válido';
                const exists = await services.clientService.findByEmail(v);
                return exists ? true : '❌ Cliente no encontrado';
              }
            },
            {
              name: 'planName',
              message: 'Nombre del plan',
              validate: async (v) => {
                if (!v.trim()) return '❌ El nombre del plan es obligatorio';
                const exists = await services.planService.findByName(v);
                return exists ? true : '❌ Plan no encontrado';
              }
            }
          ]);

          const client = await services.clientService.findByEmail(a.email);
          const plan = await services.planService.findByName(a.planName);

          console.log(chalk.yellow('\n📋 Resumen del contrato:'));
          console.log(`   Cliente: ${client._id}`);
          console.log(`   Plan:    ${plan.name}`);
          console.log(`   Precio:  ${plan.price}\n`);

          const { confirm } = await inquirer.prompt([
            { name: 'confirm', type: 'confirm', message: '¿Confirmar contrato?', default: true }
          ]);

          if (!confirm) {
            console.log(chalk.red('❌ Contrato cancelado.'));
            break;
          }

          const contract = await services.planService.assignPlanToClient({
            clientId: client._id,
            planId: plan._id,
            price: plan.price
          });

          console.log(chalk.green('✅ Contrato creado:'), {
            contratoId: contract._id,
            cliente: client._id,
            plan: plan.name,
            precio: contract.price
          });
          break;
        }


        // ================== REGISTRAR INGRESO ==================
        case 'register_income': {
          const a = await inquirer.prompt([
            {
              name: 'email',
              message: 'Email del cliente',
              validate: async (v) => {
                if (!v.trim()) return '❌ Obligatorio';
                const exists = await services.clientService.findByEmail(v);
                return exists ? true : '❌ Cliente no encontrado';
              }
            },
            {
              name: 'contractId',
              message: 'ID del contrato (enter si no aplica)',
              default: ''
            },
            {
              name: 'planId',
              message: 'ID del plan (enter si no aplica)',
              default: ''
            },
            {
              name: 'concept',
              message: 'Concepto del pago',
              validate: v => v.trim() ? true : '❌ Obligatorio'
            }
          ]);

          const client = await services.clientService.findByEmail(a.email);

          const income = await services.financeService.registerIncomeSafe({
            clientId: client._id,
            contractId: a.contractId || null,
            planId: a.planId || null,
            concept: a.concept
          });

          console.log(chalk.green('✅ Ingreso registrado:'), income);
          break;
        }

        // ================== REGISTRAR EGRESO ==================
        case 'register_expense': {
          const a = await inquirer.prompt([
            {
              name: 'concept',
              message: 'Concepto del gasto (ej. Servicios, Suplementos, Operativos)',
              validate: v => v.trim() ? true : '❌ Obligatorio'
            },
            {
              name: 'amount',
              message: 'Monto del gasto',
              validate: v => !isNaN(parseFloat(v)) && Number(v) > 0 || '❌ Debe ser un número válido'
            }
          ]);

          const expense = await services.financeService.registerExpenseSafe({
            concept: a.concept,
            amount: parseFloat(a.amount)
          });          

          console.log(chalk.green('✅ Gasto registrado:'), expense);
          break;
        }
        // ================== CONSULTAR BALANCE ==================
        case 'get_balance': {
          const a = await inquirer.prompt([
            { name: 'from', message: 'Desde (YYYY-MM-DD)', validate: v => v.trim() ? true : '❌ Obligatorio' },
            { name: 'to', message: 'Hasta (YYYY-MM-DD)', validate: v => v.trim() ? true : '❌ Obligatorio' },
            { name: 'email', message: 'Email del cliente (enter = todos)', default: '' }
          ]);

          let clientId = null;
          if (a.email.trim()) {
            const client = await services.clientService.findByEmail(a.email);
            if (!client) throw new Error('Cliente no encontrado');
            clientId = client._id;
          }

          const report = await services.financeService.getBalance({
            from: new Date(a.from),
            to: new Date(a.to),
            clientId
          });
          

          console.log(chalk.blue('\n📊 Balance financiero'));
          console.log('Ingresos:', report.ingresos);
          console.log('Egresos:', report.egresos);
          console.log('Balance:', report.balance);
          console.log('--- Detalle ---');
          report.detalle.forEach(r => {
            console.log(`${r.type.toUpperCase()} | ${r.concept} | $${r.amount} | ${r.createdAt.toISOString().split('T')[0]}`);
          });

          break;
        }

        // ================== CANCELAR CONTRATO ==================
        case 'cancel_contract': {
          const a = await inquirer.prompt([
            {
              name: 'contractId',
              message: 'ID del contrato',
              validate: (v) => v.trim() !== '' || '❌ El ID del contrato es obligatorio'
            },
            {
              name: 'reason',
              message: 'Motivo de cancelación',
              validate: (v) => v.trim() !== '' || '❌ El motivo no puede estar vacío'
            }
          ]);

          const res = await services.planService.cancelContract({
            contractId: a.contractId,
            reason: a.reason
          });

          console.log(chalk.yellow('⚠️ Contrato cancelado:'), res);
          break;
        }

        // ================== REGISTRAR PROGRESO ==================
        case 'register_progress': {
          const a = await inquirer.prompt([
            {
              name: 'email',
              message: 'Email del cliente',
              validate: async (v) => {
                if (!v.trim()) return '❌ El email es obligatorio';
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!regex.test(v)) return '❌ Email no válido';
                const exists = await services.clientService.findByEmail(v);
                return exists ? true : '❌ Cliente no encontrado';
              }
            },
            {
              name: 'weight',
              message: 'Peso (kg)',
              validate: v => !isNaN(parseFloat(v)) || '❌ Número requerido'
            },
            {
              name: 'bmi',
              message: 'IMC',
              validate: v => !isNaN(parseFloat(v)) || '❌ Número requerido'
            },
            {
              name: 'bodyFat',
              message: 'Grasa corporal (%)',
              validate: v => !isNaN(parseFloat(v)) || '❌ Número requerido'
            },
            { name: 'chest', message: 'Medida de pecho (cm, opcional)',
              validate: v => !isNaN(parseFloat(v)) || '❌ Número requerido'
             },
            { name: 'waist', message: 'Medida de cintura (cm, opcional)',
              validate: v => !isNaN(parseFloat(v)) || '❌ Número requerido'
             },
            { name: 'arm', message: 'Medida de brazo (cm, opcional)',
              validate: v => !isNaN(parseFloat(v)) || '❌ Número requerido'
             },
             { name: 'leg', message: 'Medida de pierna (cm, opcional)',
              validate: v => !isNaN(parseFloat(v)) || '❌ Número requerido'
             },
             { name: 'abs', message: 'Medida de abdomen (cm, opcional)',
              validate: v => !isNaN(parseFloat(v)) || '❌ Número requerido'
             },
            {
              name: 'photoUrl',
              message: 'URL de la foto (opcional)',
              validate: v => {
                if (!v.trim()) return true; // opcional
                if (!v.startsWith('http')) return '❌ Debe ser una URL válida';
                return true;
              }
            },
            {
              name: 'comments',
              message: 'Comentarios (opcional)'
            }
          ]);

          const client = await services.clientService.findByEmail(a.email);
          const rec = await services.clientService.registerProgress({
            clientId: client._id,
            weight: parseFloat(a.weight),
            bodyFat: parseFloat(a.bodyFat),
            bmi: parseFloat(a.bmi),
            measurements: {
              chest: a.chest ? parseFloat(a.chest) : null,
              waist: a.waist ? parseFloat(a.waist) : null,
              arm: a.arm ? parseFloat(a.arm) : null,
              leg: a.leg ? parseFloat(a.leg) : null, 
              abs: a.abs ? parseFloat(a.abs) : null,  
            },
            photoUrl: a.photoUrl,
            comments: a.comments
          });

          console.log(chalk.green('📈 Progreso registrado:'), rec);
          break;
        }


        // ================== VER PROGRESO ==================
        case 'view_progress': {
          const { email } = await inquirer.prompt([
            {
              name: 'email',
              message: 'Email del cliente',
              validate: async (v) => {
                if (!v.trim()) return '❌ El email es obligatorio';
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!regex.test(v)) return '❌ Email no válido';
                const exists = await services.clientService.findByEmail(v);
                return exists ? true : '❌ Cliente no encontrado';
              }
            }
          ]);

          const { client, records } = await services.clientService.viewProgressByEmail(email);

          console.log(chalk.green(`📊 Progreso de ${client.name}:`));
          if (records.length === 0) {
            console.log(chalk.yellow('⚠️ No hay registros de progreso todavía.'));
          } else {
            records.forEach(r => {
              console.log(
                `📅 ${r.date.toISOString().split('T')[0]} | ` +
                `Peso: ${r.weight}kg | IMC: ${r.bmi} | Grasa: ${r.bodyFat || 'N/A'}% | ` +
                `Notas: ${r.comments || 'N/A'}`
              );
              if (r.photoUrl) {
                console.log(`   📸 Foto: ${r.photoUrl}`);
              }
              if (r.measurements) {
                console.log(
                  `   📏 Medidas: ` +
                  (r.measurements.chest ? `Pecho: ${r.measurements.chest}cm | ` : '') +
                  (r.measurements.waist ? `Cintura: ${r.measurements.waist}cm | ` : '') +
                  (r.measurements.arm ? `Brazo: ${r.measurements.arm}cm |  ` : '') +
                  (r.measurements.leg ? `Pierna: ${r.measurements.leg}cm | ` : '') +
                  (r.measurements.abs ? `Abdomen: ${r.measurements.abs}cm` : '')
                );
              }
            });

            // 📌 Resumen automático
            const first = records[records.length - 1];
            const last = records[0];

            console.log(chalk.blue('\n📈 Resumen de evolución:'));
            console.log(`   ⚖️ Peso inicial: ${first.weight}kg → Peso actual: ${last.weight}kg (${(last.weight - first.weight).toFixed(1)}kg)`);
            console.log(`   🧮 IMC inicial: ${first.bmi} → IMC actual: ${last.bmi} (${(last.bmi - first.bmi).toFixed(1)})`);

            if (first.bodyFat && last.bodyFat) {
              console.log(`   💪 Grasa corporal inicial: ${first.bodyFat}% → Actual: ${last.bodyFat}% (${(last.bodyFat - first.bodyFat).toFixed(1)}%)`);
            }
          }
          break;
        }

        // ================== REPORTE FINANCIERO ==================
        case 'financial_report': {
          const { email } = await inquirer.prompt([
            {
              name: 'email',
              message: 'Email del cliente',
              validate: async (v) => {
                if (!v.trim()) return '❌ El email es obligatorio';
                const exists = await services.clientService.findByEmail(v);
                return exists ? true : '❌ Cliente no encontrado';
              }
            }
          ]);

          const client = await services.clientService.findByEmail(email);
          const report = await services.financeService.getPaymentsByClient(client._id); // 👈 corregido

          if (!report || report.length === 0) {
            console.log(chalk.yellow('⚠️ No hay pagos registrados.'));
          } else {
            console.log(chalk.green('\n=== REPORTE FINANCIERO ==='));
            report.forEach((r, i) => {
              console.log(`${i + 1}. Pago de $${r.amount} en ${new Date(r.date).toLocaleDateString()}`);
            });
          }
          break;
        }
        // ================= BACKUPS =================
        case 'backups': {
          const clients = await services.BackupsService.listClients();
          if (clients.length === 0) {
            console.log(chalk.yellow('⚠️ No hay clientes registrados.'));
          } else {
            console.log(chalk.green('\n=== LISTA DE CLIENTES ==='));
            clients.forEach((c, i) => {
              console.log(
                `${i + 1}. ${c.name} (${c.age} años) - Email: ${c.contact?.email || 'N/A'}`
              );
            });
          }
          break;
        }

        case 'delete_backup_client': {
          const { email } = await inquirer.prompt([
            {
              name: 'email',
              message: 'Email del cliente a eliminar',
              validate: async (v) => {
                if (!v.trim()) return '❌ El email es obligatorio';
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!regex.test(v)) return '❌ Email no válido';
                const exists = await services.BackupsService.findByEmail(v);
                return exists ? true : '❌ Cliente no encontrado';
              }
            }
          ]);

          const client = await services.BackupsService.findByEmail(email);

          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `⚠️ ¿Seguro que deseas eliminar al cliente "${client.name}"? Esta acción no se puede deshacer.`,
              default: false
            }
          ]);

          if (!confirm) {
            console.log(chalk.yellow('❌ Eliminación cancelada.'));
            break;
          }

          try {
            await services.BackupsServiceService.deleteClient(client._id);
            console.log(chalk.green(`✅ Cliente "${client.name}" eliminado correctamente.`));
          } catch (err) {
            // Manejo de error cuando tiene contrato activo u otro problema
            console.log(chalk.red('❌ No se pudo eliminar al cliente:'), err.message);
          }

          break;
        }  
            


        // ================== SALIR ==================
        case 'exit': {
          console.log(chalk.red('👋 Saliendo de la aplicación...'));
          process.exit(0);
        }
      }
    } catch (err) {
      console.error(chalk.red('❌ Error:'), err.message);
    }
  }
}
module.exports = { mainMenu }
