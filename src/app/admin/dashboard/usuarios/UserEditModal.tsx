"use client";

import { useState, useEffect } from "react";
import { FiX, FiSave, FiUser, FiMail, FiPhone, FiShield, FiCamera, FiTrash2 } from "react-icons/fi";
import {
  UsuarioAdminDTO,
  UsuarioAdminUpdateDTO,
  useAtualizarUsuarioMutation,
  useAtualizarFotoPerfilUrlMutation,
  useUploadFotoPerfilMutation,
  useRemoverFotoPerfilMutation,
} from "@/hooks/api/usuariosAdminApi";
import Image from "next/image";

// Função para formatar telefone
const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/^(\d{0,2})(\d{0,4})(\d{0,4}).*/, (_, a, b, c) =>
      [a && `(${a}`, a && ") ", b, c && `-${c}`].filter(Boolean).join("")
    );
  }
  return d.replace(/^(\d{0,2})(\d{0,5})(\d{0,4}).*/, (_, a, b, c) =>
    [a && `(${a}`, a && ") ", b, c && `-${c}`].filter(Boolean).join("")
  );
};

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: UsuarioAdminDTO;
}

export default function UserEditModal({ isOpen, onClose, usuario }: UserEditModalProps) {
  const [formData, setFormData] = useState<UsuarioAdminUpdateDTO>({
    nome: usuario.nome,
    sobrenome: usuario.sobrenome || "",
    email: usuario.email || "",
    telefone: usuario.telefone || "",
    role: usuario.role,
  });

  const [fotoUrl, setFotoUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(usuario.fotoPerfil || "");

  const [atualizarUsuario, { isLoading: isUpdating }] = useAtualizarUsuarioMutation();
  const [atualizarFotoUrl, { isLoading: isUpdatingFotoUrl }] = useAtualizarFotoPerfilUrlMutation();
  const [uploadFoto, { isLoading: isUploading }] = useUploadFotoPerfilMutation();
  const [removerFoto, { isLoading: isRemoving }] = useRemoverFotoPerfilMutation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    setFormData({
      nome: usuario.nome,
      sobrenome: usuario.sobrenome || "",
      email: usuario.email || "",
      telefone: usuario.telefone || "",
      role: usuario.role,
    });
    setPreviewUrl(usuario.fotoPerfil || "");
  }, [usuario]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateFotoUrl = async () => {
    if (!fotoUrl.trim()) {
      alert("Por favor, insira uma URL válida");
      return;
    }

    try {
      await atualizarFotoUrl({ id: usuario.id, fotoUrl }).unwrap();
      setPreviewUrl(fotoUrl);
      setFotoUrl("");
      alert("Foto atualizada com sucesso!");
    } catch {
      alert("Erro ao atualizar foto");
    }
  };

  const handleUploadFoto = async () => {
    if (!selectedFile) {
      alert("Por favor, selecione um arquivo");
      return;
    }

    try {
      const result = await uploadFoto({ id: usuario.id, file: selectedFile }).unwrap();
      setPreviewUrl(result.fotoUrl);
      setSelectedFile(null);
      alert("Foto enviada com sucesso!");
    } catch {
      alert("Erro ao enviar foto");
    }
  };

  const handleRemoverFoto = async () => {
    if (!confirm("Tem certeza que deseja remover a foto de perfil?")) return;

    try {
      await removerFoto(usuario.id).unwrap();
      setPreviewUrl("");
      alert("Foto removida com sucesso!");
    } catch {
      alert("Erro ao remover foto");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await atualizarUsuario({ id: usuario.id, data: formData }).unwrap();
      alert("Usuário atualizado com sucesso!");
      onClose();
    } catch {
      alert("Erro ao atualizar usuário");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FiUser />
              Editar Usuário
            </h2>
            <p className="text-blue-100 text-sm mt-1">ID: #{usuario.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FiX className="text-2xl text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto de Perfil */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiCamera />
                Foto de Perfil
              </h3>

              <div className="flex items-start gap-6">
                {/* Preview */}
                <div className="flex-shrink-0">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={120}
                      height={120}
                      className="rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                      {usuario.nome.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Opções de Upload */}
                <div className="flex-1 space-y-4">
                  {/* Upload por Arquivo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload de Arquivo
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <button
                        type="button"
                        onClick={handleUploadFoto}
                        disabled={!selectedFile || isUploading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        {isUploading ? "Enviando..." : "Enviar"}
                      </button>
                    </div>
                  </div>

                  {/* Upload por URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL da Foto
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={fotoUrl}
                        onChange={(e) => setFotoUrl(e.target.value)}
                        placeholder="https://exemplo.com/foto.jpg"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleUpdateFotoUrl}
                        disabled={!fotoUrl.trim() || isUpdatingFotoUrl}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        {isUpdatingFotoUrl ? "Atualizando..." : "Atualizar"}
                      </button>
                    </div>
                  </div>

                  {/* Remover Foto */}
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={handleRemoverFoto}
                      disabled={isRemoving}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      <FiTrash2 />
                      {isRemoving ? "Removendo..." : "Remover Foto"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Dados do Usuário */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Usuário</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Sobrenome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sobrenome
                  </label>
                  <input
                    type="text"
                    value={formData.sobrenome}
                    onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        setFormData({ ...formData, telefone: formatted });
                      }}
                      placeholder="(11) 99999-9999"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo
                  </label>
                  <div className="relative">
                    <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as "USER" | "ADMIN" })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="USER">Usuário</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações Adicionais (Read-only) */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">Provedor</p>
                  <p className="text-gray-900 mt-1">{usuario.provider}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Email Verificado</p>
                  <p className="text-gray-900 mt-1">{usuario.emailVerificado ? "Sim" : "Não"}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Status</p>
                  <p className="text-gray-900 mt-1">{usuario.ativo ? "Ativo" : "Inativo"}</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave />
            {isUpdating ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
