import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import { getUser, updateUser } from "../services/test";

export const userQueryOptions = (id: number) =>
  queryOptions({
    queryKey: queryKeys.test.user(id),
    queryFn: () => getUser(id),
  });

export const useGetUserQuery = (id: number) => {
  return useQuery(userQueryOptions(id));
};

// SEND DATA IN SINGLE OBJECT(pass as options from component) e.g
// {
//      payload: {id: 1, name: "John", email: "john@example.com"},
//      id: id,
// }
// TODO: replace with types from api docs
export const useUpdateUserMutation = (options: any) => {
  const mutation = useMutation({
    mutationKey: mutationKeys.test.updateUser(options?.id ?? 0),
    mutationFn: updateUser,
    ...options,
  });

  return mutation;
};
