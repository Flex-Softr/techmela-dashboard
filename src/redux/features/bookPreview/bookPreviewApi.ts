import baseApi from "../../baseApi/baseApi";

const bookPreviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadBookPreview: builder.mutation({
      query: (
        body:
          | FormData
          | { previews: { src: string; alt: string; previewType?: string }[] }
      ) => ({
        url: "/book-previews",
        method: "POST",
        body,
      }),
      invalidatesTags: ["bookPreviews"],
    }),
    getBookPreviews: builder.query({
      query: ({
        page,
        limit,
        sort,
        search,
        previewType,
      }: {
        page: number;
        limit: number;
        sort: string;
        search?: string;
        previewType?: string;
      }) => ({
        url: `/book-previews?page=${page}&limit=${limit}&sort=${sort}${
          search ? `&searchTerm=${search}` : ""
        }${previewType ? `&previewType=${previewType}` : ""}`,
      }),
      providesTags: ["bookPreviews"],
    }),
    deleteBookPreview: builder.mutation({
      query: (previewIds) => ({
        url: `/book-previews`,
        method: "DELETE",
        body: { previewIds },
      }),
      invalidatesTags: ["bookPreviews"],
    }),
  }),
});

export const {
  useUploadBookPreviewMutation,
  useGetBookPreviewsQuery,
  useDeleteBookPreviewMutation,
} = bookPreviewApi;

export default bookPreviewApi;

