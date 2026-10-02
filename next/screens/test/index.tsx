"use client";

import React from "react";

import { useGetUserQuery, useUpdateUserMutation } from "@/hooks/test";

export default function Test() {
  // const queryClient = useQueryClient();
  //just for check the calculate api
  // using react query
  const { data, isLoading, error } = useGetUserQuery(1);

  const updateUserMutation = useUpdateUserMutation({
    onSuccess: () => {
      // toast.success("User updated successfully");
      // Invalidate and refetch user queries
      // queryClient.invalidateQueries({
      //   queryKey: ["user"],
      // });
      // Optional: Navigate after success
      // navigate("/some-path");
    },
    onError: () => {
      // toast.error("User update failed");
    },
  });

  const handleUpdateUser = () => {
    // updateUserMutation.mutate({
    //   id: userId,
    //   payload: {
    //     // Your update payload here
    //     name: "John Doe",
    //     email: "john@example.com",
    //   },
    // });
  };

  if (isLoading) return <div>Loading...</div>;
  return (
    <button onClick={handleUpdateUser} disabled={updateUserMutation.isPending}>
      {updateUserMutation.isPending ? "Updating..." : "Update User"}
    </button>
  );
}
