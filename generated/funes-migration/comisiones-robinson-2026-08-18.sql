-- Carga incremental idempotente: comisiones de Robinson.
-- Fuente: comisiones robinson.csv
-- No elimina ni actualiza datos existentes.
BEGIN;

CREATE TEMP TABLE _robinson_comisiones (
  id uuid, periodo date, marca text, modelo text, anio integer, precio_venta numeric, fecha_venta date, dominio text, porcentaje numeric, monto numeric, vehiculo_id uuid, venta_id uuid, fila integer
) ON COMMIT DROP;

INSERT INTO _robinson_comisiones (id, periodo, marca, modelo, anio, precio_venta, fecha_venta, dominio, porcentaje, monto, vehiculo_id, venta_id, fila) VALUES
  ('9234b2ad-a4a2-57bb-b860-e69ad143a12a', '2025-01-01', 'TOYOTA', 'HILUX 4X4 D/C GR-S 2.8 TDI 6 A/T', 2019, 45387000, NULL, 'AD244JB', 1, 453870, 'a0cca1ba-c978-5c09-97a9-ea2d7b3c0980', '8ad1d341-999b-5f8a-9451-cb32626f5185', 5),
  ('ddb9b04c-8a7b-5582-8d58-e92356a71295', '2025-01-01', 'FORD', 'KA SE 1.5L', 2019, 15900000, NULL, 'AE006IP', 1, 159000, '3244d31b-12cf-527f-a81b-cafe1af531d7', '6e213d3c-112a-587a-8576-53d1d3cf5467', 6),
  ('568a4aad-8602-533f-b2e4-f4301f96aba9', '2025-01-01', 'PEUGEOT', '208 GT T200 AM25', 2025, 30500000, NULL, 'G533036', 1, 305000, 'f0072ceb-0b6c-5e4c-9c0c-8e4e67b4faea', '80ce0afe-e87f-5aa9-9784-706284c9b55d', 7),
  ('a2d49d1c-3ec9-50d7-b63b-168727216579', '2025-01-01', 'FORD', 'KA SE 1.5L', 2016, 13200000, NULL, 'AA058YB', 1, 132000, 'ce9489fa-5205-5fa6-8f77-509f34278a6c', 'fb7b9260-a2ee-58ad-972d-40357e38db24', 8),
  ('9375a416-cc01-5634-b269-f1f42d319835', '2025-01-01', 'RENAULT', 'NUEVO SANDERO ESPRESSION PACK', 2018, 14900000, NULL, 'AC959LI', 1, 149000, 'f4c66348-7fb6-5859-bf8b-ab3b23f8b901', '95441d48-960d-51f8-bcb0-128e2d0e31f9', 9),
  ('4f58fe24-2001-50e6-a5e0-53f8a2fb05f7', '2025-01-01', 'PEUGEOT', '208 1.6 IN CONCERT', 2020, 25900000, NULL, 'AE227PJ', 1, 259000, 'f75baa71-5160-566f-bae2-973798f7dc50', '17f397d2-5449-5ff6-afe2-1350eb5ad54b', 10),
  ('4db5837d-016d-5e83-8836-55b8e54a3cef', '2025-01-01', 'CHEVROLET', 'SPIN 1.8 LT', 2013, 12200000, NULL, 'NIQ953', 1, 122000, 'b86b86e7-02fb-5683-9f1c-ed292a19d12c', '7768aea2-53fd-5c19-b9ff-7085eee7f0f3', 11),
  ('ce833ae4-4868-5a88-9e05-5874e469a82c', '2025-02-01', 'VW', 'SAVEIRO CD PACK HIGH 1.6', 2017, 17200000, NULL, 'AB931IL', 1, 172000, '2f9c4ff7-7821-5edc-89dc-164fb2e49384', '041af426-d17c-5f7b-9cf6-c436c48d831b', 20),
  ('5ced6576-558f-5704-ada3-a56d6a108057', '2025-02-01', 'CHEVROLET', 'CLASSIC 1.4 N LT', 2010, 6500000, NULL, 'JHU385', 1, 65000, '32164c22-0eb9-5af8-9dc2-7dec704a500d', '26f09ed9-6161-57ed-b9b6-71f6c10f98c0', 21),
  ('286e7386-bc82-5485-b95a-a545899c654c', '2025-02-01', 'TOYOTA', 'HILUX 4X2 CD SRV 3.0 TDI', 2012, 23700000, NULL, 'LUL788', 1, 237000, '3aa0369d-b716-56fa-b051-3b1bb9e7fe2b', 'c0dec447-3cef-52b1-bbc5-08ec0e802fcf', 22),
  ('e4340290-6a19-5322-b6c3-9c98022aa988', '2025-03-01', 'NISSAN', 'FRONTIER X-GEAR 4X4 AT 2.3 D CD', 2021, 32500000, NULL, 'AE899SD', 1, 325000, '66dbe335-d5d8-51d4-b995-f1684116d48a', '62966560-b463-5b72-8e06-a10e23958403', 35),
  ('4ff3a85d-5084-54cc-99de-73074aa52d30', '2025-03-01', 'CHEVROLET', 'ONIX JOY 1.4 N LS MT', 2017, 14100000, NULL, 'AB783BM', 1, 141000, '47cbfcf4-ee48-5903-9fd2-41e3f3ea4e06', '6d9dccc0-4172-5c45-895c-645fb7fa1d17', 36),
  ('a3317ffd-b55f-5da4-9000-1ce2fadca17d', '2025-03-01', 'FORD', 'KUGA TITANIUM 2.0L ECOBOOST AWD 6AT', 2018, 30500000, NULL, 'AD187TE', 1, 305000, 'c1884249-8545-59bd-be61-092f2c7d8941', '88929121-0ac8-594c-9c43-ec8dbc9c51a3', 37),
  ('06b29756-a02a-50b8-9a60-95bf1e0a7825', '2025-03-01', 'PEUGEOT', '208 ALLURE AT AM25.5', 2025, 26900000, NULL, 'G568825', 1, 269000, '5647eb2d-e822-502b-8434-7ff0e9bfb909', '4ab69828-3d2c-56df-bedc-3b329f57a214', 38),
  ('63e41b73-f691-5354-8615-ee59ac4a2c9d', '2025-03-01', 'PEUGEOT', '208 GT T200 AM25', 2025, 33000000, NULL, 'AH281ZL', 1, 330000, '62ecc388-4bb5-5b8c-afa3-0d00a5a7fd5c', '021d2d33-eea9-5bd1-9736-55dbadb33059', 39),
  ('930b2fa3-bfed-577b-8882-e69c405a4f11', '2025-03-01', 'FORD', 'RANGER DC 4X2 XL SAFETY 2.2L DSL', 2014, 16800000, NULL, 'OEG385', 1, 168000, '7f46b794-b489-589d-b5cf-a437280b10c5', '179afe6e-195c-50ab-b40c-9825e9286656', 40),
  ('f5aa3d96-4e1d-5ebc-9f00-ec90191e39a2', '2025-03-01', 'TOYOTA', 'HILUX 4X4 CD SR C/AB 3.0 TDI', 2011, 22300000, NULL, 'JQG020', 1, 223000, '0998bddc-9f7e-5a4b-9b29-b81d1a07f06f', '80a8f095-8c08-5cc4-92b7-7400851804d8', 41),
  ('8933ba39-39e6-5641-a596-925bc0be6f10', '2025-04-01', 'RENAULT', 'CAPTUR INTENS 2.0', 2018, 21900000, NULL, 'AC220HJ', 1, 219000, 'c94887ec-3ec7-5a65-a495-1c9aa32f69fa', 'df539b55-d7b9-5f36-b59e-9dd273aeeb7e', 51),
  ('5b4d5c1e-bf79-5ea3-bdf8-bb95ec60174b', '2025-04-01', 'VW', 'GOL TREND 1.6 MSI PACK II', 2012, 10900000, NULL, 'LHA198', 1, 109000, '9d8b3d04-7cdf-5f9a-a4d7-4ef94e82e056', 'c31c6f95-db84-5ac7-b588-b7de43aabaf1', 52),
  ('1948d447-16f7-58f8-8496-116970eba6d5', '2025-04-01', 'FORD', 'MUSTANG DESCAPOTABLE', 1966, 85200000, NULL, 'AE310JZ', 1, 852000, '7a5ec89f-14ab-5147-83b6-fa470f05d989', 'f2a55b3f-3172-53a3-b1c8-cecca1cd7754', 53),
  ('bb3f5933-e98f-58f4-a7d6-887ddded1145', '2025-04-01', 'CHEVROLET', 'SONIC 1.6 LT M/T 5 PUERTAS', 2014, 12500000, NULL, 'NYN229', 1, 125000, '6e144602-a1fe-5ce4-b739-a5ce7c004188', '4c8d9d80-f936-58e7-aa8a-95fe739ef3dc', 54),
  ('22989b09-52b4-56b9-8003-e0df51ed219d', '2025-04-01', 'RENAULT', 'LOGAN PH2 LIFE 1.6', 2021, 17200000, NULL, 'AE634ZM', 1, 172000, '5f8338c9-0549-549f-877d-df4abfbca449', '6a13abb6-a75d-55eb-b13a-317f1b04d9cf', 55),
  ('9b1d936d-aec7-50c1-a81b-13a78410b175', '2025-05-01', 'FORD', 'FIESTA 1.6L S PLUS', 2018, 17600000, NULL, 'AC754DF', 1, 176000, '7a433c60-979d-5d0e-a508-c7b812064b74', '602f1cda-4858-5f89-8f09-e99a1077f80b', 66),
  ('fbea53fd-cec5-5bf1-8ce2-6ed33b904df3', '2025-05-01', 'CHEVROLET', 'SONIC 1.6 LTZ M/T 4 PTAS', 2013, 10900000, NULL, 'MDZ941', 1, 109000, '9d689de0-d9a5-5dc2-88be-fc9a1e67d357', '6246cb49-a825-5353-bf99-290a6eb3d473', 67),
  ('57a25ad5-7b12-5fab-b513-d336d0341f53', '2025-05-01', 'RENAULT', 'SANDERO EXPRESSION PACK', 2017, 14600000, NULL, 'AB765TU', 1, 146000, 'b68306fc-3449-53ce-9508-de20ab877ddb', '1d59b117-af35-5766-9c89-d7b970996650', 68),
  ('d0fe807e-d20a-55c4-a779-ea1b0400cbfc', '2025-05-01', 'CHEVROLET', 'S10 2.8 4X2 LS', 2017, 24500000, NULL, 'AB124YH', 1, 245000, '3a704ac8-efec-5a70-adcd-556a7bd75032', '1050a8e6-88e4-5504-b995-c0effd14cd93', 69),
  ('68807432-2fdf-5d30-8f25-819dc4f25ab2', '2025-05-01', 'CITROEN', 'C4 CACTUS VTI 115 FEEL AM22', 2020, 19800000, NULL, 'AE087NP', 1, 198000, '3796d03d-b1f9-545b-96c7-cc29dc908ef3', 'ac7e4195-1eb7-5f5f-92f0-920b43158afc', 70),
  ('18901bd3-5cd2-5f31-9604-747120d2cf71', '2025-06-01', 'CITROEN', 'C4 CACTUS VTI 115E AT6 FEEL PACK AM20', 2019, 18600000, NULL, 'AD870GP', 1, 186000, 'ff18d12a-5702-57af-9075-24c67d60c788', '3fe6dcce-f059-586e-b9f2-342e429e7b12', 82),
  ('f1147d5b-1002-5460-bd20-21819e156d58', '2025-06-01', 'FORD', 'FIESTA 1.6L SE', 2017, 17100000, NULL, 'AB531EZ', 1, 171000, 'a03025fa-d4ef-5460-bd13-5c58fe40b1ec', '4fb5b022-1c6c-5651-8499-44ea3da225cd', 83),
  ('561ce470-cdd7-58e1-a860-e1c9e514cc2c', '2025-06-01', 'FIAT', 'CRONOS PRECISION 1.8 MT', 2020, 17300000, NULL, 'AE465RJ', 1, 173000, '26979b5f-bd05-5053-bc68-380ce58c631b', '05a7182c-fa26-5f85-b440-5c87f3197cac', 84),
  ('4b7d30e8-ff1d-5250-b131-af9c7c43990c', '2025-06-01', 'FIAT', 'TORO VOLCANO 2.0 16V 4X4 AT', 2017, 23700000, NULL, 'AC113CR', 1, 237000, '19827d1c-7327-5671-9f6b-69b117761c31', 'ca523ff5-4ba9-563e-8978-445e7ee425d8', 85),
  ('9515c130-feed-586e-9ec3-da73caef8dcd', '2025-07-01', 'MINI', 'COOPER COUNTRYMAN ONE', 2012, 15900000, NULL, 'LPE497', 1, 159000, 'c15ffcea-0d3d-5d71-bcc1-3c507b9abaaf', '813cb308-f4ce-5417-be0c-9afc17353672', 104),
  ('fd5c240c-4c20-5dd4-a896-6b7993cbf7da', '2025-07-01', 'VESPA', 'GTS 300', 2022, 12000000, NULL, 'A172BWT', 1, 120000, '8ec2c949-8760-5023-9ef6-b9e9b8ccd495', 'aabe3c4f-9e7a-5f5b-9bba-24a2c5984c66', 105),
  ('bb3dff3d-1957-5c02-8f8c-a0f2b00f001b', '2025-07-01', 'PEUGEOT', '207 COMPACT XR 1.4 N 5P', 2011, 8900000, NULL, 'KCY162', 1, 89000, '6937e5c4-143b-556c-8524-a1861a67f2a4', '4441733a-591a-5d63-af8e-bbfb59aff1da', 106),
  ('ab004404-0782-5d1f-ac64-b221108d1a1f', '2025-08-01', 'RENAULT', 'SANDERO PH2 LIFE 1.6', 2020, 18200000, NULL, 'AF854VU', 1, 182000, 'db63f0ab-6878-5c4d-a08b-b7b3002e8098', '5817918d-ce2a-590e-9746-de479c09fecd', 118),
  ('a96cd6b1-600d-5b46-95bb-8bf47a4803d8', '2025-08-01', 'CHEVROLET', 'TRACKER FWD LTZ MT', 2015, 15100000, NULL, 'ORO446', 1, 151000, 'd475c201-3e7d-5318-bfbd-c8fa141afa01', '7981befb-b115-53f6-a5af-327c88f80f6c', 119),
  ('64b6107d-6d11-579c-91ef-43d9f57d94e4', '2025-08-01', 'RENAULT', 'SANDERO STEPWAY INTENS 1.6 CVT', 2025, 28380000, NULL, 'RSI2025', 1, 283800, '71110ab4-2584-5fc9-88f0-aad74fa834fc', '6769e1de-ae44-5fda-8f6a-03781e054ce0', 120),
  ('3128be75-ec72-5d85-82a4-cc49a8fd3708', '2025-08-01', 'TOYOTA', 'SW4 4X4 SRX 2.8 TDI 6AT 7A', 2021, 59000000, NULL, 'AE715BO', 1, 590000, '63e81343-b3f2-50d9-bca4-50db6f6b7392', '0e714cdf-cba8-5520-ba15-df7c2a8766d7', 121),
  ('0f3ac57c-b0bc-5b2e-991e-682a8b6467e2', '2025-08-01', 'PEUGEOT', '308 ACTIVE 1.6L', 2013, 13200000, NULL, 'MAQ489', 1, 132000, '21f10f85-0040-545a-bea7-f2a8cd1c046e', '7fb774a2-6f0a-5bd8-ba4f-d197876ff4ea', 122),
  ('5575a4f3-29cb-568e-a47c-93ef7f69ec51', '2025-09-01', 'VW', 'GOL TREND PACK III 1.6', 2010, 7700000, '2025-09-19', 'IUD096', 1, 120000, '77691969-df44-5a1e-8d20-60c92048c126', '0f7a0a1b-62f0-59d6-8cf7-9e453bc3ce71', 133),
  ('797f4712-aaf2-5b3d-b91f-86f6daee21d7', '2025-09-01', 'FIAT', 'PUNTO ATTRACTIVE 1.4 8V', 2013, 10000000, '2025-09-30', 'MJQ902', 1, 120000, 'bbcd7bca-1505-58e0-b703-96a17d737ca2', '30a1bb21-d0f2-5d6c-a6ef-fde3cd59ec7c', 134),
  ('fb1c84ed-e7be-5424-9fd8-24fbf19cce47', '2025-10-01', 'RENAULT', 'STEPWAY INTENS 1.6 CVT', 2023, 23800000, '2025-10-03', 'AG400RG', 1, 238000, '7d97d8c6-4fad-5b25-9968-d71f9a01bec4', '66803dbd-bf74-5cdd-8fdb-b6c64f285a90', 150),
  ('81a29ed7-ec4f-551b-9b23-2c9bebb7ebb1', '2025-10-01', 'RENAULT', 'KANGOO PH3 AUTHENTIQUE PLUS 1.6 2PL 7A', 2014, 8500000, '2025-10-09', 'OKQ532', 0, 120000, 'd89581b9-db49-5a9c-b3fa-bb9173339536', '39978ad5-c421-5bff-8f6f-99fa04a36eb7', 151),
  ('bc30e8a8-c442-5ef4-9cc1-8fccaad7d859', '2025-10-01', 'RENAULT', 'CLIO MIO CONFORT 5PTAS', 2016, 12500000, '2025-10-15', 'AA463TJ', 1, 155000, 'a7b75435-a6a7-58c5-827c-67ae6f82ca72', '374fb0d0-fbc8-5442-9488-fb9148159e68', 152),
  ('a149ca32-820a-5f75-83a5-184a25e29ef9', '2025-11-01', 'FORD', 'ECOSPORT TITANIUM 1.6L MT N', 2016, 16200000, '2025-11-03', 'AA227QF', 1, 162000, 'ef3bb9be-36cc-5922-868e-5f62f565a40b', '654ba8b3-03cd-5aa6-962b-418106b6167c', 170),
  ('df4515c4-361f-5860-b617-17bb974ad6fa', '2025-11-01', 'PEUGEOT', '208 STYLE MT 23.5 1.6L', 2023, 24900000, '2025-11-10', 'AG131HG', 1, 249000, 'ca62500c-cbdb-5aae-893b-3767e4eb103c', 'e557ab6d-f19a-5d36-b790-4c9c8297ee37', 171),
  ('9c8ddc8f-d74a-5be2-b9b8-629e8d5c3774', '2025-11-01', 'RENAULT', 'DUSTER DYNAMIQUE 1.6', 2015, 15900000, '2025-11-29', 'PDS466', 1, 159000, '68b0c5ed-5061-551f-a035-02e56fae132f', '3fae05ba-03fa-54b0-9ef9-39fbbff436da', 172),
  ('7829c081-9874-527d-89cf-dc62397c6ce0', '2025-12-01', 'RENAULT', 'CAPTUR ZEN 2.0', 2019, 21900000, '2025-12-03', 'AD900QU', 1, 219000, 'b5c8762f-7ee0-58ba-974e-471e1b77bef8', '6014b2fb-9cd3-5785-9772-245805a1e219', 190),
  ('4aa49817-5366-557d-863d-f80d2df2901e', '2025-12-01', 'FORD', 'FOCUS 2.0L N MT AT SE PLUS 4 PTAS', 2017, 18200000, '2025-12-05', 'AB115WZ', 1, 182000, 'bb47ae45-c760-5a3b-a227-a0e435c8ebce', '6b554021-d335-50f0-9284-71bf56fa6caf', 191),
  ('7e89e43e-bd84-5ff7-a74c-9cc1c0627bf5', '2025-12-01', 'RENAULT', 'SANDERO STEPWAY ZEN 1.6', 2022, 22000000, '2025-12-15', 'AF384NX', 1, 220000, 'e51f89cf-2396-5875-b35a-4dadd0fc410b', 'b40c5c15-f29a-5066-99e1-15af674b1004', 192),
  ('89b853dd-d7a1-5771-9f15-ff4a08116d41', '2026-01-01', 'VW', 'UP TAKE 1.0', 2019, 15900000, '2026-01-08', 'AD553TE', 1, 159000, '9df85368-bd8c-53c9-befc-defa04b7b21f', '9a005873-17cb-5f61-8ac1-040572e50538', 211),
  ('edb131dc-cea8-5f3a-88fc-20d327885c44', '2026-01-01', 'RENAULT', 'KANGOO II EXPRESS CONFORT 1.6 SCE', 2023, 23900000, '2026-01-13', 'AF860CD', 1, 239000, '8330f12c-3022-58a3-b1bd-f0bb09013ae9', 'a436f91e-7b37-5851-9266-8450011ee272', 212),
  ('ee17470f-7536-5559-97dc-7121d6bada36', '2026-01-01', 'NISSAN', 'MARCH ADVANCE MEDIA-TECH AT PURE', 2017, 16385000, '2026-01-24', 'AA882LX', 1, 203850, 'afabba7f-fc13-5a3a-8213-9a7fa1ec0ca2', '03bed91d-cf15-54c2-bc0a-d26084403fb2', 213),
  ('3e316b2d-753d-592f-aa49-92b59d8b5144', '2026-02-01', 'FIAT', 'PALIO ESSENCE 5P 1.6 16V AT', 2017, 13900000, '2026-02-04', 'AB161NV', 1, 139000, '3065364c-e5b6-5fea-a66e-17f3e1894ce9', '37b90b05-d235-5b92-b97b-fb1359ce0c23', 232),
  ('a548cb84-7902-57bb-8adf-281adafcce9c', '2026-02-01', 'PEUGEOT', '208 ACTIVE 1.6', 2020, 16500000, '2026-02-10', 'AE297RX', 1, 165000, '553b7924-0e9e-51bd-a9e5-6de649779b81', '605e69de-ce13-526e-893c-61aa1d8a70cd', 233),
  ('13c0fce6-18e7-5fd6-9f29-2bd931842d24', '2026-02-01', 'PEUGEOT', '208 GT', 2026, 36900000, '2026-02-13', 'TG567738', 1, 369000, '3cf25d2e-2240-5a53-9da9-43481c964c60', 'd4df1141-ba95-52a2-9888-cb6b33880c90', 234),
  ('2bf757ee-6d5a-5ff2-bf20-07547cfa48ec', '2026-02-01', 'PEUGEOT', '208 GT', 2026, 36900000, '2026-02-23', 'G569633', 1, 369000, 'eb4fbd7e-c625-5db9-bf9c-fdb28905d45b', 'ea15ef2d-8121-5c3f-a2d1-54f16fe8ae48', 235),
  ('3b772677-1c75-5be2-b5e0-b0e4a82a7b48', '2026-02-01', 'FIAT', 'MOBI 1.0 8V EASY', 2017, 13500000, '2026-02-23', 'AB946CJ', 1, 135000, '8ae94874-1ab3-54a5-b5da-c3f6207789ac', '02a08ba8-57f9-5f6a-be34-55c8188fdb31', 236),
  ('c848f791-7bd8-5669-a2a1-55f75fbee3c2', '2026-03-01', 'RENAULT', 'CAPTUR INTENS 1.6 CVT', 2019, 18000000, '2026-03-17', 'AD570OQ', 1.2, 216000, 'be3af560-6767-5146-8602-e398cf11d955', '4dbce061-04f8-564d-92a1-f46b69c2dec8', 255),
  ('74293226-6be5-5700-8e56-55867d8f1a92', '2026-03-01', 'VW', 'SURAN 1.6N COMFORTLINE', 2008, 7000000, '2026-03-18', 'HOD513', 1.2, 144000, '8612c786-58ad-5918-acb0-94642f1f8227', 'b2c2e732-a920-5626-9a00-757eadbc8af3', 256),
  ('a83bcb46-723a-5a37-a846-80d36c9c5f23', '2026-03-01', 'CHEVROLET', 'SONIC 1.6 LTZ MT 5P', 2012, 9500000, '2026-03-18', 'LPW281', 1.2, 144000, 'ef4dce28-3350-5467-9172-2fc5e5611ab9', 'fa309d94-68c6-54de-bfc7-5872c41e89e7', 257),
  ('9d6869d7-072a-5670-8272-f83cbeb042fa', '2026-03-01', 'PEUGEOT', '208 ACTIVE TIPTRONIC 1.6L', 2022, 23300000, '2026-03-18', 'AF287ZK', 1.2, 279600, 'efabcedf-5c3d-5702-b497-b61d4af2ede3', '35925107-728a-5b81-b7fe-7847bd79d26e', 258),
  ('052e148b-833f-5bcb-8454-9543940957c9', '2026-03-01', 'RENAULT', 'STEPWAY CONFORT 1.6 16V', 2011, 7900000, '2026-03-19', 'JRA795', 1.2, 144000, 'd4a43e0c-29e2-507b-b9e4-ae11c06e8701', '84d22ebf-bf5d-5985-8fe0-22d48a0d591a', 259),
  ('92a1bbc1-4c88-565b-80ec-528447caeedd', '2026-03-01', 'RENAULT', 'DUSTER PH2 PRIVILEGE 1.6', 2018, 19700000, '2026-03-28', 'AC788SE', 1.2, 236400, '1c88d730-c369-5676-9506-c8a01d27705f', 'da65f666-5930-5a31-85b4-21ef274a47d0', 260),
  ('505ae7b5-82a1-5428-9827-0bee7cbeeff5', '2026-03-01', 'CITROEN', 'C3 1.5L TENDANCE PACK', 2013, 9500000, '2026-03-28', 'MLU126', 1.2, 144000, 'd0a65ad2-dc27-55b9-be92-46697283fa49', 'b5104ef2-4b42-5868-85b6-74cc2496a9e6', 261),
  ('271b91d9-1698-55aa-860e-c17bef8a68d2', '2026-03-01', 'RENAULT', 'LOGAN AUTHENTIQUE 1.6', 2019, 12700000, '2026-03-30', 'AD771EG', 1.2, 152400, '5f90d91b-5207-5c26-ba80-e1ff1a8b3bde', 'fc0b46c2-3854-55c8-a8a7-be52c388468a', 262),
  ('ce5f6659-c183-5023-b19e-5140d9c1a579', '2026-04-01', 'CITROEN', '3CV', 1977, 6860000, '2026-04-04', 'XBV027', 1.2, 144000, 'd7bfb767-96cd-5dc1-8cc8-ce89303b832a', '538ede76-9466-56e6-8654-48555588f662', 284),
  ('c6794b36-6406-534c-be90-c338979dffd4', '2026-04-01', 'HONDA', 'WAVE 110 S', 2020, 2300000, '2026-04-09', 'A128BHU', 1.2, 144000, '557bdf46-86bf-57ff-8f1d-afdaafa6044a', '17285bab-1f76-556e-8d4b-6018f99df817', 285),
  ('0aa67947-c538-59cd-b722-854d1e4aedc2', '2026-04-01', 'CITROEN', 'C3 VTI 115 FEEL', 2017, 12900000, '2026-04-13', 'AB355BI', 1.2, 154800, 'a435a6ab-b737-5749-a8d2-8c86808535ce', '27fb9e0c-74d1-5769-9f45-d4a83db17e3a', 286),
  ('45bdff43-7957-50f3-afe2-636b4fff4f93', '2026-04-01', 'RENAULT', 'CAPTUR ZEN 2.0', 2017, 19600000, '2026-04-13', 'AC168RA', 1.2, 235200, '2d32850e-8c2c-51a7-9d99-b096f5bbe7f2', '0e1cd47d-ef09-56d5-9134-d3b6288dc877', 287),
  ('cdae7c04-3932-5e70-ae08-9a73a7ee8a00', '2026-04-01', 'PEUGEOT', '208 ALLURE 1.6', 2017, 15700000, '2026-04-13', 'AB595HZ', 1.2, 188400, 'eba1e451-bc96-53b0-b89a-7c1660250dd4', '8fcc1347-9462-5779-a651-63c684b1aa66', 288),
  ('44bf43a6-a426-5d0b-96a8-94daedba652e', '2026-04-01', 'PEUGEOT', '3008 FELINE 1.6', 2013, 11900000, '2026-04-21', 'NKL786', 1.2, 144000, '1f6bed19-1ca3-5adf-b382-5e1d14631d65', 'b67c15bb-f403-5743-af28-f2d8f81e0f21', 289),
  ('30810d92-8a6d-50c8-bf3e-6ca295302be0', '2026-04-01', 'CHEVROLET', 'CLASSIC 4 PTAS LS AA+DIR 1.4N', 2013, 8500000, '2026-04-30', 'MVX205', 1.2, 144000, 'a773767e-a790-5077-9c05-4416b6b8cb2b', 'b1a30073-f57b-5d5d-b682-a397dc0c82fc', 290),
  ('f5ddb195-4512-5e38-8146-56fa704f2c60', '2026-05-01', 'RENAULT', 'CLIO MIO EXPRESSION PACK II', 2013, 10500000, '2026-05-12', 'MVX033', 1, 120000, '52847a03-07d9-5e6e-b60a-c4546caf71f0', '0b2ad358-0831-5b06-980b-b082f8890900', 309),
  ('2b9812f2-c652-5e5b-a790-cb53af39a85b', '2026-05-01', 'CHEVROLET', 'CELTA LT SPIRIT', 2013, 8600000, '2026-05-14', 'MKS300', 1, 120000, '69a45e5d-e7f6-5a55-83e7-f111196f8465', '9488317c-d163-5c98-bfd3-4b22e2b9b788', 310),
  ('3fc21ad0-19e4-5a9b-b05a-1d69049ef9e6', '2026-05-01', 'RENAULT', 'DUSTER PH2 PRIVILEGE 2.0', 2018, 20000000, '2026-05-20', 'AC600YI', 1, 200000, '410692c5-4381-53e0-94db-5fb2fb80f3b7', '58ad6b1e-5115-5ee7-947f-06f29fcdfa7b', 311),
  ('a367c72e-8959-5fa1-83d8-7bdb11f2655c', '2026-05-01', 'NISSAN', 'FRONTIER CD X GEAR 2.3 D 4X2', 2022, 34000000, '2026-05-28', 'AF249SL', 1, 340000, '4161d44c-3835-5dc4-9c3a-aafdcf5e51d6', '88794977-59fb-5627-98ff-0851c0691573', 312),
  ('844edefb-1f48-5af8-9761-b5e75d820951', '2026-05-01', 'RENAULT', 'MEGANE III 2.0 16V LUXE', 2013, 13900000, '2026-05-28', 'MFA302', 1, 139000, 'f98160a1-5c64-535a-baea-0926d83f1599', 'e99cf677-ca22-5c90-b253-730518ee8222', 313),
  ('247b044e-bd55-5e2a-b097-a6a86059aa66', '2026-06-01', 'RENAULT', 'STEPWAY PH2 INTENS 1.6', 2023, 23600000, '2026-06-06', 'AF946FN', 1.2, 283200, 'c45ffa08-4928-5e2c-96d5-b20a2ecc9f62', 'a930f21c-1973-5be3-b069-488ef0f2d3f8', 338),
  ('306b83b0-8323-5e63-a52d-22b256f623da', '2026-06-01', 'RENAULT', 'SANDERO PACK 1.6 8V', 2012, 9500000, '2026-06-12', 'LJR875', 1.2, 144000, 'e922e305-1aca-5259-a40f-a6946a000d13', '32645734-dd02-5ffd-812f-79dae8f97d98', 339),
  ('c7b6f659-ff35-56a6-ba5c-ceb0773d9522', '2026-06-01', 'NISSAN', 'KICKS 1.6 X-PLAY CVT', 2023, 33500000, '2026-06-19', 'AF718GP', 1.2, 402000, 'e577a1aa-c6cf-5771-8f58-75b02e3217d9', '32701ec1-a0ed-58c3-bbee-1aa687034732', 340),
  ('c1bff046-0648-5b04-8f49-e081962e22cb', '2026-06-01', 'PEUGEOT', '208 1.6 ALLURE NAV TIPTRONIC', 2017, 15900000, '2026-06-22', 'AB711ML', 1.2, 190800, '7068ee8a-abbb-5245-a45f-43eb1b30fac6', 'a55fa32c-8425-54e5-bf45-0c2958ce770a', 341),
  ('387343bd-df53-5bb1-b3f5-c820f35ad1cd', '2026-06-01', 'PEUGEOT', '208 ALLURE PACK  1.6 AM23.5', 2023, 24300000, '2026-06-26', 'AG236RD', 1.2, 291600, '67b41431-7984-50a8-97c7-7d275c333af7', 'd3ddcd25-c043-56ee-aeda-b3ab0b24a33d', 342),
  ('32003833-b6a9-5181-a07c-c5b54474035c', '2026-06-01', 'RENAULT', 'KANGOO II EXPRESS 5 A 1.5 DCI', 2023, 26600000, '2026-06-27', 'AG131HY', 1.2, 319200, '5a78c395-8cbf-5332-8efd-aa097b6e929f', '02ef1e26-27ec-5b36-a15b-24f75c7c01b6', 343),
  ('4876f568-2f56-59cb-bc25-32a096f0a480', '2026-07-01', 'FORD', 'ECOSPORT TITANIUM 1.5L MT N', 2019, 21500000, '2026-07-06', 'AD521AL', 1, 215000, 'e11bd250-d4a4-5ab4-a389-e32b8e726932', 'aad58745-f5c0-58bd-968c-3754251d35ec', 359),
  ('f57a47f3-0314-53f8-8c44-14ef6180af11', '2026-07-01', 'PEUGEOT', '206 XT 1.6 5P', 2008, 4900000, '2026-07-09', 'HQU572', 1, 120000, 'b6fda6a0-7727-562a-b7f9-387f9451dfc9', 'd0573ec4-dd1b-582b-9c4a-086700d17e09', 360),
  ('8104fbf0-173f-5d55-ac31-00d2c1992f8b', '2026-07-01', 'RENAULT', 'KWID INTENS 1.0', 2020, 14500000, '2026-07-13', 'AE477GJ', 1, 145000, '23553700-127c-514e-983d-fd02d337191f', '45bdb478-cb24-5630-b2b7-057a03714be7', 361),
  ('44fb715a-bf0d-5b5c-b7bf-30536578c3d0', '2026-07-01', 'RENAULT', 'DUSTER PRIVILEGE 2.0 4X2', 2012, 12900000, '2026-07-24', 'LNI801', 1, 129000, 'd6047800-5ac7-5a67-9ccd-83f26ae7afd7', 'bbac9b46-3ff9-51d0-b966-bc8a9710636d', 362);

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM public.empleados WHERE activo IS DISTINCT FROM FALSE AND lower(nombre) LIKE '%robinson%') THEN RAISE EXCEPTION 'No se encontró un empleado activo Robinson para cargar las comisiones.'; END IF; END $$;

