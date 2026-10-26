import {
  isNil,
  isObject,
  isPlainObject,
  isString,
  isUndefined,
} from '@nestjs/common/utils/shared.utils';
import { Serializer } from '@nestjs/microservices';

import type { KafkaMessage, KafkaRequest } from '../interfaces/kafka.interface.js';

/**
 * Serializador personalizado para preparar los mensajes antes de enviarlos a Kafka.
 * Este serializador transforma los datos entrantes para asegurar que están en el formato correcto para Kafka.
 */
export class KafkaRequestSerializer implements Serializer<any, KafkaRequest> {
  /**
   * Serializa los datos entrantes en un formato adecuado para su envío a Kafka.
   *
   * @param {any} data - Los datos que se van a serializar, esperados en la forma de un mensaje de Kafka.
   * @returns {KafkaRequest} - El mensaje de Kafka formateado listo para enviar.
   * @example
   * ```typescript
   * const serializer = new KafkaRequestSerializer();
   * const kafkaMessage = {
   *   key: '123',
   *   value: { name: 'John Doe', age: 30 },
   *   headers: { header1: 'value1' }
   * };
   * const formattedMessage = serializer.serialize(kafkaMessage);
   * ```
   */
  serialize(data: { messages: unknown }): KafkaRequest {
    let value: unknown = data.messages;
    // Verifica si el valor no es un mensaje de Kafka estructurado correctamente.
    const isNotKafkaMessage =
      isNil(value) || !isObject(value) || (!('key' in value) && !('value' in value));

    // Si no es un mensaje de Kafka, envuelve el valor dado en un objeto KafkaMessage.
    if (isNotKafkaMessage) {
      value = { value };
    }

    const message = value as KafkaMessage;

    // Codifica el valor y la clave del mensaje si están presentes.
    message.value = this.encode(message.value);
    if (!isNil(message.key)) {
      message.key = this.encode(message.key);
    }

    // Asegura que el mensaje tenga un objeto de cabeceras, incluso si está vacío.
    if (isNil(message.headers)) {
      message.headers = {};
    }

    return message as unknown as KafkaRequest;
  }

  /**
   * Codifica un valor para asegurar que es compatible con Kafka.
   * Los objetos y arrays se convierten en JSON. Los valores indefinidos se convierten en `null`.
   *
   * @param {any} value - El valor a codificar.
   * @returns {Buffer | string | null} - El valor codificado, o `null` si el valor es indefinido.
   * @example
   * ```typescript
   * const encodedValue = serializer.encode({name: "Alice", age: 25});
   * console.log(encodedValue); // '{"name":"Alice","age":25}'
   * ```
   */
  public encode(value: any): Buffer | string | null {
    // Verifica si el valor es un objeto o un array (y no un Buffer o un string).
    const isObjectOrArray = !isNil(value) && !isString(value) && !Buffer.isBuffer(value);

    // Convierte objetos o arrays a JSON, otros objetos a sus representaciones de string o retorna el mismo valor.
    if (isObjectOrArray) {
      return isPlainObject(value) || Array.isArray(value)
        ? JSON.stringify(value)
        : (value as { toString(): string }).toString();
    } else if (isUndefined(value)) {
      return null;
    }
    return value;
  }
}
