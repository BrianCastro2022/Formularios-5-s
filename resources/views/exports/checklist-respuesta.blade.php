<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $checklist->checklistPlantilla->nombre }}</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #1a1a1a; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        h2 { font-size: 13px; margin-top: 18px; margin-bottom: 6px; background: #f3f4f6; padding: 4px 6px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
        th, td { border: 1px solid #ddd; padding: 4px 6px; text-align: left; vertical-align: top; }
        th { background: #f9fafb; }
        .meta { width: 100%; margin: 10px 0 4px; }
        .meta td { border: none; padding: 2px 0; }
        .meta .label { color: #666; width: 140px; }
        .resultado { font-size: 16px; font-weight: bold; }
        .observacion { color: #555; font-style: italic; }
    </style>
</head>
<body>
    <h1>{{ $checklist->checklistPlantilla->nombre }}</h1>

    <table class="meta">
        <tr><td class="label">Área</td><td>{{ $checklist->checklistPlantilla->area->nombre }}</td></tr>
        @if ($checklist->activo)
            <tr><td class="label">Placa/Activo</td><td>{{ $checklist->activo->codigo }}</td></tr>
        @endif
        <tr><td class="label">Evaluador</td><td>{{ $checklist->usuario->name }}</td></tr>
        <tr><td class="label">Fecha</td><td>{{ $checklist->fecha->format('d/m/Y') }}</td></tr>
        <tr><td class="label">% Adherencia</td><td class="resultado">{{ $checklist->resultado_porcentaje ?? '—' }}%</td></tr>
    </table>

    @foreach ($secciones as $nombreSeccion => $respuestas)
        <h2>{{ $nombreSeccion }}</h2>
        <table>
            <tr>
                <th style="width: 40%">Pregunta</th>
                <th style="width: 15%">Respuesta</th>
                <th style="width: 45%">Observación</th>
            </tr>
            @foreach ($respuestas as $detalle)
                <tr>
                    <td>
                        @if ($detalle->pregunta->subcategoria)
                            <strong>{{ $detalle->pregunta->subcategoria }}:</strong>
                        @endif
                        {{ $detalle->pregunta->texto }}
                    </td>
                    <td>{{ $detalle->opcion->texto_opcion }}</td>
                    <td class="observacion">{{ $detalle->observacion ?? '—' }}</td>
                </tr>
            @endforeach
        </table>
    @endforeach
</body>
</html>
