<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Dashboard 5S - CD Nariño</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #1a1a1a; }
        h1 { font-size: 18px; margin-bottom: 0; }
        h2 { font-size: 13px; margin-top: 22px; margin-bottom: 6px; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
        p.subtitle { color: #666; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
        th, td { border: 1px solid #ddd; padding: 4px 6px; text-align: left; }
        th { background: #f3f4f6; }
        .tarjetas { width: 100%; margin-top: 10px; }
        .tarjetas td { border: none; padding: 8px 12px; }
        .tarjeta-valor { font-size: 20px; font-weight: bold; }
        .tarjeta-label { color: #666; }
        .grafica { display: block; max-width: 480px; max-height: 260px; margin: 6px 0 10px; }
    </style>
</head>
<body>
    <h1>Dashboard 5S — CD Nariño</h1>
    <p class="subtitle">
        Filtros:
        @if (($filtros['fecha_desde'] ?? null) || ($filtros['fecha_hasta'] ?? null))
            Desde {{ $filtros['fecha_desde'] ?? '—' }} hasta {{ $filtros['fecha_hasta'] ?? '—' }} ·
        @else
            Mes {{ $filtros['mes'] ?? 'todos' }} ·
            Año {{ $filtros['anio'] ?? 'todos' }} ·
        @endif
        Área {{ $filtros['area_id'] ?? 'todas' }} ·
        Activo {{ $filtros['activo_id'] ?? 'todos' }}
        — generado {{ now()->format('d/m/Y H:i') }}
    </p>

    <table class="tarjetas">
        <tr>
            <td>
                <div class="tarjeta-label">Checklists ejecutados</div>
                <div class="tarjeta-valor">{{ $datos['tarjetas']['checklists_ejecutados'] }}</div>
            </td>
            <td>
                <div class="tarjeta-label">Activos revisados</div>
                <div class="tarjeta-valor">{{ $datos['tarjetas']['activos_revisados'] }}</div>
            </td>
            <td>
                <div class="tarjeta-label">% Adherencia general</div>
                <div class="tarjeta-valor">{{ $datos['tarjetas']['adherencia_general'] ?? '—' }}%</div>
            </td>
        </tr>
    </table>

    <h2>Resultado por las 5S</h2>
    @if (! empty($graficas['radar'] ?? null))
        <img class="grafica" src="{{ $graficas['radar'] }}" alt="Gráfica: resultado por las 5S">
    @endif
    <table>
        <tr><th>Sección</th><th>% Adherencia</th></tr>
        @foreach ($datos['por_s'] as $fila)
            <tr><td>{{ $fila['nombre'] }}</td><td>{{ $fila['porcentaje'] ?? '—' }}%</td></tr>
        @endforeach
    </table>

    <h2>Tendencia mensual</h2>
    @if (! empty($graficas['tendencia'] ?? null))
        <img class="grafica" src="{{ $graficas['tendencia'] }}" alt="Gráfica: tendencia mensual">
    @endif
    <table>
        <tr><th>Periodo</th><th>Checklists</th><th>% Adherencia</th></tr>
        @foreach ($datos['tendencia_mensual'] as $fila)
            <tr><td>{{ $fila['periodo'] }}</td><td>{{ $fila['total'] }}</td><td>{{ $fila['promedio'] }}%</td></tr>
        @endforeach
    </table>

    <h2>Resultado por área</h2>
    @if (! empty($graficas['area'] ?? null))
        <img class="grafica" src="{{ $graficas['area'] }}" alt="Gráfica: resultado por área">
    @endif
    <table>
        <tr><th>Área</th><th>Checklists</th><th>% Adherencia</th></tr>
        @foreach ($datos['por_area'] as $fila)
            <tr><td>{{ $fila['area'] }}</td><td>{{ $fila['total'] }}</td><td>{{ $fila['promedio'] }}%</td></tr>
        @endforeach
    </table>

    <h2>Resultado por subcategoría</h2>
    @if (! empty($graficas['subcategoria'] ?? null))
        <img class="grafica" src="{{ $graficas['subcategoria'] }}" alt="Gráfica: resultado por subcategoría">
    @endif
    <table>
        <tr><th>Subcategoría</th><th>Respuestas</th><th>% Adherencia</th></tr>
        @foreach ($datos['por_subcategoria'] as $fila)
            <tr><td>{{ $fila['subcategoria'] }}</td><td>{{ $fila['total'] }}</td><td>{{ $fila['promedio'] ?? '—' }}%</td></tr>
        @endforeach
    </table>

    <h2>Resultado por evaluador</h2>
    @if (! empty($graficas['evaluador'] ?? null))
        <img class="grafica" src="{{ $graficas['evaluador'] }}" alt="Gráfica: resultado por evaluador">
    @endif
    <table>
        <tr><th>Evaluador</th><th>Checklists</th><th>% Adherencia</th></tr>
        @foreach ($datos['por_evaluador'] as $fila)
            <tr><td>{{ $fila['evaluador'] }}</td><td>{{ $fila['total'] }}</td><td>{{ $fila['promedio'] }}%</td></tr>
        @endforeach
    </table>

    <h2>Resultado por vehículo/activo</h2>
    <table>
        <tr><th>Activo</th><th>Checklists</th><th>% Adherencia</th></tr>
        @foreach ($datos['por_activo'] as $fila)
            <tr><td>{{ $fila['activo'] }}</td><td>{{ $fila['total'] }}</td><td>{{ $fila['promedio'] }}%</td></tr>
        @endforeach
    </table>

    <h2>Top oportunidades (preguntas con más GAPs)</h2>
    @if (! empty($graficas['oportunidades'] ?? null))
        <img class="grafica" src="{{ $graficas['oportunidades'] }}" alt="Gráfica: top oportunidades">
    @endif
    <table>
        <tr><th>Pregunta</th><th>Subcategoría</th><th>GAPs</th></tr>
        @foreach ($datos['top_oportunidades'] as $fila)
            <tr><td>{{ $fila['texto'] }}</td><td>{{ $fila['subcategoria'] }}</td><td>{{ $fila['gaps'] }}</td></tr>
        @endforeach
    </table>

    <h2>Reincidencias</h2>
    <table>
        <tr><th>Pregunta</th><th>Área/Activo</th><th>Veces</th></tr>
        @foreach ($datos['reincidencias'] as $fila)
            <tr><td>{{ $fila['texto'] }}</td><td>{{ $fila['alcance'] }}</td><td>{{ $fila['veces'] }}</td></tr>
        @endforeach
    </table>

    <h2>Planes de acción</h2>
    <table>
        <tr><th>Abiertos</th><th>En progreso</th><th>Cerrados</th><th>Vencidos</th></tr>
        <tr>
            <td>{{ $datos['planes_accion']['abierto'] ?? 0 }}</td>
            <td>{{ $datos['planes_accion']['en_progreso'] ?? 0 }}</td>
            <td>{{ $datos['planes_accion']['cerrado'] ?? 0 }}</td>
            <td>{{ $datos['planes_accion']['vencido'] ?? 0 }}</td>
        </tr>
    </table>

    <h2>Detalle por área y sección</h2>
    <table>
        <tr><th>Área</th><th>Sección</th><th>Respuestas</th><th>% Adherencia</th></tr>
        @foreach ($datos['detalle_cruzado'] as $fila)
            <tr>
                <td>{{ $fila['area'] }}</td>
                <td>{{ $fila['seccion_nombre'] }}</td>
                <td>{{ $fila['total'] }}</td>
                <td>{{ $fila['promedio'] ?? '—' }}%</td>
            </tr>
        @endforeach
    </table>
</body>
</html>
