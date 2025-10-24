"use client";

import { useState, useMemo } from "react";
import { FiUsers, FiUserCheck, FiUserX, FiShield, FiUser, FiSearch, FiFilter, FiEdit2, FiCheck, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  useListarUsuariosComPaginacaoQuery,
  useObterEstatisticasQuery,
  useDesativarUsuarioMutation,
  useAtivarUsuarioMutation,
  UsuarioAdminDTO,
} from "@/hooks/api/usuariosAdminApi";
import Image from "next/image";
import UserEditModal from "./UserEditModal";

export default function UsuariosAdminPage() {
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"ALL" | "USER" | "ADMIN">("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ATIVO" | "INATIVO">("ALL");
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("ASC");
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Modal de edição
  const [selectedUser, setSelectedUser] = useState<UsuarioAdminDTO | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Queries
  const {
    data: usuariosPage,
    isLoading,
    error,
  } = useListarUsuariosComPaginacaoQuery({
    page: currentPage,
    size: pageSize,
    sortBy,
    direction: sortDirection,
  });

  const { data: estatisticas } = useObterEstatisticasQuery();

  // Mutations
  const [desativarUsuario] = useDesativarUsuarioMutation();
  const [ativarUsuario] = useAtivarUsuarioMutation();

  // Processar dados dos usuários
  const usuarios = useMemo(() => {
    if (!usuariosPage?.content) return [];

    let filtered = [...usuariosPage.content];

    // Filtrar por termo de busca (nome ou email)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.nome?.toLowerCase().includes(term) ||
          u.sobrenome?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
      );
    }

    // Filtrar por role
    if (filterRole !== "ALL") {
      filtered = filtered.filter((u) => u.role === filterRole);
    }

    // Filtrar por status
    if (filterStatus === "ATIVO") {
      filtered = filtered.filter((u) => u.ativo === true);
    } else if (filterStatus === "INATIVO") {
      filtered = filtered.filter((u) => u.ativo === false);
    }

    return filtered;
  }, [usuariosPage, searchTerm, filterRole, filterStatus]);

  const handleDesativar = async (id: number) => {
    if (confirm("Tem certeza que deseja desativar este usuário?")) {
      try {
        await desativarUsuario(id).unwrap();
        alert("Usuário desativado com sucesso!");
      } catch {
        alert("Erro ao desativar usuário");
      }
    }
  };

  const handleAtivar = async (id: number) => {
    try {
      await ativarUsuario(id).unwrap();
      alert("Usuário ativado com sucesso!");
    } catch {
      alert("Erro ao ativar usuário");
    }
  };

  const handleEdit = (usuario: UsuarioAdminDTO) => {
    setSelectedUser(usuario);
    setIsEditModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-800 font-medium">Erro ao carregar usuários</p>
            <p className="text-red-600 text-sm mt-2">Você precisa estar logado como ADMIN</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <FiUsers className="text-blue-600" />
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-600">Administre usuários, cargos e permissões do sistema</p>
        </div>

        {/* Estatísticas */}
        {estatisticas && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{estatisticas.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiUsers className="text-2xl text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{estatisticas.ativos}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiUserCheck className="text-2xl text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inativos</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{estatisticas.inativos}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <FiUserX className="text-2xl text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{estatisticas.admins}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiShield className="text-2xl text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuários</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{estatisticas.users}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiUser className="text-2xl text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros e Busca */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="text-xl text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro de Role */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as "ALL" | "USER" | "ADMIN")}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Todos os Cargos</option>
              <option value="USER">Usuário</option>
              <option value="ADMIN">Admin</option>
            </select>

            {/* Filtro de Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "ALL" | "ATIVO" | "INATIVO")}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Todos os Status</option>
              <option value="ATIVO">Ativos</option>
              <option value="INATIVO">Inativos</option>
            </select>

            {/* Ordenação */}
            <select
              value={`${sortBy}-${sortDirection}`}
              onChange={(e) => {
                const [field, dir] = e.target.value.split("-");
                setSortBy(field);
                setSortDirection(dir as "ASC" | "DESC");
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="id-ASC">ID (Crescente)</option>
              <option value="id-DESC">ID (Decrescente)</option>
              <option value="nome-ASC">Nome (A-Z)</option>
              <option value="nome-DESC">Nome (Z-A)</option>
              <option value="email-ASC">Email (A-Z)</option>
              <option value="email-DESC">Email (Z-A)</option>
            </select>
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <p>
              Exibindo <span className="font-semibold text-gray-900">{usuarios.length}</span> de{" "}
              <span className="font-semibold text-gray-900">{usuariosPage?.totalElements || 0}</span> usuários
            </p>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="10">10 por página</option>
              <option value="20">20 por página</option>
              <option value="50">50 por página</option>
              <option value="100">100 por página</option>
            </select>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Carregando usuários...</p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="p-12 text-center">
              <FiUsers className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg">Nenhum usuário encontrado</p>
              <p className="text-gray-400 text-sm mt-2">Tente ajustar os filtros de busca</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cargo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Provedor
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {usuario.fotoPerfil ? (
                            <Image
                              src={usuario.fotoPerfil}
                              alt={usuario.nome}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                              {usuario.nome.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {usuario.nome} {usuario.sobrenome}
                            </p>
                            <p className="text-sm text-gray-500">ID: #{usuario.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{usuario.email}</p>
                        {usuario.emailVerificado && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                            <FiCheck className="text-sm" />
                            Verificado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {usuario.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            <FiShield />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <FiUser />
                            Usuário
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {usuario.ativo ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <FiUserCheck />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <FiUserX />
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{usuario.provider}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(usuario)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <FiEdit2 />
                          </button>
                          {usuario.ativo ? (
                            <button
                              onClick={() => handleDesativar(usuario.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Desativar"
                            >
                              <FiX />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAtivar(usuario.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Ativar"
                            >
                              <FiCheck />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {usuariosPage && usuariosPage.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Página {currentPage + 1} de {usuariosPage.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft />
                </button>
                
                {/* Números de página */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, usuariosPage.totalPages) }, (_, i) => {
                    let pageNum = i;
                    if (usuariosPage.totalPages > 5) {
                      if (currentPage < 3) {
                        pageNum = i;
                      } else if (currentPage > usuariosPage.totalPages - 4) {
                        pageNum = usuariosPage.totalPages - 5 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= usuariosPage.totalPages - 1}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      {selectedUser && (
        <UserEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          usuario={selectedUser}
        />
      )}
    </div>
  );
}
