# Software 5S · CD Nariño

Software web de auditorías 5S para el Centro de Distribución de Nariño (AB InBev). Digitaliza el checklist físico/Excel de 5S.

## Qué hace el sistema

- 5 formularios (uno por área): **Almacén, Administrativo (Oficinas), Montacargas, Camiones, Taller mecánico**.
- Cada formulario tiene 5 secciones (1°S a 5°S: Clasificación, Orden, Limpieza, Estandarización/Padronización, Disciplina) con preguntas.
- Cada pregunta se responde con una escala de opciones — **la escala varía por área** (ver tabla abajo).
- **Particularidad clave:** Camiones (23 placas), Montacargas (3 unidades: 633, 872, 566), Almacén (9 zonas) y Administrativo (4 zonas) se diligencian **por cada activo/zona individual**, no una sola vez por área. Solo Taller mecánico se diligencia una vez por área. Ver detalle en "Cambios posteriores a Fase 8" más abajo.
- **Cada formulario (por activo/zona, si aplica) solo se puede diligenciar una vez por semana calendario (lunes-domingo)** — el envío se bloquea, no es solo una advertencia. Ver detalle abajo.

## Escalas por checklist

| Checklist | Escala | Niveles |
|---|---|---|
| Camiones | No OK. Hay Gaps / Necesita acciones de mejora / OK | 3 |
| Camiones — excepción "Mantenimiento" (sección 3°S, item 7) | 0=sin tratamiento / 1=en curso / 3=completo | escala propia, solo esa pregunta |
| Almacén | Muy malo / Malo / Regular / Bueno / Muy bueno | 5 |
| Taller mecánico | No aplica / No ok / Cumpliendo pero con lagunas / Ok | 4 |
| Administrativo | No aplica / No ok / Cumpliendo pero con lagunas / Ok | 4 |
| Montacargas | No aplica / No OK / Cumpliendo pero con lagunas / Ok | 4 |

La estructura completa (todas las preguntas, secciones y subcategorías de los 5 checklists) es el Apéndice del PDF de la **Fase 3** — esa es la fuente literal para el seeder, no reinterpretar desde aquí.

## Roles

- **Administrador**: gestiona usuarios, catálogos de activos, checklists, y ve el dashboard general.
- **Responsable**: tiene un área asignada; solo ve/diligencia el formulario de esa área. Si su área se evalúa por activo (Camiones, Montacargas, Almacén, Administrativo), primero elige la placa/unidad/zona.

## Login

Usuario = tipo + número de identificación. Contraseña inicial = número de identificación (cambio obligatorio en primer ingreso).

## Dashboard

Se basa en un tablero de Power BI de referencia (`BU_-_5S.pdf`), sin el filtro de Región (el sistema es exclusivo del CD Nariño). Gráficas dinámicas con Chart.js.

## Stack

- Backend: Laravel 12 + Inertia.js v2 (`laravel/react-starter-kit`)
- Frontend: React 19 + TypeScript, Tailwind v4, componentes estilo shadcn/ui sobre Radix
- Base de datos: SQLite en desarrollo local (el PDF sugiere MySQL — confirmar antes de producción)
- Laravel Boost instalado con skills de convenciones (infer-conventions, laravel-best-practices, inertia-react-development, tailwindcss-development)

## Plan de 8 fases

| # | Fase | Estado |
|---|---|---|
| 1 | Cimientos y autenticación | **Hecha** |
| 2 | Gestión de usuarios | **Hecha** |
| 3 | Catálogos: activos y checklists | **Hecha** |
| 4 | Diligenciamiento de formularios | **Hecha** |
| 5 | Dashboard — filtros e indicadores generales | **Hecha** |
| 6 | Dashboard — rankings y detalle | **Hecha** |
| 7 | Dashboard — exportación y refinamiento | **Hecha** |
| 8 | Planes de acción (opcional) | **Hecha** |

Cada fase se trabaja en sesión nueva, pegando el PDF de esa fase. Este archivo se actualiza al cerrar cada fase con las decisiones tomadas y las convenciones de nombres reales usadas en el código.

## Modelo de datos (sugerido, se confirma/ajusta fase a fase)

- `users` (nombres, apellidos, tipo_identificacion, numero_identificacion [unique, login], password, rol [admin/responsable], must_change_password, area_id nullable)
- `areas` (id, nombre) — Almacén, Administrativo, Montacargas, Camiones, Taller mecánico
- `activos` (id, area_id, codigo [placa/número], tipo [camion/montacargas], activo)
- `checklists_plantilla` (id, area_id, nombre)
- `secciones_5s` (id, checklist_plantilla_id, nombre, orden) — 1°S…5°S
- `preguntas` (id, seccion_id, subcategoria, texto)
- `escalas_opciones` (id, checklist_plantilla_id o pregunta_id, texto_opcion, peso_numerico, orden)
- `checklists_respuesta` (id, checklist_plantilla_id, usuario_id, activo_id nullable, fecha, resultado_porcentaje)
- `respuestas_detalle` (id, checklist_respuesta_id, pregunta_id, opcion_id, observacion, foto_url)
- `planes_accion` (id, respuesta_detalle_id, responsable_id, descripcion, fecha_limite, estado, fecha_cierre) — Fase 8, opcional

## Decisiones pendientes de confirmar con el negocio

Estas están marcadas explícitamente en los PDFs como abiertas — no asumir, preguntar al usuario cuando la fase correspondiente las toque:

1. **Fórmula de % de adherencia**: implementada en Fase 4 como decisión provisional (ver sección Fase 4 más abajo) — normaliza cada respuesta a 0-100% dentro de su propia escala y promedia. **Sigue sin confirmar con negocio**, es la fórmula "más razonable" que se me ocurrió para resolver que la escala de Mantenimiento en Camiones no esté en 0-100, no una decisión de negocio real.
2. **"No aplica"**: implementado y probado en Fase 4 — las respuestas con `excluye_promedio=true` se excluyen del promedio (no cuentan como 0). Verificado con test manual: 5 "No aplica" + resto "Ok" en Taller mecánico dio 100%, no un valor más bajo.
3. **Pesos por defecto de cada escala**: aplicados en Fase 3 (ver tabla más abajo). Provisional, confirmar con negocio.
4. **Checklist obligatorio vs. borrador**: decisión tomada en Fase 4 — **todas las preguntas activas son obligatorias, no existe guardar borrador**. El backend rechaza el envío si falta alguna (probado: enviar 20/21 respuestas de Camiones devuelve error de validación y no crea el registro).
5. **HU-18 (no repetir formulario en el periodo)**: decisión original de Fase 4 — advertencia no bloqueante, período = mismo mes/año — **reemplazada** después de Fase 8 a pedido explícito del negocio: ahora es **bloqueante y semanal** (lunes-domingo). Ver "Cambios posteriores a Fase 8" más abajo.
6. **Restricción de placas/zonas por responsable** (áreas evaluadas por activo): ¿acceso a todas las placas/zonas del área, o restringido a algunas vía tabla pivote `usuario_activo`? Opcional, solo si negocio lo pide. **No implementado** (el negocio no lo ha pedido explícitamente) — el responsable ve todas las placas/unidades/zonas activas de su área.
7. **Qué se considera "GAP" por escala**: implementado en Fase 6 — columna `es_gap` en `escalas_opciones`, parametrizada por dato (no hardcodeada por texto en el código). Ver detalle en la sección Fase 6 más abajo. La asignación concreta (qué opción de cada escala es GAP) es una decisión mía razonable siguiendo lo que el PDF sugiere como ejemplo, **no confirmada por negocio**.
8. **Alcance de exportación** (HU-29): implementadas **ambas** en Fase 7 (el propio HU-29 ya las contemplaba a las dos) — dashboard completo a PDF y Excel, y checklist puntual a PDF. Ver detalle abajo.
9. **Fase 8 (Planes de acción)**: implementada a pedido explícito del usuario aunque es opcional. Ver detalle abajo.
10. **Localización completa a español**: solo se tradujeron las pantallas de login y cambio de contraseña forzado (texto propio). El resto de la UI (settings, dashboard) y los mensajes de validación de Laravel siguen en inglés — traducir todo el sistema es una tarea aparte (`lang:publish` + traducción) no incluida en el alcance de Fase 1.

## Fase 1 — Cimientos y autenticación (hecha)

**Decisión tomada — recuperación de contraseña**: se optó por **exclusivamente vía administrador** (no autoservicio por email), porque no hay garantía de que todos los operarios de CD tengan correo corporativo. El flujo de "olvidé mi contraseña" por email/token del starter kit se eliminó por completo (`PasswordResetLinkController`, `NewPasswordController`, páginas `forgot-password`/`reset-password`, tabla `password_reset_tokens`). HU-04 quedará totalmente resuelta cuando la Fase 2 (HU-09) construya el botón de "restablecer contraseña" en el panel de administrador; mientras tanto no existe autoservicio.

**Otras adaptaciones sobre el starter kit:**
- Se eliminó el registro público (`RegisteredUserController`, página `register`) — sistema cerrado, los usuarios los crea el administrador (Fase 2).
- Se eliminó la verificación de email (`VerifyEmailController` y relacionados) — no aplica al login por cédula.
- La landing pública (`welcome.tsx`) se quitó; `/` redirige a `login` o `dashboard` según sesión.
- El login usa solo `numero_identificacion` + `password` (no se pide `tipo_identificacion` en el login porque el número ya es único en todo el sistema, según HU-05).
- Redirección post-login: por ahora **tanto Admin como Responsable van a `/dashboard`** — la vista "formulario de su área" para Responsable no existe hasta la Fase 4. Está marcado con `// TODO (Fase 4)` en `AuthenticatedSessionController` y `ChangePasswordController`.

**Modelo `users` (tabla real, ya migrada):**
`id, nombres, apellidos, tipo_identificacion, numero_identificacion (unique, login), email (nullable, unique), password, rol (admin|responsable, enum App\Enums\UserRole), must_change_password (bool, default true), area_id (nullable, sin FK todavía), remember_token, timestamps`.

- El modelo `User` expone un accessor `name` (`nombres` + `apellidos`) para no romper los componentes de UI del starter kit que ya esperaban `user.name` (avatar, sidebar, etc.).
- `area_id` está en la tabla desde ya pero **sin foreign key** — la Fase 2 debe crear `areas` y añadir la constraint.

**Middleware de cambio de contraseña forzado**: `App\Http\Middleware\EnsurePasswordIsChanged`, registrado global en el grupo `web` (`bootstrap/app.php`). Si `must_change_password` es true, redirige a `GET /cambiar-password` (rutas `password.change.edit` / `password.change.update`) para cualquier ruta excepto esa misma y `logout`.

**Seed**: `database/seeders/DatabaseSeeder.php` crea un admin semilla — cédula `1000000000`, contraseña inicial igual a la cédula, `must_change_password=true`. Usarlo para la primera prueba manual de login.

## Fase 2 — Gestión de usuarios (hecha)

**Modelo `areas`**: `id, nombre (unique), timestamps`. Sembradas las 5 áreas fijas del PDF (`AreaSeeder`, llamado desde `DatabaseSeeder`): Almacén, Administrativo, Montacargas, Camiones, Taller mecánico.

**`users` ampliada**: se agregó `activo` (boolean, default true) y la foreign key real `area_id → areas.id` (migración `2026_08_18_152718_...`, separada de la migración base de Fase 1 como estaba planeado).

**Login bloquea usuarios inactivos** (HU-07) sin filtrar información: `LoginRequest::authenticate()` añade `'activo' => true` directamente a las credenciales de `Auth::attempt()`, así que un usuario inactivo simplemente "no se encuentra" y cae en el mismo mensaje genérico que una contraseña incorrecta — no hay una rama de código separada que pueda filtrar "la cuenta existe pero está inactiva".

