<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\ChecklistPlantilla;
use App\Models\EscalaOpcion;
use App\Models\Pregunta;
use App\Models\Seccion5S;
use Illuminate\Database\Seeder;

/**
 * Carga las 5 plantillas de checklist (HU-12) tal cual el Apéndice de la Fase 3:
 * secciones 1°S-5°S, preguntas con su subcategoría, y la escala de respuesta propia
 * de cada checklist (con su peso numérico). Fuente literal — no reinterpretar.
 *
 * Convención de pesos (sugerida, pendiente de confirmar con negocio — ver CLAUDE.md):
 * peor opción = 0, mejor = 100, intermedias distribuidas proporcionalmente.
 * "No aplica" no participa en el promedio (excluye_promedio = true, sin peso).
 * Excepción: la escala especial de "Mantenimiento" en Camiones usa los valores
 * literales del documento (0 / 1 / 3), no la convención 0-100.
 *
 * Qué opción(es) cuentan como "GAP" (Fase 6, HU-26/HU-27) también se define aquí,
 * por escala — parametrizado por dato, no hardcodeado. Camiones: "No OK. Hay Gaps"
 * (el propio PDF lo da como ejemplo). Almacén: "Muy malo" y "Malo" (también sugerido
 * literalmente por el PDF). Taller mecánico/Administrativo/Montacargas: "No ok"/"No
 * OK" (la peor opción sustantiva; "No aplica" no es GAP, ya está excluida del
 * promedio). Mantenimiento (escala especial de Camiones): "Sin tratamiento".
 */
class ChecklistSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->definiciones() as $definicion) {
            $this->crearChecklist($definicion);
        }
    }

    private function crearChecklist(array $definicion): void
    {
        $area = Area::query()->where('nombre', $definicion['area'])->firstOrFail();

        $checklist = ChecklistPlantilla::query()->create([
            'area_id' => $area->id,
            'nombre' => $definicion['nombre'],
        ]);

        foreach ($definicion['escala'] as $orden => $opcion) {
            EscalaOpcion::query()->create([
                'checklist_plantilla_id' => $checklist->id,
                'texto_opcion' => $opcion['texto'],
                'peso_numerico' => $opcion['peso'] ?? null,
                'excluye_promedio' => $opcion['excluye_promedio'] ?? false,
                'es_gap' => $opcion['es_gap'] ?? false,
                'orden' => $orden + 1,
            ]);
        }

        $ordenSeccion = 0;
        foreach ($definicion['secciones'] as $nombreSeccion => $preguntas) {
            $ordenSeccion++;

            $seccion = Seccion5S::query()->create([
                'checklist_plantilla_id' => $checklist->id,
                'nombre' => $nombreSeccion,
                'orden' => $ordenSeccion,
            ]);

            foreach ($preguntas as $ordenPregunta => $datosPregunta) {
                $pregunta = Pregunta::query()->create([
                    'seccion_id' => $seccion->id,
                    'subcategoria' => $datosPregunta['subcategoria'],
                    'texto' => $datosPregunta['texto'],
                    'orden' => $ordenPregunta + 1,
                ]);

                if (isset($datosPregunta['escala_propia'])) {
                    foreach ($datosPregunta['escala_propia'] as $orden => $opcion) {
                        EscalaOpcion::query()->create([
                            'pregunta_id' => $pregunta->id,
                            'texto_opcion' => $opcion['texto'],
                            'peso_numerico' => $opcion['peso'] ?? null,
                            'excluye_promedio' => $opcion['excluye_promedio'] ?? false,
                            'es_gap' => $opcion['es_gap'] ?? false,
                            'orden' => $orden + 1,
                        ]);
                    }
                }
            }
        }
    }

    private function definiciones(): array
    {
        $escala3Camiones = [
            ['texto' => 'No OK. Hay Gaps', 'peso' => 0, 'es_gap' => true],
            ['texto' => 'Necesita acciones de mejora', 'peso' => 50],
            ['texto' => 'OK', 'peso' => 100],
        ];

        $escala5Almacen = [
            ['texto' => 'Muy malo', 'peso' => 0, 'es_gap' => true],
            ['texto' => 'Malo', 'peso' => 25, 'es_gap' => true],
            ['texto' => 'Regular', 'peso' => 50],
            ['texto' => 'Bueno', 'peso' => 75],
            ['texto' => 'Muy bueno', 'peso' => 100],
        ];

        $escala4TallerMecanico = [
            ['texto' => 'No aplica', 'excluye_promedio' => true],
            ['texto' => 'No ok', 'peso' => 0, 'es_gap' => true],
            ['texto' => 'Cumpliendo pero con lagunas', 'peso' => 50],
            ['texto' => 'Ok', 'peso' => 100],
        ];

        $escala4Administrativo = [
            ['texto' => 'No aplica', 'excluye_promedio' => true],
            ['texto' => 'No ok', 'peso' => 0, 'es_gap' => true],
            ['texto' => 'Cumpliendo, pero con lagunas', 'peso' => 50],
            ['texto' => 'Ok', 'peso' => 100],
        ];

        $escala4Montacargas = [
            ['texto' => 'No aplica', 'excluye_promedio' => true],
            ['texto' => 'No OK', 'peso' => 0, 'es_gap' => true],
            ['texto' => 'Cumpliendo pero con lagunas', 'peso' => 50],
            ['texto' => 'Ok', 'peso' => 100],
        ];

        $escalaMantenimientoCamiones = [
            ['texto' => 'Sin tratamiento', 'peso' => 0, 'es_gap' => true],
            ['texto' => 'Tratamiento en curso', 'peso' => 1],
            ['texto' => 'Tratamiento completo', 'peso' => 3],
        ];

        return [
            [
                'area' => 'Camiones',
                'nombre' => 'Checklist Camiones',
                'escala' => $escala3Camiones,
                'secciones' => [
                    '1°S Clasificación' => [
                        ['subcategoria' => 'Materiales', 'texto' => '¿La cabina o body del camión se encuentra libre de objetos innecesarios? Comprobar cabina, área de almacenamiento, caja, ventanas, etc.'],
                        ['subcategoria' => 'Información', 'texto' => '¿El camión tiene OPL/Procedimientos con números de emergencia y otra información importante?'],
                        ['subcategoria' => 'Elementos personales', 'texto' => '¿Hay algún elemento personal innecesario en la cabina?'],
                    ],
                    '2°S Orden' => [
                        ['subcategoria' => 'Basura', 'texto' => '¿El camión tiene alguna papelera (zafacón) o bolsa de basura en la cabina?'],
                        ['subcategoria' => 'Clasificación', 'texto' => '¿El camión cumple con los estándares de cada cosa en su lugar? (documentos, caja de seguridad, kit de herramientas, EPP, etc.)'],
                        ['subcategoria' => 'Seguridad', 'texto' => '¿La unidad se encuentra libre de elementos que representen una condición insegura?'],
                        ['subcategoria' => 'Kit de limpieza', 'texto' => '¿Hay algún kit de limpieza disponible en la cabina?'],
                    ],
                    '3°S Limpieza' => [
                        ['subcategoria' => 'Limpieza', 'texto' => '¿Está el camión en buenas condiciones de limpieza? (cabina, alfombra, ventanas, asientos, lona/cortinas, caja, etc.)'],
                        ['subcategoria' => 'Limpieza', 'texto' => '¿Todas las ubicaciones de almacenamiento están limpias y disponibles para usar? (guantera, áreas de almacenamiento en cabina, etc.)'],
                        ['subcategoria' => 'Desinfección', 'texto' => '¿Hay disponibles suministros adecuados de desinfección según protocolos de seguridad y salud?'],
                        ['subcategoria' => 'Chequeo diario', 'texto' => '¿Hay lista de verificación diaria cuando el camión abandona el CD para garantizar estándares 5S?'],
                        ['subcategoria' => 'Mantenimiento', 'texto' => '¿Está el camión en buenas condiciones de mantenimiento?'],
                        [
                            'subcategoria' => 'Mantenimiento (escala especial)',
                            'texto' => '¿Se resuelven los problemas de mantenimiento lo antes posible? (0=sin tratamiento, 1=en curso, 3=completo)',
                            'escala_propia' => $escalaMantenimientoCamiones,
                        ],
                    ],
                    '4°S Padronización' => [
                        ['subcategoria' => 'RACI', 'texto' => '¿Existe asignación clara de roles y responsabilidades respecto al plan maestro de 5S?'],
                        ['subcategoria' => 'Procedimiento/OPL', 'texto' => '¿Hay SOP/OPL para ejecución de 5S en camiones? ¿Lo tienen los conductores?'],
                        ['subcategoria' => 'Control', 'texto' => '¿Existe lista/inventario de cosas que deben almacenarse en la cabina?'],
                        ['subcategoria' => 'Horarios', 'texto' => '¿Existen horarios/rutinas para limpiar y desinfectar cabinas, computadoras de mano y equipo compartido?'],
                        ['subcategoria' => 'Procedimiento/OPL', 'texto' => '¿El conductor y ayudante conocen y aplican el procedimiento/OPL de 5S?'],
                    ],
                    '5°S Disciplina' => [
                        ['subcategoria' => 'Auditoría', 'texto' => '¿Hay rutina de auditoría mensual? ¿El conductor conoce los últimos resultados y las GAPs más importantes?'],
                        ['subcategoria' => 'Acciones', 'texto' => '¿Existe registro de acciones para garantizar tratamiento adecuado de los principales GAPs?'],
                        ['subcategoria' => 'Reconocimiento', 'texto' => '¿Hay programa de reconocimiento al mejor equipo 5S? ¿Lo conocen conductor y ayudante?'],
                    ],
                ],
            ],
            [
                'area' => 'Almacén',
                'nombre' => 'Checklist Almacén',
                'escala' => $escala5Almacen,
                'secciones' => [
                    '1°S Clasificación' => [
                        ['subcategoria' => 'Tráfico', 'texto' => '¿Las áreas están libres de elementos innecesarios que interfieran con el tráfico normal?'],
                        ['subcategoria' => 'Materiales o insumos', 'texto' => '¿No existen materiales o cosas innecesarias?'],
                        ['subcategoria' => 'Herramientas y equipos', 'texto' => '¿No existen equipos dañados (ej. FLTs)?'],
                        ['subcategoria' => 'Identificación', 'texto' => '¿Los ítems innecesarios están delimitados y bloqueados apropiadamente?'],
                        ['subcategoria' => 'Condiciones generales', 'texto' => '¿En picking/montaje/verificación no hay rotura/derrame fuera del contenedor? ¿Pallets en sectores asignados?'],
                        ['subcategoria' => 'Elementos personales', 'texto' => '¿Existe lugar definido para elementos personales (ropa, maletines, EPP, etc.)?'],
                        ['subcategoria' => 'Información', 'texto' => '¿El área tiene estándares obsoletos o averiados?'],
                    ],
                    '2°S Orden' => [
                        ['subcategoria' => 'Layout/disposición', 'texto' => '¿Existe layout claro que muestra cada zona, equipo, productos, etc.?'],
                        ['subcategoria' => 'Pasos cebra', 'texto' => '¿Los pasos cebra, equipos y sitios importantes están claramente delimitados?'],
                        ['subcategoria' => 'ID', 'texto' => '¿Existen dashboards de 5S, OPL y otra información útil para la gestión de 5S?'],
                        ['subcategoria' => 'Contenedores/recipientes', 'texto' => '¿El área tiene cajas y contenedores estandarizados para desechos y residuos?'],
                        ['subcategoria' => 'Herramientas de limpieza', 'texto' => '¿Hay lugar estándar para el kit de limpieza? (aplica taller: productos químicos identificados y matriz de compatibilidad presente)'],
                        ['subcategoria' => 'Configuración', 'texto' => '¿El estándar de layout se cumple?'],
                    ],
                    '3°S Limpieza' => [
                        ['subcategoria' => 'Pisos', 'texto' => '¿El piso está limpio? Verificar rutina (plan vs. cumplimiento)'],
                        ['subcategoria' => 'Paredes/techos', 'texto' => '¿Las paredes y techos están limpias (sin telarañas)?'],
                        ['subcategoria' => 'Ventanas', 'texto' => '¿Las ventanas están limpias? Verificar vidrios rotos'],
                        ['subcategoria' => 'Lugar de trabajo', 'texto' => 'Taller: ¿herramientas en su lugar, limpio, según estándares? ¿Mesas/áreas de trabajo limpias?'],
                        ['subcategoria' => 'Rutina de limpieza', 'texto' => '¿Rutina de limpieza detallada con roles y frecuencia diaria/semanal/mensual?'],
                    ],
                    '4°S Estandarización' => [
                        ['subcategoria' => 'Ideas de mejora', 'texto' => '¿Existe proceso de ideas para mejorar resultados de 5S?'],
                        ['subcategoria' => 'Ejecución de ideas', 'texto' => '¿Todas las ideas se analizan y tienen retroalimentación?'],
                        ['subcategoria' => 'Estándares', 'texto' => '¿Estándar de orden y limpieza del sector con cumplimiento evidenciado?'],
                        ['subcategoria' => 'Estándares', 'texto' => '¿Existe layout con dueños claros por área?'],
                        ['subcategoria' => 'Trazabilidad', 'texto' => '¿Existe registro de acciones enfocado en resultados de 5S?'],
                        ['subcategoria' => 'Primeras 3S', 'texto' => '¿Los equipos tienen rutina de orden/limpieza y matrices de responsabilidad 5S?'],
                    ],
                    '5°S Disciplina' => [
                        ['subcategoria' => 'Monitoreo de 5S', 'texto' => '¿Todas las áreas tienen rutina mensual de 5S?'],
                        ['subcategoria' => 'Auditorías', 'texto' => '¿Plan maestro de auditorías cruzadas de 5S? ¿Resultados por encima del 80%?'],
                        ['subcategoria' => 'Estándares', 'texto' => '¿Los estándares se actualizan periódicamente con registro de cada actualización?'],
                        ['subcategoria' => 'Dashboards', 'texto' => '¿Todos los dashboards de 5S están actualizados?'],
                        ['subcategoria' => 'Acciones', 'texto' => '¿El equipo tiene planes de acción para resolver problemas de 5S?'],
                        ['subcategoria' => 'Evolución', 'texto' => '¿El área puede mostrar evolución en los resultados de 5S?'],
                    ],
                ],
            ],
            [
                'area' => 'Taller mecánico',
                'nombre' => 'Checklist Taller mecánico',
                'escala' => $escala4TallerMecanico,
                'secciones' => [
                    '1°S Clasificación' => [
                        ['subcategoria' => 'Almacén de repuestos', 'texto' => '¿Todos los componentes están identificados con código y ubicación en SAP?'],
                        ['subcategoria' => 'Documentos digitales', 'texto' => '¿En el escritorio de las PCs no hay documentos sueltos, solo accesos directos?'],
                        ['subcategoria' => 'PCs/laptops', 'texto' => '¿Todos los dispositivos de PCs/Laptop están identificados?'],
                        ['subcategoria' => 'Área de taller', 'texto' => '¿El armario de stock de piezas está organizado e identificado?'],
                        ['subcategoria' => null, 'texto' => '¿Los neumáticos están separados según tipo (revitalizados y nuevos)?'],
                    ],
                    '2°S Orden' => [
                        ['subcategoria' => 'Almacén de repuestos', 'texto' => '¿La organización del almacén es por categoría?'],
                        ['subcategoria' => 'Documentos digitales', 'texto' => '¿Carpetas y subcarpetas organizadas de forma estructurada y lógica?'],
                        ['subcategoria' => 'Área de taller', 'texto' => '¿Todas las herramientas de trabajo están en lugar definido y señalado?'],
                        ['subcategoria' => 'Área de taller', 'texto' => '¿Todos los cilindros están asegurados con cadenas y bloqueo de energía?'],
                        ['subcategoria' => 'Área de taller', 'texto' => '¿El taller tiene área definida y señalada para vehículos livianos, montacargas y camiones?'],
                        ['subcategoria' => 'Lubricantes', 'texto' => '¿Todos los lubricantes están en lugar identificado y señalizado?'],
                        ['subcategoria' => 'Neumáticos', 'texto' => '¿Todos los neumáticos a almacenar están dentro del cuarto definido?'],
                    ],
                    '3°S Limpieza' => [
                        ['subcategoria' => 'Almacén', 'texto' => '¿Todos los pasillos están libres de obstáculos y limpios?'],
                        ['subcategoria' => 'General', 'texto' => '¿Existen contenedores identificados para cada división del taller?'],
                    ],
                    '4°S Padronización' => [
                        ['subcategoria' => 'Herramientas especializadas', 'texto' => '¿Herramientas de procesos especializados identificadas y con procedimiento de la tarea?'],
                        ['subcategoria' => 'Acompañamiento', 'texto' => '¿Existe plan de acción actualizado, con dueño de cada área definido y divulgado?'],
                    ],
                    '5°S Disciplina' => [
                        ['subcategoria' => 'Gestión de vista', 'texto' => '¿El tablero de 5S contiene layout, comunicación de premiación y evolución del área?'],
                        ['subcategoria' => 'Auditoría', 'texto' => '¿Plan de acción de auditorías 5S? ¿Resultados por encima del 85%?'],
                        ['subcategoria' => 'Evolución', 'texto' => '¿Existe un KPI asociado a las 5S ligado a las auditorías?'],
                    ],
                ],
            ],
            [
                'area' => 'Administrativo',
                'nombre' => 'Checklist Administrativo',
                'escala' => $escala4Administrativo,
                'secciones' => [
                    '1°S Clasificación' => [
                        ['subcategoria' => 'Tránsito', 'texto' => '¿El área está libre de objetos que dificulten el tránsito?'],
                        ['subcategoria' => 'Materiales', 'texto' => '¿El área está libre de materiales innecesarios?'],
                        ['subcategoria' => 'Herramientas y equipos', 'texto' => '¿Existe algún equipo roto/dañado? (puerta, silla, PC, etc.)'],
                        ['subcategoria' => 'Identificación', 'texto' => 'Ante equipos rotos/ítems innecesarios, ¿existe reporte abierto con el área responsable?'],
                        ['subcategoria' => 'Elementos personales', 'texto' => '¿Los elementos personales están en lugares definidos (mochila, ropa, etc.)?'],
                        ['subcategoria' => 'Información', 'texto' => '¿Los padrones disponibles están actualizados?'],
                    ],
                    '2°S Orden' => [
                        ['subcategoria' => 'Layout', 'texto' => '¿Existe identificación clara de cada bahía, gaveta, armario, etc.?'],
                        ['subcategoria' => 'Gestión a la vista', 'texto' => '¿Existe gestión a la vista de 5S, padrón y otra info útil?'],
                        ['subcategoria' => 'Almacenamiento', 'texto' => '¿Cajas y recipientes para residuos adecuadamente padronizados (basura con tapa)?'],
                        ['subcategoria' => '5S Digital', 'texto' => '¿Archivos en carpetas compatibles con SPO/DPO? ¿Escritorio libre de archivos sueltos?'],
                    ],
                    '3°S Limpieza' => [
                        ['subcategoria' => 'Terreno', 'texto' => '¿El terreno está limpio? Verificar cronograma (plan vs. cumplimiento)'],
                        ['subcategoria' => 'Paredes/Techos', 'texto' => '¿Paredes y techos limpios (sin telarañas)?'],
                        ['subcategoria' => 'Ventanas', 'texto' => '¿Ventanas limpias? Verificar vidrios rotos'],
                        ['subcategoria' => 'Baños/Vestidores', 'texto' => '¿Vestidores y baños limpios? ¿Cronograma de limpieza actualizado?'],
                        ['subcategoria' => 'Ambiente de trabajo', 'texto' => '¿Mesas y sillas limpias, libres de polvo y alimentos?'],
                    ],
                    '4°S Padronización' => [
                        ['subcategoria' => 'Padrón', 'texto' => '¿El dueño de cada área está definido y divulgado?'],
                        ['subcategoria' => 'Acompañamiento', 'texto' => '¿Existe plan de acción para mejorar resultados de 5S?'],
                        ['subcategoria' => '3S', 'texto' => '¿Rutina de limpieza detallada con roles y frecuencia semanal/mensual?'],
                    ],
                    '5°S Disciplina' => [
                        ['subcategoria' => 'Auditoría', 'texto' => '¿Plan de acción de auditorías 5S? ¿Resultados por encima del 85%?'],
                        ['subcategoria' => 'Evolución', 'texto' => '¿Existe KPI asociado a las 5S ligado a las auditorías?'],
                    ],
                ],
            ],
            [
                'area' => 'Montacargas',
                'nombre' => 'Checklist Montacargas',
                'escala' => $escala4Montacargas,
                'secciones' => [
                    '1°S Clasificación' => [
                        ['subcategoria' => 'Cabina', 'texto' => '¿La cabina está libre de productos, envases e ítems innecesarios?'],
                        ['subcategoria' => 'Documentos', 'texto' => '¿Los checklists del montacargas están en lugar adecuado, protegidos de polvo y agua?'],
                        ['subcategoria' => 'Cabina', 'texto' => '¿El tapizado de la cabina está en buenas condiciones (sin rasgadura ni hierro expuesto)?'],
                    ],
                    '2°S Orden' => [
                        ['subcategoria' => 'Ítems Teclog', 'texto' => '¿El soporte y la tablet están en el lugar apropiado?'],
                        ['subcategoria' => 'Seguridad', 'texto' => '¿El montacargas está libre de condiciones inseguras (vidrio roto, alambres/mangueras sueltas, sin puntos de apoyo)?'],
                        ['subcategoria' => 'Conservación', 'texto' => '¿Pintura conservada? ¿Adhesivos reflectivos y espejos en buen estado?'],
                    ],
                    '3°S Limpieza' => [
                        ['subcategoria' => 'Cabina', 'texto' => '¿La cabina se mantiene limpia, libre de basura y desechos?'],
                        ['subcategoria' => 'General', 'texto' => '¿El montacargas está libre de papeles, plásticos e hilos incrustados en su estructura?'],
                    ],
                    '4°S Padronización' => [
                        ['subcategoria' => 'RACI', 'texto' => '¿El personal conoce el flujo de limpieza de bahías? ¿Existe padrón con flujo y RACI conocido por el equipo?'],
                    ],
                    '5°S Disciplina' => [
                        ['subcategoria' => 'Conocimiento', 'texto' => '¿El montacarguista sabe que existe rutina de auditorías? ¿Recuerda la última puntuación?'],
                        ['subcategoria' => 'Conocimiento', 'texto' => '¿El montacarguista conoce el significado de las 5S?'],
                        ['subcategoria' => 'Conocimiento', 'texto' => '¿El montacarguista conoce los principales GAPs levantados?'],
                        ['subcategoria' => 'Reconocimiento', 'texto' => '¿Sabe que existe un programa de reconocimiento al mejor equipo 5S?'],
                    ],
                ],
            ],
        ];
    }
}