-- Vehículos históricos mínimos solo para comisiones sin venta vinculable por dominio.
INSERT INTO public.vehiculos (id, marca, modelo, anio, km, dominio, precio_venta, precio_moneda, estado, estado_preparacion, catalogo_publicado, catalogo_destacado, publicado_mercadolibre, publicado_rodados_google, fotos, fecha_ingreso, observaciones)
SELECT DISTINCT ON (r.dominio)
  r.vehiculo_id, r.marca, r.modelo, r.anio, 0, r.dominio, r.precio_venta, 'ARS', 'vendido', 'sin_preparar', FALSE, FALSE, FALSE, FALSE, ARRAY[]::text[], r.periodo,
  jsonb_build_object('source', 'comisiones robinson.csv', 'migration_note', 'Vehículo mínimo creado solo para vincular una comisión histórica sin venta existente.')
FROM _robinson_comisiones r
WHERE NOT EXISTS (
  SELECT 1 FROM public.vehiculos v
  WHERE regexp_replace(upper(coalesce(v.dominio, '')), '[^A-Z0-9]', '', 'g') = r.dominio
);

-- Venta histórica mínima solo cuando no existe una venta para el dominio.
INSERT INTO public.ventas (id, vehiculo_id, vendedor_id, fecha_venta, cliente_nombre, precio_venta, moneda, metodo_pago, estado, observaciones)
SELECT r.venta_id,
  COALESCE((
    SELECT v.id FROM public.vehiculos v
    WHERE regexp_replace(upper(coalesce(v.dominio, '')), '[^A-Z0-9]', '', 'g') = r.dominio
    ORDER BY v.created_at NULLS LAST
    LIMIT 1
  ), r.vehiculo_id),
  (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1),
  coalesce(r.fecha_venta, r.periodo), 'Cliente histórico', coalesce(r.precio_venta, 0), 'ARS', 'transferencia', 'registrada',
  jsonb_build_object('source', 'comisiones robinson.csv', 'fila', r.fila, 'vendedor_original', 'Robinson', 'migration_note', 'Venta mínima creada solo para vincular comisión histórica.')
