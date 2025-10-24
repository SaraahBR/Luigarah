import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./config";

// ===========================
// TYPES & INTERFACES
// ===========================

export interface UsuarioAdminDTO {
  id: number;
  nome: string;
  sobrenome?: string;
  email: string;
  telefone?: string;
  dataNascimento?: string;
  genero?: string;
  fotoPerfil?: string;
  role: "USER" | "ADMIN";
  ativo: boolean;
  emailVerificado: boolean;
  provider: "LOCAL" | "GOOGLE" | "FACEBOOK";
  enderecos?: EnderecoDTO[];
}

export interface EnderecoDTO {
  id?: number;
  apelido?: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  principal?: boolean;
}

export interface UsuarioAdminUpdateDTO {
  nome: string;
  sobrenome?: string;
  email?: string;
  telefone?: string;
  role?: "USER" | "ADMIN";
  enderecos?: EnderecoDTO[];
}

export interface EstatisticasUsuarios {
  total: number;
  ativos: number;
  inativos: number;
  admins: number;
  users: number;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// ===========================
// API
// ===========================

export const usuariosAdminApi = createApi({
  reducerPath: "usuariosAdminApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["UsuariosAdmin", "EstatisticasUsuarios"],
  endpoints: (builder) => ({
    // Listar todos os usuários
    listarTodosUsuarios: builder.query<UsuarioAdminDTO[], void>({
      query: () => "/admin/usuarios",
      providesTags: ["UsuariosAdmin"],
    }),

    // Listar usuários com paginação
    listarUsuariosComPaginacao: builder.query<
      PageResponse<UsuarioAdminDTO>,
      {
        page?: number;
        size?: number;
        sortBy?: string;
        direction?: "ASC" | "DESC";
      }
    >({
      query: ({ page = 0, size = 10, sortBy = "id", direction = "ASC" }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
          sortBy,
          direction,
        });
        return `/admin/usuarios/paginado?${params.toString()}`;
      },
      providesTags: ["UsuariosAdmin"],
    }),

    // Buscar usuário por ID
    buscarUsuarioPorId: builder.query<UsuarioAdminDTO, number>({
      query: (id) => `/admin/usuarios/${id}`,
      providesTags: (_result, _error, id) => [{ type: "UsuariosAdmin", id }],
    }),

    // Buscar usuários por nome
    buscarUsuariosPorNome: builder.query<UsuarioAdminDTO[], string>({
      query: (nome) => {
        const params = new URLSearchParams({ nome });
        return `/admin/usuarios/buscar/nome?${params.toString()}`;
      },
      providesTags: ["UsuariosAdmin"],
    }),

    // Buscar usuários por email
    buscarUsuariosPorEmail: builder.query<UsuarioAdminDTO[], string>({
      query: (email) => {
        const params = new URLSearchParams({ email });
        return `/admin/usuarios/buscar/email?${params.toString()}`;
      },
      providesTags: ["UsuariosAdmin"],
    }),

    // Buscar usuários por role
    buscarUsuariosPorRole: builder.query<UsuarioAdminDTO[], "USER" | "ADMIN">({
      query: (role) => `/admin/usuarios/buscar/role/${role}`,
      providesTags: ["UsuariosAdmin"],
    }),

    // Buscar usuários por status
    buscarUsuariosPorStatus: builder.query<UsuarioAdminDTO[], boolean>({
      query: (ativo) => `/admin/usuarios/buscar/status/${ativo}`,
      providesTags: ["UsuariosAdmin"],
    }),

    // Atualizar usuário
    atualizarUsuario: builder.mutation<
      UsuarioAdminDTO,
      { id: number; data: UsuarioAdminUpdateDTO }
    >({
      query: ({ id, data }) => ({
        url: `/admin/usuarios/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "UsuariosAdmin", id },
        "UsuariosAdmin",
        "EstatisticasUsuarios",
      ],
    }),

    // Desativar usuário
    desativarUsuario: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/admin/usuarios/${id}/desativar`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "UsuariosAdmin", id },
        "UsuariosAdmin",
        "EstatisticasUsuarios",
      ],
    }),

    // Ativar usuário
    ativarUsuario: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/admin/usuarios/${id}/ativar`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "UsuariosAdmin", id },
        "UsuariosAdmin",
        "EstatisticasUsuarios",
      ],
    }),

    // Estatísticas de usuários
    obterEstatisticas: builder.query<EstatisticasUsuarios, void>({
      query: () => "/admin/usuarios/estatisticas",
      providesTags: ["EstatisticasUsuarios"],
    }),

    // Atualizar foto de perfil por URL
    atualizarFotoPerfilUrl: builder.mutation<
      { sucesso: boolean; mensagem: string; usuario: UsuarioAdminDTO },
      { id: number; fotoUrl: string }
    >({
      query: ({ id, fotoUrl }) => ({
        url: `/admin/usuarios/${id}/foto`,
        method: "PUT",
        body: { fotoUrl },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "UsuariosAdmin", id },
        "UsuariosAdmin",
      ],
    }),

    // Upload de foto de perfil
    uploadFotoPerfil: builder.mutation<
      {
        sucesso: boolean;
        mensagem: string;
        fotoUrl: string;
        usuario: UsuarioAdminDTO;
      },
      { id: number; file: File }
    >({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: `/admin/usuarios/${id}/foto/upload`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "UsuariosAdmin", id },
        "UsuariosAdmin",
      ],
    }),

    // Remover foto de perfil
    removerFotoPerfil: builder.mutation<
      { sucesso: boolean; mensagem: string },
      number
    >({
      query: (id) => ({
        url: `/admin/usuarios/${id}/foto`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "UsuariosAdmin", id },
        "UsuariosAdmin",
      ],
    }),
  }),
});

// Export hooks
export const {
  useListarTodosUsuariosQuery,
  useListarUsuariosComPaginacaoQuery,
  useBuscarUsuarioPorIdQuery,
  useLazyBuscarUsuariosPorNomeQuery,
  useLazyBuscarUsuariosPorEmailQuery,
  useBuscarUsuariosPorRoleQuery,
  useBuscarUsuariosPorStatusQuery,
  useAtualizarUsuarioMutation,
  useDesativarUsuarioMutation,
  useAtivarUsuarioMutation,
  useObterEstatisticasQuery,
  useAtualizarFotoPerfilUrlMutation,
  useUploadFotoPerfilMutation,
  useRemoverFotoPerfilMutation,
} = usuariosAdminApi;
