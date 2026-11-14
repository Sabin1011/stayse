
import axiosInstance from "./axiosInstance";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  status: string;
  emailVerified: boolean;
  roles: string[];
  createdAt: string;
  profileImageUrl: string | null;
}

export interface GetProfileResponse {
  message: string;
  user: UserProfile;
}

export interface UpdateProfileRequest {
  fullName: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: UserProfile;
}

export interface UploadProfileImageResponse {
  message: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    profileImageUrl: string;
    status: string;
  };
}

// Get current user's profile
export const getProfile = async (): Promise<GetProfileResponse> => {
  const response = await axiosInstance.get<GetProfileResponse>(
    "/auth/me"
  );

  return response.data;
};

// Update user's full name
export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  const response = await axiosInstance.patch<UpdateProfileResponse>(
    "/auth/profile",
    data
  );

  return response.data;
};

export const uploadProfileImage = async (
  image: File
): Promise<UploadProfileImageResponse> => {
  const formData = new FormData();

  formData.append("image", image);

  const response = await axiosInstance.post<UploadProfileImageResponse>(
    "/auth/profile/image",
    formData,
    {
      headers: {
        "Content-Type": undefined,
      },
    }
  );

  return response.data;
};