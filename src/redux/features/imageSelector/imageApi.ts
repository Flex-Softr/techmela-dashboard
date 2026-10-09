import baseApi from "@/redux/baseApi/baseApi";

const mediaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation({
      query: (
        body:
          | FormData
          | { images: { src: string; alt: string; purpose?: string }[] }
      ) => ({
        url: "/images",
        method: "POST",
        body,
      }),
      invalidatesTags: ["images"],
    }),
    getImages: builder.query({
      query: ({
        page,
        limit,
        sort,
        purpose,
      }: {
        page: number;
        limit: number;
        sort: string;
        purpose?: string;
      }) => ({
        url: `/images?page=${page}&limit=${limit}&sort=${sort}${purpose ? `&purpose=${purpose}` : ""}`,
      }),
      providesTags: ["images"],
    }),
    deleteImage: builder.mutation({
      query: (payload: string[]) => ({
        url: "/images",
        method: "DELETE",
        body: { imageIds: payload },
      }),
      invalidatesTags: ["images"],
    }),
  }),
});

export const {
  useUploadImageMutation,
  useGetImagesQuery,
  useDeleteImageMutation,
} = mediaApi;