**Autorización**: `App\Policies\UserPolicy` (auto-descubierta por convención, no requirió registro manual). Todo el CRUD exige rol Admin. Método extra `manageStatus` (usado por activar/inactivar y restablecer contraseña) además exige que el admin no se esté targeteando a sí mismo — evita que un admin se bloquee el acceso por accidente. Verificado con pruebas manuales: intento de auto-inactivación devuelve 403, y un usuario con rol Responsable recibe 403 en `GET /admin/usuarios`.

**Rutas** (`routes/admin.php`, prefijo `admin/usuarios`, todas bajo `auth`):
`admin.users.index|create|store|edit|update` (CRUD estándar) + dos acciones dedicadas: `admin.users.toggle-status` (PATCH, activar/inactivar) y `admin.users.reset-password` (PATCH, contraseña ← número de identificación + `must_change_password=true`).

**Frontend**: `resources/js/pages/admin/users/{index,create,edit,user-form}.tsx`. `index.tsx` trae filtro por texto (nombre/cédula, con debounce), área, rol y estado, servidos vía query string y paginación server-side (Eloquent `paginate()`). Se agregó el componente base `resources/js/components/ui/table.tsx` (no existía en el starter kit). El link "Usuarios" en el sidebar (`app-sidebar.tsx`) solo aparece si `auth.user.rol === 'admin'` — ahí quedó el primer punto del código que distingue vistas por rol; la Fase 4 deberá seguir el mismo patrón para la vista del Responsable.