FROM _robinson_comisiones r
WHERE NOT EXISTS (
  SELECT 1
  FROM public.ventas v
  JOIN public.vehiculos vh ON vh.id = v.vehiculo_id
  WHERE regexp_replace(upper(coalesce(vh.dominio, '')), '[^A-Z0-9]', '', 'g') = r.dominio
    AND v.estado = 'registrada'
);

-- Comisiones vinculadas por dominio a la venta existente o a la venta mínima anterior.
INSERT INTO public.comisiones (id, venta_id, vendedor_id, base_comision, porcentaje, monto_comision, moneda, estado, fecha_generada, fecha_pago, observaciones)
SELECT r.id,
  COALESCE((
    SELECT v.id FROM public.ventas v
    JOIN public.vehiculos vh ON vh.id = v.vehiculo_id
    WHERE regexp_replace(upper(coalesce(vh.dominio, '')), '[^A-Z0-9]', '', 'g') = r.dominio
      AND v.estado <> 'anulada'
    ORDER BY v.fecha_venta NULLS LAST, v.created_at NULLS LAST
    LIMIT 1
  ), r.venta_id),
  (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1),
  coalesce(r.precio_venta, 0), r.porcentaje, r.monto, 'ARS', 'pendiente', r.periodo, NULL,
  jsonb_build_object('source', 'comisiones robinson.csv', 'fila', r.fila, 'vendedor_original', 'Robinson')
