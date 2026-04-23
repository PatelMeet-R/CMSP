// import { toastService } from "@/core/toast/toastService";
// import {
//   updateProfileImage,
//   uploadFile,
// } from "@/modules/users/profile/model/profileService";
// import { useMutation, useQueryClient } from "@tanstack/react-query";

// export const useProfileViewModel = (userId: number) => {
//   const queryClient = useQueryClient();

//   const uploadAvatarMutation = useMutation({
//     mutationFn: async (file: File) => {
//       //    Upload the file
//       const uploadRes = await uploadFile(file, "profiles");

//       //    Link it to the user profile
//       await updateProfileImage(userId, uploadRes.data.id);
//     },
//     onSuccess: () => {
//       toastService.success("Profile picture updated!");
//       //    Refresh the profile data on the screen
//       queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
//     },
//     onError: () => {
//       toastService.error("Failed to update profile picture.");
//     },
//   });

//   //    Mutation to handle Removing the Image
//   const removeAvatarMutation = useMutation({
//     mutationFn: async () => {
//       await updateProfileImage(userId, null);
//     },
//     onSuccess: () => {
//       toastService.success("Profile picture removed!");
//       queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
//     },
//     onError: () => {
//       toastService.error("Failed to remove profile picture.");
//     },
//   });

//   return {
//     uploadAvatar: uploadAvatarMutation.mutateAsync,
//     removeAvatar: removeAvatarMutation.mutateAsync,
//     isUploading:
//       uploadAvatarMutation.isPending || removeAvatarMutation.isPending,
//   };
// };