**No implementado a propósito**: tabla pivote `usuario_activo` para restringir placas (ver decisión pendiente #6 arriba) — no existe aún la tabla `activos` (es de Fase 3), así que tampoco sería viable todavía.

## Fase 3 — Catálogos: activos y checklists (hecha)

**Modelo `activos`**: `id, area_id (FK), codigo (unique), tipo (App\Enums\ActivoTipo: camion|montacargas), activo (bool), timestamps`. Sembrados los 23 camiones y 3 montacargas literales del Apéndice (`ActivoSeeder`). `tipo` es redundante con `area_id` (Camiones↔camion, Montacargas↔montacargas) pero se mantuvo porque el PDF lo pide explícito en el modelo sugerido; el admin solo elige "tipo" al crear y el controlador deriva el `area_id` automáticamente.

**Modelo de checklists** (HU-12), tal como lo sugiere el PDF:
- `checklists_plantilla` (id, area_id, nombre)
- `secciones_5s` (id, checklist_plantilla_id, nombre, orden) — nombre completo tipo `"1°S Clasificación"`, se preservó el nombre exacto de cada área para la 4°S (unas usan "Padronización", Almacén usa "Estandarización" — así viene en el docx original, no se normalizó).
- `preguntas` (id, seccion_id, subcategoria nullable, texto, orden, **activa** — para HU-13)
- `escalas_opciones` (id, **checklist_plantilla_id nullable**, **pregunta_id nullable**, texto_opcion, peso_numerico nullable, **excluye_promedio** bool, orden). Cada fila pertenece a *uno* de los dos FKs: la escala general de un checklist, o la escala propia de una sola pregunta (usado solo por la excepción de "Mantenimiento" en Camiones). `Pregunta::opciones()` resuelve cuál usar (propia si existe, si no la general del checklist) — probado con tinker, funciona.

**Pesos aplicados en el seeder** (`ChecklistSeeder`, convención sugerida por el PDF: peor=0, mejor=100, intermedias proporcionales — provisional, ver decisión pendiente #3):
- Camiones (3 niveles): No OK=0, Necesita mejora=50, OK=100.
- Camiones — Mantenimiento (escala propia, valores **literales** del documento, no la convención 0-100): Sin tratamiento=0, En curso=1, Completo=3.
- Almacén (5 niveles): Muy malo=0, Malo=25, Regular=50, Bueno=75, Muy bueno=100.
- Taller mecánico / Administrativo / Montacargas (4 niveles, texto de "No aplica" varía levemente por checklist — se preservó tal cual): "No aplica" → `excluye_promedio=true`, sin peso; luego 0 / 50 / 100 para las 3 restantes.

**Verificado contra el Apéndice**: 103 preguntas en total (Camiones 21, Almacén 30, Taller mecánico 19, Administrativo 20, Montacargas 13), 23 placas + 3 montacargas, 20 opciones de escala general + 3 de la escala especial de Mantenimiento — todo contado por código y cuadra con la transcripción literal del PDF.

**HU-10/11 (activos)**: CRUD mínimo — sin "editar" (el PDF no lo pide, solo crear e inactivar/reactivar sin perder histórico). `ActivoPolicy`, rutas en `admin/activos`.

**HU-13 (editar checklist)**: se implementó *solo* gestión de preguntas (agregar, editar texto/subcategoría, activar/desactivar) vía `ChecklistController` + `ChecklistPlantillaPolicy`, en `admin/checklists/{id}`. **No se implementó edición de la escala/pesos** — HU-13 solo menciona preguntas, no las escalas; editar pesos queda fuera de alcance hasta que se pida explícitamente.

**Frontend**: `resources/js/pages/admin/activos/index.tsx` (tabla + dialog de creación) y `resources/js/pages/admin/checklists/{index,show}.tsx` (listado de las 5 plantillas → detalle con secciones/preguntas editables inline). Sidebar ampliado con "Activos" y "Checklists" (admin only).

## Fase 4 — Diligenciamiento de formularios (hecha)

**Modelo** (tal como lo sugiere el PDF):
- `checklists_respuesta` (id, checklist_plantilla_id, usuario_id, activo_id nullable, fecha, resultado_porcentaje nullable)
- `respuestas_detalle` (id, checklist_respuesta_id, pregunta_id, opcion_id, observacion nullable, foto_url nullable)

**`AdherenciaCalculator`** (`app/Services/AdherenciaCalculator.php`), aislado de la lógica de guardado como pide el PDF: por cada respuesta, normaliza el peso de la opción elegida a 0-100% **dentro de la propia escala de esa pregunta** (peso mínimo de esa escala = 0%, máximo = 100%) y promedia. Esto es lo que permite mezclar en el mismo checklist preguntas con escala 0-100 y la excepción de Mantenimiento en Camiones (0/1/3) sin que esta última distorsione el promedio. Las opciones con `excluye_promedio=true` ("No aplica") no participan. **Es una fórmula que yo diseñé para resolver el problema técnico, no una confirmada por negocio** — está aislada a propósito para poder cambiarla sin tocar el controlador. Verificado con cálculo manual: 20 preguntas en "Necesita acciones de mejora" (50%) + 1 en "Tratamiento en curso" (1 de escala 0-3 → 33.33%) da 49.21%, que es exactamente lo que devolvió el sistema.

**HU-14 (ver solo mi formulario)**: `FormularioController::show()` resuelve el checklist por `area_id` del usuario. Si el área es Camiones o Montacargas y no viene `?activo_id=`, muestra `formulario/seleccionar-placa` (solo activos con `activo=true`); si no, o si ya viene la placa, muestra `formulario/diligenciar`. Probado con un responsable de Almacén (va directo) y uno de Camiones (ve las 23 placas primero).

**HU-15/16 (diligenciar + resumen)**: página `diligenciar.tsx` de un solo componente con dos pasos locales (`form` → `resumen`), sin llamada al backend hasta el envío final — no hay borrador guardado en servidor. Cada pregunta se responde con botones (no radio nativo, para no agregar la dependencia `@radix-ui/react-radio-group` que el proyecto no tenía) y permite observación de texto + foto opcional (sube a `storage/app/public/evidencias/checklists`, requirió correr `php artisan storage:link`). El backend exige que **todas** las preguntas activas estén respondidas antes de guardar (transacción única, todo o nada).

**HU-17 (historial)**: `formulario/historial.tsx`, paginado, solo del propio usuario (`ChecklistRespuestaPolicy`).

**HU-18 (advertencia de duplicado)**: `FormularioController` calcula `yaDiligenciadoEstePeriodo` (mismo checklist + mismo activo/área + mismo mes/año) y lo pasa como prop; el frontend solo muestra un `Alert` informativo, no bloquea el envío.

**Redirección post-login para Responsable**: quedó pendiente desde Fase 1/2 (`// TODO Fase 4`) — ya resuelto: `AuthenticatedSessionController` y `ChangePasswordController` redirigen a `formulario.show` en vez de `dashboard` cuando `rol === Responsable`.

**Sidebar**: para rol Responsable ahora muestra "Mi formulario" y "Historial" (sin "Dashboard", que es exclusivo de Admin según el PDF).

**No implementado**: la restricción opcional de placas por responsable (ver decisión pendiente de Fase 2) — cualquier Responsable de Camiones/Montacargas ve todas las placas activas de su área, tal como se dejó documentado que pasaría en esta fase.

## Fase 5 — Dashboard: filtros e indicadores generales (hecha)

**Stack**: se instaló `chart.js` + `react-chartjs-2` (no venían en el starter kit). El dashboard reemplazó por completo el placeholder de `dashboard.tsx` y la ruta placeholder de `routes/web.php` — ahora vive en `routes/dashboard.php`.

**Un solo endpoint agregado** (`GET /dashboard/data`, `DashboardController@data`), como sugiere el PDF, en vez de reusar los endpoints CRUD. Recibe `mes`, `anio`, `area_id`, `activo_id`, `meta` (todos opcionales) y devuelve en un solo JSON: tarjetas resumen, desglose por área, tendencia mensual y desglose por las 5S. El frontend pide este JSON por `fetch()` (no es una visita Inertia) cada vez que cambia un filtro, así los gráficos se actualizan sin recargar la página.

**Cómo se calculan los bloques**:
- Tarjetas y tendencia mensual usan directamente `checklists_respuesta.resultado_porcentaje` (ya viene calculado desde Fase 4) — rápido, sin recorrer respuestas_detalle.
- El desglose **por las 5S** (HU-21) sí necesita bajar a `respuestas_detalle`, porque el resultado por sección no se guarda en ningún lado: agrupa las respuestas filtradas por `pregunta.seccion.orden` (1-5) y reutiliza `AdherenciaCalculator::normalizar()` (refactorizado en esta fase para exponerlo, antes solo tenía `calcular()` para un checklist completo) — así el promedio por sección respeta la misma normalización de escalas que el resultado general, sin duplicar lógica.
- Los nombres de las 5S que se muestran son **canónicos** (`Clasificación, Orden, Limpieza, Estandarización, Disciplina`), no el `nombre` literal de `secciones_5s`, porque ese texto varía por checklist (ej. "Padronización" vs "Estandarización" para la misma 4°S).

**Decisión — línea de meta (HU-22)**: el PDF sugiere metas distintas por checklist (80% Almacén, 85% Taller/Administrativo) pero pide "una línea de meta fija/configurable" para el dashboard general. Implementé un input numérico en el filtro (default 80%) en vez de una meta fija por área — el usuario la ajusta manualmente si quiere comparar contra el umbral de un área específica.

**Autorización**: sin Policy dedicada (no hay un modelo Eloquent natural al que atarla) — chequeo directo `abort_unless($user->rol === UserRole::Admin, 403)` en el controlador. Probado: un Responsable recibe 403 en `/dashboard` y `/dashboard/data`.

**Verificado con datos reales** (no hardcodeados): generé 5 checklists de prueba a mano (3 de Almacén en 3 meses distintos con tendencia ascendente 60→75→90, 2 de Camiones el mes actual con 2 placas distintas) y confirmé que tarjetas, desglose por área, tendencia mensual y filtros (por área, por mes/año, por placa) devuelven los números esperados.

**Nota de mantenimiento del build**: el manifest de Vite (`public/build/`) llevaba desactualizado desde antes de Fase 1 — hubo que correr `npm run build` en esta fase para que las páginas nuevas no rompieran el middleware `AddLinkHeadersForPreloadedAssets` en cargas de página completas. Si algo similar vuelve a pasar (error "Unable to locate file in Vite manifest"), la solución es esa: `npm run build`.

## Fase 6 — Dashboard: rankings y detalle (hecha)

**"GAP" parametrizado, no hardcodeado** (nota técnica explícita del PDF): se agregó la columna `escalas_opciones.es_gap` (boolean, migración `2026_08_18_164928_...`). El `ChecklistSeeder` marca qué opción(es) de cada escala son GAP:
- Camiones: "No OK. Hay Gaps" (dado como ejemplo literal por el PDF).
- Camiones — Mantenimiento (escala especial): "Sin tratamiento".
- Almacén: "Muy malo" y "Malo" (también sugerido literalmente por el PDF).
- Taller mecánico / Administrativo / Montacargas: "No ok"/"No OK" (la peor opción sustantiva; "No aplica" no es GAP, ya está excluida del promedio aparte con `excluye_promedio`).

Esta asignación concreta es una decisión razonable mía siguiendo los ejemplos del PDF, **no confirmada por negocio** — si negocio decide que, por ejemplo, "Cumpliendo pero con lagunas" también debería contar como GAP en las escalas de 4 niveles, basta con actualizar el seeder (o construir la UI de edición de escalas que quedó pendiente desde Fase 3).

**Mismo endpoint, extendido** (como pide el PDF): `DashboardController::data()` de la Fase 5 ahora también devuelve `por_evaluador`, `por_subcategoria`, `por_activo`, `top_oportunidades`, `reincidencias` y `detalle_cruzado`, respetando los mismos filtros (mes/año/área/activo). Para evitar recorrer `respuestas_detalle` varias veces, se construye una sola colección `$respuestasEnriquecidas` (cada respuesta con su área/activo/sección/pregunta/normalizado/es_gap ya resueltos) y todos los bloques de esta fase se derivan de ahí.

- **HU-23 (por evaluador)**: promedio de `resultado_porcentaje` agrupado por `usuario_id`, ordenado descendente.
- **HU-24 (por subcategoría)**: agrupa por `pregunta.subcategoria` (la misma agrupación cargada en Fase 3), usando `AdherenciaCalculator::normalizar()` por respuesta — ordenado ascendente (peor primero) para "ubicar los puntos críticos con precisión". También se subió el desglose por área de Fase 5 (antes solo insignias) a un gráfico de barras real.
- **HU-25 (por activo)**: tabla con placa/número, total de checklists y % promedio.
- **HU-26 (top oportunidades)**: cuenta respuestas con `opcion.es_gap = true` agrupadas por pregunta, top 10.
- **HU-27 (reincidencias)**: agrupa respuestas GAP por `pregunta_id` + alcance (`activo_id` si aplica, si no `area_id`), se queda solo con los grupos que aparecen **2 o más veces** (checklists distintos). Verificado con datos reales: forcé la misma pregunta de Almacén como GAP en 3 checklists sucesivos de la misma responsable y el sistema la reportó correctamente con "veces": 3.
- **HU-28 (detalle cruzado)**: tabla área × sección (1S-5S) con conteo y % promedio; el frontend pivotea la respuesta plana del backend a una matriz para mostrarla como tabla cruzada real.

**Verificado con datos reales** (no hardcodeados): 3 evaluadores, 2 áreas, una pregunta forzada como GAP repetidamente. El ranking por evaluador, el top de oportunidades, las reincidencias y la tabla cruzada devolvieron exactamente los números esperados a mano.

## Fase 7 — Dashboard: exportación y refinamiento (hecha)

**Librerías nuevas** (composer): `barryvdh/laravel-dompdf` (PDF) y `maatwebsite/excel` (Excel). Ambas se auto-descubrieron sin configuración adicional.

**Refactor previo**: la lógica de agregación que vivía dentro de `DashboardController::data()` se extrajo a `App\Services\DashboardAggregator::agregar()`, para que el endpoint JSON, el export a PDF y el export a Excel usen exactamente los mismos números — no hay una segunda copia de la lógica de cálculo en ningún export.

**HU-29 — Exportación (ambas modalidades, como ya contemplaba la propia historia)**:
- Dashboard completo, con los filtros actuales: `GET /dashboard/exportar/pdf` y `GET /dashboard/exportar/excel` (botones en la esquina superior del dashboard). El Excel usa una hoja por bloque (`App\Exports\DashboardExport` + `App\Exports\ArraySheet`, una clase de hoja genérica reutilizable en vez de 8 clases casi idénticas). El PDF (`resources/views/exports/dashboard.blade.php`) es una tabla-resumen apaisada (A4 landscape), pensada para imprimir/compartir en comité, no una réplica visual de los gráficos.
- Checklist puntual a PDF: nueva pantalla admin **"Checklists diligenciados"** (`/admin/checklists-respuesta`, `Admin\ChecklistRespuestaController`) — no existía ningún lugar donde el admin pudiera ver TODOS los checklists de TODAS las áreas (el historial de Fase 4 es solo del propio responsable). Desde ahí se exporta cualquier checklist puntual a PDF con el detalle completo (secciones → preguntas → respuesta elegida → observación).

**HU-30 — Auditoría de calidad transversal**:
- Se cambió el gráfico de "Resultado por las 5S" de barras a **radar** (`react-chartjs-2` `<Radar>` + `RadialLinearScale`), porque el criterio de aceptación del PDF pide explícitamente "dona/radar para las 5S" y antes solo había un gráfico de barras ahí.
- Revisé que todos los gráficos (Fases 5 y 6) reaccionan a los filtros sin recargar la página — ya lo hacían desde que se implementaron (un solo `fetch()` a `dashboard.data` en un `useEffect` con los filtros como dependencias), así que no hubo que tocar eso.
- Todos los gráficos tienen tooltips con el valor exacto: los que llevan formato `%` tienen un callback custom, el resto usa el tooltip por defecto de Chart.js (que ya muestra el valor exacto, no solo la barra).

**Performance (nota técnica del PDF)**: se agregó `Cache::remember()` en `DashboardController::data()`, clave = hash de la combinación de filtros, **60 segundos de expiración** (corto a propósito, porque entran checklists nuevos todo el tiempo y el dashboard debe reflejarlos pronto). Los exports NO pasan por caché — piden datos frescos directo al agregador, ya que son una acción puntual, no algo que se repita en cada cambio de filtro.

**Verificado con datos reales**: exporté el dashboard a PDF (`%PDF-1.7`, 6.5 KB) y a Excel (firma ZIP `PK..`, 16 KB) con datos reales de la Fase 6, y un checklist puntual a PDF. Confirmé que un Responsable recibe 403 en las cuatro rutas nuevas (2 exports del dashboard + listado admin + export puntual), y que el filtro por área del nuevo listado admin devuelve el conteo correcto.

**Con esto, el sistema queda funcionalmente completo para producción según el propio plan del proyecto** — la Fase 8 (Planes de acción) era opcional y también quedó implementada (ver más abajo).

## Fase 8 — Planes de acción (hecha, opcional)

**Modelo**, tal como lo sugiere el PDF: `planes_accion` (id, respuesta_detalle_id, responsable_id, descripcion, fecha_limite, estado, fecha_cierre). `estado` solo guarda `abierto`/`en_progreso`/`cerrado` — **"vencido" nunca se guarda**, se calcula en caliente en `PlanAccion::estadoEfectivo()` (`fecha_limite < hoy && estado != cerrado`), exactamente como sugería la nota técnica para evitar que quede desactualizado. Verificado: un plan con `fecha_limite` pasada y `estado=abierto` en la BD reporta `estado_efectivo=vencido` sin que nadie lo haya tocado.

**Enganche con Top oportunidades/Reincidencias (Fase 6)** — este era el punto delicado que pedía el PDF explícitamente resolver antes de programar: esas tablas están agregadas *por pregunta* (cuentan cuántas veces salió GAP), pero un plan de acción debe apuntar a **una** `respuesta_detalle` puntual. Se resolvió agregando `ultima_respuesta_detalle_id` a cada fila de `top_oportunidades` y `reincidencias` en `DashboardAggregator` (la ocurrencia GAP más reciente de ese grupo) — el botón "Crear plan" de cada fila usa ese id. Probado con la reincidencia real de Fase 6 (misma pregunta marcada GAP 3 veces): el botón crea el plan sobre la última ocurrencia sin problema.

**HU-31 (crear plan) — "responsable o administrador"**: además del botón en el dashboard (rol Admin), se agregó una vía para el rol Responsable: en su historial (`/mi-formulario/historial`) ahora hay un "Ver detalle" por checklist (`FormularioController::historialDetalle`, ruta nueva `formulario.historial.show`, **scopeada al propio usuario** — probado que un responsable recibe 403 si intenta ver el detalle de un checklist ajeno) que lista cada respuesta con su opción elegida, y muestra el botón "Crear plan" solo en las marcadas GAP.

**HU-32 (ver estado)**: tarjeta nueva en el dashboard con el conteo por estado (abierto/en_progreso/cerrado/vencido) — **a propósito NO respeta los filtros de mes/año/área del dashboard** (conteo siempre global), porque la fecha que importa para un plan es su propia `fecha_limite`, no la fecha del checklist que lo originó; mezclar ambas fechas habría sido confuso. También se agregó `/planes-accion`, una página de listado compartida por los dos roles: el administrador ve todos los planes (con filtros de estado/área), un responsable solo ve los que tiene asignados a él — **la política restringe además que un responsable no pueda cambiar el estado de un plan asignado a otro responsable** (probado: 403).

**Autorización** (`PlanAccionPolicy`): crear → Admin o Responsable con área asignada. Actualizar estado → Admin siempre, Responsable solo si es el `responsable_id` del plan. Ver listado → cualquiera de los dos roles (el controlador ajusta el alcance de la consulta, no hace falta una policy por fila).

**Validación de negocio**: `StorePlanAccionRequest` rechaza crear un plan sobre una `respuesta_detalle` cuya opción elegida no tenga `es_gap=true` — probado que el intento no crea ningún registro y devuelve error de validación.

**Verificado con datos reales**: creado un plan sobre la reincidencia real de Fase 6, cambiado de abierto → en_progreso → cerrado (con `fecha_cierre` puesto automáticamente), creado un plan vencido a propósito para confirmar el cálculo dinámico, y confirmados los límites de acceso entre roles (403 en los tres escenarios: detalle de checklist ajeno, editar plan ajeno, y el rechazo de plan sobre respuesta no-GAP).

## Cambios posteriores a Fase 8

Con el sistema ya en producción funcional, el negocio pidió dos cambios que no estaban en ningún PDF de fase — se documentan aquí en vez de retocar el historial de fases ya cerradas.

**Zonas de Almacén y Administrativo (evaluación por activo individual)**: hasta este punto Almacén y Administrativo se diligenciaban una sola vez por área, igual que Taller mecánico. El negocio pidió que, igual que Camiones/Montacargas, se pueda diligenciar el 5S **por cada zona individual**:
- Almacén (9 zonas): Reempaque, Sorting, Residuos y Sustancias Químicas, Bahías de Carga y Descarga T1, Picking, Marketplace, Almacén PT, Vertimiento, Centro de Acopio.
- Administrativo (4 zonas): Oficinas Administrativas OL, Oficinas Administrativas UC, Zona de Liquidación, Salas de agencia.

Se modeló reutilizando la tabla `activos` que ya existía para placas/montacargas — se agregaron los casos `zona_almacen` y `zona_administrativo` a `App\Enums\ActivoTipo`, con un método `areaNombre()` en el propio enum que resuelve a qué área (`Camiones`, `Montacargas`, `Almacén`, `Administrativo`) pertenece cada tipo, para no repetir esa tabla de mapeo en cada sitio que la necesita (`Admin\ActivoController::store`, `ActivoSeeder`). **No hizo falta ninguna migración**: `activos.tipo` ya era un string libre, no un enum de base de datos. Las 13 zonas se sembraron en `ActivoSeeder` (mismo patrón `firstOrCreate` que placas/montacargas, así que correr el seeder de nuevo en una base ya poblada no duplica nada).

`FormularioController::AREAS_POR_ACTIVO` ahora incluye las 4 áreas (`Camiones`, `Montacargas`, `Almacén`, `Administrativo`) — **solo Taller mecánico sigue siendo "una vez por área"**. El resto del sistema (dashboard, exportaciones, historial, planes de acción) ya trabajaba de forma genérica sobre `activo_id` sin asumir qué área era, así que no necesitó cambios más allá de sumar las dos áreas a las listas de "requiere elegir activo" en `FormularioController` y en el filtro del dashboard (`dashboard.tsx`, antes `AREAS_CON_PLACA`, renombrada `AREAS_CON_ACTIVO`).

**HU-18 revisada — bloqueo semanal (no solo advertencia)**: el negocio pidió explícitamente que cada formulario (por activo, si el área lo requiere) **solo se pueda diligenciar una vez por semana calendario** (lunes a domingo, `Carbon::startOfWeek()`/`endOfWeek()`), y que esta vez sí **bloquee el envío**, no solo advierta como la versión de Fase 4. Implementado en `FormularioController`:
- `yaDiligenciadoEstaSemana()` reemplaza a la antigua `yaDiligenciadoEstePeriodo()` (mismo query, ventana semanal en vez de mensual).
- En `show()`: si el combo checklist+activo (o checklist+área, para Taller mecánico) ya se diligenció esta semana, la página `diligenciar` se renderiza en un estado bloqueado (`bloqueadoPorSemana=true`) — no muestra el formulario, solo un aviso explicando que puede volver la próxima semana. Antes de eso, si el área requiere elegir activo, la pantalla `seleccionar-placa` ya marca como "Completado esta semana" (deshabilitado, no clicable) cada placa/unidad/zona que corresponda, para que el responsable no llegue a un formulario bloqueado por sorpresa.
- En `store()`: se repite la misma validación como defensa en profundidad (por si se reenvía una página vieja o se llama al endpoint directamente) — lanza `ValidationException` y no crea ningún registro.

Verificado con `tinker`: se creó un `ChecklistRespuesta` de prueba para una zona de Almacén en la semana en curso y se confirmó que `yaDiligenciadoEstaSemana()` pasa de `false` a `true` para esa zona, que sigue en `false` para una zona distinta de la misma área (el bloqueo es por activo, no por área completa), y que `activosCompletadosEstaSemana()` devuelve exactamente el id de la zona diligenciada.

**No implementado a propósito**: no se migraron los `checklists_respuesta` históricos de Almacén/Administrativo (que tienen `activo_id=null`, de cuando esas áreas eran "una vez por área") — quedan como historial válido, simplemente no participan en el nuevo bloqueo por zona porque ese requiere una zona específica.

**Bloqueo semanal compartido entre usuarios (bug reportado por negocio)**: la implementación original del bloqueo semanal (arriba) filtraba también por `usuario_id`, así que cada responsable tenía su propio bloqueo individual — dos responsables distintos del mismo área SÍ podían diligenciar el mismo activo/zona en la misma semana, uno cada uno, generando duplicados. Negocio pidió explícitamente que el bloqueo sea por combinación checklist+activo (o checklist+área) **sin importar qué usuario lo diligencie**: si cualquier responsable ya lo diligenció esta semana, queda bloqueado para todos los demás hasta la próxima semana. Se quitó el filtro `usuario_id` de `yaDiligenciadoEstaSemana()` y `activosCompletadosEstaSemana()` en `FormularioController` — sigue siendo la misma ventana semanal (lunes-domingo), solo cambió el alcance de a quién bloquea. `checklists_respuesta.usuario_id` se sigue guardando (para auditoría de quién lo diligenció), solo dejó de usarse como filtro del bloqueo.

**Planes de acción — GAPs por área (no por usuario) y responsable autoasignado**: a pedido del negocio, `PlanAccionController::index()` cambió el alcance de "GAPs sin plan" que ve un Responsable: antes solo veía los GAPs de los checklists que él mismo había diligenciado (filtro por `usuario_id`), ahora ve **todos los GAPs de su área asignada**, sin importar quién diligenció ese checklist (filtro por `área_id` de la plantilla, igual que el bloqueo semanal de arriba). Además, `CrearPlanAccionDialog` ahora es consciente del rol (`usePage().props.auth.user.rol`): si es Responsable, el selector de "Responsable" no aparece y el plan se autoasigna a su propio id; si es Admin, conserva el selector para elegir a cualquiera. Reforzado también en `StorePlanAccionRequest` (un Responsable que intente forzar `responsable_id` distinto al suyo recibe error de validación) porque el frontend por sí solo no evita una llamada directa al endpoint. El modal también muestra siempre la pregunta y la opción del GAP (antes solo se veía en la fila de la lista, no dentro del propio modal).

**Recordatorio semanal por correo (HU nueva, a pedido del negocio)**: se agregó el campo `email` (ya existía en la tabla `users` desde el starter kit, pero no se exponía en el formulario de gestión de usuarios) a `admin/usuarios/{create,edit}` — **obligatorio solo si el rol es Responsable** (`required_if:rol,responsable` en `StoreUserRequest`/`UpdateUserRequest`, mismo patrón que `area_id`), porque sin correo el recordatorio no le puede llegar. Comando `php artisan checklists:recordar-pendientes` (`App\Console\Commands\EnviarRecordatoriosChecklist`), agendado a diario a las 8:00 a. m. vía `bootstrap/app.php` (`->withSchedule(...)`) — **requiere que algo dispare `php artisan schedule:run` cada minuto** (cron del sistema operativo o el "Cron Jobs" del panel de hosting; Laravel no lo hace solo, y no hay nada de eso configurado todavía en este entorno). Por cada Responsable activo con correo, revisa su último `ChecklistRespuesta` propio (de cualquier activo/área); si tiene 7 días o más (o nunca ha diligenciado nada, usando su fecha de creación como referencia), le envía `App\Notifications\RecordatorioChecklistPendiente` y guarda `users.recordatorio_enviado_at` para no reenviárselo todos los días — solo vuelve a avisar si pasa otra semana sin que haya diligenciado. Ese contador se limpia solo (`recordatorio_enviado_at = null`) en `FormularioController::store()` cada vez que el usuario diligencia un checklist nuevo, así el ciclo arranca de cero. La notificación es **síncrona, no usa `ShouldQueue`**, a propósito: este proyecto no tiene un worker de colas corriendo (`QUEUE_CONNECTION=database` pero nada consume esa cola), así que un correo en cola que nadie procesa nunca llega — mejor que el comando tarde unos segundos más. Verificado con `config(['mail.default' => 'log'])` en tinker (para no mandar correos reales durante la prueba): el comando detecta correctamente a un responsable con 10 días de antigüedad sin diligenciar, envía el correo, no lo vuelve a enviar en una segunda corrida inmediata, y `recordatorio_enviado_at` vuelve a `null` en cuanto ese responsable diligencia un checklist real desde la UI.

**Meta comparable en todos los gráficos de porcentaje + meta preseleccionada en 90%**: la línea de meta (HU-22, antes solo visible en "Tendencia mensual") ahora se dibuja también en "Resultado por área", "Resultado por subcategoría", "Resultado por evaluador" y "Resultado por las 5S" — se instaló `chartjs-plugin-annotation` para las barras (línea punteada con etiqueta "Meta XX%") y, para el radar, se agregó un segundo dataset "Meta" (un pentágono constante en el valor de la meta) porque el plugin de anotaciones no dibuja bien sobre una escala radial. No se agregó a "Top oportunidades" a propósito — ese gráfico cuenta GAPs, no adherencia, no hay nada que comparar. `DashboardController::META_DEFAULT` pasó de 80.0 a 90.0; el campo sigue siendo editable igual que antes, solo cambió el valor inicial.

**Backfill histórico de demostración (mayo-agosto 2026)**: a pedido del negocio, se generaron 600 `checklists_respuesta` reales (uno por activo/zona/área por cada una de las 15 semanas calendario, lunes-domingo, desde el 4 de mayo hasta la semana del 10 de agosto de 2026), con ~12 000 `respuestas_detalle` y 255 `planes_accion`, usando los responsables ya registrados y la asignación real de zonas de Almacén/Administrativo que dio el negocio (Camiones y Montacargas los diligencia un único responsable cada uno, para todos sus activos). La adherencia general quedó en **92.72%**, pero variada a propósito por área — no todas al mismo nivel — mediante un objetivo distinto por área (Camiones 95%→94.25% real, Almacén 93%→90.78%, Administrativo 96%→95.53%, Montacargas 81%→82.91%, Taller mecánico 95%→93.21%) resuelto por interpolación probabilística entre los niveles de cada escala (para que el promedio real converja cerca del objetivo sin que todas las respuestas sean idénticas) más una probabilidad baja de GAP aislado por pregunta, incluso en áreas con buen desempeño, para que hubiera material real de planes de acción. Las observaciones y descripciones de los planes se llenaron con bancos de frases en español con errores sutiles (tildes omitidas, típico de alguien escribiendo rápido), variadas según si la respuesta fue buena, regular o GAP. El comando usado para generarlo (`App\Console\Commands\GenerarHistoricoDemo`, `php artisan demo:generar-historico`) **se borró después de correrlo** a propósito — no tiene guardia de idempotencia, así que volver a correrlo duplicaría todas las semanas ya generadas; si se necesita volver a generar o ampliar el rango, hay que rehacerlo desde cero (la lógica completa queda documentada aquí, no en el código).

**Pendiente detectado, no resuelto todavía**: con datos a esta escala, la tarjeta "GAPs sin plan de acción" en `planes-accion/index.tsx` (agregada más arriba en este mismo documento) no pagina — con las ~194 GAPs sin plan que quedaron del backfill, la página renderiza una lista larguísima sin cortar. Antes no se notaba porque solo se había probado con un puñado de GAPs de prueba. Si se usa seguido con datos reales de este volumen, conviene paginarla o limitarla a un top N con un enlace a "ver todas".

## Convenciones de nombres

- **Base de datos**: nombres de tabla y columna en español, en snake_case, siguiendo literalmente los nombres del PDF (`nombres`, `apellidos`, `numero_identificacion`, `must_change_password` es la única excepción en inglés porque es un flag técnico sin equivalente de negocio claro — si se prefiere en español, renombrar a `debe_cambiar_password` antes de que existan más migraciones que la referencien).
- **Clases PHP** (controllers, middleware, requests, enums): en inglés, siguiendo la convención estándar de Laravel (`AuthenticatedSessionController`, `EnsurePasswordIsChanged`, `UserRole`).
- **Rutas**: el path público de una ruta puede ir en español cuando es user-facing y viene nombrado así en el PDF (`/cambiar-password`); el *nombre* de ruta (`route('...')`) sigue el estilo dot-notation en inglés de Breeze (`password.change.edit`).
- **Roles**: `App\Enums\UserRole` (`Admin`, `Responsable`) — usar el enum, no strings sueltos, al comparar o asignar rol.
- **Modelos con tabla en español que Eloquent no adivinaría bien** (ej. `checklists_plantilla`, `secciones_5s`, `escalas_opciones`): declarar `protected $table` explícito siempre, no confiar en el inflector de Eloquent (solo sabe pluralizar en inglés). Aplica también a las tablas que faltan por crear en próximas fases (`checklists_respuesta`, `respuestas_detalle`, etc.).
- **Enums de dominio** (tipo de activo, rol de usuario, etc.): clase PHP en `App\Enums`, backed por string, nunca comparar con strings sueltos.
