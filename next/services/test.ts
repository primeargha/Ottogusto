// Example usage:
import { apiClient, ApiError } from "@/config/api";

interface User {
  id: number;
  name: string;
  email: string;
}

//  will call for react query - query
const getUser = async (id: number) => {
  try {
    const user = await apiClient.get<User>(`/users/${id}`);
    return user;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

//  will call for react query - mutation
// TODO: replace with types from api docs
const updateUser = async (data: any) => {
  try {
    const updatedUser = await apiClient.put<User>(`/users/${data.id}`, data.payload);
    return updatedUser;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Error ${error.status}: ${error.message}`);
    }
    throw error;
  }
};

export { getUser, updateUser };
