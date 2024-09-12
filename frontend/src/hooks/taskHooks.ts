import { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { taskApi } from "../api/taskApi";
import { TaskRequestData } from "../components/task";

interface AxiosErrorType {
    message: string,
    success: boolean
  }
  
  
  export const useCreateTaskMutation = () => {
    const queryClient = useQueryClient();
  
    return useMutation(
      (taskData: TaskRequestData) => taskApi.createTask(taskData),
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries('taskData');
        },
        onError: (e: AxiosError<AxiosErrorType>) => {
          console.log("error on create task", e);
        }
      }
    );
  };
  
    
  export const useUpdateTaskMutation = () => {
    const queryClient = useQueryClient();
  
    return useMutation(
      (taskData: TaskRequestData) => taskApi.updateTask(taskData),
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries('taskData');
          console.log("on update mutation success: ", data);
        },
        onError: (e: AxiosError<AxiosErrorType>) => {
          console.log("error on update task", e);
        },
      }
    );
  };
  
  interface DeleteTaskPayload{
    email:string,
    id:string
  }

  export const useDeleteTaskMutation = () => {
    const queryClient = useQueryClient();
  
    return useMutation(
      (payload: DeleteTaskPayload) => taskApi.deleteTask(payload.email,payload.id),
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries('taskData');
          console.log("on delete mutation success: ", data);
        },
        onError: (e: AxiosError<AxiosErrorType>) => {
          console.log("error on delete task", e);
        }
      }
    );
  };


  export const useGetTasks = (email:string,refetchInterval?: number) => {
    return  useQuery({
        queryKey: ['taskData'],
        queryFn: async () => {
          const res =await taskApi.getAllTasks(email)
          return res.data 
        },
        onError:(e:AxiosError<AxiosErrorType>)=>e,
        refetchInterval:false,
      })
  }
 