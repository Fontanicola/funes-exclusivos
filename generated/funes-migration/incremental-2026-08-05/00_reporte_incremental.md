# Incremental CSV actualizados - 2026-08-05

Comparacion generada contra la carpeta historica `Documentos funes` usada en la migracion base.

## Altas detectadas

- proveedores: 1
- vehiculos: 4
- compras: 34
- gastos: 69
- ventas: 20
- pagos: 33
- entregas: 13
- gestoria: 31
- comisiones: 7
- liquidaciones: 1
- recordatorios: 10

## Muestras

### vehiculos
- 4ca88be2-e505-55c7-9ee9-02747a929123 (LP.csv fila 55)
- 57d88af2-8210-5c2a-9413-cfbe6901422c (LP.csv fila 63)
- fa51f8cb-6ac5-50bb-83ff-62d5ce70d953 (LP.csv fila 61)
- 83007e90-0062-5f2c-b1f1-908dec5a65ff (LP.csv fila 58)

### ventas
- HQU572 (Renta 07-2026.csv fila 14)
- LNZ817 (Renta 07-2026.csv fila 15)
- AE477GJ (Renta 07-2026.csv fila 16)
- AF806GU (Renta 07-2026.csv fila 17)
- MQJ636 (Renta 07-2026.csv fila 18)
- OXL597 (Renta 07-2026.csv fila 19)
- MQM470 (Renta 07-2026.csv fila 20)
- LNI801 (Renta 07-2026.csv fila 21)
- AG501SJ (Renta 07-2026.csv fila 22)
- PLV480 (Renta 07-2026.csv fila 23)
- PLV480 (Pendiente de entrega.csv fila 5)
- AD521AL (Pendiente de entrega.csv fila 704)

### compras
- AI223SF (Funes Exclusivos Base(BASE).csv fila 1696)
- AF036UM (Funes Exclusivos Base(BASE).csv fila 1712)
- LDF734 (Funes Exclusivos Base(BASE).csv fila 1717)
- GOO700 (Funes Exclusivos Base(BASE).csv fila 1718)
- IZD432 (Funes Exclusivos Base(BASE).csv fila 1719)
- AF213GY (Funes Exclusivos Base(BASE).csv fila 1720)
- AF909SG (LP.csv fila 7)
- AD447EF (LP.csv fila 9)
- AB213GR (LP.csv fila 10)
- MOW449 (LP.csv fila 11)
- GPB198 (LP.csv fila 13)
- AC844BC (LP.csv fila 16)

### entregas
- 4ccabd2a-a8e8-5b66-9051-69c9c37decfb (Pendiente de entrega.csv fila 5)
- 106954da-4e01-5b7a-9e7b-dc85c579672d (Pendiente de entrega.csv fila 704)
- 1642e155-9508-519e-8c0d-373e60bd9d77 (Pendiente de entrega.csv fila 705)
- 03ca4eea-42d0-549e-b0fb-d7c318dc8a5a (Pendiente de entrega.csv fila 706)
- e4302d15-2e03-509b-9a39-28ca7909b4fa (Pendiente de entrega.csv fila 707)
- 7afef7e1-6573-53ae-be8f-aa9a55a6022e (Pendiente de entrega.csv fila 708)
- 35e24de0-c2f2-5310-b9f4-28754f7c71d5 (Pendiente de entrega.csv fila 709)
- 3379e1bb-c4b7-5988-915e-6ed0af3c65ae (Pendiente de entrega.csv fila 710)
- e06f0427-19a2-5804-9d33-b7c550614f61 (Pendiente de entrega.csv fila 711)
- 87920dcb-7a49-5d49-963f-2edd3428b676 (Pendiente de entrega.csv fila 712)
- 9e199946-a485-5f4e-ba91-2dfa22c75c0d (Pendiente de entrega.csv fila 713)
- 119af870-86a7-544e-b2a7-7d05a63ead4f (Pendiente de entrega.csv fila 714)

### gestoria
- HQU572 (ALTA BAJA MUNICIPAL.csv fila 121)
- LNZ817 (ALTA BAJA MUNICIPAL.csv fila 122)
- AE477GJ (ALTA BAJA MUNICIPAL.csv fila 123)
- AF806GU (ALTA BAJA MUNICIPAL.csv fila 124)
- MQJ636 (ALTA BAJA MUNICIPAL.csv fila 125)
- OXL597 (ALTA BAJA MUNICIPAL.csv fila 126)
- MQM470 (ALTA BAJA MUNICIPAL.csv fila 127)
- LNI801 (ALTA BAJA MUNICIPAL.csv fila 128)
- AB711ML (Cta cte gestoria .csv fila 485)
- AB711ML (Cta cte gestoria .csv fila 486)
- AG131HY (Cta cte gestoria .csv fila 487)
- MOD506 (Cta cte gestoria .csv fila 488)

### comisiones
- 56ad6c77-38d2-5c08-82ce-7ccbd38603fa (Comisiones vendedores.csv fila 275)
- 9582c658-ac87-57bc-bde2-f37744aa0b5a (Comisiones vendedores.csv fila 276)
- 4182e50d-1a45-5afe-be27-67c35fd08d50 (Comisiones vendedores.csv fila 277)
- a91804be-c5f7-5dd1-9e0e-c5f79d62b35d (Comisiones vendedores.csv fila 278)
- 34078c9d-de1b-5ea2-9ba6-d982e6857cbf (Comisiones vendedores.csv fila 279)
- 19635005-0c02-5cb3-962b-d09f9e30a4e3 (Comisiones vendedores.csv fila 280)
- 784d895e-724a-58ac-b04c-755c2ef988fa (Comisiones vendedores.csv fila 281)

### recordatorios
- HQU572
- LNZ817
- AE477GJ
- AF806GU
- MQJ636
- OXL597
- MQM470
- LNI801
- IZD432
- Seguimiento de entrega pendiente

## Archivos generados

- `01_incremental_altas.sql`: inserts incrementales con `ON CONFLICT (id) DO NOTHING`.
- `sources/`: copia de los CSV actualizados usados para generar este incremental.

## Nota

Los vehiculos/proveedores incluidos son solamente prerrequisitos que no existian en la migracion anterior.
El SQL no ejecuta deletes ni updates masivos. Si Funes cambio valores de registros ya importados, se recomienda revisar esos cambios en una segunda pasada controlada.
