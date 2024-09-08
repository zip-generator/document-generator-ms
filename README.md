# Product Microservice

## Dev
1. Clonar el repositorio
2. Instalar dependencias
3. Crear un archivo .env basado en el env.template
4. Ejecutar migración de prisma npx prisma migrate dev
5. Levantar el servidor de NATS
`docker run -d --name nats-server -p 4222:4222 -p 8222:8222 nats`
6. Ejecutar npm run start:dev


# Que Hace Este Micro Servicio:

Este micro servicio se encarga de ir a la base de datos y buscar todas las facturas por un rango de fecha o por algun tipo de documento o comprobante.
Posteriormente agrupa estas facturas por fecha y tipo de comprobante, en medio del proceso de agrupamiento emite un `topic` (tema) via NATS para que otro microservicio le regrese el `path` don estan estas facturas en `PDF`.
Finalmente al finalizar ese agrupamiento crea un `JSON` con la data de las facturas para luego emitir un `topic` para que otro microservicio comprima esto en un zip.