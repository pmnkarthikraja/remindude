import { useMutation, useQuery, useQueryClient } from "react-query"
import { holidayApi } from "../api/calenderApi"
import { AxiosError } from "axios"

export const useGetHolidays = (refetchInterval?: number) => {
    return  useQuery({
        queryKey: ['holidays'],
        queryFn: async () => {
          const data =  await holidayApi.getHolidays()
          return data
          // const nationalHolidays = data.filter(d=>d.type[0]=='National holiday')
          // return nationalHolidays
        },
        onError:(e:AxiosError<any>)=>e,
        refetchInterval:false,
      })
  }
 
export const useGetLocalHolidays = () => {
  return  useQuery({
    queryKey: ['localHolidays'],
    queryFn: async () => {
      const data =  await holidayApi.getLocalHolidays()
      return data
    },
    onError:(e:AxiosError<any>)=>e,
    refetchInterval:false,
  })
}


export const useDeleteLocalHoliday = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (_id:string) =>  holidayApi.deleteLocalHoliday(_id),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('localHolidays');
        console.log("on delete local holiday mutation success: ", data);
      },
      onError: (e: AxiosError<{
        message:string,
        success:boolean
      }>) => {
        console.log("error on delete task", e);
      }
    }
  );
};