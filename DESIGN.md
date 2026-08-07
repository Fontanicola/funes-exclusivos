# Funes Exclusivos - Manual de Diseno UX/UI

Este documento define el sistema visual, los patrones de interaccion y las reglas de producto para Funes Exclusivos. La referencia base es una plataforma operativa B2B premium: compacta, clara, rapida de recorrer y orientada al trabajo diario de una concesionaria.

La interfaz debe sentirse como una herramienta interna seria para administrar stock, ventas, caja, CRM, WhatsApp, gestoria, comisiones y catalogo publico. No debe sentirse como un template generico ni como una demo tecnica.

## 1. Vision del sistema

Funes Exclusivos debe ayudar a:

- Encontrar informacion operativa rapidamente.
- Registrar operaciones sin friccion.
- Comparar stock, precios, ventas, caja y seguimiento comercial.
- Mantener trazabilidad sin exponer informacion tecnica.
- Separar datos comerciales de datos internos sensibles.
- Dar sensacion de producto estable, premium y confiable.

Regla madre:

> Si una decision visual no ayuda a vender mejor, operar mas rapido o reducir ruido, probablemente sobra.

## 2. Personalidad visual

El sistema debe sentirse:

- Profesional.
- Compacto.
- Comercial.
- Operativo.
- Premium sin ostentacion.
- Simple sin parecer basico.
- Solido y confiable.

No debe sentirse:

- Como dashboard generico.
- Como CRM inflado con cards gigantes.
- Como landing page dentro del panel interno.
- Como demo tecnica.
- Como sistema con modulos pegados sin criterio.

## 3. Principios de UX

### 3.1 Densidad operativa

Funes se usa para operar una concesionaria, no para leer paginas comerciales internas.

Preferir:

- Tablas compactas.
- Headers bajos.
- Toolbars en una fila con wrap.
- Metadata secundaria en texto chico o badges.
- Acciones principales claras.
- Formularios divididos por secciones.

Evitar:

- Cards enormes para datos tabulares.
- Titulo repetido en cada bloque.
- Botones duplicados.
- Espacios muertos.
- Formularios largos sin jerarquia.

### 3.2 Contexto claro

Cada pantalla debe dejar claro donde esta el usuario:

- Header de plataforma compacto con titulo/contexto.
- Evitar encabezados internos que repitan el titulo de la ruta.
- Accion principal dentro de la toolbar operativa.
- Acciones secundarias discretas.

No repetir el mismo titulo dentro de cada seccion si ya esta en el header de plataforma.

### 3.3 Una accion primaria por pantalla

Cada pantalla debe tener una accion principal:

- Nuevo vehiculo.
- Nueva compra.
- Nueva venta.
- Nuevo lead.
- Nuevo tramite.
- Nuevo presupuesto.
- Crear recordatorio.

Las acciones secundarias deben ir como botones outline, links o menus.

## 4. Layout global

### 4.1 Fondo

El fondo general es blanco.

Usar:

- `body`: blanco.
- Contenido principal: blanco.
- Tablas/cards: blanco con borde sutil.
- Separadores: `border-slate-200`.

Evitar:

- Gradientes decorativos.
- Fondos grises grandes sin funcion.
- Sombras pesadas.

### 4.2 Contenedor

El panel interno necesita ancho util amplio.

Reglas:

- No usar max-width angosto en modulos tabulares.
- Padding lateral consistente.
- Scroll horizontal solo dentro de tablas cuando sea inevitable.
- En mobile, apilar headers, filtros y acciones.

### 4.3 Espaciado

El sistema debe sentirse denso pero respirable.

- Entre header y contenido: separacion moderada.
- Entre toolbar y tabla: distancia clara.
- Entre cards: gap consistente.
- Evitar dobles separadores o grandes huecos.

## 5. Color

### 5.1 Color principal

El color principal operativo es bordó corporativo:

- Primario: `#8A1538`.
- Hover: `#6F102D`.
- Fondo suave: `#FDF2F5`.
- Borde suave: `#D8A1B2`.

Uso del bordó:

- Botones primarios.
- Links operativos.
- Estado activo de sidebar.
- Indicadores de foco.
- Acciones de alta o guardado.

Evitar:

- Azul como accion principal.
- Botones negros como patron principal.
- Colores saturados sin significado.

### 5.2 Colores de estado

Usar colores solo para comunicar estado:

- Verde: activo, aprobado, positivo, conectado.
- Amber/bordó suave: pendiente, advertencia, QR pendiente.
- Rojo/rose: vencido, error, critico.
- Slate/zinc: neutral, cerrado, sin datos.

