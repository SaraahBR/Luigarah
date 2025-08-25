import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type Produto = {
  id: number;
  title: string;       // marca
  subtitle: string;    // categoria
  description?: string;
  preco?: number;
  img?: string;
  imgHover?: string;
  images?: string[];
  dimension?: string;
  author?: string;
  composition?: string;
  highlights?: string[];
};

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/produtos" }),
  keepUnusedDataFor: 300,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: 60,
  endpoints: (builder) => ({
    getBolsas: builder.query<Produto[], void>({
      query: () => "bolsas",
      transformResponse: (r: Produto[] | { produtos: Produto[] }) =>
        Array.isArray(r) ? r : r.produtos,
    }),
    getRoupas: builder.query<Produto[], void>({
      query: () => "roupas",
      transformResponse: (r: Produto[] | { produtos: Produto[] }) =>
        Array.isArray(r) ? r : r.produtos,
    }),
    getSapatos: builder.query<Produto[], void>({
      query: () => "sapatos",
      transformResponse: (r: Produto[] | { produtos: Produto[] }) =>
        Array.isArray(r) ? r : r.produtos,
    }),
  }),
});

export const {
  useGetBolsasQuery,
  useGetRoupasQuery,
  useGetSapatosQuery,
} = productsApi;
