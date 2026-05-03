import { GetOneTransactionResponseDto } from "./get-one-transaction-response.dto";
import { Exclude, Type } from "class-transformer";

export class GetDetailTransactionResponseDto extends GetOneTransactionResponseDto  {
  peerUser: {
    id: string;
    displayName: string;
    email: string;
  } | null;
}