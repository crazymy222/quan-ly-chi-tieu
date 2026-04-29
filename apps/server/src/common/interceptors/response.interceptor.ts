import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { Response } from "express";

export interface StandardResponse<T> {
  statusCode: number;
  status: 'success';
  message: string;
  data: T | null;
  timeStamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {

  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    const statusCode = context.switchToHttp().getResponse<Response>().statusCode;
    return next.handle().pipe(
      map((data: T)=>({
        statusCode: statusCode,
        status: 'success',
        data: data ?? null,
        message: 'Request Success',
        timeStamp: new Date().toISOString()
      }))
    )
  }
}