import { EachMessagePayload, Kafka } from "kafkajs";
const kafka = new Kafka({ 
clientId: 'email-consumer',
brokers: ['pkc-12576z.us-west2.gcp.confluent.cloud:9092'],
ssl:true,
sasl:{
    mechanism:'plain',
    username:'ND65SNICBKVCDMQR',
    password:'FQBCgebPOJwq7ZqYiXFVYUBq0/HpxlPyAWHg00BnjVIPDNVsmvN0ynLmKSLp0aS9'
}
});

export=kafka.producer();
