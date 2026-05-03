import { downloadReport } from "@/services/transaction.service";
import { GetStatisticsParams } from "@/types/transaction.type";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface Props {
  onSuccess?: (blob: Blob) => void;
  onError?: (error: Error | AxiosError) => void;
}

export const useDownloadReport = ({ onSuccess, onError }: Props = {}) => {
  const { mutate, isPending, status } = useMutation({
    mutationFn: async (params: GetStatisticsParams) => {
      const response = await downloadReport(params);
      return {
        blob: response.data,
        headers: response.headers,
      };
    },
    onSuccess: ({blob, headers}) => {
      onSuccess?.(blob);
      const contentDisposition = headers['content-disposition'];
    
      let fileName = 'file_mac_dinh.xlsx';
  
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (fileNameMatch && fileNameMatch.length > 1) {
          fileName = fileNameMatch[1];
        }
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    downloadReport: mutate,
    isPending,
    status,
  }
};