FROM _robinson_comisiones r
ON CONFLICT (id) DO NOTHING;

-- Liquidaciones mensuales cerradas, idempotentes por UUID determinístico.
INSERT INTO public.comision_liquidaciones (id, vendedor_id, periodo, estado, moneda, neto_a_cobrar, fecha_pago, fecha_cierre, observaciones) VALUES
  ('e0956e03-46fe-5323-8893-aaf6adea5ca6', (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1), '2025-01-01', 'cerrada', 'ARS', 1579870.00, NULL, '2025-01-31', jsonb_build_object('source', 'comisiones robinson.csv', 'vendedor_original', 'Robinson')),
  ('0fb5d5e0-8f47-5701-8e50-f78da983a985', (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1), '2025-02-01', 'cerrada', 'ARS', 474000.00, NULL, '2025-02-28', jsonb_build_object('source', 'comisiones robinson.csv', 'vendedor_original', 'Robinson')),
  ('29a0d648-7a83-5cb0-9f26-eda6cad2c30c', (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1), '2025-03-01', 'cerrada', 'ARS', 1761000.00, NULL, '2025-03-31', jsonb_build_object('source', 'comisiones robinson.csv', 'vendedor_original', 'Robinson')),
  ('3f55e884-88ae-5ad3-bbba-9fbac8246642', (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1), '2025-04-01', 'cerrada', 'ARS', 1477000.00, NULL, '2025-04-30', jsonb_build_object('source', 'comisiones robinson.csv', 'vendedor_original', 'Robinson')),
  ('a5414c5d-818b-560b-b541-871013f89ab5', (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1), '2025-05-01', 'cerrada', 'ARS', 874000.00, NULL, '2025-05-31', jsonb_build_object('source', 'comisiones robinson.csv', 'vendedor_original', 'Robinson')),
  ('6a37ea2d-79da-5d03-b41c-1ee320636d60', (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1), '2025-06-01', 'cerrada', 'ARS', 767000.00, NULL, '2025-06-30', jsonb_build_object('source', 'comisiones robinson.csv', 'vendedor_original', 'Robinson')),
  ('d9c9e4a8-2149-5f50-a364-9f2f019bffdc', (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1), '2025-07-01', 'cerrada', 'ARS', 368000.00, NULL, '2025-07-31', jsonb_build_object('source', 'comisiones robinson.csv', 'vendedor_original', 'Robinson')),
  ('9b00e24e-b457-56af-b54a-d9197f0bedaf', (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1), '2025-08-01', 'cerrada', 'ARS', 1338800.00, NULL, '2025-08-31', jsonb_build_object('source', 'comisiones robinson.csv', 'vendedor_original', 'Robinson')),
  ('7b839e18-d9eb-5a29-9cbc-c3500ce8125a', (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1), '2025-09-01', 'cerrada', 'ARS', 240000.00, NULL, '2025-09-30', jsonb_build_object('source', 'comisiones robinson.csv', 'vendedor_original', 'Robinson')),
  ('616f3e16-b32b-5e76-b575-55c26fdfcc90', (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1), '2025-10-01', 'cerrada', 'ARS', 513000.00, NULL, '2025-10-31', jsonb_build_object('source', 'comisiones robinson.csv', 'vendedor_original', 'Robinson')),
  ('176e88e1-8a7b-51a1-b732-dc3af75cdeea', (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1), '2025-11-01', 'cerrada', 'ARS', 570000.00, NULL, '2025-11-30', jsonb_build_object('source', 'comisiones robinson.csv', 'vendedor_original', 'Robinson')),
  ('ba626d15-aaa2-530a-8964-4acad7dcd6f9', (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1), '2025-12-01', 'cerrada', 'ARS', 621000.00, NULL, '2025-12-31', jsonb_build_object('source', 'comisiones robinson.csv', 'vendedor_original', 'Robinson')),
  ('77de794b-4517-5893-864e-5c32dbebd391', (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1), '2026-01-01', 'cerrada', 'ARS', 601850.00, NULL, '2026-01-31', jsonb_build_object('source', 'comisiones robinson.csv', 'vendedor_original', 'Robinson')),
  ('b5ab5c1d-8078-55f2-85a4-5c50f70f7671', (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1), '2026-02-01', 'cerrada', 'ARS', 1177000.00, NULL, '2026-02-28', jsonb_build_object('source', 'comisiones robinson.csv', 'vendedor_original', 'Robinson')),
  ('a8ee3bea-0f74-5a6f-be9e-519473957159', (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1), '2026-03-01', 'cerrada', 'ARS', 1460400.00, NULL, '2026-03-31', jsonb_build_object('source', 'comisiones robinson.csv', 'vendedor_original', 'Robinson')),
  ('5754c0e7-6a3b-5b9b-8498-0709cc5b1887', (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1), '2026-04-01', 'cerrada', 'ARS', 1154400.00, NULL, '2026-04-30', jsonb_build_object('source', 'comisiones robinson.csv', 'vendedor_original', 'Robinson')),
  ('614b7344-501e-5c71-8464-f29c8c66db46', (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1), '2026-05-01', 'cerrada', 'ARS', 919000.00, NULL, '2026-05-31', jsonb_build_object('source', 'comisiones robinson.csv', 'vendedor_original', 'Robinson')),
  ('759b8ef4-68b9-5e92-83d0-d4284545ba08', (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1), '2026-06-01', 'cerrada', 'ARS', 1630800.00, NULL, '2026-06-30', jsonb_build_object('source', 'comisiones robinson.csv', 'vendedor_original', 'Robinson')),
  ('e557d3b8-84a8-5eee-ac15-71f3a9252ac0', (SELECT e.id FROM public.empleados e WHERE e.activo IS DISTINCT FROM FALSE AND lower(e.nombre) LIKE '%robinson%' ORDER BY e.nombre LIMIT 1), '2026-07-01', 'cerrada', 'ARS', 609000.00, NULL, '2026-07-31', jsonb_build_object('source', 'comisiones robinson.csv', 'vendedor_original', 'Robinson'))
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Validación rápida:
-- SELECT count(*) AS comisiones_robinson FROM public.comisiones WHERE observaciones->>'source' = 'comisiones robinson.csv';
-- SELECT count(*) AS liquidaciones_robinson FROM public.comision_liquidaciones WHERE observaciones->>'source' = 'comisiones robinson.csv';