## 6. Tipografia

La tipografia debe verse:

- Nitida.
- Compacta.
- Empresarial.
- Legible en tablas.

Reglas:

- Titulos de pantalla moderados.
- Headers de tabla chicos, uppercase y semibold.
- Metadata secundaria en `text-slate-500` o equivalente.
- No mostrar emails junto a nombres salvo donde ayuden a distinguir personas.

## 7. Bordes, radios y superficies

### 7.1 Radio

Radio estandar:

- `rounded-md` para tablas, cards, inputs, botones y paneles.

Evitar:

- `rounded-2xl`, `rounded-3xl` o radios demasiado blandos en UI operativa.

### 7.2 Bordes y sombras

Usar:

- `border border-slate-200`.
- Separadores internos finos.
- Sombras solo en dropdowns u overlays.

Evitar:

- Cards flotantes con sombra marcada.
- Bordes oscuros.
- Superficies sin borde cuando se mezclan con el fondo.

## 8. Botones y links

### 8.1 Boton primario

Uso:

- Crear.
- Guardar.
- Confirmar.
- Actualizar.

Estilo:

- Fondo bordó.
- Texto blanco.
- Radio `rounded-md`.
- Altura compacta.

### 8.2 Boton secundario

Uso:

- Volver.
- Ver.
- Cancelar.
- Filtros.
- Acciones no prioritarias.

Estilo:

- Fondo blanco.
- Borde slate.
- Texto slate.
- Hover suave.

### 8.3 Acciones destructivas

Uso:

- Eliminar.
- Desactivar.
- Anular.
- Cancelar registros.

Reglas:

- No ponerlas al mismo nivel que la accion primaria.
- Usar texto rojo o menu secundario.
- Evitar botones rojos grandes salvo confirmacion critica.

### 8.4 Links

Los links de texto deben verse claramente:

- Bordó corporativo.
- Subrayados.
- Con offset legible.

Aplica a:

- Ver detalle.
- Relaciones entre modulos.
- Adjuntos.
- Catalogo publico.

## 9. Inputs, buscadores y filtros

### 9.1 Buscador

Todos los modulos deben usar buscador compacto:

- Icono de lupa a la izquierda.
- Placeholder claro.
- Borde `border-slate-200`.
- Radio `rounded-md`.
- Altura compacta.

### 9.2 Filtros

Reglas:

- Buscador, filtros y accion principal deben compartir la misma fila operativa siempre que haya espacio.
- `flex-wrap` siempre.
- Selects con ancho minimo suficiente.
- No cortar textos como `Todos los vendedores`.
- Si en mobile no entra todo, la misma toolbar puede apilar controles, pero sin crear un header interno repetido.

### 9.3 Toolbar

Orden recomendado:

1. Accion primaria.
2. Buscador flexible.
3. Filtros.
4. Acciones secundarias.

La toolbar reemplaza los headers internos de tabla/listado. No usar `h2` del tipo `Vehiculos`, `Leads`, `Movimientos` o `Listado` cuando la ruta ya lo indica arriba.

## 10. Tablas

### 10.1 Estilo base

Las tablas deben ser:

- Compactas.
- Con borde sutil.
- Header claro y chico.
- Filas con hover suave.
- Metadata secundaria en gris.
- Acciones alineadas a la derecha.

Evitar:

- Muchas columnas con el mismo peso.
- Botones multiples por fila.
- IDs tecnicos.
- Valores crudos de base de datos.

### 10.2 Columnas

Antes de permitir scroll horizontal:

- Reducir columnas visibles.
- Mover metadata a segunda linea.
- Compactar fechas.
- Usar badges.
- Agrupar acciones.

### 10.3 Empty states

Distinguir:

- Sin datos iniciales.
- Sin resultados por filtros.

Ejemplos:

- `Todavia no hay vehiculos cargados.`
- `No encontramos resultados con esos filtros.`
- `No hay conversaciones todavia.`

No usar mensajes tecnicos como:

- `Cuando Supabase devuelva datos...`
- `Payload no disponible.`
- `External id missing.`

## 11. Formularios

Los formularios deben dividirse en secciones:

- Datos principales.
- Datos comerciales.
- Datos internos.
- Valores.
- Documentacion.
- Observaciones.

Reglas:

- Labels claros en castellano.
- Ayuda corta.
- Errores humanos.
- Botones `Cancelar` y `Guardar`.
- La seccion interna nunca debe competir con la comercial.

## 12. Permisos visuales y datos sensibles

RLS manda la seguridad real, pero la UI debe evitar mostrar datos innecesarios.

### Admin

