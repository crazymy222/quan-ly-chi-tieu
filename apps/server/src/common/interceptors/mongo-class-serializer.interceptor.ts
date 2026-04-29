import {
	ClassSerializerInterceptor,
	PlainLiteralObject,
	Type,
} from '@nestjs/common';
import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { Document, Types } from 'mongoose';

function MongooseClassSerializerInterceptor(
	classToIntercept: Type,
): typeof ClassSerializerInterceptor {
	return class Interceptor extends ClassSerializerInterceptor {
		private changePlainObjectToClass(document: PlainLiteralObject) {
			if (document == null || typeof document !== 'object') {
				return document;
			}
			const plain = document instanceof Document ? document.toJSON() : document;
			const normalized = this.normalizeBson(plain);
			return plainToInstance(classToIntercept, normalized, {
				excludePrefixes: ['_'],
			});
		}

		private normalizeBson(value: unknown): unknown {
			if (value == null) return value;
			if (value instanceof Types.ObjectId) return value.toHexString();
			if (Array.isArray(value)) return value.map((item) => this.normalizeBson(item));
			if (this.isPlainObject(value)) {
				const out: Record<string, unknown> = {};
				for (const [k, v] of Object.entries(value)) out[k] = this.normalizeBson(v);
				return out;
			}
			return value;
		}

		private isPlainObject(value: unknown): value is Record<string, unknown> {
			if (value == null || typeof value !== 'object') {
				return false;
			}
			const proto = Object.getPrototypeOf(value);
			return proto === Object.prototype || proto === null;
		}

		private prepareResponse(
			response:
				| PlainLiteralObject
				| PlainLiteralObject[]
				| { items: PlainLiteralObject[]; count: number },
		): PlainLiteralObject | PlainLiteralObject[] | { items: PlainLiteralObject[]; count: number } {
			if (!Array.isArray(response) && response?.items) {
				return this.changePlainObjectToClass(response);
			}

			if (Array.isArray(response)) {
				return response.map((item) => this.changePlainObjectToClass(item));
			}

			return this.changePlainObjectToClass(response);
		}

		override serialize(
			response: PlainLiteralObject | PlainLiteralObject[],
			options: ClassTransformOptions,
		) {
			return super.serialize(this.prepareResponse(response), options);
		}
	};
}

export default MongooseClassSerializerInterceptor;
