import { useState, useEffect } from "react";
import { FiX, FiEdit2, FiUser, FiLayers, FiFlag, FiBox, FiTrash2 } from "react-icons/fi";
import { ProdutoDTO } from "@/hooks/api/types";
import ProductIdentityModal from "./ProductIdentityModal";
import ProductStockModal from "./ProductStockModal";
import ProductSizeStandardModal from "./ProductSizeStandardModal";
import ProductSizesModal from "./ProductSizesModal";

interface ProductOptionsModalProps {
  product: ProdutoDTO | null;
  onClose: () => void;
  onEdit: (produto: ProdutoDTO) => void;
  onDelete: (id: number) => void;
  onRefetch?: () => void; // Callback para refetch após mudanças
}

export default function ProductOptionsModal({ product, onClose, onEdit, onDelete, onRefetch }: ProductOptionsModalProps) {
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showSizeStandardModal, setShowSizeStandardModal] = useState(false);
  const [showSizesModal, setShowSizesModal] = useState(false);
  const [isMainModalVisible, setIsMainModalVisible] = useState(true);

  // Prevenir scroll quando qualquer modal estiver aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, []);
  
  if (!product) return null;

  const handleOpenModal = (modalSetter: (value: boolean) => void) => {
    setIsMainModalVisible(false); // Esconde o modal principal
    setTimeout(() => {
      modalSetter(true); // Abre o modal específico após um pequeno delay
    }, 100);
  };

  const handleCloseSecondaryModal = (modalSetter: (value: boolean) => void) => {
    modalSetter(false);
    setIsMainModalVisible(true); // Mostra o modal principal novamente
  };
  
  return (
    <>
    {isMainModalVisible && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Ações do Produto</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiX className="text-2xl text-gray-600" />
          </button>
        </div>
        {/* Botões de ação */}
        <div className="p-6 space-y-4">
          <button
            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium text-left"
            onClick={() => { onEdit(product); onClose(); }}
          >
            <FiEdit2 className="text-lg" /> Editar Produto
          </button>
          <button
            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium text-left"
            onClick={() => handleOpenModal(setShowIdentityModal)}
          >
            <FiUser className="text-lg" /> Identidade
          </button>
          <button
            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium text-left"
            onClick={() => handleOpenModal(setShowSizeStandardModal)}
          >
            <FiFlag className="text-lg" /> Padrão de Tamanhos
          </button>
          <button
            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium text-left"
            onClick={() => handleOpenModal(setShowSizesModal)}
          >
            <FiLayers className="text-lg" /> Tamanhos
          </button>
          <button
            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium text-left"
            onClick={() => handleOpenModal(setShowStockModal)}
          >
            <FiBox className="text-lg" /> Estoque
          </button>
          <button
            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-medium text-left"
            onClick={() => { if (product.id) onDelete(product.id); onClose(); }}
          >
            <FiTrash2 className="text-lg" /> Deletar
          </button>
        </div>
      </div>
    </div>
    )}

    {/* Modal de Identidade */}
    {showIdentityModal && (
      <ProductIdentityModal
        product={product}
        onClose={() => handleCloseSecondaryModal(setShowIdentityModal)}
      />
    )}

    {/* Modal de Estoque */}
    {showStockModal && (
      <ProductStockModal
        produto={product}
        onClose={() => handleCloseSecondaryModal(setShowStockModal)}
      />
    )}

    {/* Modal de Padrão de Tamanhos */}
    {showSizeStandardModal && (
      <ProductSizeStandardModal
        product={product}
        onClose={() => handleCloseSecondaryModal(setShowSizeStandardModal)}
        onSuccess={onRefetch}
      />
    )}

    {/* Modal de Tamanhos */}
    {showSizesModal && (
      <ProductSizesModal
        product={product}
        onClose={() => handleCloseSecondaryModal(setShowSizesModal)}
      />
    )}
    </>
  );
}