Ve y gestiona todo.

### Vendedor

Debe ver:

- Inventario comercial.
- Ventas.
- CRM.
- WhatsApp.
- Sus comisiones si RLS lo permite.
- Recordatorios.

No debe ver:

- Costos de adquisicion.
- Costos de reposicion.
- Margenes internos.
- Proveedores de compra si no aportan.
- Acciones administrativas.
- Configuracion global.

### Gestor

Debe ver:

- Gestoria.
- Documentacion.
- Preparacion.
- Inventario operativo.
- Caja si el permiso lo habilita.
- Recordatorios.

Costos y margenes quedan reservados para admin salvo decision explicita.

## 13. Modulos internos

### Dashboard

Debe mostrar:

- Atencion requerida arriba.
- Maximo 4 KPIs principales.
- Resultado del mes como bloque dominante.
- Operacion comercial.
- Inventario y operaciones.
- Actividad de vendedores en segundo nivel.

Evitar:

- 7 u 8 bloques con igual peso.
- Metricas repetidas.
- Copy decorativo.

### Inventario

Debe separar:

- Ficha comercial.
- Precio comercial.
- Compra y costos internos.
- Preparacion.
- Catalogo y publicaciones.
- Documentos.

### Ventas y Rentabilidad

Ventas debe ser operativa y compacta.

Rentabilidad es financiera:

- Admin ve margenes y costos.
- Vendedor no ve datos sensibles.
- Ruta tecnica se mantiene como `/ventas/renta`, pero label visible es `Rentabilidad`.

### Caja

Caja debe priorizar:

- Resumen del mes.
- Carga rapida.
- Movimientos.

No mostrar labels tecnicos:

- `Detalle 1` debe verse como `Referencia`.
- `Detalle 2` debe verse como `Comprobante / nota`.
- `Detalle 3` debe verse como `Proveedor / tercero`.

### WhatsApp

WhatsApp debe sentirse como inbox:

- Hilo de mensajes protagonista.
- Panel lateral para contacto, lead, IA y seguimiento.
- No mostrar `instance_name`, IDs externos ni raw payload.
- Todo en castellano.

### CRM

CRM debe enfocarse en:

- Leads.
- Estado comercial.
- Proximo contacto.
- Conversion a venta.

Evitar paredes de guiones cuando faltan datos.

### Gestoria

Gestoria debe priorizar:

- Vencimientos.
- Estado del tramite.
- Documentacion.
- Presupuestos.

Los vencidos deben tener tratamiento visual de alerta.

### Catalogo publico

El catalogo publico es una vidriera comercial premium.

Debe mostrar:

- Marca Funes visible.
- CTA WhatsApp claro.
- Fotos como protagonista.
- Precio si esta habilitado.
- Ficha comercial.

No debe mostrar:

- Costos.
- Proveedores.
- Observaciones internas.
- Caja.
- Comisiones.
- Documentos privados.

## 14. Iconografia

Usar iconos lineales, preferentemente `lucide-react`.

Reglas:

- Bordó corporativo para activo o accion primaria.
- Slate para iconos neutros.
- Rojo para alerta critica.
- No usar iconos decorativos sin funcion.

## 15. Idioma y tono

Toda la UI visible debe estar en castellano.

Evitar:

- `Unread`.
- `Payload`.
- `Webhook`.
- `Instance name`.
- `Supabase`.
- `Auth`.
- `Debug`.

Usar:

- `No leido`.
- `Historial`.
- `Conexion`.
- `Cuenta conectada`.
- `Entorno`.
- `Acceso`.

El tono debe ser directo, operativo y humano.

## 16. Accesibilidad

Todo elemento interactivo debe:

- Tener hover.
- Tener foco visible.
- Ser usable con teclado cuando corresponda.
- Tener label accesible si solo muestra icono.

Contraste suficiente en:

- Texto secundario.
- Links.
- Botones.
- Badges.

## 17. Performance percibida

Usar:

- Skeletons parecidos a la pantalla final.
- Queries acotadas.
- Listados limitados.
- Miniaturas livianas.
- Client Components solo donde haya interaccion.

Evitar:

- Spinners grandes como carga principal.
- Renderizar imagenes pesadas en listados.
- Pasar objetos gigantes a componentes cliente.

## 18. Checklist antes de cerrar una pantalla

- Header compacto y claro.
- Una accion primaria.
- Filtros sin truncamiento.
- Tabla legible y compacta.
- Empty state inicial y por filtros.
- Sin textos tecnicos visibles.
- Permisos visuales respetados.
- Mobile sin overflow obvio.
- Build limpio.
